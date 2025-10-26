import React, { useState } from "react";
import "../styles/forgot.sass";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'VITE_API_URL=https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("Hemos enviado un enlace de restablecimiento de contraseña a su correo electrónico. 📩");
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="forgot-container">
      <form onSubmit={handleForgotPassword} className="forgot-form">
        <img src="../public/images/moviewave-logo.png" className="img-log" alt="Logo del sitio" height="auto" width="auto">
        </img>
        <h2>Ingrese su correo de recuperación</h2>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {message && <p className="success">{message}</p>}

        <input
          type="correo electrónico"
          className="input"
          placeholder="Introduce tu correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Confirmar</button>

        <p className="login-link">
          Recuerdas tu contraseña? <Link to="/">Iniciar sesión</Link>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
