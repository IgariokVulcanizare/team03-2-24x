import React, { useState, useEffect } from "react";
import Papa from "papaparse"; // Ensure you have this dependency installed

const FilterChildren = () => {
  const [children, setChildren] = useState([]); // Holds all the children data
  const [filter, setFilter] = useState({ name: "", country: "", goodBad: "", gift: "" }); // Filter state
  const [filteredChildren, setFilteredChildren] = useState([]); // Holds the filtered children data

  useEffect(() => {
    // Fetch the CSV file from the public folder
    fetch("/santa_gift_results.csv")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        return response.text();
      })
      .then((csvData) => {
        Papa.parse(csvData, {
          complete: (result) => {
            console.log("Parsed CSV Data:", result.data); // Log the parsed CSV data
            console.log("Parsed Headers:", result.meta.fields); // Log the headers to check for the right name

            // Map children data and sanitize
            const sanitizedChildren = result.data.map((child) => {
              return {
                ...child,
                Name: child["Name"] || "", // Sanitize Name
                Country: child["Country"] || "", // Sanitize Country
                "Good/Bad": child["Good/Bad"] || "", // Sanitize Good/Bad
                Gift: child["Gift"] || "", // Sanitize Gift
              };
            });

            setChildren(sanitizedChildren);
          },
          header: true, // Assumes the first row contains headers
        });
      })
      .catch((error) => {
        console.error("Error fetching or parsing the CSV:", error);
      });
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilter((prev) => ({ ...prev, [name]: value }));

    applyFilter({ ...filter, [name]: value });
  };

  const applyFilter = (filter) => {
    console.log("Applied filter:", filter); // Check the filter being applied

    const filtered = children.filter((child) => {
      // Apply all filter conditions except for ID
      return (
        (filter.name ? child.Name?.toLowerCase().includes(filter.name.toLowerCase()) : true) &&
        (filter.country ? child.Country?.toLowerCase().includes(filter.country.toLowerCase()) : true) &&
        (filter.goodBad ? child["Good/Bad"]?.toLowerCase().includes(filter.goodBad.toLowerCase()) : true) &&
        (filter.gift ? child.Gift?.toLowerCase().includes(filter.gift.toLowerCase()) : true)
      );
    });

    console.log("Filtered children:", filtered); // Log the filtered result

    setFilteredChildren(filtered); // Update the filtered data state
  };

  return (
    <div className="filter-children-container">
      <h2 className="title">Santa's Children Filter</h2>

      {children.length === 0 ? (
        <p className="no-results">Loading children data...</p>
      ) : (
        <div className="filter-controls">
          <h3>Filter Children</h3>
          <div className="filter-inputs">
            <input
              type="text"
              name="name"
              placeholder="Name"
              value={filter.name}
              onChange={handleFilterChange}
              className="input-field"
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={filter.country}
              onChange={handleFilterChange}
              className="input-field"
            />
            <input
              type="text"
              name="goodBad"
              placeholder="Good/Bad"
              value={filter.goodBad}
              onChange={handleFilterChange}
              className="input-field"
            />
            <input
              type="text"
              name="gift"
              placeholder="Gift"
              value={filter.gift}
              onChange={handleFilterChange}
              className="input-field"
            />
          </div>
        </div>
      )}

      {/* Show filtered children only after applying the filter */}
      {filteredChildren.length > 0 && (
        <div className="filter-results">
          <h3>Filtered Children</h3>
          <table className="children-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Country</th>
                <th>Good/Bad</th>
                <th>Gift</th>
              </tr>
            </thead>
            <tbody>
              {filteredChildren.map((child, index) => (
                <tr key={index}>
                  <td>{child.Name}</td>
                  <td>{child.Country}</td>
                  <td>{child["Good/Bad"]}</td>
                  <td>{child.Gift}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Display this if no filtered children are available */}
      {filteredChildren.length === 0 && (
        <p className="no-results">No children match the filter criteria.</p>
      )}
    </div>
  );
};

export default FilterChildren;