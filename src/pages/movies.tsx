import React, { useEffect, useState } from "react";
import "../styles/movies.sass";
import SearchBar from "../components/search-bar.tsx";
import VideoModal from "../components/video-modal.tsx";
import type { ResultadoBusquedaVideo } from "../types/vide.types.ts";
import { useNavigate } from "react-router-dom";

interface MovieRow {
  genre: string;
  movies: ResultadoBusquedaVideo[];
}

/**
 * MoviesPage component - displays movie categories, search results, and allows adding favorites.
 * Handles authentication, API requests, modals, and navigation.
 */
const MoviesPage: React.FC = () => {
  /** API base URL (uses environment variable or Render fallback) */
  const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';

  console.log('🔧 Variables de entorno:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    API_BASE_USADA: API_BASE
  });

  const [movieRows, setMovieRows] = useState<MovieRow[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<ResultadoBusquedaVideo[] | null>(null);
  const navigate = useNavigate();

  const genres = ["popular", "action", "comedy", "romance", "horror", "sci-fi", "adventure", "animation"];

  /**
   * Gets the authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  /**
   * Gets user session from token
   */
  const getUserSession = async () => {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE}/api/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return { user: userData, access_token: token };
      }
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  };

  /**
   * Loads movies by genre using the API.
   * @param genre - The genre to search for.
   * @returns A promise resolving with an array of movies.
   */
  const loadMoviesByGenre = async (genre: string): Promise<ResultadoBusquedaVideo[]> => {
    try {
      const url = `${API_BASE}/videos/search?query=${encodeURIComponent(genre)}`;
      console.log('🔍 URL de petición:', url);
      const res = await fetch(url);
      console.log('📡 Respuesta status:', res.status);
      if (!res.ok) throw new Error(`Error al obtener películas de ${genre}`);
      const data = await res.json();
      console.log('🎬 Datos recibidos:', data);
      return data;
    } catch (err) {
      console.error(`Error cargando ${genre}:`, err);
      return [];
    }
  };

  /**
   * Loads all genres and combines them into rows for display.
   */
  const loadAllMovies = async () => {
    try {
      setLoading(true);
      setError(null);

      const popularMovies = await loadMoviesByGenre("popular");

      const genrePromises = genres
        .filter(genre => genre !== "popular")
        .map(async (genre) => {
          const movies = await loadMoviesByGenre(genre);
          return { genre, movies };
        });

      const genreResults = await Promise.all(genrePromises);

      const allRows: MovieRow[] = [
        { genre: "popular", movies: popularMovies },
        ...genreResults.filter(row => row.movies.length > 0)
      ];

      setMovieRows(allRows);
    } catch (err: any) {
      console.error(err);
      setError("Hubo un problema al cargar las películas. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles movie search by term using API.
   * @param term - The search term entered by the user.
   */
  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      const url = `${API_BASE}/videos/search?query=${encodeURIComponent(term)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Error en la búsqueda");
      const data = await res.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error(err);
      setError("Error en la búsqueda");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Opens the movie modal.
   * @param id - ID of the selected movie.
   */
  const openModal = (id: number) => setSelectedMovieId(id);

  /** Closes the movie modal. */
  const closeModal = () => setSelectedMovieId(null);

  /**
   * Adds a movie to user's favorites list.
   * @param movie - Movie object to be added to favorites.
   */
  const addToFavorites = async (movie: ResultadoBusquedaVideo) => {
    try {
      console.log("🔹 Intentando agregar a favoritos...");

      const session = await getUserSession();

      if (!session) {
        console.error("❌ No hay sesión activa");
        alert('Debes iniciar sesión para agregar favoritos');
        navigate("/");
        return;
      }

      console.log("✅ Usuario autenticado:", session.user.email);

      const response = await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          id_contenido: movie.id,
          movie_data: { // ❗ Pasar datos adicionales de la película
            title: movie.title,
            poster: movie.poster,
            genre: movie.genre,
            year: movie.year
          }
        }),
      });

      if (response.ok) {
        alert("✅ Película agregada a favoritos");
      } else if (response.status === 400) {
        alert("⭐ Esta película ya está en favoritos");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al agregar favorito');
      }
    } catch (error: any) {
      console.error('Error agregando favorito:', error);
      alert("Error al agregar a favoritos: " + error.message);
    }
  };

  /** Loads movies on first render. */
  useEffect(() => {
    loadAllMovies();
  }, []);

  /**
   * Returns display name for a given genre.
   * @param genre - The genre key.
   * @returns Display name in Spanish.
   */
  const getGenreDisplayName = (genre: string): string => {
    const genreMap: { [key: string]: string } = {
      "popular": "Populares",
      "action": "Acción",
      "comedy": "Comedia",
      "romance": "Romance",
      "horror": "Terror",
      "sci-fi": "Ciencia Ficción",
      "adventure": "Aventura",
      "animation": "Animación"
    };
    return genreMap[genre] || genre.charAt(0).toUpperCase() + genre.slice(1);
  };

  return (
    <div className="movies">
      {/* HEADER */}
      <header className="movies__header">
        <div className="movies__nav">
          <img
            src="/images/moviewave-logo.png"
            alt="MovieWave Logo"
            className="movies__logo"
          />

          <div className="movies__nav-center">
            <div className="movies__search">
              <SearchBar alBuscar={handleSearch} />
            </div>
          </div>

          <button
            className="menu-toggle"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>
      </header>

      {/* SIDEBAR */}
      <aside className={`sidebar sidebar-right ${isSidebarOpen ? "open" : ""}`}>
        <h2 className="sidebar-title">
          Movie<span>Wave</span>
        </h2>
        <button
          className="close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          ✖
        </button>

        <nav className="sidebar-nav">
          <button onClick={() => navigate("/profile")}>👤 Perfil</button>
          <button onClick={() => navigate("/favorites")}>⭐ Favoritos</button>
          <button onClick={() => navigate("/about")}>ℹ️ Sobre nosotros</button>
          <button onClick={() => navigate("/deleteaccount")}>🗑️ Eliminar cuenta</button>
          <button onClick={() => navigate("/")} className="logout">🚪 Cerrar sesión</button>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* MAIN CONTENT */}
      <main className="movies__main">
        {loading && (
          <div className="movies__loading">
            <div className="movies__spinner"></div>
            <p>Cargando películas...</p>
          </div>
        )}

        {error && <p className="movies__error">{error}</p>}

        {!loading && !error && (
          <div className="movies__content">
            {/* SEARCH RESULTS */}
            {searchResults && (
              <section className="movies__row">
                <h2 className="movies__row-title">
                  Resultados de búsqueda ({searchResults.length})
                </h2>
                <div className="movies__row-container">
                  <div className="movies__row-scroll">
                    {searchResults.length === 0 ? (
                      <p className="movies__empty">No se encontraron resultados.</p>
                    ) : (
                      searchResults.map((movie) => (
                        <div key={movie.id} className="movies__card">
                          <img
                            src={movie.poster || "/images/default-movie.jpg"}
                            alt={movie.title}
                            className="movies__image"
                            onClick={() => openModal(movie.id)}
                          />
                          <div className="movies__info">
                            <h3 className="movies__name">{movie.title}</h3>
                            <p className="movies__genre">{movie.genre}</p>
                            <p className="movies__year">{movie.year}</p>
                            <button
                              className="movies__favorite-btn"
                              onClick={() => addToFavorites(movie)}
                            >
                              ❤️ Favorito
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* GENRE ROWS */}
            {!searchResults && movieRows.map((row) => (
              row.movies.length > 0 && (
                <section key={row.genre} className="movies__row">
                  <h2 className="movies__row-title">
                    {getGenreDisplayName(row.genre)}
                  </h2>
                  <div className="movies__row-container">
                    <div className="movies__row-scroll">
                      {row.movies.map((movie) => (
                        <div key={movie.id} className="movies__card">
                          <img
                            src={movie.poster || "/images/default-movie.jpg"}
                            alt={movie.title}
                            className="movies__image"
                            onClick={() => openModal(movie.id)}
                          />
                          <div className="movies__info">
                            <h3 className="movies__name">{movie.title}</h3>
                            <p className="movies__genre">{movie.genre}</p>
                            <p className="movies__year">{movie.year}</p>
                            <button
                              className="movies__favorite-btn"
                              onClick={() => addToFavorites(movie)}
                            >
                              ⭐ Favorito
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              )
            ))}
          </div>
        )}
      </main>

      {selectedMovieId && (
        <VideoModal videoId={selectedMovieId} alCerrar={closeModal} />
      )}

      {/* FOOTER */}
      <footer className="movies__footer">
        <div className="footer-container">
          <h3>Mapa del sitio</h3>
          <div className="footer-line"></div>
          <div className="footer-grid">
            <div className="footer-column">
              <h4>Acceso</h4>
              <a href="/">Iniciar sesión</a>
              <a href="/register">Registrarse</a>
            </div>

            <div className="footer-column">
              <h4>Cuenta y soporte</h4>
              <a href="/resetpassword">Restablecer contraseña</a>
              <a href="/forgot">Olvidé mi contraseña</a>
            </div>

            <div className="footer-column">
              <h4>Navegación</h4>
              <a href="/movies">Inicio</a>
              <a href="/favorites">Favoritos</a>
              <a href="/profile">Perfil</a>
              <a href="/deleteaccount">Eliminar cuenta</a>
            </div>

            <div className="footer-column">
              <h4>Contacto</h4>
              <a href="/about">Sobre nosotros</a>
            </div>
          </div>

          <p className="footer-copy">
            ©2025 MovieWave Películas Online, Todos los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MoviesPage;
