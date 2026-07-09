// src/hooks/useSpeechToSign.ts
import { useState, useEffect, useCallback, useRef } from 'react';
import { convertToSignGloss, Dialect } from '../utils/glossMapper';

interface UseSpeechToSignOptions {
  dialect?: Dialect;
  language?: 'en-US' | 'ur-PK'; // Supports English or Urdu voice input targets
}

export function useSpeechToSign(
  onGlossReady: (glossTokens: string[]) => void,
  options: UseSpeechToSignOptions = {}
) {
  const { dialect = 'PSL', language = 'en-US' } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcription, setTranscription] = useState('');
  const [glossResult, setGlossResult] = useState<string[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check for browser SpeechRecognition compatibility
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Web Speech API is not supported in this browser environment.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Stop listening automatically once speech pauses
    recognition.interimResults = false;
    recognition.lang = language;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognition.onresult = (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscription(resultText);

      // Pass the speech string into our reordering grammar pipeline
      const glossTokens = convertToSignGloss(resultText, dialect);
      setGlossResult(glossTokens);

      // Trigger the 3D avatar sequence loading callback
      onGlossReady(glossTokens);
    };

    recognitionRef.current = recognition;
  }, [dialect, language, onGlossReady]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error("SpeechRecognition start error:", e);
      }
    }
  }, [isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error("SpeechRecognition stop error:", e);
      }
    }
  }, [isListening]);

  return {
    isListening,
    transcription,
    glossResult,
    startListening,
    stopListening
  };
}
