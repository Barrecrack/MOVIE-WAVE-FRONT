import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // Obtener token de autenticación
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  // Verificar si el video está en favoritos (BACKEND)
  const checkIfFavorite = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setIsFavorite(false);
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_BASE}/api/favorites/check/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isFavorite);
      }
    } catch (error) {
      console.error('Error verificando favorito:', error);
      setIsFavorite(false);
    }
  };

  // Agregar a favoritos (BACKEND)
  const addToFavorites = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Debes iniciar sesión para agregar favoritos');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_contenido: videoId,
          movie_data: {
            title: videoData?.title,
            poster: videoData?.poster,
            genre: videoData?.genre,
            year: videoData?.year
          }
        })
      });

      if (response.ok) {
        setIsFavorite(true);
        alert("✅ Agregado a favoritos");
      } else if (response.status === 400) {
        alert("❤️ Ya está en favoritos");
      } else {
        throw new Error('Error al agregar favorito');
      }
    } catch (error: any) {
      console.error('Error agregando favorito:', error);
      alert("Error al agregar a favoritos");
    }
  };

  // Eliminar de favoritos (BACKEND)
  const removeFromFavorites = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Debes iniciar sesión para eliminar favoritos');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_BASE}/api/favorites/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setIsFavorite(false);
        alert("💔 Eliminado de favoritos");
      } else {
        throw new Error('Error al eliminar favorito');
      }
    } catch (error: any) {
      console.error('Error eliminando favorito:', error);
      alert("Error al eliminar de favoritos");
    }
  };

  // Cargar datos del video
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
        const url = `${API_BASE}/videos/search?query=popular`;
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          const videoEncontrado = data.find((video: any) => video.id === videoId);
          if (videoEncontrado) {
            setVideoData(videoEncontrado);
          } else {
            await buscarEnOtrosGeneros(videoId);
          }
        }
      } catch (err) {
        console.error("Error loading video:", err);
        setVideoData({
          id: videoId,
          title: "Película",
          genre: "Desconocido",
          year: new Date().getFullYear(),
          poster: "/images/default-movie.jpg",
          videoUrl: null,
        });
      } finally {
        setLoading(false);
      }
    };

    const buscarEnOtrosGeneros = async (id: number) => {
      const generos = ["action", "comedy", "romance", "horror", "sci-fi", "adventure", "animation"];
      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      
      for (const genero of generos) {
        try {
          const url = `${API_BASE}/videos/search?query=${genero}`;
          const res = await fetch(url);
          if (res.ok) {
            const data = await res.json();
            const video = data.find((v: any) => v.id === id);
            if (video) {
              setVideoData(video);
              return;
            }
          }
        } catch (error) {
          console.error(`Error searching in ${genero}:`, error);
        }
      }
    };

    fetchVideo();
  }, [videoId]);

  // Verificar favoritos cuando cambia el video
  useEffect(() => {
    if (videoData) {
      checkIfFavorite();
    }
  }, [videoData]);

  if (loading) {
    return (
      <div className="video-modal" onClick={alCerrar}>
        <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
          <button className="video-modal__close" onClick={alCerrar}>✖</button>
          <p>Cargando video...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-modal" onClick={alCerrar}>
      <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={alCerrar}>✖</button>

        <h2 className="video-modal__title">{videoData?.title}</h2>
        <p className="video-modal__description">
          {videoData?.genre} • {videoData?.year}
        </p>

        {videoData?.videoUrl ? (
          <div style={{ textAlign: "center" }}>
            <video
              controls
              src={videoData.videoUrl}
              className="video-modal__video"
              poster={videoData.poster}
              style={{ maxWidth: "100%", maxHeight: "400px" }}
            >
              Tu navegador no soporta el elemento de video.
            </video>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <img
              src={videoData?.poster || "/images/default-movie.jpg"}
              alt={videoData?.title}
              style={{ maxWidth: "300px", width: "100%", borderRadius: "8px" }}
            />
            <p>🎬 Video no disponible para reproducción</p>
          </div>
        )}

        {/* BOTÓN DE FAVORITOS - CORAZÓN */}
        <div className="video-modal__actions" style={{ textAlign: "center", marginTop: "1rem" }}>
          {isFavorite ? (
            <button 
              className="fav-btn remove" 
              onClick={removeFromFavorites}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              💔 Quitar de Favoritos
            </button>
          ) : (
            <button 
              className="fav-btn add" 
              onClick={addToFavorites}
              style={{
                background: "#dc2626",
                color: "white",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
            >
              ❤️ Agregar a Favoritos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;