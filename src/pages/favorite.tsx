import React, { useEffect, useState } from "react";
import "../styles/favorite.sass";

/**
 * Página que muestra todas las películas guardadas como favoritas.
 * Permite eliminar películas directamente desde la lista.
 */
const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<any[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
    setFavoritos(stored);
  }, []);

  const eliminarFavorito = (id: number) => {
    const nuevos = favoritos.filter((fav) => fav.id !== id);
    setFavoritos(nuevos);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
  };

  return (
    <div className="favorites-page">
      <h2 className="favorites-title">Películas favoritas</h2>

      {favoritos.length === 0 ? (
        <p className="favorites-empty">No tienes películas en favoritos.</p>
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
                <div className="favorite-actions">
                  <button className="like-btn">👍</button>
                  <button className="dislike-btn">👎</button>
                  <button
                    className="delete-btn"
                    onClick={() => eliminarFavorito(fav.id)}
                  >
                    ❌
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
