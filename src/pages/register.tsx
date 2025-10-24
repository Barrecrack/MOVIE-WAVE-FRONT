import React, { useState } from "react";
import "../styles/register.sass";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname || !email || !password || !confirmPassword) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    if (!agreeTerms) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'VITE_API_URL=https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Error al registrar el usuario.");
        return;
      }

      alert("Registro exitoso. Ahora puede iniciar sesión.");
      navigate("/"); // Redirects to login
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="register-page">
      <img src="../public/images/moviewave-logo.png" className="img-logo" alt="Logo del sitio" height="auto" width="auto"></img>
     
      <div className="register-box">
        <h1 className="title">Crea tu cuenta</h1>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            type="text"
            placeholder="Apellido"
            className="input"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
          />

          <input
            type="email"
            placeholder="Correo"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <input
            type="password"
            placeholder="Confirme su contraseña"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="terms">
              Estoy de acuerdo con los{" "}
              <a href="#" onClick={(e) => e.preventDefault()}>
                términos y condiciones
              </a>
            </label>
          </div>

          <button type="submit" className="register-btn">
            Registrarse
          </button>
        </form>
        

        <p className="register">
          ¿Ya tiene cuenta? <Link to="/">Inicie sesión</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
