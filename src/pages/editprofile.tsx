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

  const getAuthToken = (): string | null => localStorage.getItem("supabase.auth.token");

  const calculateAge = (birthDate: string): string => {
    if (!birthDate) return "";
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;
    return `${years} años`;
  };

  const fetchUserData = async () => {
    try {
      const token = getAuthToken();
      if (!token) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/api/user-profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Error obteniendo datos del usuario");

      const userData = await response.json();
      setName(userData.name || "");
      setLastname(userData.lastname || "");
      setEmail(userData.email || "");
      setBirthdate(userData.birthdate || "");
      setAge(userData.birthdate ? calculateAge(userData.birthdate) : "");
    } catch (error) {
      console.error(error);
      alert("Error cargando perfil. Por favor inicia sesión nuevamente.");
      navigate("/");
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
      const token = getAuthToken();
      if (!token) {
        alert("Tu sesión ha expirado. Por favor inicia sesión nuevamente.");
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/api/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, lastname, birthdate }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Error al actualizar el perfil.");

      alert("✅ Perfil actualizado exitosamente.");
      setIsEditing(false);
      await fetchUserData();
    } catch (error: any) {
      console.error(error);
      alert(error.message || "Error al conectar con el servidor.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    fetchUserData();
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
      <button className="back-menu-btn" onClick={() => navigate("/movies")}>
        ← Volver al menú
      </button>

      <div className="edit-profile-box">
        <h1 className="title">{isEditing ? "Editar perfil" : "Mi perfil"}</h1>

        {!isEditing ? (
          <div className="profile-view">
            <img src="/images/user.png" className="img-user" alt="foto de perfil" />

            <div className="profile-info">
              <p><strong>👤 Nombre:</strong> {name}</p>
              <p><strong>👥 Apellido:</strong> {lastname}</p>
              <p><strong>📧 Correo:</strong> {email}</p>
              <p><strong>🎂 Edad:</strong> {age}</p>
              <p><strong>📅 Fecha de nacimiento:</strong> {birthdate}</p>
            </div>

            <div className="profile-actions">
              <button onClick={() => setIsEditing(true)}>✏️ Editar perfil</button>
              <button onClick={() => navigate("/forgot")}>🔒 Cambiar contraseña</button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleUpdateProfile} className="edit-form">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                value={lastname}
                onChange={(e) => setLastname(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Fecha de nacimiento</label>
              <input
                type="date"
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
              <button type="submit" disabled={saving}>
                {saving ? "⏳ Guardando..." : "💾 Guardar cambios"}
              </button>
              <button type="button" onClick={handleCancel} disabled={saving}>
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
