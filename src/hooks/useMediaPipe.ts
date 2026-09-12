import { useState, useEffect, useRef, useCallback } from 'react';
import { normalizeLandmarks, Landmark } from '../utils/normalize';

interface UseMediaPipeResult {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isLoading: boolean;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
  error: string | null;
}

function padOrSliceLandmarks(landmarks: Landmark[], targetSize: number): Landmark[] {
  const result = [...landmarks];
  while (result.length < targetSize) {
    result.push({ x: 0, y: 0, z: 0 });
  }
  return result.slice(0, targetSize);
}

export function useMediaPipe(
  onFrameProcessed: (flattenedCoords: number[]) => void
): UseMediaPipeResult {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isTracking, setIsTracking] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const animationFrameRef = useRef<number | null>(null);
  const holisticRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const activeRef = useRef<boolean>(false);

  // Dynamic script loader for CDN MediaPipe Holistic
  const loadMediaPipeScripts = useCallback((): Promise<void> => {
    return new Promise((resolve, reject) => {
      if ((window as any).Holistic) {
        resolve();
        return;
      }

      const holisticScript = document.querySelector('script[src*="holistic.js"]');
      if (holisticScript) {
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

      cameraScript.onload = () => {
        document.body.appendChild(holScript);
      };
      holScript.onload = () => {
        resolve();
      };
      cameraScript.onerror = () => reject(new Error("Failed to load MediaPipe Camera utils"));
      holScript.onerror = () => reject(new Error("Failed to load MediaPipe Holistic"));

      document.body.appendChild(cameraScript);
    });
  }, []);

  // Process incoming frame matrices into a structured 543 array sequence
  const handleResults = useCallback((results: any) => {
    if (!activeRef.current) return;

    let pose = results.poseLandmarks || [];
    let leftHand = results.leftHandLandmarks || [];
    let rightHand = results.rightHandLandmarks || [];
    let face = results.faceLandmarks || [];

    // Apply distance-agnostic shoulder normalization matrix
    if (pose.length > 0) {
      leftHand = normalizeLandmarks(leftHand, pose);
      rightHand = normalizeLandmarks(rightHand, pose);
      face = normalizeLandmarks(face, pose);
      pose = normalizeLandmarks(pose, pose);
    }

    // Pad or structure missing tracking targets to keep shape static at 543 items
    const combined: Landmark[] = [
      ...padOrSliceLandmarks(pose, 33),
      ...padOrSliceLandmarks(leftHand, 21),
      ...padOrSliceLandmarks(rightHand, 21),
      ...padOrSliceLandmarks(face, 468),
    ];

    // Flatten elements out into a pure unrolled numerical floating matrix array [x1, y1, z1, x2, y2, z2...]
    const flattened = combined.flatMap((lm) => [lm.x, lm.y, lm.z]);
    if (flattened.length > 0) {
      onFrameProcessed(flattened);
    }
  }, [onFrameProcessed]);

  const stopTracking = useCallback(() => {
    activeRef.current = false;
    setIsTracking(false);

    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    if (holisticRef.current) {
      try {
        holisticRef.current.close();
      } catch (e) {
        console.error("Error closing Holistic model:", e);
      }
      holisticRef.current = null;
    }
  }, []);

  // Pre-warm MediaPipe bundle load so first camera start is instant
  useEffect(() => {
    async function initMediaPipe() {
      setIsLoading(true);
      try {
        await loadMediaPipeScripts();
      } catch (err) {
        setError('Failed to initialize MediaPipe Holistic engine.');
      } finally {
        setIsLoading(false);
      }
    }
    initMediaPipe();

    return () => {
      stopTracking();
    };
  }, [loadMediaPipeScripts, stopTracking]);

  const startTracking = useCallback(async () => {
    if (!videoRef.current || activeRef.current) return;

    setError(null);
    activeRef.current = true;

    try {
      await loadMediaPipeScripts();
      const HolisticClass = (window as any).Holistic;
      if (!HolisticClass) {
        throw new Error("MediaPipe Holistic library not loaded.");
      }

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

      holistic.onResults(handleResults);
      holisticRef.current = holistic;
      setIsTracking(true);

      const processFrame = async () => {
        if (!activeRef.current) return;
        const video = videoRef.current;
        if (!video || video.paused || video.ended) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
          return;
        }

        try {
          await holistic.send({ image: video });
        } catch (e) {
          console.error("Frame processing error:", e);
        }

        if (activeRef.current) {
          animationFrameRef.current = requestAnimationFrame(processFrame);
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      videoRef.current.srcObject = stream;
      videoRef.current.play();
      streamRef.current = stream;

      animationFrameRef.current = requestAnimationFrame(processFrame);
    } catch (err: any) {
      console.error("Webcam initialization failed:", err);
      setError(err.message || "Failed to initialize MediaPipe Holistic.");
      stopTracking();
    }
  }, [handleResults, loadMediaPipeScripts, stopTracking]);

  return { videoRef, isLoading, isTracking, startTracking, stopTracking, error };
}