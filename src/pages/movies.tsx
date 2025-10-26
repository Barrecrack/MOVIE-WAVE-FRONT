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

const MoviesPage: React.FC = () => {
  // 🔧 CORREGIR: Usar VITE_API_URL en lugar de VITE_API_LOCAL_URL
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

  const loadMoviesByGenre = async (genre: string): Promise<ResultadoBusquedaVideo[]> => {
    try {
      // 🔧 USAR API_BASE CORRECTA
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

  const loadAllMovies = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Para "popular", cargamos una mezcla de todos los géneros
      const popularMovies = await loadMoviesByGenre("popular");
      
      // Para otros géneros, cargamos cada uno individualmente
      const genrePromises = genres
        .filter(genre => genre !== "popular")
        .map(async (genre) => {
          const movies = await loadMoviesByGenre(genre);
          return { genre, movies };
        });

      const genreResults = await Promise.all(genrePromises);
      
      // Combinamos todo en rows
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

  const handleSearch = async (term: string) => {
    if (!term.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      setLoading(true);
      // 🔧 USAR API_BASE CORRECTA
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

  const openModal = (id: number) => setSelectedMovieId(id);
  const closeModal = () => setSelectedMovieId(null);

  const addToFavorites = (movie: ResultadoBusquedaVideo) => {
    const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
    if (!stored.find((fav: any) => fav.id === movie.id)) {
      stored.push(movie);
      localStorage.setItem("favoritos", JSON.stringify(stored));
      alert("✅ Película agregada a favoritos");
    } else {
      alert("⭐ Esta película ya está en favoritos");
    }
  };

  useEffect(() => {
    loadAllMovies();
  }, []);

  // Función para obtener el nombre display del género
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
      {/* ENCABEZADO */}
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
        <button
          className="close-btn"
          onClick={() => setIsSidebarOpen(false)}
          aria-label="Cerrar menú"
        >
          ✖
        </button>

        <h2 className="sidebar-title">
          Movie<span>Wave</span>
        </h2>

        <nav className="sidebar-nav">
          <button onClick={() => navigate("/movies")}>🎬 Películas</button>
          <button onClick={() => navigate("/favorites")}>⭐ Favoritos</button>
          <button onClick={() => navigate("/profile")}>👤 Perfil</button>
          <button onClick={() => navigate("/about")}>ℹ️ Sobre nosotros</button>
          <button onClick={() => navigate("/")} className="logout">🚪 Cerrar sesión</button>
        </nav>
      </aside>

      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* CONTENIDO PRINCIPAL */}
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
            {/* RESULTADOS DE BÚSQUEDA */}
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
                              ⭐ Favorito
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </section>
            )}

            {/* FILAS POR GÉNERO (solo si no hay búsqueda activa) */}
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