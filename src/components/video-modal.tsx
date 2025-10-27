import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

/**
 * Props for the VideoModal component.
 * @interface
 * @property {number} videoId - ID of the selected video.
 * @property {() => void} alCerrar - Function executed when the modal is closed.
 */
interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

/**
 * VideoModal component that displays detailed information about a selected movie.
 * Allows users to view, add, or remove the movie from favorites.
 * 
 * @component
 * @param {VideoModalProps} props - The properties for the VideoModal component.
 * @returns {JSX.Element} The video modal with movie details and favorite controls.
 */
const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  /** 
   * Loads the video data by ID when the modal opens.
   * Searches across genres if not found in the initial query.
   */
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
        console.log('🔍 Searching for video ID:', videoId);

        const url = `${API_BASE}/videos/search?query=popular`;
        console.log('📡 Search URL:', url);
        const res = await fetch(url);

        if (res.ok) {
          const data = await res.json();
          console.log('📦 Data received:', data);
          
          const videoEncontrado = data.find((video: any) => video.id === videoId);
          
          if (videoEncontrado) {
            console.log('✅ Video found:', videoEncontrado);
            setVideoData(videoEncontrado);
          } else {
            console.warn('❌ Video not found in results');
            await buscarEnOtrosGeneros(videoId);
          }
        } else {
          console.error('❌ Response error:', res.status);
          throw new Error(`Error ${res.status}: ${res.statusText}`);
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
          description: "Información no disponible"
        });
      } finally {
        setLoading(false);
      }
    };

    /**
     * Searches the movie across multiple genres if not found initially.
     * @param {number} id - The ID of the movie to search for.
     */
    const buscarEnOtrosGeneros = async (id: number) => {
      const generos = ["action", "comedy", "romance", "horror", "sci-fi", "adventure", "animation"];
      const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      
      for (const genero of generos) {
        try {
          const url = `${API_BASE}/videos/search?query=${genero}`;
          console.log(`🔍 Searching in genre: ${genero}`);
          const res = await fetch(url);
          
          if (res.ok) {
            const data = await res.json();
            const video = data.find((v: any) => v.id === id);
            
            if (video) {
              console.log(`✅ Video found in genre: ${genero}`);
              setVideoData(video);
              return;
            }
          }
        } catch (error) {
          console.error(`Error searching in ${genero}:`, error);
        }
      }

      console.warn('❌ Video not found in any genre');
      setVideoData({
        id: id,
        title: "Película no disponible",
        genre: "Desconocido",
        year: new Date().getFullYear(),
        poster: "/images/default-movie.jpg",
        videoUrl: null,
        description: "No se pudo encontrar la información de esta película"
      });
    };

    fetchVideo();
  }, [videoId]);

  /** Checks if the selected video is already in the favorites list. */
  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const existe = favoritos.some((fav: any) => fav.id === videoId);
    setIsFavorite(existe);
  }, [videoId]);

  /** Adds the current video to the favorites list in localStorage. */
  const addToFavorites = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (!videoData) return;

    const existe = favoritos.some((fav: any) => fav.id === videoData.id);
    if (!existe) {
      favoritos.push(videoData);
      localStorage.setItem("favoritos", JSON.stringify(favoritos));
      setIsFavorite(true);
      alert(`✅ "${videoData.title}" fue añadida a favoritos.`);
    } else {
      alert("⭐ Esta película ya está en favoritos");
    }
  };

  /** Removes the current video from the favorites list in localStorage. */
  const removeFromFavorites = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const nuevos = favoritos.filter((fav: any) => fav.id !== videoId);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    setIsFavorite(false);
    alert(`🗑️ "${videoData?.title}" fue eliminada de favoritos.`);
  };

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

  if (!videoData) {
    return (
      <div className="video-modal" onClick={alCerrar}>
        <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
          <button className="video-modal__close" onClick={alCerrar}>✖</button>
          <p>Error al cargar el video.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-modal" onClick={alCerrar}>
      <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={alCerrar}>✖</button>

        <h2 className="video-modal__title">{videoData.title}</h2>
        <p className="video-modal__description">
          {videoData.description || `Género: ${videoData.genre} • Año: ${videoData.year}`}
        </p>

        {videoData.videoUrl ? (
          <video 
            controls 
            src={videoData.videoUrl} 
            className="video-modal__video"
            poster={videoData.poster}
          >
            Tu navegador no soporta el elemento de video.
          </video>
        ) : (
          <div style={{textAlign: 'center', padding: '2rem'}}>
            <img 
              src={videoData.poster || "/images/default-movie.jpg"} 
              alt={videoData.title}
              style={{maxWidth: '300px', width: '100%', borderRadius: '8px', marginBottom: '1rem'}}
            />
            <p>🎬 Video no disponible para reproducción</p>
          </div>
        )}

        <div className="video-modal__actions">
          {isFavorite ? (
            <button className="fav-btn remove" onClick={removeFromFavorites}>
              💔 Eliminar de favoritos
            </button>
          ) : (
            <button className="fav-btn add" onClick={addToFavorites}>
              ❤️ Añadir a favoritos
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
