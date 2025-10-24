import React, { useState } from "react";
import "../styles/styles-components/search-bar.sass";

interface SearchBarProps {
  alBuscar: (term: string) => void;
}

/**
 * Barra de búsqueda para buscar películas o videos.
 * 
 * @component
 * @param {Function} alBuscar - Función que recibe el término de búsqueda.
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
