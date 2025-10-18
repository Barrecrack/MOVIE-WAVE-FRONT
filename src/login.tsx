import React, { useState } from "react";
import "./styles/login.sass";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, ingrese su correo y contraseña.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';  // Dinámico
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al iniciar sesión.");
        return;
      }

      // Guarda el token si existe
      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      alert("Inicio de sesión exitoso.");
      navigate("/home"); // redirige al home o dashboard
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <h1 className="title">
          Movie<span>Wave</span>
        </h1>

        <p className="subtitle">¡Bienvenido a la mejor plataforma de streaming!</p>
        <p className="text">Ingrese su correo y contraseña para acceder</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <img
              src={
                showPassword
                  ? "/images/eyeopen.svg"
                  : "/images/eyeclose.svg"
              }
              alt="Mostrar contraseña"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <button type="submit" className="login-btn">
            Iniciar sesión
          </button>
        </form>

        <a className="forgot">
          ¿Olvidó su contraseña? <Link to="/forgot">Recupérela</Link>
        </a>

        <button className="google-btn">
          <img src="/images/google.svg" alt="Google" />
          Continuar con Google
        </button>

        <p className="register">
          ¿No tiene cuenta? <Link to="/register">Regístrese</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
