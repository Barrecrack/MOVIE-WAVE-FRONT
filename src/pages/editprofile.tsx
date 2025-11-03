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
  const [birthdate, setBirthdate] = useState("");
  const [age, setAge] = useState("");
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
    if (!dateString) return "📅 Seleccionar fecha de nacimiento";
    const date = new Date(dateString);
    return `📅 ${date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })}`;
  };

  /**
   * Calculates age from birthdate
   */
  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      years--;
    }
    return `${years} años`;
  };

  /**
   * Handles date selection from the date picker
   */
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    setBirthdate(newDate);
    setAge(calculateAge(newDate));
  };

  /**
   * Confirms date selection and closes picker
   */
  const confirmDateSelection = () => {
    setShowDatePicker(false);
    if (birthdate) {
      setAge(calculateAge(birthdate));
    }
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
        setBirthdate(userData.birthdate || "");
        setAge(userData.age ? `${userData.age} años` : calculateAge(userData.birthdate));
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
          setAge(parsedData.age || calculateAge(parsedData.birthdate));
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

    if (!name.trim() || !lastname.trim() || !birthdate) {
      alert("Por favor complete nombre, apellido y fecha de nacimiento.");
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
          birthdate: birthdate,
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
          birthdate: birthdate,
          age: calculateAge(birthdate)
        };
        localStorage.setItem("userData", JSON.stringify(updatedData));
      }

      alert("✅ Perfil actualizado exitosamente.");
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
        ← Volver al menú
      </button>

      <div className="edit-profile-box">
        <h1 className="title">{isEditing ? "Editar perfil" : "Mi perfil"}</h1>

        {!isEditing ? (
          <div className="profile-view">
            <img src="/images/user.png" className="img-user" alt="foto de perfil" />

            <div className="profile-info">
              <p className="profile-field">
                <strong>👤 Nombre:</strong> {name || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>👥 Apellido:</strong> {lastname || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>📧 Correo:</strong> {email || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>🎂 Edad:</strong> {age || "No disponible"}
              </p>
              <p className="profile-field">
                <strong>📅 Fecha de nacimiento:</strong> {birthdate ? formatDateForDisplay(birthdate).replace('📅 ', '') : "No disponible"}
              </p>
            </div>

            <div className="profile-actions">
              <button
                type="button"
                className="edit-profile-btn"
                onClick={handleEdit}
              >
                ✏️ Editar perfil
              </button>
              <button
                type="button"
                className="change-password-btn"
                onClick={handleChangePassword}
              >
                🔒 Cambiar contraseña
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <div className="form-group">
              <label htmlFor="name">Nombre</label>
              <input
                id="name"
                type="text"
                placeholder="Tu nombre"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastname">Apellido</label>
              <input
                id="lastname"
                type="text"
                placeholder="Tu apellido"
                className="input"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                placeholder="Tu correo electrónico"
                className="input disabled"
                value={email}
                disabled
                title="El correo electrónico no se puede modificar"
              />
            </div>

            {/* Mejorado: Campo de fecha de nacimiento con modal */}
            <div className="form-group">
              <label htmlFor="birthdate">Fecha de nacimiento</label>
              <div className="date-input-wrapper">
                <button
                  type="button"
                  id="birthdate"
                  className={`date-input-button ${birthdate ? 'has-value' : ''}`}
                  onClick={() => setShowDatePicker(true)}
                >
                  {formatDateForDisplay(birthdate)}
                </button>
                
                {showDatePicker && (
                  <>
                    <div className="modal-overlay" onClick={() => setShowDatePicker(false)} />
                    <div className="date-picker-modal">
                      <div className="date-picker-header">
                        <h3>🎂 Selecciona tu fecha de nacimiento</h3>
                        <button 
                          type="button" 
                          className="close-button"
                          onClick={() => setShowDatePicker(false)}
                          aria-label="Cerrar"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="date-picker-content">
                        <input
                          type="date"
                          className="date-input-field"
                          value={birthdate}
                          onChange={handleDateSelect}
                          max={new Date().toISOString().split('T')[0]}
                          required
                        />
                        {birthdate && (
                          <div className="age-preview">
                            <span>📊 Edad calculada: <strong>{calculateAge(birthdate)}</strong></span>
                          </div>
                        )}
                        <div className="date-picker-actions">
                          <button
                            type="button"
                            className="cancel-date-btn"
                            onClick={() => setShowDatePicker(false)}
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            className="confirm-date-btn"
                            onClick={confirmDateSelection}
                            disabled={!birthdate}
                          >
                            Confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={saving}
              >
                {saving ? '⏳ Guardando...' : '💾 Guardar cambios'}
              </button>
              <button
                type="button"
                className="cancel-btn"
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