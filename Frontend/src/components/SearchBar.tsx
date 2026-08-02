import React, { useState } from "react";
import { Search } from "lucide-react";

interface Props {
  onSearch: (city: string) => void;
  loading?: boolean;
}

const SearchBar = ({ onSearch, loading }: Props) => {
  const [city, setCity] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!city.trim() || loading) return;
    onSearch(city.trim());
  };

  const quickCities = ["Lucknow", "London", "Tokyo", "New York", "Mumbai"];

  return (
    <div className="search-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="input-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Search City..."
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" className="search-button" disabled={loading} aria-label="Search">
            {loading ? <span className="spinner" /> : <Search size={20} />}
          </button>
        </div>
      </form>

      <div className="quick-cities">
        <span className="quick-title">Popular:</span>
        {quickCities.map((c) => (
          <button
            key={c}
            type="button"
            className="city-chip"
            onClick={() => {
              setCity(c);
              onSearch(c);
            }}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchBar;
