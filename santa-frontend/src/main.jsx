import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";
import Nav from "./Nav";
import './global.css';
import EarthAnimation from './EarthAnimation';

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <div>
      <Nav /> 
      <Hero />
      <EarthAnimation />
    </div>
  </StrictMode>
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import Hero from "./Hero";
import Nav from "./Nav";
import "./global.css";
import EarthAnimation from "./EarthAnimation";
import FilterChildren from "./FilterChildren";

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <div>
      <Nav />
      <Hero />
      <EarthAnimation />
      <FilterChildren />
    </div>
  </StrictMode>
);
