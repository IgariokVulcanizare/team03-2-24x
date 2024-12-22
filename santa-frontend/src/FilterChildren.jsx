import React, { useState } from "react";
import Papa from "papaparse"; // For parsing CSV files
import "./global.css";

const FilterChildren = () => {
  const [csvData, setCsvData] = useState([]);
  const [filters, setFilters] = useState({
    name: "",
    countryId: "",
    giftPreference: "",
  });

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
        },
      });
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = () => {
    return csvData.filter((child) => {
      const matchesName = child.Name?.toLowerCase().includes(filters.name.toLowerCase());
      const matchesCountryId = child.CountryID?.includes(filters.countryId);
      const matchesGiftPreference = child.Gift?.toLowerCase().includes(filters.giftPreference.toLowerCase());

      return matchesName && matchesCountryId && matchesGiftPreference;
    });
  };

  const filteredChildren = applyFilters();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Filter Children</h1>
      <div>
        <label>
          Upload CSV:
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={filters.name}
            onChange={handleInputChange}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Country ID:
          <input
            type="text"
            name="countryId"
            value={filters.countryId}
            onChange={handleInputChange}
          />
        </label>
        <label style={{ marginLeft: "20px" }}>
          Gift Preference:
          <input
            type="text"
            name="giftPreference"
            value={filters.giftPreference}
            onChange={handleInputChange}
          />
        </label>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h2>Filtered Results:</h2>
        {filteredChildren.length > 0 ? (
          <table border="1" style={{ width: "100%", textAlign: "left" }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Country ID</th>
                <th>Gift</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child, index) => (
                <tr key={index}>
                  <td>{child.Name}</td>
                  <td>{child.CountryID}</td>
                  <td>{child.Gift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No children match the filters.</p>
        )}
      </div>
    </div>
  );
};

export default FilterChildren;
