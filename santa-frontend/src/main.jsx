import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";
import Nav from "./Nav";
import EarthAnimation from "./EarthAnimation";
// import FilterChildren from "./FilterChildren";
import Behaviour from "./behaviour";
import CategorizedGifts from "./CategorizedGifts"; // Import CategorizedGifts component
import Chinchillas from "./Chinchillas.jsx"; // Import Chinchillas component
import './global.css'; // Global styles for the app

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <div className="app-container">
      <Nav />
      <Hero />
      <EarthAnimation />
      {/* <FilterChildren /> */}
      <Behaviour />
      <CategorizedGifts />
      
      {/* Add Chinchillas component here */}
      <Chinchillas />
    </div>
  </StrictMode>
);




























/*
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";
import Nav from "./Nav";
import EarthAnimation from "./EarthAnimation";
import FilterChildren from "./FilterChildren"; // Import the FilterChildren component
import './global.css';

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <div className="app-container">
      <Nav />
      <Hero />
      <EarthAnimation />
      <FilterChildren />
    </div>
  </StrictMode>
);

*/
