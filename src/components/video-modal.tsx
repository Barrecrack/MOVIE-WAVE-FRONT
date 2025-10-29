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

  // ⭐ NUEVOS ESTADOS para comentarios y calificación
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState<string[]>([]);

  // 🎬 NUEVOS ESTADOS PARA SUBTÍTULOS
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(false);

  // ===============================
  // CÓDIGO ORIGINAL (sin cambios)
  // ===============================
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
          if (videoEncontrado) setVideoData(videoEncontrado);
          else await buscarEnOtrosGeneros(videoId);
        } else throw new Error(`Error ${res.status}: ${res.statusText}`);
      } catch (err) {
        console.error("Error loading video:", err);
        setVideoData({
          id: videoId,
          title: "Película",
          genre: "Desconocido",
          year: new Date().getFullYear(),
          poster: "/images/default-movie.jpg",
          videoUrl: null,
          description: "Información no disponible",
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
      setVideoData({
        id: id,
        title: "Película no disponible",
        genre: "Desconocido",
        year: new Date().getFullYear(),
        poster: "/images/default-movie.jpg",
        videoUrl: null,
        description: "No se pudo encontrar la información de esta película",
      });
    };

    fetchVideo();
  }, [videoId]);

  useEffect(() => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const existe = favoritos.some((fav: any) => fav.id === videoId);
    setIsFavorite(existe);
  }, [videoId]);

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

  const removeFromFavorites = () => {
    const favoritos = JSON.parse(localStorage.getItem("favoritos") || "[]");
    const nuevos = favoritos.filter((fav: any) => fav.id !== videoId);
    localStorage.setItem("favoritos", JSON.stringify(nuevos));
    setIsFavorite(false);
    alert(`🗑️ "${videoData?.title}" fue eliminada de favoritos.`);
  };

  // ===============================
  // 💫 NUEVAS FUNCIONES
  // ===============================

  /** Guarda la calificación del usuario (1-5 estrellas) */
  const handleRating = (value: number) => {
    setRating(value);
    alert(`🌟 Calificaste la película con ${value} estrella${value > 1 ? "s" : ""}`);
  };

  /** Envía un comentario y lo almacena en la lista local */
  const handleCommentSubmit = () => {
    if (comment.trim() !== "") {
      setCommentsList((prev) => [...prev, comment]);
      setComment("");
      alert("💬 Comentario enviado correctamente");
    }
  };

  /** Activa o desactiva los subtítulos */
  const toggleSubtitles = () => {
    setSubtitlesEnabled(!subtitlesEnabled);
  };

  // ===============================
  // RENDER ORIGINAL + NUEVAS SECCIONES
  // ===============================
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
      <button className="video-modal__close" onClick={alCerrar}>✖</button>
      <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>

        <h2 className="video-modal__title">{videoData.title}</h2>
        <p className="video-modal__description">
          {videoData.description || `Género: ${videoData.genre} • Año: ${videoData.year}`}
        </p>

        {videoData.videoUrl ? (
          <div style={{ textAlign: "center" }}>
            <video
              controls
              src={videoData.videoUrl}
              className="video-modal__video"
              poster={videoData.poster}
            >
              {subtitlesEnabled && (
                <track
                  label="Español"
                  kind="subtitles"
                  srcLang="es"
                  src="/subtitles/default.vtt"
                  default
                />
              )}
              Tu navegador no soporta el elemento de video.
            </video>

            {/* 🔤 Botón de subtítulos */}
            <button
              onClick={toggleSubtitles}
              style={{
                marginTop: "0.5rem",
                background: "#3b82f6",
                color: "#fff",
                border: "none",
                padding: "0.5rem 1rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              {subtitlesEnabled ? "🔇 Desactivar subtítulos" : "💬 Activar subtítulos"}
            </button>
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <img
              src={videoData.poster || "/images/default-movie.jpg"}
              alt={videoData.title}
              style={{ maxWidth: "300px", width: "100%", borderRadius: "8px", marginBottom: "1rem" }}
            />
            <p>🎬 Video no disponible para reproducción</p>
          </div>
        )}

        {/* FAVORITOS */}
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

        {/* ⭐ SECCIÓN DE CALIFICACIÓN */}
        <div className="rating-section" style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <h3>Califica esta película:</h3>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              style={{
                fontSize: "1.8rem",
                cursor: "pointer",
                color: star <= (rating || 0) ? "#ffd700" : "#ccc",
              }}
            >
              ★
            </span>
          ))}
        </div>

        {/* 💬 SECCIÓN DE COMENTARIOS */}
        <div className="comments-section" style={{ marginTop: "1.5rem" }}>
          <h3>Deja tu comentario:</h3>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Escribe tu opinión sobre la película..."
            style={{
              width: "100%",
              minHeight: "80px",
              borderRadius: "8px",
              padding: "10px",
              border: "1px solid #ccc",
              resize: "none",
              marginBottom: "0.5rem",
            }}
          />
          <button onClick={handleCommentSubmit} className="fav-btn add">
            💬 Enviar comentario
          </button>

          {/* Lista de comentarios */}
          <ul style={{ marginTop: "1rem", paddingLeft: "1rem" }}>
            {commentsList.map((c, i) => (
              <li key={i} style={{ marginBottom: "0.5rem" }}>
                🗣️ {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VideoModal;
