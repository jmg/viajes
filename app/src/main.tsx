import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// PWA: registrar service worker solo en producción (en dev rompe el HMR de Vite).
if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // BASE_URL respeta el subpath (ej: "/viajes/" en GitHub Pages, "/" en local).
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {});
  });
}
