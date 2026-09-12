import { useEffect, useState } from "react";

export type HashPath = "/" | "/app";

export function parseHash(): HashPath {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const clean = raw.split("?")[0].split("#")[0];
  if (clean === "/app" || clean.startsWith("/app")) return "/app";
  return "/";
}

export function navigate(hash: HashPath | `/#${string}` | string) {
  const target = hash.startsWith("/") ? hash : hash;
  window.location.hash = `#${target}`;
}

export function useHashRoute(): HashPath {
  const [path, setPath] = useState<HashPath>(parseHash);

  useEffect(() => {
    const onChange = () => {
      setPath(parseHash());
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);

  return path;
}