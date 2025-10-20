import React, { useEffect, useState } from "react";
import "../styles/movies.sass";
import SearchBar from "../components/search-bar.tsx";
import VideoModal from "../components/video-modal.tsx";
import type { Categoria, ResultadoBusquedaVideo } from "../types/vide.types.ts";

/**
 * Categories available to filter movies.
 */
const MOVIE_CATEGORIES: Categoria[] = [
  { id: "1", nombre: "Acción", consulta: "action" },
  { id: "2", nombre: "Comedia", consulta: "comedy" },
  { id: "3", nombre: "Terror", consulta: "horror" },
  { id: "4", nombre: "Ciencia Ficción", consulta: "sci-fi" },
  { id: "5", nombre: "Romance", consulta: "romance" },
  { id: "6", nombre: "Documentales", consulta: "documentary" },
];

/**
 * Movie listing page.
 * Contains search, category filtering, and a detail mode.
 */
const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<ResultadoBusquedaVideo[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const [error, setError] = useState<string | null>(null);

  /**
   * Gets movies from the backend based on category or search.
   * @param query Search term or category
   */
  const loadMovies = async (query: string) => {
    try {
      setLoading(true);
      setError(null);
      const url = `${import.meta.env.VITE_API_LOCAL_URL}/videos/search?query=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error al obtener películas");
      const data = await res.json();
      setMovies(data);
    } catch (err: any) {
      console.error(err);
      setError("Hubo un problema al cargar las películas. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Change the active category and reload the movies.
   */
  const handleCategoryChange = (categoryQuery: string) => {
    setActiveCategory(categoryQuery);
    loadMovies(categoryQuery);
  };

  /**
   * Handles search by term.
   */
  const handleSearch = (term: string) => {
    setActiveCategory("");
    loadMovies(term);
  };

  /**
   * Opens the modal with the details of the selected movie.
   */
  const openModal = (id: number) => setSelectedMovieId(id);

  /**
   * Close the modal.
   */
  const closeModal = () => setSelectedMovieId(null);

  /**
   * Load popular movies when mounting.
   */
  useEffect(() => {
    loadMovies("popular");
  }, []);

  return (
    <div className="movies">
      <header className="movies__header">
        <h1 className="movies__title">Explora Películas</h1>
        <SearchBar alBuscar={handleSearch} />
      </header>

      <div className="movies__filters">
        {MOVIE_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            className={`movies__filter ${activeCategory === cat.consulta ? "active" : ""}`}
            onClick={() => handleCategoryChange(cat.consulta)}
          >
            {cat.nombre}
          </button>
        ))}
      </div>

      {loading && (
        <div className="movies__loading">
          <div className="movies__spinner"></div>
          <p>Cargando películas...</p>
        </div>
      )}

      {error && <p className="movies__error">{error}</p>}

      {!loading && !error && (
        <div className="movies__grid">
          {movies.length === 0 ? (
            <p className="movies__empty">No se encontraron resultados.</p>
          ) : (
            movies.map((movie) => (
              <div key={movie.id} className="movies__card" onClick={() => openModal(movie.id)}>
                <img
                  src={movie.poster || "/images/default-movie.jpg"}
                  alt={movie.title}
                  className="movies__image"
                />
                <div className="movies__info">
                  <h3 className="movies__name">{movie.title}</h3>
                  <p className="movies__genre">{movie.genre}</p>
                  <p className="movies__year">{movie.year}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedMovieId && <VideoModal videoId={selectedMovieId} alCerrar={closeModal} />}
    </div>
  );
};

export default MoviesPage;
