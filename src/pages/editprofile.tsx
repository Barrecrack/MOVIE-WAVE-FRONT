import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass"; // reutilizamos el mismo estilo base
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
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setName(user.name || "");
      setLastname(user.lastname || "");
      setAge(user.age || "");
      setEmail(user.email || "");
    } else {
      navigate("/"); // si no hay sesión activa, redirige al login
    }
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname || !age || !email) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

      const response = await fetch(`${API_URL}/api/update-profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname,
          age,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al actualizar el perfil.");
        return;
      }

      // Actualizamos los datos en localStorage
      const updatedUser = { name, lastname, age, email };
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
          />

          <input
            type="text"
            placeholder="Apellido"
            className="input"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />

          <input
            type="number"
            placeholder="Edad"
            className="input"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
