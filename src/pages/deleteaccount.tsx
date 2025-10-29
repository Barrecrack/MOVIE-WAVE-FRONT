import React, { useState } from "react";
import { supabase } from "../supabaseClient";
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

  const handleDeleteAccount = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error("No se encontró el usuario.");

      // ⚠️ Esto requiere una clave service_role desde backend.
      const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id);
      if (deleteError) throw deleteError;

      await supabase.auth.signOut();
      alert("Tu cuenta ha sido eliminada permanentemente.");
      navigate("/register");
    } catch (err: any) {
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
              <button onClick={handleDeleteAccount} disabled={loading}>
                {loading ? "Eliminando..." : "Sí, eliminar"}
              </button>
              <button onClick={() => setConfirming(false)}>Cancelar</button>
            </div>
          </div>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
};

export default DeleteAccount;
