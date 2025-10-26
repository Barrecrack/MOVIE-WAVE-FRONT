import React, { useEffect, useState } from "react";
import "../styles/favorite.sass";
import type { ResultadoBusquedaVideo } from "../types/vide.types.ts";

/**
 * Página que muestra todas las películas guardadas como favoritas.
 * Permite eliminar películas directamente desde la lista.
 */
const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<ResultadoBusquedaVideo[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
    console.log('📋 Favoritos cargados:', stored); // Para debug
    setFavoritos(stored);
  }, []);

  const eliminarFavorito = (id: number) => {
    const nuevos = favoritos.filter((fav) => fav.id !== id);
    setFavoritos(nuevos);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    alert("Película eliminada de favoritos");
  };

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <button className="back-btn" onClick={() => window.history.back()}>
          ← Volver
        </button>
        <h2 className="favorites-title">Películas favoritas</h2>
      </header>

      {favoritos.length === 0 ? (
        <div className="favorites-empty">
          <p>No tienes películas en favoritos.</p>
          <p>Agrega películas desde la página principal haciendo clic en "⭐ Favorito"</p>
        </div>
      ) : (
        <div className="favorites-list">
          {favoritos.map((fav) => (
            <div key={fav.id} className="favorite-card">
              <img
                src={fav.poster || "/images/default-movie.jpg"}
                alt={fav.title}
                className="favorite-poster"
              />
              <div className="favorite-info">
                <h3>{fav.title}</h3>
                <p className="favorite-genre">{fav.genre}</p>
                <p className="favorite-year">{fav.year}</p>
                <div className="favorite-actions">
                  <button
                    className="delete-btn"
                    onClick={() => eliminarFavorito(fav.id)}
                    title="Eliminar de favoritos"
                  >
                    ❌ Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;