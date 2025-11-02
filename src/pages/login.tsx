import React, { useState } from "react";
import "../styles/login.sass";
import { Link, useNavigate } from "react-router-dom";

/**
 * Login component for user authentication.
 * 
 * @component
 * @returns {JSX.Element} The rendered login form component.
 */
const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles the user login process by sending credentials to the backend.
   * 
   * @param {React.FormEvent} e - The form submission event.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, ingrese su correo y contraseña.");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔹 Iniciando sesión con el backend...");
      
      const API_URL = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al iniciar sesión.");
        return;
      }

      console.log("✅ Login exitoso via backend:", data.user?.email);

      // 🔥 IMPORTANTE: Solo guardamos el token, NO sincronizamos con Supabase
      if (data.token) {
        console.log("🔐 Guardando token en localStorage...");
        
        // Guardar token para futuras peticiones al backend
        localStorage.setItem("supabase.auth.token", data.token);
        
        // Opcional: guardar información básica del usuario
        if (data.user) {
          localStorage.setItem("userData", JSON.stringify({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name,
            lastname: data.user.user_metadata?.lastname
          }));
        }
        
        console.log("✅ Token guardado correctamente");
      }

      alert("Inicio de sesión exitoso.");
      navigate("/movies");
      
    } catch (error: any) {
      console.error("❌ Error en login:", error);
      alert("Error al iniciar sesión: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-box">
        <img src="/images/moviewave-logo.png" className="img-logo" alt="Logo del sitio" />

        <p className="subtitle">¡Bienvenido a la mejor plataforma de streaming!</p>
        <p className="text">Ingrese su correo y contraseña para acceder</p>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="password-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Contraseña"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
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

          <button 
            type="submit" 
            className="login-btn"
            disabled={loading}
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
          </button>
        </form>

        <a className="forgot">
          ¿Olvidó su contraseña? <Link to="/forgot">Recuperar</Link>
        </a>

        <p className="register">
          ¿No tiene cuenta? <Link to="/register">Regístrarse</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;