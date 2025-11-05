/**
 * @file register.tsx
 * @description React component that manages the user registration process, including form validation,
 * password confirmation, age verification, and API communication to register a new user.
 */
import React, { useState } from "react";
import "../styles/register.sass";
import { Link, useNavigate } from "react-router-dom";

/**
 * Register component handles user registration logic, input validation,
 * and communication with the backend API.
 *
 * @component
 * @returns {JSX.Element} The registration form interface.
 */
const Register = () => {
  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const navigate = useNavigate();

  /**
   * Calculates a user's age based on a given birthdate.
   *
   * @private
   * @param {string} birthDate - The user's date of birth in YYYY-MM-DD format.
   * @returns {number} The calculated age in years.
   */
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const birth = new Date(birthDate);
    const today = new Date();
    let years = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) years--;
    return years;
  };

  /**
   * Handles the registration form submission.
   * Validates user input, checks password match, enforces minimum age,
   * and sends registration data to the backend API.
   *
   * @async
   * @param {React.FormEvent} e - The form submission event.
   * @returns {Promise<void>} Resolves when the registration process is complete.
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

    const age = calculateAge(birthdate);
    if (age < 5) {
      alert("Debes tener al menos 5 años para registrarte.");
      return;
    }

    if (!agreeTerms) {
      alert("Debe aceptar los términos y condiciones.");
      return;
    }

    try {
      const API_URL = import.meta.env.VITE_API_URL || "https://movie-wave-ocyd.onrender.com";
      const response = await fetch(`${API_URL}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          lastname,
          email,
          password,
          birthdate,
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

          <div className="form-group">
            <label htmlFor="birthdate">Fecha de nacimiento</label>
            <input
              type="date"
              id="birthdate"
              className="input"
              value={birthdate}
              onChange={(e) => setBirthdate(e.target.value)}
              max={new Date().toISOString().split("T")[0]}
              required
            />
            {birthdate && (
              <p className="age-preview">
                <strong>Edad:</strong> {calculateAge(birthdate)} años
                {calculateAge(birthdate) < 5 && (
                  <span className="age-warning"> ❌ (Mínimo 5 años)</span>
                )}
              </p>
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
    </div>
  );
};

export default Register;
