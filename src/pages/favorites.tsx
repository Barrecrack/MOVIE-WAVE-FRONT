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
    id_externo: string; // 🔥 Este es el ID de Pexels
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

const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadFavorites();
  }, []);

  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  const getUserSession = async () => {
    const token = getAuthToken();
    if (!token) return null;

    try {
      const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_BASE}/api/user-profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
   * Carga los favoritos directamente desde la base de datos
   * Ya incluyen la información del contenido gracias al JOIN
   */
  const loadFavorites = async () => {
    try {
      const session = await getUserSession();

      if (!session) {
        setError("Debes iniciar sesión para ver tus favoritos");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log("🔹 Cargando favoritos desde el backend...");
      const response = await fetch(`${API_URL}/api/favorites/my-favorites`, {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📋 Favoritos cargados:', data);
        setFavoritos(data);
        setError(null);
      } else {
        const errorData = await response.json();
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
   * Elimina un favorito usando el ID de Pexels (id_externo)
   */
  const eliminarFavorito = async (idPexels: string) => {
    try {
      const session = await getUserSession();

      if (!session) {
        alert('Debes iniciar sesión para eliminar favoritos');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log(`🔹 Eliminando favorito con ID Pexels: ${idPexels}`);
      const response = await fetch(`${API_URL}/api/favorites/${idPexels}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${session.access_token}` },
      });

      if (response.ok) {
        // Actualizar el estado local
        setFavoritos(prev => prev.filter(fav => 
          fav.Contenido?.id_externo !== idPexels
        ));
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
   * Abre el video en un modal (puedes implementar esta función)
   */
  const abrirVideo = (favorito: FavoriteItem) => {
    // Aquí puedes abrir el modal o navegar a la página del video
    console.log("Abrir video:", favorito);
    // Ejemplo: navigate(`/video/${favorito.Contenido?.id_externo}`);
    alert(`Abriendo: ${favorito.Contenido?.titulo}`);
  };

  // Helper functions
  const getPosterUrl = (contenido: any): string => {
    return contenido?.poster || "/images/default-movie.jpg";
  };

  const getGenreDisplay = (contenido: any): string => {
    return contenido?.genero || contenido?.tipo || "Género no disponible";
  };

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

      {error && <div className="error-message">{error}</div>}

      {favoritos.length === 0 && !error ? (
        <div className="favorites-empty">
          <p>No tienes películas en favoritos.</p>
          <p>Agrega películas desde la página principal haciendo clic en "❤️ Añadir a favoritos"</p>
          <button onClick={() => navigate("/movies")} className="browse-movies-btn">
            Explorar Películas
          </button>
        </div>
      ) : (
        <div className="favorites-list">
          {favoritos.map((favorito) => (
            <div key={favorito.id_favorito} className="favorite-card">
              <img
                src={getPosterUrl(favorito.Contenido)}
                alt={favorito.Contenido?.titulo || "Película sin título"}
                className="favorite-poster"
                onClick={() => abrirVideo(favorito)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/default-movie.jpg";
                }}
              />
              <div className="favorite-info">
                <h3 onClick={() => abrirVideo(favorito)} style={{ cursor: 'pointer' }}>
                  {favorito.Contenido?.titulo || "Título no disponible"}
                </h3>
                <p className="favorite-genre">{getGenreDisplay(favorito.Contenido)}</p>
                <p className="favorite-year">{getYearDisplay(favorito.Contenido)}</p>
                <p className="favorite-duration">{favorito.Contenido?.duracion || "Duración no disponible"}</p>
                {favorito.Contenido?.descripcion && favorito.Contenido.descripcion !== "Sin descripción" && (
                  <p className="favorite-description">{favorito.Contenido.descripcion}</p>
                )}
                <p className="favorite-date">
                  Agregado: {new Date(favorito.fecha_agregado).toLocaleDateString('es-ES')}
                </p>
                <div className="favorite-actions">
                  <button
                    className="play-btn"
                    onClick={() => abrirVideo(favorito)}
                    title="Reproducir video"
                  >
                    ▶️ Reproducir
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => eliminarFavorito(favorito.Contenido?.id_externo || '')}
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