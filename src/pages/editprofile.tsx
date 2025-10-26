import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
        const token = localStorage.getItem("token");

        if (!token) {
          alert("Sesión expirada. Inicia sesión de nuevo.");
          navigate("/");
          return;
        }

        // Obtener datos del usuario actual
        const response = await fetch(`${API_URL}/api/user-profile`, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
        });

        if (response.ok) {
          const userData = await response.json();
          setName(userData.name || "");
          setLastname(userData.lastname || "");
          setEmail(userData.email || "");
        } else {
          // Si falla, cargar desde localStorage
          const storedData = localStorage.getItem("userData");
          if (storedData) {
            const parsedData = JSON.parse(storedData);
            setName(parsedData.name || "");
            setLastname(parsedData.lastname || "");
            setEmail(parsedData.email || "");
          }
        }
      } catch (error) {
        console.error("Error cargando datos:", error);
        // Cargar desde localStorage como fallback
        const storedData = localStorage.getItem("userData");
        if (storedData) {
          const parsedData = JSON.parse(storedData);
          setName(parsedData.name || "");
          setLastname(parsedData.lastname || "");
          setEmail(parsedData.email || "");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname) {
      alert("Por favor complete nombre y apellido.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name,
          lastname,
          // No enviamos email ya que no es editable
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al actualizar el perfil.");
        return;
      }

      // Actualizar datos localmente
      const updatedUser = { name, lastname, email };
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      alert("Perfil actualizado exitosamente.");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    }
  };

  if (loading) {
    return (
      <div className="edit-profile-page">
        <div className="edit-profile-box">
          <p>Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="edit-profile-page">
      <div className="edit-profile-box">
        <h1 className="title">Editar perfil</h1>

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

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" className="register-btn">
              Guardar cambios
            </button>
            <button 
              type="button" 
              className="google-btn" 
              onClick={() => navigate("/profile")}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;