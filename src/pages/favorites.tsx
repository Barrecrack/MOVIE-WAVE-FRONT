import React, { useEffect, useState } from "react";
import "../styles/favorites.sass";
import { useNavigate } from "react-router-dom";

interface FavoriteItem {
  id_favorito: string;
  id_usuario: string;
  id_contenido: string;
  fecha_agregado: string;
  Contenido?: {
    id_contenido: string;
    id_externo: string;
    titulo: string;
    descripcion: string;
    duracion: string;
    tipo: string;
    fecha: string;
    calificacion: number;
    poster?: string;
    genero?: string;
  };
}

/**
 * FavoritesPage component that displays and manages the user's favorite movies.
 * Loads favorites from the backend API only.
 *
 * @component
 * @returns {JSX.Element} The favorites management page.
 */
const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  /**
   * Gets the authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  /**
   * Gets user session from token via backend
   */
  const getUserSession = async () => {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_BASE}/api/user-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const userData = await response.json();
        return { user: userData, access_token: token };
      }
      return null;
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  };

  /**
   * Loads the user's favorite movies from the backend API.
   *
   * @async
   * @function loadFavorites
   * @returns {Promise<void>}
   */
  const loadFavorites = async () => {
    try {
      const session = await getUserSession();

      if (!session) {
        console.error("Usuario no autenticado");
        setError("Debes iniciar sesión para ver tus favoritos");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log("🔹 Cargando favoritos desde el backend...");
      const response = await fetch(`${API_URL}/api/favorites/my-favorites`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Favoritos cargados:', data);
        
        // Formatear los datos para que coincidan con la interfaz
        const formattedFavorites = data.map((fav: any) => ({
          id_favorito: fav.id_favorito,
          id_usuario: fav.id_usuario,
          id_contenido: fav.id_contenido,
          fecha_agregado: fav.fecha_agregado,
          Contenido: fav.Contenido ? {
            id_contenido: fav.Contenido.id_contenido,
            id_externo: fav.Contenido.id_externo,
            titulo: fav.Contenido.titulo || "Sin título",
            descripcion: fav.Contenido.descripcion || "Sin descripción",
            duracion: fav.Contenido.duracion || "00:00",
            tipo: fav.Contenido.tipo || "video",
            fecha: fav.Contenido.fecha,
            calificacion: fav.Contenido.calificacion || 0,
            poster: fav.Contenido.poster,
            genero: fav.Contenido.genero || fav.Contenido.tipo
          } : undefined
        }));

        setFavoritos(formattedFavorites);
        setError(null);
      } else {
        const errorData = await response.json();
        console.error('❌ Error del backend:', errorData);
        setError(errorData.error || 'Error cargando favoritos');
      }
    } catch (error: any) {
      console.error("Error cargando favoritos:", error);
      setError("Error al cargar los favoritos. Intenta más tarde.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Removes a movie from the user's favorites list.
   *
   * @async
   * @function eliminarFavorito
   * @param {string} idContenido - The ID of the movie to remove from favorites.
   * @returns {Promise<void>}
   */
  const eliminarFavorito = async (idContenido: string) => {
    try {
      const session = await getUserSession();

      if (!session) {
        alert('Debes iniciar sesión para eliminar favoritos');
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log(`🔹 Eliminando favorito con ID: ${idContenido}`);
      const response = await fetch(`${API_URL}/api/favorites/${idContenido}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        setFavoritos(prev => prev.filter(fav => fav.id_contenido !== idContenido));
        alert("Película eliminada de favoritos");
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error eliminando favorito');
      }
    } catch (error: any) {
      console.error("Error eliminando favorito:", error);
      alert("Error al eliminar de favoritos: " + error.message);
    }
  };

  /**
   * Gets the poster URL for a movie
   */
  const getPosterUrl = (contenido: any): string => {
    if (contenido?.poster) return contenido.poster;
    
    // Si no hay poster, intentar usar el ID externo para generar una imagen por defecto
    if (contenido?.id_externo) {
      return `/images/default-movie.jpg`;
    }
    
    return "/images/default-movie.jpg";
  };

  /**
   * Gets the genre for display
   */
  const getGenreDisplay = (contenido: any): string => {
    return contenido?.genero || contenido?.tipo || "Género no disponible";
  };

  /**
   * Gets the year for display
   */
  const getYearDisplay = (contenido: any): string => {
    if (contenido?.fecha) {
      return new Date(contenido.fecha).getFullYear().toString();
    }
    return "Año no disponible";
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
        <h2 className="favorites-title">Mis Películas Favoritas</h2>
        <button className="back-btn" onClick={() => navigate("/movies")}>
          Menu ← 
        </button>
      </header>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {favoritos.length === 0 && !error ? (
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
            <div key={fav.id_favorito} className="favorite-card">
              <img
                src={getPosterUrl(fav.Contenido)}
                alt={fav.Contenido?.titulo || "Película sin título"}
                className="favorite-poster"
                onError={(e) => {
                  // Si la imagen falla al cargar, usar una por defecto
                  (e.target as HTMLImageElement).src = "/images/default-movie.jpg";
                }}
              />
              <div className="favorite-info">
                <h3>{fav.Contenido?.titulo || "Título no disponible"}</h3>
                <p className="favorite-genre">{getGenreDisplay(fav.Contenido)}</p>
                <p className="favorite-year">{getYearDisplay(fav.Contenido)}</p>
                <p className="favorite-duration">{fav.Contenido?.duracion || "Duración no disponible"}</p>
                {fav.Contenido?.descripcion && fav.Contenido.descripcion !== "Sin descripción" && (
                  <p className="favorite-description">{fav.Contenido.descripcion}</p>
                )}
                <p className="favorite-date">
                  Agregado: {new Date(fav.fecha_agregado).toLocaleDateString('es-ES')}
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