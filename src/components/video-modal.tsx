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

  // ⭐ ESTADOS ACTUALIZADOS para comentarios y calificación con backend
  const [userRating, setUserRating] = useState<number | null>(null);
  const [userComment, setUserComment] = useState("");
  const [hasUserRated, setHasUserRated] = useState(false);

  // 🎬 ESTADOS PARA SUBTÍTULOS
  const [currentSubtitle, setCurrentSubtitle] = useState<string | null>(null);
  const [availableSubtitles, setAvailableSubtitles] = useState<SubtitleTrack[]>([]);
  const [subtitlesLoading, setSubtitlesLoading] = useState(false);

  // 🔥 Obtener token de autenticación
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  // 🔥 Verificar calificación del usuario desde backend
  const checkUserRating = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        setHasUserRated(false);
        setUserRating(null);
        setUserComment("");
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_BASE}/api/ratings/user/${videoId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.hasRating && data.calificacion) {
          setUserRating(data.calificacion.puntuacion);
          setUserComment(data.calificacion.comentario || "");
          setHasUserRated(true);
        } else {
          setHasUserRated(false);
          setUserRating(null);
          setUserComment("");
        }
      }
    } catch (error) {
      console.error('Error verificando calificación:', error);
      setHasUserRated(false);
    }
  };

  // 🔥 ACTUALIZADO: Guardar calificación en backend - PERMITE GUARDAR PARCIALMENTE
  const saveRating = async (puntuacion: number | null, comentario: string | null) => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Debes iniciar sesión para calificar');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      // 🔥 PREPARAR DATOS PARA ENVIAR (permitir valores null)
      const ratingData: any = {
        id_contenido: videoId
      };

      // Solo incluir puntuación si no es null
      if (puntuacion !== null) {
        ratingData.puntuacion = puntuacion;
      }

      // Solo incluir comentario si no es null
      if (comentario !== null) {
        ratingData.comentario = comentario;
      }

      // 🔥 VALIDACIÓN: Al menos uno de los dos debe tener valor
      if (puntuacion === null && comentario === null) {
        alert("⚠️ Debes proporcionar al menos una calificación o un comentario");
        return;
      }

      const response = await fetch(`${API_BASE}/api/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(ratingData)
      });

      const responseData = await response.json();

      if (response.ok) {
        setHasUserRated(true);
        
        // 🔥 ACTUALIZAR SOLO LOS CAMPOS QUE SE ENVIARON
        if (puntuacion !== null) {
          setUserRating(puntuacion);
        }
        if (comentario !== null) {
          setUserComment(comentario);
        }
        
        alert(`✅ ${hasUserRated ? 'Calificación actualizada' : 'Calificación guardada'} correctamente`);
      } else {
        throw new Error(responseData.error || 'Error al guardar calificación');
      }
    } catch (error: any) {
      console.error('Error guardando calificación:', error);
      alert("Error al guardar calificación: " + error.message);
    }
  };

  // 🔥 Eliminar calificación
  const deleteRating = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Debes iniciar sesión para eliminar calificación');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_BASE}/api/ratings/${videoId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setHasUserRated(false);
        setUserRating(null);
        setUserComment("");
        alert("🗑️ Calificación eliminada");
      } else {
        throw new Error('Error al eliminar calificación');
      }
    } catch (error: any) {
      console.error('Error eliminando calificación:', error);
      alert("Error al eliminar calificación");
    }
  };

  // 🔥 ACTUALIZADO: Manejo de calificación - GUARDA SOLO LA CALIFICACIÓN
  const handleRating = async (value: number) => {
    await saveRating(value, null); // 🔥 Solo calificación, comentario = null
  };

  // 🔥 ACTUALIZADO: Manejo de comentarios - GUARDA SOLO EL COMENTARIO
  const handleCommentSubmit = async () => {
    if (userComment.trim() !== "") {
      await saveRating(null, userComment.trim()); // 🔥 Solo comentario, puntuación = null
    } else {
      alert("⚠️ Escribe un comentario antes de enviar");
    }
  };

  // 🔥 Manejo de cambio de comentario
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserComment(e.target.value);
  };

  // 🔥 Verificar si el video está en favoritos (BACKEND)
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

  // 🔥 CÓDIGO ORIGINAL PARA FAVORITOS
  const addToFavorites = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert('Debes iniciar sesión para agregar favoritos');
        return;
      }

      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log('🔄 Enviando solicitud para agregar favorito...');

      const response = await fetch(`${API_BASE}/api/favorites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id_contenido: videoId
        })
      });

      const responseData = await response.json();

      if (response.ok) {
        setIsFavorite(true);
        console.log('✅ Favorito agregado correctamente:', responseData);
        alert("✅ Agregado a favoritos");
      } else if (response.status === 400) {
        if (responseData.error === 'Ya está en favoritos') {
          setIsFavorite(true);
          alert("❤️ Ya está en favoritos");
        } else {
          console.error('❌ Error 400:', responseData);
          throw new Error(responseData.error || 'Error al agregar favorito');
        }
      } else {
        console.error('❌ Error en respuesta:', responseData);
        throw new Error(responseData.error || 'Error al agregar favorito');
      }
    } catch (error: any) {
      console.error('💥 Error agregando favorito:', error);
      alert("Error al agregar a favoritos: " + error.message);
    }
  };

  // 🔥 Eliminar de favoritos (BACKEND)
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

  // ===============================
  // CÓDIGO ORIGINAL PARA CARGAR VIDEO (MANTENIENDO ESTRUCTURA ORIGINAL)
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

    const cargarSubtitulosDesdeBackend = async (videoId: number) => {
      const API_BASE = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      try {
        setSubtitlesLoading(true);
        const subtitlesResponse = await fetch(`${API_BASE}/videos/${videoId}/subtitles`);

        if (subtitlesResponse.ok) {
          const subtitlesData = await subtitlesResponse.json();
          setAvailableSubtitles(subtitlesData);
        } else {
          setAvailableSubtitles([
            { lang: "es", label: "Español", src: `${API_BASE}/videos/${videoId}/subtitles/es` },
            { lang: "en", label: "English", src: `${API_BASE}/videos/${videoId}/subtitles/en` }
          ]);
        }
      } catch (error) {
        console.error("Error cargando subtítulos:", error);
        setAvailableSubtitles([
          { lang: "es", label: "Español", src: `${API_BASE}/videos/${videoId}/subtitles/es` },
          { lang: "en", label: "English", src: `${API_BASE}/videos/${videoId}/subtitles/en` }
        ]);
      } finally {
        setSubtitlesLoading(false);
      }
    }

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

  // 🔥 ACTUALIZADO: Usar backend en lugar de localStorage
  useEffect(() => {
    if (videoData) {
      checkIfFavorite();
      checkUserRating(); // 🔥 NUEVO: Verificar calificación del usuario
    }
  }, [videoData]);

  // ===============================
  // 💫 FUNCIONES PARA SUBTÍTULOS (ORIGINALES)
  // ===============================

  const activateSubtitles = (lang: string) => {
    setCurrentSubtitle(lang);
  };

  const disableSubtitles = () => {
    setCurrentSubtitle(null);
  };

  // ===============================
  // RENDER MEJORADO (MANTENIENDO ESTRUCTURA ORIGINAL PARA CARÁTULA)
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

            <div className="subtitles-controls" style={{
              marginTop: "1rem",
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              flexWrap: "wrap"
            }}>
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

        {/* FAVORITOS CON BACKEND */}
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

        {/* ⭐ SECCIÓN DE CALIFICACIÓN ACTUALIZADA CON BACKEND */}
        <div className="rating-section" style={{ marginTop: "1.5rem", textAlign: "center" }}>
          <h3>
            {hasUserRated ? "Tu calificación:" : "Califica esta película:"}
            {hasUserRated && (
              <button
                onClick={deleteRating}
                style={{
                  marginLeft: "10px",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  padding: "2px 8px",
                  fontSize: "0.8rem",
                  cursor: "pointer"
                }}
              >
                Eliminar
              </button>
            )}
          </h3>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              onClick={() => handleRating(star)}
              style={{
                fontSize: "1.8rem",
                cursor: "pointer",
                color: star <= (userRating || 0) ? "#ffd700" : "#ccc",
                margin: "0 0.2rem"
              }}
            >
              ★
            </span>
          ))}
          {userRating && (
            <p style={{ marginTop: "0.5rem", color: "#666" }}>
              Calificaste con {userRating} estrella{userRating > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* 💬 SECCIÓN DE COMENTARIOS ACTUALIZADA CON BACKEND */}
        <div className="comments-section" style={{ marginTop: "1.5rem" }}>
          <h3>Deja tu comentario:</h3>
          <textarea
            value={userComment}
            onChange={handleCommentChange}
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
            {userComment ? "💾 Guardar comentario" : "🗑️ Eliminar comentario"}
          </button>
          {userComment && (
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "0.5rem" }}>
              💡 Puedes guardar solo el comentario sin necesidad de calificar primero
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoModal;