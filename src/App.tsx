import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FloatingAvatar } from '@/components/FloatingAvatar';
import { SignAvatar } from '@/components/SignAvatar';
import { useMediaPipe } from '@/hooks/useMediaPipe';
import { useSlidingWindow } from '@/hooks/useSlidingWindow';
import { useTFLiteWorker } from '@/hooks/useTFLiteWorker';
import { useSpeechToSign } from '@/hooks/useSpeechToSign';
import { convertToSignGloss } from '@/utils/glossMapper';
import {
  HandIcon,
  MicIcon,
  XIcon,
  CpuIcon,
  SunIcon,
  MoonIcon,
  GlobeIcon,
  FlipIcon,
  ActivityIcon
} from '@/components/icons';
import { Pill, StatusDot } from '@/components/ui';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

type AppMode = 'DEAF_SIGNER' | 'HEARING_SPEAKER';
type PipelineStep = 'INPUT_CAPTURE' | 'GLOSS_EXTRACTION' | 'AVATAR_RENDER' | 'ANALYTICS_LOG';

function LevelMeter({ active }: { active: boolean }) {
  return (
    <div className="flex h-7 items-center justify-center gap-[3px] no-drag">
      {Array.from({ length: 28 }).map((_, i) => (
        <span
          key={i}
          className={`w-[3px] origin-center rounded-full transition-all duration-300 ${active ? "bg-emerald-400 animate-[wave-bar_0.6s_ease-in-out_infinite]" : "bg-zinc-700"}`}
          style={{
            height: active ? "100%" : "20%",
            animationDelay: `${(i % 7) * 0.08}s`,
            opacity: active ? 0.9 : 0.4,
          }}
        />
      ))}
    </div>
  );
}

