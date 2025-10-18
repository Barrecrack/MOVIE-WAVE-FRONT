import React, { useEffect, useState } from "react";
import "../styles/movies.sass";
import SearchBar from "../components/search-bar.tsx";
import VideoModal from "../components/video-modal.tsx";
import type { Categoria, ResultadoBusquedaVideo } from "../types/vide.types.ts";

/**
 * Categorías disponibles para filtrar películas.
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
 * Página de listado de películas.
 * Contiene búsqueda, filtrado por categoría y modal de detalle.
 */
const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<ResultadoBusquedaVideo[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("popular");
  const [error, setError] = useState<string | null>(null);

  /**
   * Obtiene las películas desde el backend según la categoría o búsqueda.
   * @param query Término de búsqueda o categoría
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
   * Cambia la categoría activa y recarga las películas.
   */
  const handleCategoryChange = (categoryQuery: string) => {
    setActiveCategory(categoryQuery);
    loadMovies(categoryQuery);
  };

  /**
   * Maneja la búsqueda por término.
   */
  const handleSearch = (term: string) => {
    setActiveCategory("");
    loadMovies(term);
  };

  /**
   * Abre el modal con el detalle de la película seleccionada.
   */
  const openModal = (id: number) => setSelectedMovieId(id);

  /**
   * Cierra el modal.
   */
  const closeModal = () => setSelectedMovieId(null);

  /**
   * Cargar películas populares al montar.
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
