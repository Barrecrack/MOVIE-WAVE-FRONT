import React, { useEffect, useState } from "react";
import "../styles/styles-components/video-modal.sass";

interface VideoModalProps {
  videoId: number;
  alCerrar: () => void;
}

// 🎯 INTERFAZ PARA SUBTÍTULOS
interface SubtitleTrack {
  lang: string;
  label: string;
  src: string;
}

const VideoModal: React.FC<VideoModalProps> = ({ videoId, alCerrar }) => {
  const [videoData, setVideoData] = useState<any>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(true);

  // ⭐ ESTADOS para comentarios y calificación
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [commentsList, setCommentsList] = useState<string[]>([]);

  // 🎬 ESTADOS PARA SUBTÍTULOS
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [availableSubtitles, setAvailableSubtitles] = useState<SubtitleTrack[]>([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(false);

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
          if (videoEncontrado) {
            setVideoData(videoEncontrado);
            // 🎯 CARGAR SUBTÍTULOS DESDE EL BACKEND
            cargarSubtitulosDesdeBackend(videoEncontrado.id);
          }
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

    // 🎯 FUNCIÓN PARA CARGAR SUBTÍTULOS DESDE EL BACKEND
    const cargarSubtitulosDesdeBackend = async (videoId: number) => {
      try {
        setSubtitlesLoading(true);
        const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
        
        // Verificar subtítulos disponibles para este video
        const subtitlesResponse = await fetch(`${API_BASE}/videos/${videoId}/subtitles`);
        
        if (subtitlesResponse.ok) {
          const subtitlesData = await subtitlesResponse.json();
          setAvailableSubtitles(subtitlesData);
        } else {
          // Si no hay endpoint específico, usar rutas por defecto
          setAvailableSubtitles([
            { lang: "es", label: "Español", src: `${API_BASE}/videos/${videoId}/subtitles/es` },
            { lang: "en", label: "English", src: `${API_BASE}/videos/${videoId}/subtitles/en` }
          ]);
        }
      } catch (error) {
        console.error("Error cargando subtítulos:", error);
        // Subtítulos por defecto en caso de error
        setAvailableSubtitles([
          { lang: "es", label: "Español", src: `${API_BASE}/videos/${videoId}/subtitles/es` },
          { lang: "en", label: "English", src: `${API_BASE}/videos/${videoId}/subtitles/en` }
        ]);
      } finally {
        setSubtitlesLoading(false);
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
              cargarSubtitulosDesdeBackend(video.id);
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
  // 💫 FUNCIONES PARA SUBTÍTULOS
  // ===============================

  /** Activa subtítulos en un idioma específico */
  const activateSubtitles = (lang: string) => {
    setCurrentSubtitle(lang);
  };

  /** Desactiva todos los subtítulos */
  const disableSubtitles = () => {
    setCurrentSubtitle(null);
  };

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

  // ===============================
  // RENDER MEJORADO
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
              {/* 🎯 PISTAS DE SUBTÍTULOS DESDE EL BACKEND */}
              {availableSubtitles.map((track) => (
                <track
                  key={track.lang}
                  kind="subtitles"
                  srcLang={track.lang}
                  label={track.label}
                  src={track.src}
                  default={currentSubtitle === track.lang}
                />
              ))}
              Tu navegador no soporta el elemento de video.
            </video>

            {/* 🎯 CONTROLES DE SUBTÍTULOS */}
            <div className="subtitles-controls" style={{ 
              marginTop: "1rem", 
              display: "flex", 
              gap: "0.5rem", 
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
              {/* Botón Desactivar */}
              <button
                onClick={disableSubtitles}
                disabled={subtitlesLoading}
                style={{
                  background: currentSubtitle === null ? "#3b82f6" : "#6b7280",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: subtitlesLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: subtitlesLoading ? 0.6 : 1
                }}
              >
                {subtitlesLoading ? "⏳" : "🔇"} Sin subtítulos
              </button>
              
              {/* Botón Español */}
              <button
                onClick={() => activateSubtitles("es")}
                disabled={subtitlesLoading}
                style={{
                  background: currentSubtitle === "es" ? "#10b981" : "#6b7280",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: subtitlesLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: subtitlesLoading ? 0.6 : 1
                }}
              >
                {subtitlesLoading ? "⏳" : "🇪🇸"} Español
              </button>

              {/* Botón Inglés */}
              <button
                onClick={() => activateSubtitles("en")}
                disabled={subtitlesLoading}
                style={{
                  background: currentSubtitle === "en" ? "#10b981" : "#6b7280",
                  color: "#fff",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  cursor: subtitlesLoading ? "not-allowed" : "pointer",
                  fontSize: "0.9rem",
                  opacity: subtitlesLoading ? 0.6 : 1
                }}
              >
                {subtitlesLoading ? "⏳" : "🇺🇸"} English
              </button>
            </div>

            {/* 🎯 INDICADOR DE SUBTÍTULOS ACTIVOS */}
            {currentSubtitle && !subtitlesLoading && (
              <p style={{ 
                marginTop: "0.5rem", 
                fontSize: "0.9rem", 
                color: "#10b981",
                fontWeight: "bold"
              }}>
                📝 Subtítulos en {currentSubtitle === "es" ? "Español" : "English"} activados
              </p>
            )}

            {subtitlesLoading && (
              <p style={{ 
                marginTop: "0.5rem", 
                fontSize: "0.9rem", 
                color: "#6b7280"
              }}>
                Cargando subtítulos...
              </p>
            )}
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
                margin: "0 0.2rem"
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