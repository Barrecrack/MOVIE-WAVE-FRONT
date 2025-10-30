import React from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/menu.sass";

/**
 * Main menu of the MovieWave app.
 * Acts as a central hub for navigation to different sections of the platform.
 * 
 * @component
 * @returns {JSX.Element} Main menu view
 */
const Menu: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Handles user logout process.
   * Clears authentication data from local storage and redirects to login.
   * 
   * @async
   * @function handleLogout
   * @returns {Promise<void>}
   */
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token"); // Delete the token from storage
    localStorage.removeItem("userData");
    alert("Sesión cerrada exitosamente.");
    navigate("/"); // Redirects to login
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

          <button className="menu-btn logout" onClick={handleLogout}>
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
