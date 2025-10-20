import React, { useState, useEffect } from "react";
import "../styles/editprofile.sass";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const EditProfile = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [age, setAge] = useState<number | string>("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setName(user.user_metadata?.name || "");
        setLastname(user.user_metadata?.lastname || "");
        setEmail(user.email || "");
      } else {
        navigate("/");
      }
    };
    fetchUser();
  }, [navigate]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname || !email) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const { data: { session } } = await supabase.auth.getSession();

      if (!session?.access_token) {
        alert("Sesión expirada. Inicia sesión de nuevo.");
        navigate("/");
        return;
      }

      const response = await fetch(`${API_URL}/api/update-user`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password, // optional
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al actualizar el perfil.");
        return;
      }

      // ✅ Refresh local session to keep the token active
      await supabase.auth.refreshSession();

      // ✅ We update the data locally
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
