import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";
import Nav from "./Nav";
import EarthAnimation from "./EarthAnimation";
// import FilterChildren from "./FilterChildren";
import Behaviour from "./behaviour";
import CategorizedGifts from "./CategorizedGifts"; // Import CategorizedGifts component
import './global.css';

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <div className="app-container">
      <Nav />
      <Hero />
      <EarthAnimation />
      {/* <FilterChildren /> */}
      <Behaviour />
      
      {/* Add CategorizedGifts component here */}
      <CategorizedGifts />
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