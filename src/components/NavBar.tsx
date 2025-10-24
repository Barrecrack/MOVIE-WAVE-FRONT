import React, { useState } from "react";
import "../styles/styles-components/navbar.sass";

const Navbar: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="navbar">
      {/* Botón hamburguesa */}
      <div
        className={`hamburger ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* Menú desplegable */}
      <ul className={`nav-menu ${menuOpen ? "active" : ""}`}>
        <li><a href="/perfil">Perfil</a></li>
        <li><a href="/favoritos">Favoritos</a></li>
        <li><a href="/sobre-nosotros">Sobre nosotros</a></li>
      </ul>
    </nav>
  );
};

export default Navbar;
