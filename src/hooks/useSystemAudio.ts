import { useState, useCallback, useRef } from 'react';

export function useSystemAudio(onAudioChunkCaptured: (audioData: Float32Array) => void) {
  const [isCapturing, setIsCapturing] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const startSystemCapture = useCallback(async () => {
    try {
      // Request system tab audio loop capture permissions
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true, // Required by browsers to let users select the window/tab
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      });
      
      // Cut off the video track instantly to save local CPU processing bandwidth
      stream.getVideoTracks().forEach(track => track.stop());
      streamRef.current = stream;

      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(4096, 1, 1);

      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = (e) => {
        const inputData = e.inputBuffer.getChannelData(0);
        onAudioChunkCaptured(new Float32Array(inputData));
      };

      setIsCapturing(true);
    } catch (err) {
      console.error("System tab capture authorization declined: ", err);
    }
  }, [onAudioChunkCaptured]);

  const stopSystemCapture = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsCapturing(false);
  }, []);

  return { isCapturing, startSystemCapture, stopSystemCapture };
}
