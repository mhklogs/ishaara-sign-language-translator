// tflite.worker.ts - Runs on a separate background thread

let isModelLoading = false;
let isModelReady = false;

// Mock Glossary Mapping for South Asian Sign Language tokens (PSL/ISL)
const GLOSS_DICTIONARY: Record<number, string> = {
  0: "Assalam-o-Alaikum / Namaste",
  1: "Shukriya / Thank You",
  2: "Aap",
  3: "Kaisay",
  4: "Hain",
};

async function initModel() {
  if (isModelReady || isModelLoading) return;
  isModelLoading = true;
  try {
    // Simulate loading the quantized edge model
    await new Promise((resolve) => setTimeout(resolve, 1000));
    isModelReady = true;
    self.postMessage({ type: 'STATUS', payload: 'READY' });
  } catch (error) {
    self.postMessage({ type: 'STATUS', payload: 'ERROR', error: 'Failed to load TFLite engine' });
  } finally {
    isModelLoading = false;
  }
}

self.onmessage = async (event: MessageEvent) => {
  const { type, payload } = event.data;

  if (type === 'INIT') {
    await initModel();
  }

  if (type === 'INFERENCE_RUN') {
    if (!isModelReady) {
      self.postMessage({ type: 'INFERENCE_RESULT', error: 'Model not initialized yet' });
      return;
    }

    try {
      const windowTensor = payload as number[][];

      // Execute simulated spatiotemporal transformer calculation
      // We check average movement velocity of keypoints across frames to trigger class outputs
      let leftHandMotion = 0;
      let rightHandMotion = 0;

      for (let f = 1; f < windowTensor.length; f++) {
        const prevFrame = windowTensor[f - 1];
        const currFrame = windowTensor[f];

        if (prevFrame && currFrame) {
          // Left hand indices range roughly from 1503 to 1566
          for (let i = 1503; i < 1566; i += 3) {
            const dx = currFrame[i] - prevFrame[i];
            const dy = currFrame[i + 1] - prevFrame[i + 1];
            const dz = currFrame[i + 2] - prevFrame[i + 2];
            leftHandMotion += Math.sqrt(dx * dx + dy * dy + dz * dz);
          }
          // Right hand indices range roughly from 1566 to 1629
          for (let i = 1566; i < 1629; i += 3) {
            const dx = currFrame[i] - prevFrame[i];
            const dy = currFrame[i + 1] - prevFrame[i + 1];
            const dz = currFrame[i + 2] - prevFrame[i + 2];
            rightHandMotion += Math.sqrt(dx * dx + dy * dy + dz * dz);
          }
        }
      }

      const totalMotion = leftHandMotion + rightHandMotion;
      let maxPredictionIndex = 0;
      let confidence = 0.85;

      if (totalMotion < 0.25) {
        maxPredictionIndex = 0; // Assalam-o-Alaikum / Namaste
        confidence = 0.96;
      } else if (leftHandMotion > rightHandMotion * 1.4) {
        maxPredictionIndex = 1; // Shukriya / Thank You
        confidence = 0.89 + Math.random() * 0.09;
      } else if (rightHandMotion > leftHandMotion * 1.4) {
        maxPredictionIndex = 2; // Aap
        confidence = 0.84 + Math.random() * 0.11;
      } else if (totalMotion > 2.2) {
        maxPredictionIndex = 3; // Kaisay
        confidence = 0.88 + Math.random() * 0.08;
      } else {
        maxPredictionIndex = 4; // Hain
        confidence = 0.92 + Math.random() * 0.06;
      }

      const predictedGloss = GLOSS_DICTIONARY[maxPredictionIndex] || "Unknown Gesture";

      self.postMessage({
        type: 'INFERENCE_RESULT',
        payload: {
          gloss: predictedGloss,
          confidence: confidence,
        },
      });
    } catch (err) {
      self.postMessage({ type: 'INFERENCE_RESULT', error: 'Prediction computation failed' });
    }
  }
};
