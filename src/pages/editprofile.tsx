import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    // Cargar datos del usuario desde localStorage
    const userData = localStorage.getItem("userData");
    const token = localStorage.getItem("token");
    
    if (!token) {
      alert("Sesión expirada. Inicia sesión de nuevo.");
      navigate("/");
      return;
    }

    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        setName(parsedData.name || "");
        setLastname(parsedData.lastname || "");
        setEmail(parsedData.email || "");
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname || !email) {
      alert("Por favor complete todos los campos obligatorios.");
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
          email,
          password: password || undefined, // optional
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al actualizar el perfil.");
        return;
      }

      // ✅ Actualizar datos localmente
      const updatedUser = { name, lastname, email };
      localStorage.setItem("userData", JSON.stringify(updatedUser));

      alert("Perfil actualizado exitosamente.");
      navigate("/profile");
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    }
  };

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
            type="number"
            placeholder="Edad (opcional)"
            className="input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Nueva contraseña (opcional)"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="register-btn">
            Guardar cambios
          </button>
        </form>

        <button className="google-btn" onClick={() => navigate("/profile")}>
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditProfile;