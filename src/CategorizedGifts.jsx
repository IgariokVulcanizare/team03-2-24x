import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import './locals.css'; // Import the CSS file for styling

const CategorizedGifts = () => {
  const [gifts, setGifts] = useState([]);
  const [category, setCategory] = useState('Musical Instruments'); // Set default category

  // Function to load CSV file and parse it
  useEffect(() => {
    Papa.parse('/categorized_gifts.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setGifts(result.data); // Save parsed data into state
      },
      error: (error) => {
        console.error('Error reading the CSV file:', error);
      },
    });
  }, []);

  // Filter gifts by selected category and limit to 20
  const filteredGifts = gifts
    .filter(gift => gift.Category === category)
    .slice(0, 20); // Limit to the first 20 gifts

  return (
    <div className="categorized-gifts">
      {/* Festive lollipop corners */}
      <img src="/lol.png" alt="Lollipop" className="corner-lollipop top-left" />
      <img src="/lol.png" alt="Lollipop" className="corner-lollipop top-right" />
      <img src="/lol.png" alt="Lollipop" className="corner-lollipop bottom-left" />
      <img src="/lol.png" alt="Lollipop" className="corner-lollipop bottom-right" />

      <h1>Gift Categories</h1>

      {/* Category selection dropdown */}
      <div className="category-selector">
        <label>Choose Category:</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Musical Instruments">Musical Instruments</option>
          <option value="Toys and Vehicles">Toys and Vehicles</option>
          <option value="Games and Puzzles">Games and Puzzles</option>
          <option value="Food Cooking">Food Cooking</option>
          <option value="Miscellaneous">Miscellaneous</option>
        </select>
      </div>

      {/* Display the filtered gifts */}
      <div className="gift-list">
        {filteredGifts.length > 0 ? (
          filteredGifts.map((gift, index) => (
            <div key={index} className="gift-item">
              <p><strong>Kid Name:</strong> {gift['Kid Name']}</p>
              <p><strong>Gift:</strong> {gift.Gift}</p>
            </div>
          ))
        ) : (
          <p>No gifts found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategorizedGifts;
