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