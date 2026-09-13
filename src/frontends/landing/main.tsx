import "../../index.css";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Landing from "../../pages/Landing";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Landing />
  </StrictMode>
);