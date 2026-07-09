import { useEffect, useRef, useState, useCallback } from "react";

type Options = {
  typeSpeed?: number;
  deleteSpeed?: number;
  holdDelay?: number;
};

/** Cycles through phrases with a live typing / hold / delete rhythm. */
export function useTypewriter(phrases: string[], opts: Options = {}) {
  const { typeSpeed = 40, deleteSpeed = 20, holdDelay = 2400 } = opts;
  const [index, setIndex] = useState(0);
  const [text, setText] = useState("");
  const [phase, setPhase] = useState<"typing" | "holding" | "deleting">("typing");
  const [paused, setPaused] = useState(false);

  const phrasesRef = useRef(phrases);
  phrasesRef.current = phrases;
  const count = phrasesRef.current.length || 1;

  useEffect(() => {
    if (paused) return;
    const current = phrasesRef.current[index % count] ?? "";
    let timer: ReturnType<typeof setTimeout>;

    if (phase === "typing") {
      if (text.length < current.length) {
        timer = setTimeout(() => setText(current.slice(0, text.length + 1)), typeSpeed);
      } else {
        timer = setTimeout(() => setPhase("holding"), 280);
      }
    } else if (phase === "holding") {
      timer = setTimeout(() => setPhase("deleting"), holdDelay);
    } else {
      if (text.length > 0) {
        timer = setTimeout(() => setText(current.slice(0, text.length - 1)), deleteSpeed);
      } else {
        setIndex((i) => (i + 1) % count);
        setPhase("typing");
      }
    }
    return () => clearTimeout(timer);
  }, [text, phase, index, count, typeSpeed, deleteSpeed, holdDelay, paused]);

  const togglePause = useCallback(() => {
    setPaused((p) => !p);
  }, []);

  const nextPhrase = useCallback(() => {
    setIndex((i) => (i + 1) % count);
    setPhase("typing");
    setText("");
  }, [count]);

  const prevPhrase = useCallback(() => {
    setIndex((i) => (i - 1 + count) % count);
    setPhase("typing");
    setText("");
  }, [count]);

  const selectPhrase = useCallback((idx: number) => {
    setIndex(idx % count);
    setPhase("typing");
    setText("");
  }, [count]);

  return {
    text,
    full: phrases[index % count] ?? "",
    typing: phase === "typing" && !paused,
    deleting: phase === "deleting" && !paused,
    index,
    paused,
    togglePause,
    nextPhrase,
    prevPhrase,
    selectPhrase,
  };
}
