import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

/**
 * EditProfile component allows the user to view and update their profile information.
 * It retrieves user data from Supabase or backend and provides edit functionality.
 * 
 * 💡 NOTA:
 * Si deseas visualizar el frontend sin iniciar sesión,
 * puedes comentar temporalmente las líneas marcadas con:
 * // 👉 (Desactivar para visualizar frontend)
 */
const EditProfile = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // 👉 (Desactivar para visualizar frontend sin login)
    fetchUserData();
  }, []);

  /**
   * Fetches user data from Supabase or backend if Supabase session is not found.
   * Falls back to localStorage if no session is available.
   * 
   * @async
   * @function
   */
  const fetchUserData = async () => {
    try {
      console.log("🔹 Obteniendo datos del usuario...");

      const { data: { user }, error: supabaseError } = await supabase.auth.getUser();

      if (!supabaseError && user) {
        console.log("✅ Usuario obtenido de Supabase:", user.email);

        const userData = {
          name: user.user_metadata?.name || '',
          lastname: user.user_metadata?.lastname || '',
          email: user.email || '',
        };

        setName(userData.name);
        setLastname(userData.lastname);
        setEmail(userData.email);
        return;
      }

      console.log("🔄 Supabase no tiene sesión, intentando con backend...");

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ No hay token disponible");
        // 👉 (Desactivar para visualizar frontend sin login)
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/api/user-profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const userData = await response.json();
        setName(userData.name || "");
        setLastname(userData.lastname || "");
        setEmail(userData.email || "");
        console.log("✅ Datos obtenidos del backend");
      } else {
        throw new Error('Error obteniendo datos del usuario');
      }

    } catch (error: any) {
      console.error("❌ Error cargando datos:", error);

      try {
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || "");
          setLastname(parsedData.lastname || "");
          setEmail(parsedData.email || "");
          console.log("✅ Datos cargados desde localStorage");
        } else {
          // 👉 (Desactivar para visualizar frontend sin login)
          alert("Error cargando perfil. Por favor inicia sesión nuevamente.");
          navigate("/");
        }
      } catch (localError) {
        console.error("Error con localStorage:", localError);
        // 👉 (Desactivar para visualizar frontend sin login)
        alert("Error cargando perfil. Por favor inicia sesión nuevamente.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the profile update process by sending updated data to the backend.
   * Verifies the Supabase session before proceeding.
   * 
   * @async
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !lastname.trim()) {
      alert("Por favor complete nombre y apellido.");
      return;
    }

    setSaving(true);
    try {
      console.log("🔹 Actualizando perfil...");

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error("❌ Error de sesión:", sessionError);
        // 👉 (Desactivar para visualizar frontend sin login)
        alert('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        navigate("/");
        return;
      }

      const token = session.access_token;
      console.log("✅ Token obtenido");

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      console.log("🔹 Enviando solicitud a:", `${API_URL}/api/update-user`);

      const response = await fetch(`${API_URL}/api/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          lastname: lastname.trim(),
        }),
      });

      const data = await response.json();
      console.log("📨 Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil.");
      }

      alert("Perfil actualizado exitosamente.");
      setIsEditing(false);
      await fetchUserData();

    } catch (error: any) {
      console.error("❌ Error actualizando perfil:", error);
      alert(error.message || "Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  /** Enables edit mode for the profile form. */
  const handleEdit = () => {
    setIsEditing(true);
  };

  /** Cancels edit mode and reloads the original user data. */
  const handleCancel = () => {
    setIsEditing(false);
    fetchUserData();
  };

  /** Navigates back to the movies page. */
  const handleBackToMovies = () => {
    // 👉 (Desactivar para visualizar frontend sin redirección)
    navigate("/movies");
  };

  /** Redirects user to password change page. */
  const handleChangePassword = () => {
    // 👉 (Desactivar para visualizar frontend sin redirección)
    navigate("/forgot");
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-box">
          <div className="loading-spinner"></div>
          <p>Cargando datos del perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <button className="back-menu-btn" onClick={handleBackToMovies}>
        menú ←
      </button>

      <div className="edit-profile-box">
        <h1 className="title">{isEditing ? "Editar perfil" : "Mi perfil"}</h1>

        {!isEditing ? (
          <div className="profile-view">
            <img src="/images/user.png" className="img-user" alt="foto de perfil" />

            <div className="profile-info">
              <p className="profile-field">
                <strong>Nombre:</strong> {name || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>Apellido:</strong> {lastname || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>Correo:</strong> {email || "No disponible"}
              </p>
              {/* 
              <p className="profile-field">
                <strong>Edad:</strong> {age || "No disponible"}
              </p>
              */}
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="register-btn"
                onClick={handleEdit}
              >
                ✏️ Editar perfil
              </button>
              <button
                type="button"
                className="google-btn"
                onClick={handleChangePassword}
              >
                🔒 Cambiar contraseña
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile}>
            <input
              type="text"
              placeholder="Nombre"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Apellido"
              className="input"
              value={lastname}
              onChange={(e) => setLastname(e.target.value)}
              required
            />

            <input
              type="email"
              placeholder="Correo electrónico"
              className="input disabled"
              value={email}
              disabled
              title="El correo electrónico no se puede modificar"
            />

            {/*
            <input
              type="number"
              placeholder="Edad"
              className="input disabled"
              value={age}
              disabled
              title="edad aun no se puede modificar"
            />
            */}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button
                type="submit"
                className="register-btn"
                disabled={saving}
              >
                {saving ? 'Guardando...' : '💾 Guardar'}
              </button>
              <button
                type="button"
                className="google-btn"
                onClick={handleCancel}
                disabled={saving}
              >
               ❌ Cancelar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfile;
