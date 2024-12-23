import React, { useState, useEffect } from "react";
import "./global.css"; // Ensure your global styles are imported

const Behaviour = () => {
  const [goodGifts, setGoodGifts] = useState([]);
  const [badGifts, setBadGifts] = useState([]);
  const [searchGood, setSearchGood] = useState("");
  const [searchBad, setSearchBad] = useState("");

  useEffect(() => {
    const fetchGifts = async () => {
      const fetchCSV = async (url) => {
        const response = await fetch(url);
        const text = await response.text();
        return text
          .split("\n")
          .slice(1)
          .map((line) => {
            const [id, name, country, gift] = line.split(",");
            return { id, name, country, gift };
          });
      };

      const goodData = await fetchCSV("/public/good.csv");
      const badData = await fetchCSV("/public/bad.csv");

      setGoodGifts(goodData.filter((row) => row.gift).slice(0, 20));
      setBadGifts(badData.filter((row) => row.gift).slice(0, 20));
    };

    fetchGifts();
  }, []);

  const filterGifts = (gifts, query) =>
    gifts.filter(
      (gift) =>
        gift.name.toLowerCase().includes(query.toLowerCase()) ||
        gift.country.toLowerCase().includes(query.toLowerCase()) ||
        gift.gift.toLowerCase().includes(query.toLowerCase())
    );

  return (
    <div className="behaviour-container">
      <div className="left-right-container">
        <div className="gifts-section left">
          <h2 className="gifts-title good-title">🎄 Obedient Kids 🎁</h2>
          <input
            type="text"
            placeholder="Search Good Gifts..."
            className="filter-input"
            value={searchGood}
            onChange={(e) => setSearchGood(e.target.value)}
          />
          {filterGifts(goodGifts, searchGood).length > 0 ? (
            <div className="table-container">
              <table className="gifts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Gift</th>
                  </tr>
                </thead>
                <tbody>
                  {filterGifts(goodGifts, searchGood).map((gift) => (
                    <tr key={gift.id}>
                      <td>{gift.id}</td>
                      <td>{gift.name}</td>
                      <td>{gift.country}</td>
                      <td>{gift.gift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results">No good gifts found.</p>
          )}
        </div>

        <div className="gifts-section right">
          <h2 className="gifts-title bad-title">🎅 Naughty Kids 🎅</h2>
          <input
            type="text"
            placeholder="Search Bad Gifts..."
            className="filter-input"
            value={searchBad}
            onChange={(e) => setSearchBad(e.target.value)}
          />
          {filterGifts(badGifts, searchBad).length > 0 ? (
            <div className="table-container">
              <table className="gifts-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Country</th>
                    <th>Gift</th>
                  </tr>
                </thead>
                <tbody>
                  {filterGifts(badGifts, searchBad).map((gift) => (
                    <tr key={gift.id}>
                      <td>{gift.id}</td>
                      <td>{gift.name}</td>
                      <td>{gift.country}</td>
                      <td>{gift.gift}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results">No bad gifts found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Behaviour;
