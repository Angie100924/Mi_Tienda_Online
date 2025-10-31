import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function Historial() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const obtenerHistorial = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "/";
        return;
      }

      // 🔹 Obtener pedidos completados del usuario
      const { data, error } = await supabase
        .from("pedidos")
        .select(`
          id,
          total,
          estado,
          fecha,
          detalles_pedido (
            cantidad,
            subtotal,
            productos ( nombre, imagen_url, precio )
          )
        `)
        .eq("usuario_id", session.user.id)
        .neq("estado", "pendiente") // solo completados
        .order("fecha", { ascending: false });

      if (error) console.error("Error al cargar historial:", error);
      else setPedidos(data);

      setLoading(false);
    };

    obtenerHistorial();
  }, []);

  if (loading) return <h2 style={{ textAlign: "center" }}>Cargando historial...</h2>;

  return (
    <div style={{ padding: "20px" }}>
      <h1>📦 Historial de Pedidos</h1>
      <a href="/home">
        <button style={{ marginBottom: "20px" }}>⬅️ Volver a la tienda</button>
      </a>

      {pedidos.length === 0 ? (
        <p>No tienes pedidos anteriores.</p>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            marginTop: "20px",
          }}
        >
          {pedidos.map((pedido) => (
            <div
              key={pedido.id}
              style={{
                background: "#fffafc",
                border: "1px solid #f0d5e3",
                borderRadius: "12px",
                padding: "20px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3>🧾 Pedido #{pedido.id}</h3>
              <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
              <p><strong>Estado:</strong> {pedido.estado}</p>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                  gap: "15px",
                  marginTop: "15px",
                }}
              >
                {pedido.detalles_pedido.map((detalle, i) => (
                  <div
                    key={i}
                    style={{
                      background: "#fff",
                      border: "1px solid #eee",
                      borderRadius: "8px",
                      padding: "10px",
                      textAlign: "center",
                    }}
                  >
                    <img
                      src={detalle.productos.imagen_url}
                      alt={detalle.productos.nombre}
                      style={{
                        width: "150px",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        marginBottom: "10px",
                      }}
                    />
                    <h4>{detalle.productos.nombre}</h4>
                    <p>Cantidad: {detalle.cantidad}</p>
                    <p>Precio: ${detalle.productos.precio}</p>
                    <p><strong>Subtotal: ${detalle.subtotal}</strong></p>
                  </div>
                ))}
              </div>

              <h3 style={{ marginTop: "15px", textAlign: "right" }}>
                💰 Total: ${pedido.total}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
