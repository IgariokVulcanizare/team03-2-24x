import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./global.css"; // Optional: Ensure global styles are loaded

// Ensure this matches your HTML file's root element ID
createRoot(document.getElementById("app")).render(<App />);
