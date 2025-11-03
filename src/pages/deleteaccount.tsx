import React, { useState } from "react";
import "../styles/deleteaccount.sass";
import { useNavigate } from "react-router-dom";

/**
 * Apartado de eliminación de cuenta de usuario.
 * Muestra una caja con confirmación antes de proceder.
 */
const DeleteAccount: React.FC = () => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Gets the authentication token from localStorage
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = getAuthToken();
      if (!token) {
        throw new Error("No hay sesión activa. Por favor inicia sesión nuevamente.");
      }

      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";

      console.log("🔹 Enviando solicitud de eliminación de cuenta...");
      const response = await fetch(`${API_URL}/api/delete-account`, { // ❌ CAMBIAR ESTA LÍNEA
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Error al eliminar la cuenta.");
      }

      // Limpiar localStorage después de eliminar la cuenta
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("userData");
      localStorage.removeItem("token");

      alert("Tu cuenta ha sido eliminada permanentemente.");
      navigate("/register");

    } catch (err: any) {
      console.error("❌ Error eliminando cuenta:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delete-container">
      <button className="back-menu-btn" onClick={() => navigate("/movies")}>
        menú ←
      </button>

      <div className="delete-box">
        <img
          src="/images/moviewave-logo.png"
          className="img-log"
          alt="Logo del sitio"
          height="auto"
          width="auto"
        />
        <h2>Eliminar cuenta</h2>
        <p>
          Esta acción es <strong>permanente</strong> y eliminará todos tus datos.
        </p>

        {!confirming ? (
          <button className="btn-delete" onClick={() => setConfirming(true)}>
            Eliminar mi cuenta
          </button>
        ) : (
          <div className="confirm-box">
            <p>¿Estás completamente seguro?</p>
            <div className="btn-group">
              <button
                onClick={handleDeleteAccount}
                disabled={loading}
                className="confirm-delete-btn"
              >
                {loading ? "Eliminando..." : "ELIMINAR"}
              </button>
              <button
                onClick={() => setConfirming(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default DeleteAccount;