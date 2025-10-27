import React, { useEffect, useState } from "react";
import "../styles/favorite.sass";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

interface Contenido {
  id_contenido: number;
  titulo: string;
  poster: string;
  genero: string;
  año: number;
  descripcion?: string;
  duracion?: string;
  video_url?: string;
}

interface FavoriteItem {
  id_usuario: string;
  id_contenido: number;
  fecha_agregado: string;
  Contenido: Contenido;
}

const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        console.error("Usuario no autenticado");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch(`${API_URL}/api/favorites/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Favoritos cargados:', data);
        setFavoritos(data);
      } else {
        throw new Error('Error cargando favoritos');
      }
    } catch (error) {
      console.error("Error cargando favoritos:", error);
      // Fallback a localStorage si hay error
      try {
        const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
        // Convertir formato localStorage al nuevo formato
        const convertedFavorites: FavoriteItem[] = stored.map((movie: any) => ({
          id_usuario: 'local',
          id_contenido: movie.id,
          fecha_agregado: new Date().toISOString(),
          Contenido: {
            id_contenido: movie.id,
            titulo: movie.title,
            poster: movie.poster,
            genero: movie.genre,
            año: movie.year
          }
        }));
        setFavoritos(convertedFavorites);
      } catch (localError) {
        console.error("Error con localStorage:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  const eliminarFavorito = async (idContenido: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert('Usuario no autenticado');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const token = (await supabase.auth.getSession()).data.session?.access_token;

      const response = await fetch(`${API_URL}/api/favorites/${user.id}/${idContenido}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Actualizar estado local
        setFavoritos(prev => prev.filter(fav => fav.id_contenido !== idContenido));
        alert("Película eliminada de favoritos");
      } else {
        throw new Error('Error eliminando favorito');
      }
    } catch (error: any) {
      console.error("Error eliminando favorito:", error);
      alert("Error al eliminar de favoritos");
    }
  };

  if (loading) {
    return (
      <div className="favorites-page">
        <div className="loading">Cargando favoritos...</div>
      </div>
    );
  }

  return (
    <div className="favorites-page">
      <header className="favorites-header">
        <button className="back-btn" onClick={() => navigate("/movies")}>
          ← Volver a Películas
        </button>
        <h2 className="favorites-title">Mis Películas Favoritas</h2>
      </header>

      {favoritos.length === 0 ? (
        <div className="favorites-empty">
          <p>No tienes películas en favoritos.</p>
          <p>Agrega películas desde la página principal haciendo clic en "⭐ Favorito"</p>
          <button 
            onClick={() => navigate("/movies")}
            className="browse-movies-btn"
          >
            Explorar Películas
          </button>
        </div>
      ) : (
        <div className="favorites-list">
          {favoritos.map((fav) => (
            <div key={`${fav.id_usuario}-${fav.id_contenido}`} className="favorite-card">
              <img
                src={fav.Contenido.poster || "/images/default-movie.jpg"}
                alt={fav.Contenido.titulo}
                className="favorite-poster"
              />
              <div className="favorite-info">
                <h3>{fav.Contenido.titulo}</h3>
                <p className="favorite-genre">{fav.Contenido.genero}</p>
                <p className="favorite-year">{fav.Contenido.año}</p>
                <p className="favorite-date">
                  Agregado: {new Date(fav.fecha_agregado).toLocaleDateString()}
                </p>
                <div className="favorite-actions">
                  <button
                    className="delete-btn"
                    onClick={() => eliminarFavorito(fav.id_contenido)}
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