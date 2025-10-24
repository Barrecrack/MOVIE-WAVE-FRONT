import React, { useState, useEffect } from "react";
import "../styles/resetpassword.sass";

const ResetPassword: React.FC = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState<string | null>(null); // Agregado para extraer token

  useEffect(() => {
    // Extraer token de la URL (agregado)
    const urlParams = new URLSearchParams(window.location.search);
    const extractedToken = urlParams.get("token");
    console.log("🔍 Token obtenido desde URL:", extractedToken);
    if (extractedToken) {
      setToken(extractedToken);
    } else {
      alert("Token no encontrado en la URL. Solicita un nuevo enlace de recuperación.");
    }
  }, []);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("📤 Enviando solicitud de restablecimiento...");
    console.log("🧩 Estado actual:", { password, confirmPassword, token });

    if (!password || !confirmPassword) {
      console.warn("⚠️ Faltan campos obligatorios");
      alert("Por favor complete todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      console.warn("⚠️ Las contraseñas no coinciden");
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!token) {
      console.error("❌ Token inválido o no presente");
      alert("Token inválido. Solicita un nuevo enlace.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";
      console.log("🌐 Enviando petición a:", `${API_URL}/api/reset-password`);

      const response = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }), // ✅ token corregido
      });

      console.log("📨 Respuesta HTTP:", response.status);
      const data = await response.json();
      console.log("📦 Respuesta JSON del servidor:", data);

      if (!response.ok) {
        console.error("❌ Error desde el backend:", data.message || data.error);
        alert(data.message || "Error al restablecer la contraseña.");
        return;
      }

      console.log("✅ Contraseña restablecida correctamente.");
      alert("Contraseña restablecida exitosamente. Ahora puede iniciar sesión.");
      window.location.href = "/";
    } catch (error) {
      console.error("🚨 Error en la conexión o proceso:", error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="reset-password-page">
      <div className="reset-password-box">
        <h1 className="title">Restablecer Contraseña</h1>
        <p className="subtitle">Introduzca su nueva contraseña para continuar.</p>

        <form onSubmit={handleResetPassword}>
          <input
            type="password"
            placeholder="Nueva contraseña"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="reset-btn">
            Restablecer
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
