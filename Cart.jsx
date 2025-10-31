import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css"; 

export default function Cart() {
  const [detalles, setDetalles] = useState([]);
  const [pedido, setPedido] = useState(null);
  const [total, setTotal] = useState(0);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const cargarCarrito = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        alert("⚠️ Debes iniciar sesión para ver tu carrito.");
        window.location.href = "/";
        return;
      }

      setSession(data.session);

      const { data: pedidoPendiente } = await supabase
        .from("pedidos")
        .select("*")
        .eq("usuario_id", data.session.user.id)
        .eq("estado", "pendiente")
        .single();

      if (pedidoPendiente) {
        setPedido(pedidoPendiente);

        const { data: detallesPedido, error } = await supabase
          .from("detalles_pedido")
          .select("id, cantidad, subtotal, producto_id")
          .eq("pedido_id", pedidoPendiente.id);

        if (error) {
          console.error("❌ Error al cargar detalles:", error);
          return;
        }

        if (detallesPedido && detallesPedido.length > 0) {
          const productosIds = detallesPedido.map((d) => d.producto_id);
          const { data: productosData } = await supabase
            .from("productos")
            .select("id, nombre, precio, imagen_url")
            .in("id", productosIds);

          const detallesConProductos = detallesPedido.map((d) => ({
            ...d,
            productos: productosData.find((p) => p.id === d.producto_id),
          }));

          setDetalles(detallesConProductos);
          calcularTotal(detallesConProductos);
        } else {
          setDetalles([]);
        }
      }
    };

    cargarCarrito();
  }, []);

  const calcularTotal = (items) => {
    const suma = items?.reduce((acc, item) => acc + item.subtotal, 0) || 0;
    setTotal(suma);
  };

  const eliminarProducto = async (idDetalle) => {
    await supabase.from("detalles_pedido").delete().eq("id", idDetalle);
    const nuevosDetalles = detalles.filter((d) => d.id !== idDetalle);
    setDetalles(nuevosDetalles);
    calcularTotal(nuevosDetalles);
  };

  const confirmarPago = async () => {
    if (!pedido) {
      alert("No tienes ningún pedido pendiente.");
      return;
    }

    try {
      const { error: errorPedido } = await supabase
        .from("pedidos")
        .update({
          estado: "pagado",
          total: total,
          fecha_pago: new Date().toISOString(),
        })
        .eq("id", pedido.id);

      if (errorPedido) throw errorPedido;

      await supabase.from("detalles_pedido").delete().eq("pedido_id", pedido.id);

      setDetalles([]);
      setTotal(0);

      alert("✅ Pedido pagado con éxito");
      window.location.href = "/home";
    } catch (error) {
      console.error("Error al confirmar pedido:", error);
      alert("❌ Hubo un problema al confirmar el pedido.");
    }
  };

  return (
    <div className="cart-container">
      <h2>🛒 Tu Carrito</h2>

      {detalles.length === 0 ? (
        <div className="cart-empty">
          <img src="/empty-cart.png" alt="Carrito vacío" />
          <p>Tu carrito está vacío. ¡Agrega algo dulce! 🍰</p>
        </div>
      ) : (
        <>
          {detalles.map((d) => (
            <div key={d.id} className="cart-item">
              <img
                src={d.productos?.imagen_url}
                alt={d.productos?.nombre}
                className="cart-item-img"
              />
              <div className="cart-item-info">
                <h4>{d.productos?.nombre}</h4>
                <p>Cantidad: {d.cantidad}</p>
                <p>Subtotal: ${d.subtotal}</p>
              </div>
              <button className="btn-remove" onClick={() => eliminarProducto(d.id)}>
                🗑️ Quitar
              </button>
            </div>
          ))}

          <div className="cart-summary">
            <h3>Total:</h3>
            <p className="total">${total}</p>
            <button className="btn-checkout" onClick={confirmarPago}>
              Confirmar pago 💳
            </button>
          </div>
        </>
      )}
    </div>
  );
}
