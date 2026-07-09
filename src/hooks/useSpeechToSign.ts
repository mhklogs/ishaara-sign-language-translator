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

    recognition.onresult = async (event: any) => {
      const resultText = event.results[0][0].transcript;
      setTranscription(resultText);

      let glossTokens: string[] = [];
      const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

      // Call Gemini 2.5 Flash for high-fidelity grammar parsing if API key is configured
      if (GEMINI_KEY && GEMINI_KEY !== "your_actual_gemini_api_key_here") {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Convert the following text into localized Sign Language grammatical Gloss structure (Caps, dropped particles, clear markers): "${resultText}"`
                }]
              }]
            })
          });

          if (response.ok) {
            const data = await response.json();
            const glossOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (glossOutput) {
              glossTokens = glossOutput.split(/\s+/).filter(Boolean);
            }
          }
        } catch (error) {
          console.warn("Gemini call failed inside speech recognizer, falling back to local mapper:", error);
        }
      }

      // Fallback if Gemini failed or wasn't configured
      if (glossTokens.length === 0) {
        glossTokens = convertToSignGloss(resultText, dialect);
      }

      setGlossResult(glossTokens);
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
