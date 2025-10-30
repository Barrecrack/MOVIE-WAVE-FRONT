import React, { useState } from "react";
import "../styles/styles-components/search-bar.sass";

interface SearchBarProps {
  alBuscar: (term: string) => void;
}

/**
 * Search bar component for finding movies or videos.
 *
 * @component
 * @param {Function} alBuscar - Function that receives the search term and triggers the search logic.
 */
const SearchBar: React.FC<SearchBarProps> = ({ alBuscar }) => {
  const [searchTerm, setSearchTerm] = useState("");

  /**
   * Handles the form submission event.
   * Prevents default refresh behavior and calls the search callback if the term is not empty.
   *
   * @param {React.FormEvent} e - The form submission event.
   */
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
