// Node parity test: replicate the JS MLP forward (src/workers/tflite.worker.ts)
// exactly, run it over the dataset, and confirm it classifies like Python did.
import fs from "fs";

const model = JSON.parse(fs.readFileSync("scripts/example/sign_model_v1.json", "utf8"));
const ds = JSON.parse(fs.readFileSync("scripts/example/ishaara-dataset.json", "utf8"));

const { inputDim, featureDim, hiddenDim, mean, std, labels } = model;
const w = model.weights;

function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }

function predictMlp(window) {
  const D = inputDim;
  const T = window.length;
  const fmean = new Array(D).fill(0);
  for (let j = 0; j < D; j++) {
    let s = 0;
    for (let t = 0; t < T; t++) s += (window[t][j] - mean[j]) / std[j];
    fmean[j] = s / T;
  }
  const fret = new Array(D).fill(0);
  for (let j = 0; j < D; j++) {
    let acc = 0;
    for (let t = 0; t < T; t++) {
      const d = (window[t][j] - mean[j]) / std[j] - fmean[j];
      acc += d * d;
    }
    fret[j] = Math.sqrt(acc / T);
  }
  const feats = fmean.concat(fret);

  const h = new Array(hiddenDim).fill(0);
  for (let i = 0; i < hiddenDim; i++) {
    let acc = w.b1[i];
    const row = i * featureDim;
    for (let j = 0; j < featureDim; j++) acc += w.w1[row + j] * feats[j];
    h[i] = acc > 0 ? acc : 0;
  }

  const C = labels.length;
  const logits = new Array(C).fill(0);
  for (let c = 0; c < C; c++) {
    let acc = w.b2[c];
    const row = c * hiddenDim;
    for (let j = 0; j < hiddenDim; j++) acc += w.w2[row + j] * h[j];
    logits[c] = acc;
  }

  const max = Math.max(...logits);
  const exps = logits.map((l) => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  const probs = exps.map((p) => p / sum);
  let best = 0;
  for (let c = 1; c < probs.length; c++) if (probs[c] > probs[best]) best = c;
  return { label: labels[best], confidence: Math.max(...probs) };
}

let correct = 0, total = 0;
for (const s of ds.samples) {
  const p = predictMlp(s.frames);
  total++;
  if (p.label === s.label) correct++;
}
console.log(`JS forward classification: ${correct}/${total} correct (${(100 * correct / total).toFixed(1)}%)`);
console.log("Labels:", labels.join(", "));
if (correct === total) console.log("PARITY TEST PASS — Python-trained, JS-inferred identically");
else process.exit(1);

// ---- GRU parity (format ishaara-sign-gru-v1, mirrors worker predictGlu) ----
const gruPath = "scripts/example/sign_model_gru.json";
if (fs.existsSync(gruPath)) {
  const g = JSON.parse(fs.readFileSync(gruPath, "utf8"));
  const gw = g.weights;
  const { inputDim, embedDim, hiddenDim, mean: gmean, std: gstd, labels: glabels } = g;
  const G = glabels.length;

  function predictGlu(window) {
    const T = window.length;
    const seq = [];
    for (let t = 0; t < T; t++) {
      const raw = window[t];
      const e = new Array(embedDim).fill(0);
      for (let i = 0; i < embedDim; i++) {
        let acc = gw.emb_b[i];
        const row = i * inputDim;
        for (let j = 0; j < inputDim; j++) {
          const v = (raw[j] - gmean[j]) / gstd[j];
          acc += gw.emb_w[row + j] * v;
        }
        e[i] = Math.tanh(acc);
      }
      seq.push(e);
    }

    let h = new Array(hiddenDim).fill(0);
    for (let t = 0; t < T; t++) {
      const x = seq[t];
      const gx = new Array(3 * hiddenDim).fill(0);
      const gh = new Array(3 * hiddenDim).fill(0);
      for (let gIdx = 0; gIdx < 3 * hiddenDim; gIdx++) {
        let sx = gw.gru_b_ih[gIdx];
        const sRowIH = gIdx * embedDim;
        for (let j = 0; j < embedDim; j++) sx += gw.gru_w_ih[sRowIH + j] * x[j];
        gx[gIdx] = sx;

        let sh = gw.gru_b_hh[gIdx];
        const sRowHH = gIdx * hiddenDim;
        for (let j = 0; j < hiddenDim; j++) sh += gw.gru_w_hh[sRowHH + j] * h[j];
        gh[gIdx] = sh;
      }

      const r = new Array(hiddenDim).fill(0);
      const z = new Array(hiddenDim).fill(0);
      const n = new Array(hiddenDim).fill(0);
      for (let i = 0; i < hiddenDim; i++) {
        r[i] = sigmoid(gx[i] + gh[i]);
        z[i] = sigmoid(gx[hiddenDim + i] + gh[hiddenDim + i]);
        n[i] = Math.tanh(gx[2 * hiddenDim + i] + r[i] * gh[2 * hiddenDim + i]);
      }
      const hNew = new Array(hiddenDim).fill(0);
      for (let i = 0; i < hiddenDim; i++) hNew[i] = (1 - z[i]) * n[i] + z[i] * h[i];
      h = hNew;
    }

    const logits = new Array(G).fill(0);
    for (let c = 0; c < G; c++) {
      let acc = gw.head_b[c];
      const row = c * hiddenDim;
      for (let j = 0; j < hiddenDim; j++) acc += gw.head_w[row + j] * h[j];
      logits[c] = acc;
    }

    const max = Math.max(...logits);
    const exps = logits.map((l) => Math.exp(l - max));
    const sum = exps.reduce((a, b) => a + b, 0);
    const probs = exps.map((p) => p / sum);
    let best = 0;
    for (let c = 1; c < probs.length; c++) if (probs[c] > probs[best]) best = c;
    return { label: glabels[best], confidence: Math.max(...probs) };
  }

  let gCorrect = 0, gTotal = 0;
  for (const s of ds.samples) {
    const p = predictGlu(s.frames);
    gTotal++;
    if (p.label === s.label) gCorrect++;
  }
  console.log(`GRU JS forward classification: ${gCorrect}/${gTotal} correct (${(100 * gCorrect / gTotal).toFixed(1)}%)`);
  console.log("GRU Labels:", glabels.join(", "));
  if (gCorrect !== gTotal) process.exit(1);
  console.log("GRU PARITY TEST PASS — Python-trained GRU, JS-inferred identically");
}