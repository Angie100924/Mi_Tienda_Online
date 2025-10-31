import { Navigate } from "react-router-dom";
import { supabase } from "./supabaseClient";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    async function getSession() {
      const { data } = await supabase.auth.getSession();
      setSession(data.session);
      setLoading(false);
    }
    getSession();
  }, []);

  if (loading) return <h2 style={{ textAlign: "center" }}>Cargando...</h2>;

  // Si no hay sesión → Redirige
  if (!session) return <Navigate to="/" />;

  // Si sí hay sesión → muestra el componente
  return children;
}
