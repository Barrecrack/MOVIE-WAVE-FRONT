import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient"; // Agregado: importa Supabase
import "../styles/profile.sass";

interface UserData {
  name: string;
  lastname: string;
  age: number;
  email: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false); // Agregado: estado para edición
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
    password: '', // Agregado: para cambiar contraseña
  });
  const [loading, setLoading] = useState(false); // Agregado: para loading

  useEffect(() => {
    // Cambiado: obtener datos de Supabase en lugar de localStorage
    const getUser = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        window.location.href = "/"; // Redirección si no hay sesión
        return;
      }
      setUserData({
        name: user.user_metadata?.name || '',
        lastname: user.user_metadata?.lastname || '',
        age: user.user_metadata?.age || 0,
        email: user.email || '',
      });
      setFormData({
        name: user.user_metadata?.name || '',
        lastname: user.user_metadata?.lastname || '',
        email: user.email || '',
        password: '',
      });
    };
    getUser();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true); // Cambiado: activar modo edición
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        alert('Sesión expirada. Inicia sesión de nuevo.');
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      const response = await fetch(`${API_URL}/api/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          password: formData.password || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }

      alert('Perfil actualizado correctamente');
      setIsEditing(false);
      // Recargar datos
      const { data: { user } } = await supabase.auth.getUser();
      setUserData({
        name: user?.user_metadata?.name || '',
        lastname: user?.user_metadata?.lastname || '',
        age: user?.user_metadata?.age || 0,
        email: user?.email || '',
      });
    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false); // Agregado: cancelar edición
    if (userData) {
      setFormData({
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
        password: '',
      });
    }
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
            {!isEditing ? (
              <>
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
              </>
            ) : (
              <>
                <label>
                  <strong>Nombre:</strong>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </label>
                <label>
                  <strong>Apellido:</strong>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                  />
                </label>
                <p>
                  <strong>Edad:</strong> {userData.age || "No especificada"} {/* Solo mostrar, no editar */}
                </p>
                <label>
                  <strong>Correo:</strong>
                  <input type="email" value={formData.email} readOnly />
                </label>
                <label>
                  <strong>Nueva Contraseña (opcional):</strong>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </label>
              </>
            )}
          </div>

          {!isEditing ? (
            <button className="edit-button" onClick={handleEditProfile}>
              Editar perfil
            </button>
          ) : (
            <>
              <button className="edit-button" onClick={handleSave} disabled={loading}>
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button className="edit-button" onClick={handleCancel}>
                Cancelar
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;