import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/sitemap.sass";

const SiteMap: React.FC = () => {
  const navigate = useNavigate();

  const pages = [
    { name: "Inicio (Menú)", path: "/menu" },
    { name: "Películas", path: "/movies" },
    { name: "Perfil", path: "/profile" },
    { name: "Editar Perfil", path: "/editprofile" },
    { name: "Registro", path: "/register" },
    { name: "Iniciar Sesión", path: "/" },
    { name: "Olvidé mi contraseña", path: "/forgot" },
    { name: "Restablecer contraseña", path: "/resetpassword" },
    { name: "Sobre nosotros", path: "/about" },
  ];

  return (
    <div className="sitemap-page">
      <div className="sitemap-box">
        <h2 className="title">Mapa del Sitio</h2>
        <p className="subtitle">Navega fácilmente por todas las secciones</p>

        <ul className="sitemap-list">
          {pages.map((page, index) => (
            <li
              key={index}
              className="sitemap-item"
              onClick={() => navigate(page.path, { replace: true })}
            >
              {page.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default SiteMap;
