import { useCallback, useEffect, useRef, useState } from "react";
import { normalizeLandmarks, type Landmark } from "../utils/normalize";

function padOrSliceLandmarks(landmarks: Landmark[], targetSize: number): Landmark[] {
  const result = [...landmarks];
  while (result.length < targetSize) {
    result.push({ x: 0, y: 0, z: 0 });
  }
  return result.slice(0, targetSize);
}

function loadHolisticScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if ((window as any).Holistic) return resolve();

    const existing = document.querySelector('script[src*="holistic.js"]');
    if (existing) {
      const interval = setInterval(() => {
        if ((window as any).Holistic) {
          clearInterval(interval);
          resolve();
        }
      }, 100);
      return;
    }

    const cameraScript = document.createElement("script");
    cameraScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js";
    cameraScript.async = true;

    const holScript = document.createElement("script");
    holScript.src = "https://cdn.jsdelivr.net/npm/@mediapipe/holistic/holistic.js";
    holScript.async = true;

    cameraScript.onload = () => document.body.appendChild(holScript);
    holScript.onload = () => resolve();
    cameraScript.onerror = () => reject(new Error("Failed to load MediaPipe camera utils"));
    holScript.onerror = () => reject(new Error("Failed to load MediaPipe Holistic"));

    document.body.appendChild(cameraScript);
  });
}

export interface UseLandmarkCaptureResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isRunning: boolean;
  error: string | null;
  startCapture: () => Promise<boolean>;
  stopCapture: () => void;
  requestFrame: () => Promise<number[] | null>;
}

export function useLandmarkCapture(): UseLandmarkCaptureResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const holisticRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const runningRef = useRef<boolean>(false);
  const initialisedRef = useRef<boolean>(false);

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const teardown = useCallback(() => {
    runningRef.current = false;
    setIsRunning(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const initModel = useCallback(async () => {
    if (initialisedRef.current) return;
    await loadHolisticScript();
    const HolisticClass = (window as any).Holistic;
    if (!HolisticClass) throw new Error("MediaPipe Holistic unavailable");
    const holistic = new HolisticClass({
      locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`,
    });
    holistic.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });
    holisticRef.current = holistic;
    initialisedRef.current = true;
  }, []);

  const flushLandmarks = useCallback((results: any): number[] | null => {
    const pose: Landmark[] = results?.poseLandmarks ?? [];
    if (pose.length === 0) return null;

    let leftHand: Landmark[] = results?.leftHandLandmarks ?? [];
    let rightHand: Landmark[] = results?.rightHandLandmarks ?? [];
    let face: Landmark[] = results?.faceLandmarks ?? [];

    leftHand = normalizeLandmarks(leftHand, pose);
    rightHand = normalizeLandmarks(rightHand, pose);
    face = normalizeLandmarks(face, pose);
    const poseNorm = normalizeLandmarks(pose, pose);

    const combined: Landmark[] = [
      ...padOrSliceLandmarks(poseNorm, 33),
      ...padOrSliceLandmarks(leftHand, 21),
      ...padOrSliceLandmarks(rightHand, 21),
      ...padOrSliceLandmarks(face, 468),
    ];

    return combined.flatMap((lm) => [lm.x, lm.y, lm.z]);
  }, []);

  const requestFrame = useCallback(async (): Promise<number[] | null> => {
    const video = videoRef.current;
    const holistic = holisticRef.current;
    if (!runningRef.current || !video || !holistic) return null;
    if (video.readyState < 2) return null;
    try {
      const results = await holistic.send({ image: video });
      return flushLandmarks(results);
    } catch (e) {
      return null;
    }
  }, [flushLandmarks]);

  const startCapture = useCallback(async (): Promise<boolean> => {
    if (runningRef.current) return true;
    setError(null);
    try {
      await initModel();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });
      if (!videoRef.current) throw new Error("Video element not mounted");
      videoRef.current.srcObject = stream;
      await videoRef.current.play();
      streamRef.current = stream;
      runningRef.current = true;
      setIsRunning(true);
      return true;
    } catch (err: any) {
      setError(err?.message || "Camera failed to start");
      teardown();
      return false;
    }
  }, [initModel, teardown]);

  const stopCapture = useCallback(() => teardown(), [teardown]);

  useEffect(() => {
    return () => teardown();
  }, [teardown]);

  return { videoRef, isRunning, error, startCapture, stopCapture, requestFrame };
}