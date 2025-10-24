import React, { useEffect, useState } from "react";
import "../styles/profile.sass";

interface UserData {
  name: string;
  lastname: string;
  age: number;
  email: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("userData");
    if (storedUser) {
      setUserData(JSON.parse(storedUser));
    } else {
      // 🚧 Línea comentada para pruebas
      // window.location.href = "/"; // redirige al login si no hay sesión
      console.log("No hay sesión iniciada. Mostrando perfil de prueba...");
      setUserData({
        name: "Usuario",
        lastname: "Demo",
        age: 25,
        email: "usuario@ejemplo.com",
      });
    }
  }, []);

  const handleEditProfile = () => {
    alert("Funcionalidad de edición de perfil próximamente 🔧");
  };

  if (!userData) {
    return <div className="loading">Cargando perfil...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1 className="title">Perfil</h1>

        <div className="profile-card">
          <div className="profile-info">
            <p>
              <strong>Nombre:</strong> {userData.name}
            </p>
            <p>
              <strong>Apellido:</strong> {userData.lastname}
            </p>
            <p>
              <strong>Edad:</strong> {userData.age || "No especificada"}
            </p>
            <p>
              <strong>Correo:</strong> {userData.email}
            </p>
          </div>

          <button className="edit-button" onClick={handleEditProfile}>
            Editar perfil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
