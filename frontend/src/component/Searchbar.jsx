import React, { useState } from "react";
import "./SearchBar.css"; // CSS for the SearchBar component

const SearchBar = ({ onSelectLocation , onClearSearchLocation}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  // Fetch location suggestions from the Nominatim API
  const fetchLocations = async (searchText) => {
    if (!searchText) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchText
        )}`
      );
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Error fetching location data:", error);
    }
  };

  // Handle input change
  const handleInputChange = (e) => {
    const text = e.target.value;
    setQuery(text);
    fetchLocations(text);
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setQuery(location.display_name);
    setSuggestions([]);
    onSelectLocation([parseFloat(location.lat), parseFloat(location.lon)]);
  };

  const handleQueryClear = () => {
    setQuery("");
    setSuggestions([])
    onClearSearchLocation();
  }

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search for places..."
        value={query}
        onChange={handleInputChange}
      />
      <button className="btn-search-remove" onClick={handleQueryClear}>❌</button>
      {suggestions.length > 0 && (
        <ul className="suggestions">
          {suggestions.map((suggestion, index) => (
            <li key={index} onClick={() => handleLocationSelect(suggestion)}>
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SearchBar;
