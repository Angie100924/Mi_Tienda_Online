import { useEffect } from "react";
import { supabase } from "./supabaseClient";

function App() {
  useEffect(() => {
    async function pruebaConexion() {
      const { data, error } = await supabase.from("productos").select("*");
      console.log("Resultado:", data, error);
    }
    pruebaConexion();
  }, []);

  return (
    <h1>🍰 Mi Tienda Online Conectada a Supabase</h1>
  );
}

export default App;
