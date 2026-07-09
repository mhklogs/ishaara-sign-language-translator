import { useEffect, useRef } from "react";

/** Declarative setInterval — pass `null` as delay to pause. */
export function useInterval(callback: () => void, delay: number | null) {
  const saved = useRef(callback);
  saved.current = callback;

  useEffect(() => {
    if (delay === null) return;
    const id = setInterval(() => saved.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
