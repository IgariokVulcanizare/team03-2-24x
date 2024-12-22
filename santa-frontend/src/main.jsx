import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Hero from "./Hero";
import Nav from "./Nav";
import EarthAnimation from "./EarthAnimation";
import FilterChildren from "./FilterChildren"
import Behaviour from "./behaviour";
import CategorizedGifts from "./CategorizedGifts"; // Import CategorizedGifts components
import './global.css';

createRoot(document.getElementById("app")).render(
  <StrictMode>



      {/* <Nav />
      <Hero />
      <EarthAnimation />
      {/* <FilterChildren /> */}
      {/* <Behaviour /> */}
      
      {/* Add CategorizedGifts component here */}
      {/* <CategorizedGifts /> */}

    <div className="app-container">
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Hero />} />
          <Route path="/earth-animation" element={<EarthAnimation />} />
          <Route path="/filter-children" element={<FilterChildren />} />
          <Route path="/behaviour" element={<Behaviour />} />
          <Route path="/categorized-gifts" element={<CategorizedGifts />} />
        </Routes>
      </BrowserRouter>
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
