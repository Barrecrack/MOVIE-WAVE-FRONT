import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

/**
 * Modal que muestra el detalle de una película seleccionada.
 * Permite añadir, ver y eliminar favoritos.
 */
const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- Cargar datos del video ---
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        setLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
        
        console.log('🔍 Buscando video ID:', videoId);
        
        // SOLUCIÓN: Usar el endpoint existente /videos/search
        const url = `${API_BASE}/videos/search?query=popular`;
        console.log('📡 URL de búsqueda:', url);
        
        const res = await fetch(url);
        
        if (res.ok) {
          const data = await res.json();
          console.log('📦 Datos recibidos:', data);
          
          // Buscar el video específico por ID en los resultados
          const videoEncontrado = data.find((video: any) => video.id === videoId);
          
          if (videoEncontrado) {
            console.log('✅ Video encontrado:', videoEncontrado);
            setVideoData(videoEncontrado);
          } else {
            console.warn('❌ Video no encontrado en resultados');
            // Si no se encuentra, buscar en otros géneros
            await buscarEnOtrosGeneros(videoId);
          }
        } else {
          console.error('❌ Error en respuesta:', res.status);
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
      } catch (err) {
        console.error("Error al cargar video:", err);
        // Crear objeto básico en caso de error
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

    const buscarEnOtrosGeneros = async (id: number) => {
      const generos = ["action", "comedy", "romance", "horror", "sci-fi", "adventure", "animation"];
      const API_BASE = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      
      for (const genero of generos) {
        try {
          const url = `${API_BASE}/videos/search?query=${genero}`;
          console.log(`🔍 Buscando en género: ${genero}`);
          const res = await fetch(url);
          
          if (res.ok) {
            const data = await res.json();
            const video = data.find((v: any) => v.id === id);
            
            if (video) {
              console.log(`✅ Video encontrado en género: ${genero}`);
              setVideoData(video);
              return;
            }
          }
        } catch (error) {
          console.error(`Error buscando en ${genero}:`, error);
        }
      }
      
      // Si no se encuentra en ningún género
      console.warn('❌ Video no encontrado en ningún género');
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

  // --- Verificar si es favorito al cargar ---
  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const existe = favoritos.some((fav: any) => fav.id === videoId);
    setIsFavorite(existe);
  }, [videoId]);

  // --- Añadir a favoritos ---
  const addToFavorites = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");

    if (!videoData) return;

    // Evita duplicados
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

  // --- Eliminar de favoritos ---
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

        {/* CORRECCIÓN: Usar videoUrl en lugar de url */}
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