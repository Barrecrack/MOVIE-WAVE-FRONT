/**
 * @file deleteaccount.tsx
 * @description React component that manages the user account deletion process.
 * Displays a confirmation prompt and handles API communication to permanently remove the user account.
 */
import React, { useState } from "react";
import "../styles/deleteaccount.sass";
import { useNavigate } from "react-router-dom";

/**
 * DeleteAccount component handles the UI and logic for deleting a user's account.
 * It provides confirmation prompts and communicates with the backend API to execute the deletion.
 *
 * @component
 * @returns {JSX.Element} The rendered Delete Account interface.
 */
const DeleteAccount: React.FC = () => {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Retrieves the current authentication token from localStorage.
   *
   * @private
   * @returns {string | null} The stored Supabase authentication token, or null if not found.
   */
  const getAuthToken = (): string | null => {
    return localStorage.getItem('supabase.auth.token');
  };

  /**
   * Handles the complete process of account deletion.
   * Sends a DELETE request to the backend API, clears localStorage, and redirects the user.
   * Displays alerts and logs status messages throughout the process.
   *
   * @async
   * @private
   * @returns {Promise<void>} Resolves once the account deletion process finishes.
   */
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
      const response = await fetch(`${API_URL}/api/delete-account`, {
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