export default function UnifiedInteractiveDashboard() {
  // Theme and UI layout states
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [appMode, setAppMode] = useState<AppMode>('DEAF_SIGNER');
  const [activeStep, setActiveStep] = useState<PipelineStep>('INPUT_CAPTURE');
  const [floatingAvatarOpen, setFloatingAvatarOpen] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(['System initialized. Standing by.']);
  const [themeText, setThemeText] = useState<string>('Dark');

  // Translation metrics & inputs
  const [inputText, setInputText] = useState<string>('');
  const [translatedGloss, setTranslatedGloss] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Audio / Speech-to-Sign hooks
  const onSpeechGlossReady = useCallback((tokens: string[]) => {
    setTranslatedGloss(tokens.join(' '));
    setSystemLogs(prev => [`Speech transcribed and mapped to Gloss: ${tokens.join(' ')}`, ...prev]);
    setActiveStep('AVATAR_RENDER');
  }, []);

  const {
    isListening: isMicListening,
    transcription: voiceTranscription,
    glossResult: voiceGlossResult,
    startListening: startVoiceCapture,
    stopListening: stopVoiceCapture,
  } = useSpeechToSign(onSpeechGlossReady, {
    dialect: 'PSL',
    language: 'en-US'
  });

  // TFLite / Sign-to-Speech hooks
  const onGesturePredicted = useCallback((gloss: string, confidence: number) => {
    setTranslatedGloss(gloss);
    setSystemLogs(prev => [`TFLite worker prediction: ${gloss} (${(confidence * 100).toFixed(0)}%)`, ...prev]);
    setActiveStep('AVATAR_RENDER');
    
    // Automatic Text-to-Speech Voiceover (Assistive feature for hearing party)
    try {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(gloss.toLowerCase());
        utterance.rate = 1.0;
        window.speechSynthesis.speak(utterance);
        setSystemLogs(prev => [`Synthesized audio voiceover output: "${gloss}"`, ...prev]);
      }
    } catch (e) {
      console.warn("SpeechSynthesis not accessible: ", e);
    }
  }, []);

  const {
    predictGesture,
    isModelLoading: tfliteLoading,
    engineReady: tfliteReady
  } = useTFLiteWorker(onGesturePredicted);

  const onFrameCaptured = useCallback((coordinatesFlat: number[]) => {
    // Pipe coordinates into the sliding window queue
    predictGesture(coordinatesFlat);
  }, [predictGesture]);

  const {
    videoRef,
    isTracking: isCamActive,
    isModelLoading: mediaPipeLoading,
    startTracking: startCamTracking,
    stopTracking: stopCamTracking,
    activeLandmarks
  } = useMediaPipe(onFrameCaptured);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Sync theme class to document
  useEffect(() => {
    const el = document.documentElement;
    if (isDarkMode) {
      el.classList.add('dark');
      setThemeText('Dark');
    } else {
      el.classList.remove('dark');
      setThemeText('Light');
    }
  }, [isDarkMode]);

  // Core Translation Module: Powered by Gemini 2.5 Flash with fallback to local Gloss Engine
  const executeTextToSignGloss = async () => {
    const textTarget = appMode === 'HEARING_SPEAKER' ? (voiceTranscription || inputText) : inputText;
    
    if (!textTarget.trim()) {
      alert("Please input a text phrase or speak into the microphone first.");
      return;
    }

    setIsProcessing(true);
    setActiveStep('GLOSS_EXTRACTION');
    setSystemLogs(prev => [`Processing translation pipeline...`, ...prev]);

    // Check if the API key is not set or still uses placeholder
    if (!GEMINI_KEY || GEMINI_KEY === "your_actual_gemini_api_key_here") {
      // Local grammar mapper fallback
      setTimeout(() => {
        const localGloss = convertToSignGloss(textTarget, 'PSL');
        setTranslatedGloss(localGloss.join(' '));
        setSystemLogs(prev => [
          `[Local Gloss Fallback] Extracted tokens: ${localGloss.join(' ')}`,
          `Warning: Gemini API Key missing or placeholder. Local Translation engine active.`,
          ...prev
        ]);
        setActiveStep('AVATAR_RENDER');
        setIsProcessing(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert the following text into localized Sign Language grammatical Gloss structure (Caps, dropped particles, clear markers): "${textTarget}"`
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      const glossOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "FAILED_GLOSS_PARSE";
      setTranslatedGloss(glossOutput);
      setActiveStep('AVATAR_RENDER');
      setSystemLogs(prev => [`Success: Extracted gloss tokens via Gemini 2.5 Flash.`, ...prev]);
    } catch (error: any) {
      console.error(error);
      const localGloss = convertToSignGloss(textTarget, 'PSL');
      setTranslatedGloss(localGloss.join(' '));
      setSystemLogs(prev => [
        `[Local Gloss Fallback] Extracted tokens: ${localGloss.join(' ')}`,
        `API Call Failed: ${error.message}. Local translation engine active.`,
        ...prev
      ]);
      setActiveStep('AVATAR_RENDER');
    } finally {
      setIsProcessing(false);
    }
  };

  // Switch between Deaf and Hearing modes cleanly, stopping existing streams
  const handleModeSwitch = (mode: AppMode) => {
    stopCamTracking();
    stopVoiceCapture();
    setTranslatedGloss('');
    setInputText('');
    setAppMode(mode);
    setSystemLogs(prev => [`Switched operational mode to: ${mode}`, ...prev]);
    setActiveStep('INPUT_CAPTURE');
  };

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen font-sans transition-colors duration-200`}>
      <div className="bg-[var(--bg-main)] text-[var(--text-primary)] min-h-screen">
        
        {/* NAV HEADER BRAND BAR */}
        <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-3 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            <h1 className="text-lg font-extrabold tracking-tight">ISHAARA <span className="text-[var(--brand-accent)] text-sm font-mono tracking-widest block sm:inline">Engine Workspace</span></h1>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-[9px] font-mono font-bold px-2 py-1 rounded border hidden md:inline-block ${
              GEMINI_KEY && GEMINI_KEY !== "your_actual_gemini_api_key_here"
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              Gemini API Status: {GEMINI_KEY && GEMINI_KEY !== "your_actual_gemini_api_key_here" ? 'Connected' : 'Mock Fallback Active'}
            </span>
            
            <button
              onClick={() => setFloatingAvatarOpen(!floatingAvatarOpen)}
              className={`px-3 py-1.5 text-[11px] font-bold rounded-xl border transition-all ${
                floatingAvatarOpen
                  ? 'bg-[var(--brand-primary)] text-[var(--bg-main)] border-transparent'
                  : 'border-[var(--border-color)] hover:bg-[var(--bg-main)]'
              }`}
            >
              {floatingAvatarOpen ? 'Close Screen Mode' : 'Open Screen Mode'}
            </button>

            <button
              onClick={toggleTheme}
              className="px-3 py-1.5 text-[11px] font-bold rounded-xl border border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-all"
            >
              Theme: {themeText}
            </button>
          </div>
        </header>

        {/* HERO HEADER */}
        <section className="max-w-7xl mx-auto px-6 pt-10 pb-4 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Bi-Directional translation loop
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-[var(--text-secondary)] max-w-lg mx-auto">
            Interactive assistive engine designed for PSL / ISL translation. Select mode below to begin.
          </p>
        </section>

        {/* MODE SELECTOR WORKSPACE */}
        <div className="max-w-3xl mx-auto px-6 grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleModeSwitch('DEAF_SIGNER')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 relative overflow-hidden ${
              appMode === 'DEAF_SIGNER'
                ? 'border-[var(--brand-primary)] bg-[var(--accent-glow)] ring-2 ring-[var(--brand-primary)]'
                : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--text-secondary)]'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <HandIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--brand-accent)] tracking-widest font-mono block">DEAF USER MODE</span>
              <span className="text-[13px] font-bold mt-0.5 block">Sign → Speech</span>
              <span className="text-[10.5px] text-[var(--text-secondary)] block mt-1 leading-snug">Uses camera to read PSL gestures, translates signs, and outputs TTS voiceover.</span>
            </div>
          </button>

          <button
            onClick={() => handleModeSwitch('HEARING_SPEAKER')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-start gap-3.5 relative overflow-hidden ${
              appMode === 'HEARING_SPEAKER'
                ? 'border-[var(--brand-primary)] bg-[var(--accent-glow)] ring-2 ring-[var(--brand-primary)]'
                : 'border-[var(--border-color)] bg-[var(--bg-surface)] hover:border-[var(--text-secondary)]'
            }`}
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <MicIcon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-[var(--brand-accent)] tracking-widest font-mono block">HEARING USER MODE</span>
              <span className="text-[13px] font-bold mt-0.5 block">Speech → Sign</span>
              <span className="text-[10.5px] text-[var(--text-secondary)] block mt-1 leading-snug">Captures spoken voice transcriptions, maps syntax, and drives the 3D rig avatar.</span>
            </div>
          </button>
        </div>

        {/* STEP-BY-STEP VERTICAL FLOW (IPHONE 4 TO DESKTOP FLUID ACCESSIBLE SCROLL) */}
        <main className="max-w-3xl mx-auto px-6 pb-24 space-y-8">
          
          {/* STEP 1: INPUT CAPTURE */}
          <div className="animate-slide-left p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 01</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Input Stream Capture</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">INPUT_CAPTURE</span>
            </div>

            {appMode === 'DEAF_SIGNER' ? (
              <div className="space-y-4">
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                  Place yourself in front of the camera. The system automatically scans exactly 543 spatiotemporal landmark points (pose, hands, face) at 90% bandwidth reduction.
                </p>
                
                {/* Camera Viewport Container */}
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--border-color)] bg-zinc-950">
                  <video
                    ref={videoRef}
                    className="absolute inset-0 h-full w-full object-cover scale-x-[-1]"
                    playsInline
                    muted
                  />
                  {!isCamActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-zinc-950/80">
                      <span className="text-3xl mb-1.5">📷</span>
                      <span className="text-[12px] font-bold text-zinc-300">Camera Feed is Standby</span>
                      <span className="text-[10px] text-zinc-500 mt-0.5">Click Start Tracking below to activate</span>
                    </div>
                  )}
                  {isCamActive && (
                    <div className="absolute top-2.5 left-2.5 bg-black/60 px-2 py-0.5 rounded text-[8px] font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping" />
                      LIVE FEED SCANNING
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={isCamActive ? stopCamTracking : startCamTracking}
                    className={`flex-1 font-bold py-2.5 px-4 rounded-xl transition text-xs ${
                      isCamActive
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-main)]'
                    }`}
                  >
                    {isCamActive ? 'Turn Camera Off' : 'Start Camera Tracking'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                  Speak clearly into your microphone, or type your query phrase directly inside the text editor box.
                </p>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--text-secondary)] uppercase">Text Input Editor</label>
                  <textarea
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type words here or use the voice recorder below..."
                    className="w-full h-20 bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
                  />
                </div>

                {/* Voice Capture Bar */}
                <div className="border border-[var(--border-color)] bg-[var(--bg-main)] rounded-xl p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-[var(--text-secondary)]">Live Voice Recorder</span>
                    <span className="text-[9px] font-tech text-zinc-500">48kHz · mono</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={isMicListening ? stopVoiceCapture : startVoiceCapture}
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                        isMicListening
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[var(--brand-primary)] text-[var(--bg-main)] hover:opacity-95'
                      }`}
                    >
                      <MicIcon className="h-5 w-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-medium truncate">
                        {isMicListening ? 'Listening to voice...' : voiceTranscription || 'Microphone standby'}
                      </div>
                      <div className="mt-1">
                        <LevelMeter active={isMicListening} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: GLOSS TRANSLATION */}
          <div className="animate-slide-right p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 02</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">Translation Engine</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">GLOSS_EXTRACTION</span>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Processes input structures to extract localized Sign Language Gloss tokens. Falls back automatically to client-side mapping rules if key is missing.
              </p>

              {appMode === 'HEARING_SPEAKER' && (
                <button
                  onClick={executeTextToSignGloss}
                  disabled={isProcessing}
                  className="w-full bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-main)] font-bold py-2.5 px-4 rounded-xl transition text-xs flex items-center justify-center gap-2 shadow-sm"
                >
                  {isProcessing ? (
                    <span className="w-4 h-4 border-2 border-[var(--bg-main)] border-t-transparent rounded-full animate-spin" />
                  ) : 'Translate Spoken/Typed Inputs'}
                </button>
              )}

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3.5">
                <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block mb-1">Sign Gloss Sequence Output</span>
                <div className="font-tech text-xs text-[var(--brand-accent)] font-extrabold bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-color)] uppercase tracking-widest min-h-[40px]">
                  {translatedGloss || '[Awaiting input capture...]'}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: AVATAR VIEWPORT */}
          <div className="animate-slide-left p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 03</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">3D Sign Avatar Canvas</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">AVATAR_RENDER</span>
            </div>

            <div className="space-y-4">
              <p className="text-[11px] sm:text-xs text-[var(--text-secondary)]">
                Drives structural rig configurations based on the spatiotemporal coordinates window.
              </p>

              <div className="bg-black rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-6 border border-zinc-800 shadow-inner min-h-[220px]">
                <SignAvatar
                  gesture={translatedGloss ? 'signing' : 'idle'}
                  className="absolute inset-0"
                />
                
                {/* HUD Subtitle Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 p-2.5 text-center">
                  <span className="text-[10.5px] text-green-400 font-mono tracking-widest font-bold block uppercase">
                    {translatedGloss || '[AWAITING TRANSLATION]'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: SYSTEM LOGS */}
          <div className="animate-slide-right p-5 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 04</span>
                <h3 className="font-bold text-sm sm:text-base tracking-tight">System Operations Logs</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">ANALYTICS_LOG</span>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-secondary)] uppercase block tracking-wider">System Diagnostics telemetry</span>
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3 font-mono text-[10.5px] overflow-y-auto space-y-2 shadow-inner max-h-[140px]">
                {systemLogs.map((log, idx) => (
                  <div key={idx} className="text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[var(--brand-accent)] font-bold mr-1.5">»</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Floating Canvas Overlay Widget */}
      {floatingAvatarOpen && (
        <FloatingAvatar
          primaryMode={appMode === 'HEARING_SPEAKER' ? 'SPEAKER' : 'SIGNER'}
          currentGloss={translatedGloss}
          onClose={() => setFloatingAvatarOpen(false)}
        />
      )}
    </div>
  );
}
