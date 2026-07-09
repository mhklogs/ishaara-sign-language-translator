import React, { useState, useEffect } from 'react';
import { FloatingAvatar } from '@/components/FloatingAvatar';

// Initialize Gemini 2.5 Flash lightweight processing model configuration
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

type PipelineStep = 'INPUT_CAPTURE' | 'GLOSS_EXTRACTION' | 'AVATAR_RENDER' | 'ANALYTICS_LOG';

export default function InteractivePipelineDashboard() {
  // Theme and Layout States
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);
  const [activeStep, setActiveStep] = useState<PipelineStep>('INPUT_CAPTURE');
  const [floatingAvatarOpen, setFloatingAvatarOpen] = useState<boolean>(false);

  // Real-time translation loop engines states
  const [inputText, setInputText] = useState<string>('');
  const [translatedGloss, setTranslatedGloss] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(['System initialized. Standing by.']);

  // Image Analyzer state tracking
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageAnalysisResult, setImageAnalysisResult] = useState<string>('');

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Sync theme class to document element
  useEffect(() => {
    const el = document.documentElement;
    if (isDarkMode) {
      el.classList.add('dark');
    } else {
      el.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Core Translation Module: Powered by Gemini 2.5 Flash with robust error handling
  const executeTextToSignGloss = async () => {
    if (!inputText.trim()) {
      alert("Please input context phrase or text tokens first.");
      return;
    }
    
    // Check if the API key is unconfigured or still using the placeholder
    if (!GEMINI_KEY || GEMINI_KEY === "your_actual_gemini_api_key_here") {
      const errorMsg = "Configuration Warning: VITE_GEMINI_API_KEY placeholder detected or missing from .env. Please configure a valid Google Gemini API Key.";
      setSystemLogs(prev => [errorMsg, ...prev]);
      alert(errorMsg);
      return;
    }

    setIsProcessing(true);
    setActiveStep('GLOSS_EXTRACTION');
    setSystemLogs(prev => [`Processing request with Gemini 2.5 Flash...`, ...prev]);
    
    try {
      // Direct integration endpoint for fast client-side inference queries
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Convert the following text into localized Sign Language grammatical Gloss structure (Caps, dropped particles, clear markers): "${inputText}"`
            }]
          }]
        })
      });

      if (!response.ok) {
        const errorJson = await response.json().catch(() => ({}));
        const errMsg = errorJson?.error?.message || `HTTP error! Status: ${response.status}`;
        throw new Error(errMsg);
      }

      const data = await response.json();
      const glossOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text || "FAILED_GLOSS_PARSE";
      setTranslatedGloss(glossOutput);
      setActiveStep('AVATAR_RENDER');
      setSystemLogs(prev => [`Success: Extracted gloss tokens. Driving avatar skeleton model.`, ...prev]);
    } catch (error: any) {
      console.error(error);
      const logError = `Execution Exception Error: ${error.message}`;
      setSystemLogs(prev => [logError, ...prev]);
      alert(`Gemini API Call Failed:\n${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Image Analysis Handler
  const handleImageUploadSimulation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        setImageAnalysisResult("Analyzing signing frames matrix structure...");
        setSystemLogs(prev => ["Vision Model frame tracking matrix initialized.", ...prev]);
        setTimeout(() => {
          setImageAnalysisResult("Detected Key Features: Right hand closed, posture orientation normal. Predicted Sign Value: 'WELCOME'");
          setSystemLogs(prev => ["Vision Model frame tracking matrix completed successfully.", ...prev]);
          setActiveStep('ANALYTICS_LOG');
        }, 1200);
      };
      reader.readAsDataURL(file);
    }
  };

  // Check if API key status is valid
  const hasValidApiKey = GEMINI_KEY && GEMINI_KEY !== "your_actual_gemini_api_key_here";

  return (
    <div className={`${isDarkMode ? 'dark' : ''} min-h-screen font-sans transition-colors duration-200`}>
      <div className="bg-[var(--bg-main)] text-[var(--text-primary)] min-h-screen">
        
        {/* NAV HEADER BRAND BAR */}
        <header className="border-b border-[var(--border-color)] bg-[var(--bg-surface)] px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-[var(--brand-primary)] animate-pulse" />
            <h1 className="text-xl font-bold tracking-tight">SASL <span className="text-[var(--brand-accent)]">Pipeline Engine</span></h1>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${
              hasValidApiKey 
                ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
            }`}>
              API KEY: {hasValidApiKey ? 'CONFIGURED' : 'PLACEHOLDER / MISSING'}
            </span>
            
            <button
              onClick={() => setFloatingAvatarOpen(!floatingAvatarOpen)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg border transition-all shadow-sm ${
                floatingAvatarOpen
                  ? 'bg-[var(--brand-primary)] text-[var(--bg-main)] border-transparent'
                  : 'border-[var(--border-color)] hover:bg-[var(--bg-main)] hover:border-[var(--text-secondary)]'
              }`}
            >
              {floatingAvatarOpen ? 'Close Overlay Widget' : 'Open Overlay Widget'}
            </button>

            <button
              onClick={toggleTheme}
              className="px-4 py-2 text-xs font-semibold rounded-lg border border-[var(--border-color)] hover:bg-[var(--bg-main)] transition-all shadow-sm"
            >
              Set {isDarkMode ? 'Light Palette' : 'Dark Palette'}
            </button>
          </div>
        </header>

        {/* HERO SECTION LANDING ARCHITECTURE */}
        <section className="max-w-7xl mx-auto px-6 pt-12 pb-6 text-center">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight max-w-3xl mx-auto leading-tight">
            Bridging the Communication Barrier with <span className="text-[var(--brand-primary)]">Real-Time Translation</span>
          </h2>
          <p className="mt-4 text-[var(--text-secondary)] max-w-xl mx-auto text-sm md:text-base">
            Process incoming natural spoken phrases, parse structural grammar models via Gemini 2.5 Flash, and review avatar kinematics inside an integrated pipeline.
          </p>
        </section>

        {/* STEP-BY-STEP VERTICAL FLOW WORKSPACE (NO SIDEWAYS CONGESTION) */}
        <main className="max-w-3xl mx-auto px-6 pb-24 space-y-10">
          
          {/* STEP 1: INPUT CAPTURE SECTION CARD */}
          <div className="animate-slide-left p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 01</span>
                <h3 className="font-bold text-base tracking-tight">Input Phrase Capture</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">INPUT_CAPTURE</span>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-[var(--text-secondary)] uppercase">Input Spoken Phrase Tokens</label>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a phrase (e.g., 'Hello friend, how can I assist you with your project tasks today?')..."
                  className="w-full h-24 bg-[var(--bg-main)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] resize-none"
                />
              </div>

              {/* Simulation Upload Box */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="border-2 border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center p-4 text-center bg-[var(--bg-main)] relative min-h-[110px]">
                  {selectedImage ? (
                    <img src={selectedImage} alt="Preview" className="max-h-24 object-contain rounded-lg" />
                  ) : (
                    <div className="space-y-1.5">
                      <span className="text-xl block">📸</span>
                      <p className="text-[11px] text-[var(--text-secondary)]">Simulate video frames / gesture file upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUploadSimulation}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
                <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4 flex flex-col justify-between">
                  <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1">Analyzer Telemetry Payload</span>
                  <div className="text-xs font-mono text-[var(--brand-primary)] bg-[var(--bg-surface)] p-2.5 rounded-lg border border-[var(--border-color)] flex-1 overflow-y-auto min-h-[64px]">
                    {imageAnalysisResult || "Awaiting target gesture payload profile upload..."}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 2: GLOSS EXTRACTION SECTION CARD */}
          <div className="animate-slide-right p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 02</span>
                <h3 className="font-bold text-base tracking-tight">Sign Gloss Translation</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">GLOSS_EXTRACTION</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Translates the captured inputs into sign language token lists powered by a Gemini 2.5 Flash query connection.
              </p>
              
              <button
                onClick={executeTextToSignGloss}
                disabled={isProcessing}
                className="w-full bg-[var(--brand-primary)] hover:opacity-90 text-[var(--bg-main)] font-bold py-3 px-4 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm"
              >
                {isProcessing ? (
                  <span className="w-5 h-5 border-2 border-[var(--bg-main)] border-t-transparent rounded-full animate-spin" />
                ) : 'Run Engine Pipeline Conversion'}
              </button>

              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-4">
                <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block mb-1.5">Translated Sign Gloss Sequence</span>
                <div className="font-tech text-sm text-[var(--brand-accent)] font-bold bg-[var(--bg-surface)] p-3 rounded-lg border border-[var(--border-color)] min-h-[46px] uppercase tracking-wider">
                  {translatedGloss || '[Awaiting pipeline engine trigger...]'}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: AVATAR RENDER SECTION CARD */}
          <div className="animate-slide-left p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 03</span>
                <h3 className="font-bold text-base tracking-tight">3D Sign Skeleton Viewport</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">AVATAR_RENDER</span>
            </div>

            <div className="space-y-4">
              <p className="text-xs text-[var(--text-secondary)]">
                Applies the compiled coordinates to drive spatiotemporal bones and skeletal configurations.
              </p>

              <div className="bg-black rounded-xl relative overflow-hidden flex flex-col items-center justify-center p-6 border border-zinc-800 shadow-inner min-h-[220px]">
                <div className="text-center space-y-2">
                  <span className="text-4xl block animate-bounce">🧍</span>
                  <p className="text-xs font-mono text-zinc-500">GLTF Real-time Pose Mesh Engine Activated</p>
                </div>
                
                {/* Live Real-time Subtitle HUD */}
                <div className="absolute bottom-0 left-0 right-0 bg-zinc-950/95 border-t border-zinc-800 p-2.5 text-center">
                  <span className="text-xs text-green-400 font-mono tracking-widest font-bold block uppercase">
                    {translatedGloss || '[Awaiting pipeline input]'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 4: ANALYTICS & LOGGING SECTION CARD */}
          <div className="animate-slide-right p-6 rounded-2xl border border-[var(--border-color)] bg-[var(--bg-surface)] shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-color)] pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[var(--brand-accent)] tracking-widest font-mono">STEP 04</span>
                <h3 className="font-bold text-base tracking-tight">System Operations Logs</h3>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-tech">ANALYTICS_LOG</span>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-[var(--text-secondary)] uppercase block tracking-wider">System Operations Log</span>
              <div className="bg-[var(--bg-main)] border border-[var(--border-color)] rounded-xl p-3.5 font-mono text-xs overflow-y-auto space-y-2 shadow-inner max-h-[160px]">
                {systemLogs.map((log, index) => (
                  <div key={index} className="text-[var(--text-secondary)] border-b border-[var(--border-color)] pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[var(--brand-accent)] font-bold mr-1.5">»</span> {log}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </main>
      </div>

      {/* Floating Canvas Controller Overlay Widget */}
      {floatingAvatarOpen && (
        <FloatingAvatar
          primaryMode={activeStep === 'AVATAR_RENDER' ? 'SIGNER' : 'SPEAKER'}
          currentGloss={translatedGloss}
          onClose={() => setFloatingAvatarOpen(false)}
        />
      )}
    </div>
  );
}
