import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "../styles/menu-dropdown.sass";

const MenuDropdown: React.FC = () => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    alert("Sesión cerrada exitosamente.");
    navigate("/");
  };

  return (
    <div className="menu-dropdown">
      {/* Botón hamburguesa */}
      <button className="menu-toggle" onClick={() => setOpen(!open)}>
        <img
          src="/images/menu-icon.svg"
          alt="Menú"
          className="menu-icon"
        />
      </button>

      {/* Panel desplegable */}
      {open && (
        <div className="menu-panel">
          <h2>Movie<span>Wave</span></h2>
          <button onClick={() => navigate("/movies")}>🎬 Películas</button>
          <button onClick={() => navigate("/profile")}>👤 Perfil</button>
          <button onClick={() => navigate("/about")}>ℹ️ Sobre nosotros</button>
          <button className="logout" onClick={handleLogout}>🚪 Cerrar sesión</button>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
