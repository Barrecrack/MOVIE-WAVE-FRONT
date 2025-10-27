import React, { useEffect, useState } from "react";
import "../styles/favorites.sass";
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

// Función helper para convertir UUID a número (solución temporal)
const hashStringToNumber = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

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

      // Convertir UUID a número para el backend
      const userIdNumber = hashStringToNumber(user.id);
      console.log("🔹 Cargando favoritos para usuario (convertido):", userIdNumber);

      const response = await fetch(`${API_URL}/api/favorites/${userIdNumber}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Favoritos cargados:', data);
        setFavoritos(data);
      } else {
        // Obtener el error específico del backend
        const errorData = await response.json();
        console.error('❌ Error del backend:', errorData);
        throw new Error(errorData.error || 'Error cargando favoritos');
      }
    } catch (error) {
      console.error("Error cargando favoritos:", error);

      // Fallback a localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
        console.log('📋 Usando favoritos de localStorage:', stored.length);

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
        setFavoritos([]); // Asegurar que no se quede en loading
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

      // Convertir UUID a número para el backend
      const userIdNumber = hashStringToNumber(user.id);
      console.log("🔹 Eliminando favorito para usuario (convertido):", userIdNumber);

      const response = await fetch(`${API_URL}/api/favorites/${userIdNumber}/${idContenido}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // Actualizar estado local
        setFavoritos(prev => prev.filter(fav => fav.id_contenido !== idContenido));
        alert("Película eliminada de favoritos");
        
        // También eliminar de localStorage para mantener sincronización
        try {
          const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
          const updatedFavorites = stored.filter((movie: any) => movie.id !== idContenido);
          localStorage.setItem("favoritos", JSON.stringify(updatedFavorites));
        } catch (localError) {
          console.error("Error actualizando localStorage:", localError);
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Error del backend al eliminar:', errorData);
        throw new Error(errorData.error || 'Error eliminando favorito');
      }
    } catch (error: any) {
      console.error("Error eliminando favorito:", error);
      
      // Fallback: eliminar de localStorage
      try {
        const stored = JSON.parse(localStorage.getItem("favoritos") || "[]");
        const updatedFavorites = stored.filter((movie: any) => movie.id !== idContenido);
        localStorage.setItem("favoritos", JSON.stringify(updatedFavorites));
        
        // Actualizar estado local
        setFavoritos(prev => prev.filter(fav => fav.id_contenido !== idContenido));
        alert("Película eliminada de favoritos (local)");
      } catch (localError) {
        console.error("Error con localStorage:", localError);
        alert("Error al eliminar de favoritos");
      }
    }
  };

  const handleBackToMovies = () => {
    navigate("/movies");
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
        <button className="back-btn" onClick={handleBackToMovies}>
          ← Volver a Películas
        </button>
        <h2 className="favorites-title">Mis Películas Favoritas</h2>
      </header>

      {favoritos.length === 0 ? (
        <div className="favorites-empty">
          <p>No tienes películas en favoritos.</p>
          <p>Agrega películas desde la página principal haciendo clic en "⭐ Favorito"</p>
          <button
            onClick={handleBackToMovies}
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
                onError={(e) => {
                  // Fallback si la imagen no carga
                  (e.target as HTMLImageElement).src = "/images/default-movie.jpg";
                }}
              />
              <div className="favorite-info">
                <h3>{fav.Contenido.titulo}</h3>
                <p className="favorite-genre">{fav.Contenido.genero}</p>
                <p className="favorite-year">{fav.Contenido.año}</p>
                <p className="favorite-date">
                  Agregado: {new Date(fav.fecha_agregado).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
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