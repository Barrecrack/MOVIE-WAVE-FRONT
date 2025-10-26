import React, { useEffect, useState } from "react";
import "../styles/movies.sass";
import SearchBar from "../components/search-bar.tsx";
import VideoModal from "../components/video-modal.tsx";
import type { ResultadoBusquedaVideo } from "../types/vide.types.ts";

const MoviesPage: React.FC = () => {
  const [movies, setMovies] = useState<ResultadoBusquedaVideo[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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

  const handleSearch = (term: string) => {
    loadMovies(term);
  };

  const openModal = (id: number) => setSelectedMovieId(id);
  const closeModal = () => setSelectedMovieId(null);

  useEffect(() => {
    loadMovies("popular");
  }, []);

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

          {/* Buscador centrado */}
          <div className="movies__nav-center">
            <div className="movies__search">
              <SearchBar alBuscar={handleSearch} />
            </div>
          </div>

          {/* Botón menú lateral */}
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
          <a href="/movies">🎬 Películas</a>
          <a href="/profile">👤 Perfil</a>
          <a href="/editprofile">✏️ Editar perfil</a>
          <a href="/about">ℹ️ Sobre nosotros</a>
          <a href="/" className="logout">🚪 Cerrar sesión</a>
        </nav>
      </aside>

      {/* FONDO OSCURO */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* CONTENIDO PRINCIPAL */}
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
              <div
                key={movie.id}
                className="movies__card"
                onClick={() => openModal(movie.id)}
              >
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
              <a href="/profile">Perfil</a>
              <a href="/editprofile">Editar perfil</a>
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
