import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass";
import { useNavigate } from "react-router-dom";

/**
 * EditProfile component allows the user to view and update their profile information.
 */
const EditProfile = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [birthdate, setBirthdate] = useState(""); // 👈 Cambiar a birthdate
  const [age, setAge] = useState(""); // 👈 Edad calculada
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  /**
   * Gets the authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  /**
   * Formats date for display
   */
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Seleccionar fecha de nacimiento";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Handles date selection from the date picker
   */
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthdate(e.target.value);
    setShowDatePicker(false);
  };

  /**
   * Fetches user data from the backend API.
   */
  const fetchUserData = async () => {
    try {
      console.log("🔹 Obteniendo datos del usuario desde el backend...");

      const token = getAuthToken();
      if (!token) {
        console.error("❌ No hay token disponible");
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
        setBirthdate(userData.birthdate || ""); // 👈 Recibir birthdate
        setAge(userData.age ? `${userData.age} años` : "No disponible"); // 👈 Recibir edad calculada
        console.log("✅ Datos obtenidos del backend");
      } else {
        throw new Error('Error obteniendo datos del usuario');
      }

    } catch (error: any) {
      console.error("❌ Error cargando datos:", error);
      
      // Intentar cargar desde localStorage como fallback
      try {
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || "");
          setLastname(parsedData.lastname || "");
          setEmail(parsedData.email || "");
          setBirthdate(parsedData.birthdate || "");
          setAge(parsedData.age || "");
          console.log("✅ Datos cargados desde localStorage");
        } else {
          alert("Error cargando perfil. Por favor inicia sesión nuevamente.");
          navigate("/");
        }
      } catch (localError) {
        console.error("Error con localStorage:", localError);
        alert("Error cargando perfil. Por favor inicia sesión nuevamente.");
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles the profile update process by sending updated data to the backend.
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

      const token = getAuthToken();
      if (!token) {
        alert('Tu sesión ha expirado. Por favor inicia sesión de nuevo.');
        navigate("/");
        return;
      }

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
          birthdate: birthdate, // 👈 Incluir birthdate en la actualización
        }),
      });

      const data = await response.json();
      console.log("📨 Respuesta del servidor:", data);

      if (!response.ok) {
        throw new Error(data.error || "Error al actualizar el perfil.");
      }

      // Actualizar localStorage con los nuevos datos
      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        const updatedData = {
          ...parsedData,
          name: name.trim(),
          lastname: lastname.trim(),
          birthdate: birthdate
        };
        localStorage.setItem("userData", JSON.stringify(updatedData));
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
    setShowDatePicker(false);
    fetchUserData();
  };

  /** Navigates back to the movies page. */
  const handleBackToMovies = () => {
    navigate("/movies");
  };

  /** Redirects user to password change page. */
  const handleChangePassword = () => {
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
              <p className="profile-field">
                <strong>Edad:</strong> {age || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>Fecha de nacimiento:</strong> {birthdate ? formatDateForDisplay(birthdate) : "No disponible"}
              </p>
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

            {/* 👈 Campo de fecha de nacimiento con modal para edición */}
            <div className="date-input-container">
              <button
                type="button"
                className="date-input-button"
                onClick={() => setShowDatePicker(!showDatePicker)}
              >
                {formatDateForDisplay(birthdate)}
              </button>
              
              {showDatePicker && (
                <div className="date-picker-modal">
                  <div className="date-picker-header">
                    <h3>Selecciona tu fecha de nacimiento</h3>
                    <button 
                      type="button" 
                      className="close-button"
                      onClick={() => setShowDatePicker(false)}
                    >
                      ✕
                    </button>
                  </div>
                  <input
                    type="date"
                    className="date-input"
                    value={birthdate}
                    onChange={handleDateSelect}
                    max={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              )}
            </div>

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

      {/* Overlay para cerrar el modal */}
      {showDatePicker && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default EditProfile;