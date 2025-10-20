import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

/**
 * Modal that shows the details of a selected movie.
 * 
 * @component
 * @param {number} videoId - ID of the selected video.
 * @param {Function} alCerrar - Close the modal.
 */
const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);

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
      </div>
    </div>
  );
};

export default VideoModal;
