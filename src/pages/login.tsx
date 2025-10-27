import React, { useState } from "react";
import "../styles/login.sass";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Por favor, ingrese su correo y contraseña.");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔹 Iniciando sesión con Supabase...");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("❌ Error en login:", error.message);
        alert(error.message || "Error al iniciar sesión.");
        return;
      }

      if (data.user && data.session) {
        console.log("✅ Login exitoso:", data.user.email);
        console.log("✅ Sesión creada:", data.session.access_token);
        
        // La sesión se guarda automáticamente por Supabase
        alert("Inicio de sesión exitoso.");
        navigate("/movies");
      } else {
        throw new Error("No se pudo crear la sesión");
      }
      
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