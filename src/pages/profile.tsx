import React, { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";
import "../styles/profile.sass";
import { useNavigate } from "react-router-dom";

interface UserData {
  name: string;
  lastname: string;
  email: string;
}

const Profile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    lastname: '',
    email: '',
  });
  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error || !user) {
          console.error("Error obteniendo usuario:", error);
          navigate("/");
          return;
        }
        
        const userData = {
          name: user.user_metadata?.name || '',
          lastname: user.user_metadata?.lastname || '',
          email: user.email || '',
        };
        
        setUserData(userData);
        setFormData(userData);
      } catch (error) {
        console.error("Error cargando perfil:", error);
      } finally {
        setPageLoading(false);
      }
    };
    
    getUser();
  }, [navigate]);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.lastname.trim()) {
      alert("Por favor complete nombre y apellido.");
      return;
    }

    setLoading(true);
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) {
        alert('Sesión expirada. Inicia sesión de nuevo.');
        navigate("/");
        return;
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/api/update-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          lastname: formData.lastname,
          // No enviamos email ni password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al actualizar');
      }

      alert('Perfil actualizado correctamente');
      setIsEditing(false);

      // Actualizar datos locales
      setUserData({
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
      });

    } catch (error: any) {
      console.error('Error actualizando perfil:', error);
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Restaurar datos originales
    if (userData) {
      setFormData({
        name: userData.name,
        lastname: userData.lastname,
        email: userData.email,
      });
    }
  };

  const handleBackToMenu = () => {
    navigate("/movies");
  };

  const handleForgotPassword = () => {
    navigate("/forgot");
  };

  if (pageLoading) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="loading">Cargando perfil...</div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <p>Error al cargar el perfil. <a href="/">Iniciar sesión</a></p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <button className="back-menu-btn" onClick={handleBackToMenu}>
        menú ←
      </button>
      <div className="profile-container">
        <h1 className="titulo">Perfil</h1>
  
        <img src="/images/user.png" className="img-user" alt="foto de perfil" />

        <div className="profile-card">
          <div className="profile-info">
            {!isEditing ? (
              // MODO LECTURA
              <>
                <p className="letter">
                  <strong>Nombre:</strong> {userData.name}
                </p>
                <p className="letter">
                  <strong>Apellido:</strong> {userData.lastname}
                </p>
                <p className="letter">
                  <strong>Correo:</strong> {userData.email}
                </p>
                
                <div className="profile-actions">
                  <button className="edit-button" onClick={handleEditProfile}>
                    ✏️ Editar perfil
                  </button>
                  <button 
                    className="password-button" 
                    onClick={handleForgotPassword}
                  >
                    🔒 Cambiar contraseña
                  </button>
                </div>
              </>
            ) : (
              // MODO EDICIÓN
              <>
                <div className="form-group">
                  <label><strong>Nombre:</strong></label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="edit-input"
                  />
                </div>
                
                <div className="form-group">
                  <label><strong>Apellido:</strong></label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                    className="edit-input"
                  />
                </div>
                
                <div className="form-group">
                  <label><strong>Correo:</strong></label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    readOnly 
                    className="edit-input disabled"
                    title="El correo no se puede modificar"
                  />
                </div>

                <div className="edit-actions">
                  <button 
                    className="save-button" 
                    onClick={handleSave} 
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : '💾 Guardar'}
                  </button>
                  <button 
                    className="cancel-button" 
                    onClick={handleCancel}
                  >
                    ❌ Cancelar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;