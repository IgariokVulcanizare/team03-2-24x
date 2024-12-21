import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';  // Make sure this points to your App.js
import './index.css';     // Optional: for styling

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
