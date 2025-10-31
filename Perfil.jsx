import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function Perfil() {
  const [usuario, setUsuario] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState("https://vxevlvbdnbxfdmdjqnrf.supabase.co/storage/v1/object/public/avatars/Yo.jpeg"); // 🔹 tu imagen por defecto

  useEffect(() => {
    const obtenerUsuario = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUsuario(session.user);

        // Si el usuario tiene un avatar guardado en metadata, úsalo
        const urlGuardada = session.user.user_metadata?.avatar_url;
        if (urlGuardada) {
          setAvatarUrl(urlGuardada);
        }
      } else {
        alert("⚠️ Debes iniciar sesión para ver tu perfil.");
        window.location.href = "/login";
      }
    };
    obtenerUsuario();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileName = `${usuario.id}-${Date.now()}.jpg`;

    // 📤 Subir al bucket
    const { error } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (error) {
      alert("❌ Error al subir la imagen");
      console.error(error);
      return;
    }

    // 📎 Obtener URL pública
    const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
    const publicUrl = data.publicUrl;

    // Actualizar el estado local
    setAvatarUrl(publicUrl);

    // 🧩 Guardar en los metadatos del usuario
    const { error: updateError } = await supabase.auth.updateUser({
      data: { avatar_url: publicUrl },
    });

    if (updateError) {
      console.error(updateError);
      alert("❌ No se pudo guardar el avatar");
    } else {
      alert("✅ Avatar actualizado correctamente");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <div className="perfil-container">
      <h2>👤 Mi Perfil</h2>

      {usuario ? (
        <div className="perfil-card">
          <img
            src={avatarUrl}
            alt="avatar"
            className="perfil-avatar"
          />

          <h3>{usuario.email}</h3>
          <p><strong>ID:</strong> {usuario.id}</p>

          <label className="upload-label">
            📸 Cambiar foto
            <input type="file" accept="image/*" onChange={handleUpload} hidden />
          </label>

          <div className="perfil-buttons">
            <a href="/"><button>🏠 Tienda</button></a>
            <button onClick={handleLogout} className="btn-logout">🔓 Cerrar sesión</button>
          </div>
        </div>
      ) : (
        <p>Cargando información...</p>
      )}
    </div>
  );
}
