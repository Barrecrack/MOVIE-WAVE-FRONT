import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/menu-dropdown.sass";

/**
 * Dropdown menu component displayed as a hamburger button.
 * Allows navigation to different sections and handles user logout.
 *
 * @component
 */
const MenuDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles user logout by clearing local storage,
   * showing confirmation, and redirecting to home.
   *
   * @function handleLogout
   */
  const handleLogout = () => {
    // Limpiar todos los tokens y datos de usuario
    localStorage.removeItem("supabase.auth.token");
    localStorage.removeItem("userData");
    localStorage.removeItem("token");
    
    alert("Sesión cerrada exitosamente.");
    navigate("/");
  };

  return (
    <div className="menu-dropdown">
      {/* Hamburger button */}
      <button className="menu-toggle" onClick={() => setOpen(!open)}>
        <img
          src="/images/menu-icon.svg"
          alt="Menú"
          className="menu-icon"
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="menu-panel">
          <h2>Movie<span>Wave</span></h2>
          <button onClick={() => navigate("/movies")}>🎬 Películas</button>
          <button onClick={() => navigate("/profile")}>👤 Perfil</button>
          <button onClick={() => navigate("/favorites")}>⭐ Favoritos</button>
          <button onClick={() => navigate("/about")}>ℹ️ Sobre nosotros</button>
          <button className="logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;