import React, { useEffect, useState } from "react";
import "../styles/favorites.sass";
import { useNavigate } from "react-router-dom";
import VideoModal from "../components/video-modal.tsx";

interface FavoriteItem {
  id_favorito: string;
  id_usuario: string;
  id_contenido: string;
  fecha_agregado: string;
  Contenido?: {
    id_contenido: string;
    id_externo: string; // ID de Pexels
    titulo: string;
    descripcion: string;
    duracion: string;
    tipo: string;
    fecha: string;
    calificacion: number;
  };
}

interface VideoData {
  id: number;
  title: string;
  genre: string;
  year: number;
  poster: string;
  videoUrl: string | null;
  description: string;
}

const FavoritesPage: React.FC = () => {
  const [favoritos, setFavoritos] = useState<FavoriteItem[]>([]);
  const [videoData, setVideoData] = useState<{[key: string]: VideoData}>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null); // 🔥 ESTADO PARA EL MODAL
  const [showModal, setShowModal] = useState(false); // 🔥 CONTROLAR MODAL
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
   * Busca información completa del video por ID de Pexels
   */
  const fetchVideoData = async (pexelsId: string): Promise<VideoData | null> => {
    try {
      // Buscar en los videos populares primero
      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/videos/search?query=popular`);
      
      if (response.ok) {
        const videos = await response.json();
        const video = videos.find((v: any) => v.id.toString() === pexelsId);
        
        if (video) {
          return video;
        }
      }
      
      // Si no se encuentra, devolver datos básicos
      return {
        id: parseInt(pexelsId),
        title: `Video ${pexelsId}`,
        genre: "Video",
        year: new Date().getFullYear(),
        poster: "/images/default-movie.jpg",
        videoUrl: null,
        description: "Video de Pexels"
      };
    } catch (error) {
      console.error(`Error buscando video ${pexelsId}:`, error);
      return null;
    }
  };

  /**
   * Carga los favoritos y luego busca la información de cada video
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
        const favoritosData: FavoriteItem[] = await response.json();
        console.log('📋 Favoritos cargados:', favoritosData);
        
        // 🔥 BUSCAR INFORMACIÓN COMPLETA DE CADA VIDEO
        const videoDataMap: {[key: string]: VideoData} = {};
        
        for (const favorito of favoritosData) {
          if (favorito.Contenido?.id_externo) {
            const videoInfo = await fetchVideoData(favorito.Contenido.id_externo);
            if (videoInfo) {
              videoDataMap[favorito.Contenido.id_externo] = videoInfo;
            }
          }
        }
        
        setFavoritos(favoritosData);
        setVideoData(videoDataMap);
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
        
        // Eliminar de videoData también
        setVideoData(prev => {
          const newData = {...prev};
          delete newData[idPexels];
          return newData;
        });
        
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
   * 🔥 ABRE EL MODAL DEL VIDEO
   */
  const abrirVideo = (favorito: FavoriteItem) => {
    if (favorito.Contenido?.id_externo) {
      const videoInfo = videoData[favorito.Contenido.id_externo];
      if (videoInfo) {
        console.log("Abriendo video modal:", videoInfo);
        setSelectedVideo(videoInfo);
        setShowModal(true);
      }
    }
  };

  /**
   * 🔥 CIERRA EL MODAL
   */
  const cerrarModal = () => {
    setShowModal(false);
    setSelectedVideo(null);
  };

  // Helper functions usando la información de Pexels
  const getVideoInfo = (favorito: FavoriteItem): VideoData | null => {
    if (favorito.Contenido?.id_externo) {
      return videoData[favorito.Contenido.id_externo] || null;
    }
    return null;
  };

  const getPosterUrl = (favorito: FavoriteItem): string => {
    const videoInfo = getVideoInfo(favorito);
    return videoInfo?.poster || "/images/default-movie.jpg";
  };

  const getTitle = (favorito: FavoriteItem): string => {
    const videoInfo = getVideoInfo(favorito);
    return videoInfo?.title || favorito.Contenido?.titulo || "Título no disponible";
  };

  const getGenre = (favorito: FavoriteItem): string => {
    const videoInfo = getVideoInfo(favorito);
    return videoInfo?.genre || favorito.Contenido?.tipo || "Video";
  };

  const getYear = (favorito: FavoriteItem): string => {
    const videoInfo = getVideoInfo(favorito);
    return videoInfo?.year?.toString() || new Date().getFullYear().toString();
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
      {/* 🔥 MODAL DEL VIDEO */}
      {showModal && selectedVideo && (
        <VideoModal 
          videoId={selectedVideo.id} 
          alCerrar={cerrarModal} 
        />
      )}

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
                src={getPosterUrl(favorito)}
                alt={getTitle(favorito)}
                className="favorite-poster"
                onClick={() => abrirVideo(favorito)}
                style={{ cursor: 'pointer' }}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/images/default-movie.jpg";
                }}
              />
              <div className="favorite-info">
                <h3 onClick={() => abrirVideo(favorito)} style={{ cursor: 'pointer' }}>
                  {getTitle(favorito)}
                </h3>
                <p className="favorite-genre">{getGenre(favorito)}</p>
                <p className="favorite-year">{getYear(favorito)}</p>
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