// Define basic structure for MediaPipe landmarks
export interface Landmark {
  x: number;
  y: number;
  z: number;
  visibility?: number;
}

/**
 * Normalizes 3D landmarks relative to the signer's shoulder width.
 * Uses MediaPipe Pose landmarks: Left Shoulder (11) and Right Shoulder (12).
 */
export function normalizeLandmarks(landmarks: Landmark[], poseLandmarks: Landmark[]): Landmark[] {
  if (!poseLandmarks || poseLandmarks.length < 13) return landmarks;

  const leftShoulder = poseLandmarks[11];
  const rightShoulder = poseLandmarks[12];

  // Calculate Euclidean distance between shoulders (the scaling factor)
  const shoulderWidth = Math.sqrt(
    Math.pow(leftShoulder.x - rightShoulder.x, 2) +
    Math.pow(leftShoulder.y - rightShoulder.y, 2) +
    Math.pow(leftShoulder.z - rightShoulder.z, 2)
  );

  // Prevent division by zero if shoulders aren't clearly detected yet
  const scale = shoulderWidth > 0 ? shoulderWidth : 1;

  // Use the mid-point between shoulders as the origin point (0,0,0)
  const originX = (leftShoulder.x + rightShoulder.x) / 2;
  const originY = (leftShoulder.y + rightShoulder.y) / 2;
  const originZ = (leftShoulder.z + rightShoulder.z) / 2;

  return landmarks.map((lm) => ({
    x: (lm.x - originX) / scale,
    y: (lm.y - originY) / scale,
    z: (lm.z - originZ) / scale,
    ...(lm.visibility !== undefined && { visibility: lm.visibility }),
  }));
}
