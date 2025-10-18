import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/menu.sass";

/**
 * Menu principal de la aplicación MovieWave.
 * Sirve como punto de acceso a las diferentes secciones de la plataforma.
 * 
 * @component
 * @returns {JSX.Element} Vista del menú principal
 */
const Menu: React.FC = () => {
  const navigate = useNavigate();

  // --- Función para cerrar sesión ---
  const handleLogout = () => {
    localStorage.removeItem("token"); // Elimina el token del almacenamiento
    alert("Sesión cerrada exitosamente.");
    navigate("/login"); // Redirige al login
  };

  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1 className="menu-title">
          Movie<span>Wave</span>
        </h1>
      </header>

      <div className="menu-content">
        <h2 className="menu-subtitle">Bienvenido a MovieWave</h2>
        <p className="menu-description">
          Disfruta de la mejor experiencia de streaming. Explora películas, gestiona tu perfil o descubre nuevos estrenos.
        </p>

        <div className="menu-buttons">
          <button className="menu-btn" onClick={() => navigate("/movies")}>
            Explorar películas
          </button>

          <button className="menu-btn" onClick={() => navigate("/profile")}>
            Perfil
          </button>

          <button className="menu-btn" onClick={() => navigate("/about")}>
            Sobre nosotros
          </button>

          <button className="menu-btn logout" onClick={() => navigate("/")}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <footer className="menu-page__footer">
        <p>© 2025 MovieWave. Todos los derechos reservados.</p>
        <div className="footer-links">
          <a href="/sitemap">Mapa del sitio</a>
        </div>
      </footer>
    </div>
  );
};

export default Menu;
