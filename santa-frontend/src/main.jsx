import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <Hero />
  </StrictMode>
);