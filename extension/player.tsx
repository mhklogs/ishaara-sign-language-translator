import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { SignAvatar } from "../src/components/SignAvatar";
import { convertToSignGloss } from "../src/utils/glossMapper";

const MAX_CHIPS = 24;

function GlossPlayer() {
  const [text, setText] = useState("");
  const [speaking, setSpeaking] = useState(false);
  const readySent = useRef(false);

  const gloss = useMemo(() => {
    if (!text.trim()) return [];
    return convertToSignGloss(text).slice(0, MAX_CHIPS);
  }, [text]);

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      const d = e.data || {};
      if (d.type === "ISHAARA_SET_TEXT") {
        setText(String(d.text ?? "").slice(0, 600));
        stopSpeaking();
      } else if (d.type === "ISHAARA_CLOSE") {
        stopSpeaking();
      }
    };
    window.addEventListener("message", onMessage, false);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (readySent.current) return;
    readySent.current = true;
    window.parent?.postMessage({ type: "ISHAARA_READY" }, "*");
  }, []);

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  const speak = () => {
    if (!("speechSynthesis" in window)) return;
    if (speaking) {
      stopSpeaking();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(gloss.join(" "));
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const copy = async () => {
    const value = gloss.join(" ");
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
  };

  return (
    <div className="player">
      <header className="player__header">
        <div className="player__logo">✋</div>
        <div>
          <div className="player__title">
            ISHAARA<em>.</em>
          </div>
          <div className="player__sub">sign any page</div>
        </div>
        <div className="player__spacer" />
        <button className="player__iconbtn" onClick={copy} title="Copy gloss" aria-label="Copy gloss">
          <CopyIcon />
        </button>
        <button
          className="player__iconbtn"
          onClick={() => window.parent?.postMessage({ type: "ISHAARA_CLOSE" }, "*")}
          title="Close"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
      </header>

      <div className="player__stage">
        {text ? (
          <>
            <SignAvatar gesture={gloss.length ? "signing" : "idle"} style={{ width: "100%", height: "100%" }} />
            <div className="player__status">signing</div>
          </>
        ) : (
          <div className="player__empty">
            <div style={{ fontSize: 30 }}>✋</div>
            <b>No text yet</b>
            <p>
              Select any sentence on the page and hit the green <em>“Sign it”</em> bubble — or click
              the ISHAARA toolbar icon to sign this page.
            </p>
          </div>
        )}
      </div>

      <div className="player__body">
        <div className="player__gloss">
          {gloss.length ? (
            gloss.map((w, i) => (
              <span key={i} className="player__chip">
                {w}
              </span>
            ))
          ) : (
            <span style={{ fontSize: 11, color: "#52525b" }}>
              Gloss sequence will appear here…
            </span>
          )}
        </div>
        <div className="player__output">
          <button
            className={`player__speak${speaking ? "" : " stopped"}`}
            onClick={speak}
            disabled={!gloss.length}
          >
            {speaking ? <StopIcon /> : <SpeakerGlyph />}
            {speaking ? "Stop" : "Speak"}
          </button>
          <span className="player__hint">on-device · no cloud</span>
        </div>
      </div>
    </div>
  );
}

function SpeakerGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  );
}

function StopIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" aria-hidden>
      <path d="M6 6 18 18M18 6 6 18" />
    </svg>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GlossPlayer />
  </StrictMode>
);