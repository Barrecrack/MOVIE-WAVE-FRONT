import React, { useState } from "react";
import "../styles/styles-components/search-bar.sass";

interface SearchBarProps {
  alBuscar: (term: string) => void;
}

/**
 * Search bar to search for movies or videos.
 * 
 * @component
 * @param {Function} alBuscar - Function that receives the search term.
 */
const SearchBar: React.FC<SearchBarProps> = ({ alBuscar }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim() !== "") {
      alBuscar(searchTerm);
    }
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Buscar películas..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-bar__input"
      />
      <button type="submit" className="search-bar__button">
        🔍
      </button>
    </form>
  );
};

export default SearchBar;
