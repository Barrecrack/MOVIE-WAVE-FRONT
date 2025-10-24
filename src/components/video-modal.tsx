import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

/**
 * Modal que muestra el detalle de una película seleccionada.
 * Permite añadir, ver y eliminar favoritos.
 *
 * @component
 * @param {number} videoId - ID del video seleccionado.
 * @param {Function} alCerrar - Cierra el modal.
 */
const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);

  // --- Cargar datos del video ---
  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const url = `${import.meta.env.VITE_API_LOCAL_URL}/videos/get?id=${videoId}`;
        const res = await fetch(url);
        const data = await res.json();
        setVideoData(data);
      } catch (err) {
        console.error("Error al cargar video:", err);
      }
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
      alert(`"${videoData.title}" fue añadida a favoritos.`);
    }
  };

  // --- Eliminar de favoritos ---
  const removeFromFavorites = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const nuevos = favoritos.filter((fav: any) => fav.id !== videoId);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    setIsFavorite(false);
    alert(`"${videoData.title}" fue eliminada de favoritos.`);
  };

  if (!videoData) {
    return (
      <div className="video-modal">
        <div className="video-modal__content">
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="video-modal" onClick={alCerrar}>
      <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
        <button className="video-modal__close" onClick={alCerrar}>✖</button>

        <h2 className="video-modal__title">{videoData.title}</h2>
        <p className="video-modal__description">{videoData.description}</p>

        <video controls src={videoData.url} className="video-modal__video"></video>

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
