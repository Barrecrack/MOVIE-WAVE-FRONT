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

  return (
    <div className="menu-page">
      <header className="menu-header">
        <h1 className="menu-title">
          Movie<span>Wave</span>
        </h1>
      </header>

      <div className="menu-content">
        <h2 className="menu-subtitle">Welcome to MovieWave</h2>
        <p className="menu-description">
          Enjoy the best streaming experience. Explore movies, manage your profile,
          or discover new releases.
        </p>

        <div className="menu-buttons">
          <button className="menu-btn" onClick={() => navigate("/movies")}>
            🎬 Explore Movies
          </button>
          <button className="menu-btn" onClick={() => navigate("/favorites")}>
            ❤️ My Favorites
          </button>
          <button className="menu-btn" onClick={() => navigate("/profile")}>
            👤 Profile
          </button>
          <button className="menu-btn logout" onClick={() => navigate("/login")}>
            🚪 Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Menu;
