import React, { StrictMode } from "react";
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
<<<<<<< HEAD





























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
=======
>>>>>>> 4c3e0efe3963f3ab4b9046d6c4c3c16e80ff8f3e
