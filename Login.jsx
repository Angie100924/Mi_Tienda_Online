import { useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // 🔹 INICIAR SESIÓN
  const handleLogin = async (e) => {
    e.preventDefault();

    console.log("🔐 Iniciando sesión con:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("📤 Respuesta login:", { data, error });

    if (error) {
      alert("❌ Error al iniciar sesión: " + error.message);
    } else {
      alert("✅ Inicio de sesión exitoso");
      window.location.href = "/home";
    }
  };

  // 🔹 REGISTRAR NUEVO USUARIO
  const handleRegister = async (e) => {
    e.preventDefault();

    console.log("🆕 Intentando registrar:", email);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
    emailRedirectTo: `${window.location.origin}/home`,
  },
    });

    console.log("📤 Respuesta Supabase:", { data, error });

    if (error) {
      alert("❌ Error al registrarte: " + error.message);
    } else {
      alert("✅ Registro exitoso. Revisa tu correo para confirmar la cuenta.");
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>🍰 Bienvenido a SweetShop 🥤</h2>

        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Iniciar sesión</button>

          <button type="button" onClick={handleRegister}>
            Crear cuenta
          </button>
        </form>

        <div className="login-footer">
          <p>
            ¿Olvidaste tu contraseña? <a href="#">Recupérala aquí</a>
          </p>
        </div>
      </div>
    </div>
  );
}
