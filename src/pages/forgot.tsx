import React, { useState } from "react";
import "../styles/forgot.sass";
import { Link, useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setMessage("");

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
      const response = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong");
      }

      setMessage("We have sent a password reset link to your email 📩");
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="forgot-container">
      <form onSubmit={handleForgotPassword} className="forgot-form">
        <h2>Forgot Password</h2>

        {errorMessage && <p className="error">{errorMessage}</p>}
        {message && <p className="success">{message}</p>}

        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit">Send Reset Link</button>

        <p>
          Remember your password? <a href="/login">Sign in</a>
        </p>
      </form>
    </div>
  );
}

export default ForgotPassword;
