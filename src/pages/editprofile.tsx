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
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
  }, []);

  const getAuthToken = (): string | null => {
    return localStorage.getItem("supabase.auth.token");
  };

  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "📅 Seleccionar fecha de nacimiento";
    const date = new Date(dateString);
    return `📅 ${date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

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

      const API_URL =
        import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
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
        throw new Error("Error obteniendo datos del usuario");
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
        alert("Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
        navigate("/");
        return;
      }

      const API_URL =
        import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
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

      const userData = localStorage.getItem("userData");
      if (userData) {
        const parsedData = JSON.parse(userData);
        const updatedData = {
          ...parsedData,
          name: name.trim(),
          lastname: lastname.trim(),
          birthdate: birthdate,
          age: calculateAge(birthdate),
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

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    fetchUserData();
  };
  const handleBackToMovies = () => navigate("/movies");
  const handleChangePassword = () => navigate("/forgot");

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
              <p>
                <strong>👤 Nombre:</strong> {name || "No disponible"}
              </p>
              <p>
                <strong>👥 Apellido:</strong> {lastname || "No disponible"}
              </p>
              <p>
                <strong>📧 Correo:</strong> {email || "No disponible"}
              </p>
              <p>
                <strong>🎂 Edad:</strong> {age || "No disponible"}
              </p>
              <p>
                <strong>📅 Fecha de nacimiento:</strong>{" "}
                {birthdate
                  ? formatDateForDisplay(birthdate).replace("📅 ", "")
                  : "No disponible"}
              </p>
            </div>

            <div className="profile-actions">
              <button type="button" onClick={handleEdit}>
                ✏️ Editar perfil
              </button>
              <button type="button" onClick={handleChangePassword}>
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
                className="input disabled"
                value={email}
                disabled
                title="El correo electrónico no se puede modificar"
              />
            </div>

            {/* 🔹 Nuevo selector de fecha simplificado (sin modal) */}
            <div className="form-group">
              <label htmlFor="birthdate">Fecha de nacimiento</label>
              <input
                type="date"
                id="birthdate"
                className="input"
                value={birthdate}
                onChange={(e) => {
                  setBirthdate(e.target.value);
                  setAge(calculateAge(e.target.value));
                }}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              {birthdate && (
                <p className="age-preview">
                  📊 Edad calculada: <strong>{calculateAge(birthdate)}</strong>
                </p>
              )}
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={saving}>
                {saving ? "⏳ Guardando..." : "💾 Guardar cambios"}
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
