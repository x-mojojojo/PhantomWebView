import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { initPlatform } from "./native/platform";

// Initialize Capacitor native plugins before first render.
// On web, this is a no-op.
initPlatform().then(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
});
