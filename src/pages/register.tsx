import React, { useState } from "react";
import "../styles/register.sass";
import { Link, useNavigate } from "react-router-dom";

/**
 * Register component handles user registration process.
 */
const Register = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState(""); // 👈 Cambiar a birthdate
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  /**
   * Handles date selection from the date picker
   */
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBirthdate(e.target.value);
    setShowDatePicker(false);
  };

  /**
   * Formats date for display
   */
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return "Seleccionar fecha de nacimiento";
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  /**
   * Handles the registration form submission.
   */
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !lastname || !email || !password || !confirmPassword || !birthdate) {
      alert("Por favor complete todos los campos.");
      return;
    }

    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden.");
      return;
    }

    // Validar que la fecha de nacimiento sea válida (al menos 5 años)
    const birthDate = new Date(birthdate);
    const today = new Date();
    const minDate = new Date();
    minDate.setFullYear(today.getFullYear() - 5); // Mínimo 5 años
    
    if (birthDate > minDate) {
      alert("Debes tener al menos 5 años para registrarte.");
      return;
    }

    if (!agreeTerms) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'https://movie-wave-ocyd.onrender.com';
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password,
          birthdate, // 👈 Enviar fecha de nacimiento
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Error al registrar el usuario.");
        return;
      }

      alert("Registro exitoso. Ahora puede iniciar sesión.");
      navigate("/");
    } catch (error) {
      console.error(error);
      alert("Error al conectar con el servidor.");
    }
  };

  return (
    <div className="register-page">
      <img src="/images/moviewave-logo.png" className="img-logo" alt="Logo del sitio" />
     
      <div className="register-box">
        <h1 className="titulo">Crea tu cuenta</h1>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Nombre"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="text"
            placeholder="Apellido"
            className="input"
            value={lastname}
            onChange={(e) => setLastname(e.target.value)}
            required
          />

          {/* 👈 Campo de fecha de nacimiento con modal */}
          <div className="date-input-container">
            <button
              type="button"
              className="date-input-button"
              onClick={() => setShowDatePicker(!showDatePicker)}
            >
              {formatDateForDisplay(birthdate)}
            </button>
            
            {showDatePicker && (
              <div className="date-picker-modal">
                <div className="date-picker-header">
                  <h3>Selecciona tu fecha de nacimiento</h3>
                  <button 
                    type="button" 
                    className="close-button"
                    onClick={() => setShowDatePicker(false)}
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="date"
                  className="date-input"
                  value={birthdate}
                  onChange={handleDateSelect}
                  max={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>
            )}
          </div>

          <input
            type="email"
            placeholder="Correo electrónico"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            className="input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <div className="terms">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              required
            />
            <label htmlFor="terms" className="terms-label">
              Estoy de acuerdo con los{" "}
              <a className="terms-link" href="#" onClick={(e) => e.preventDefault()}>
                términos y condiciones
              </a>
            </label>
          </div>

          <button type="submit" className="register-btn">
            Registrarse
          </button>
        </form>
        
        <p className="login-link">
          ¿Ya tiene cuenta? <Link to="/">Inicie sesión</Link>
        </p>
      </div>

      {/* Overlay para cerrar el modal */}
      {showDatePicker && (
        <div 
          className="modal-overlay" 
          onClick={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
};

export default Register;