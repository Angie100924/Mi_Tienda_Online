import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import "./App.css";

export default function Home() {
  const [productos, setProductos] = useState([]);
  const [carritoCount, setCarritoCount] = useState(0);
  const [session, setSession] = useState(null);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState("todas");
  const [categorias, setCategorias] = useState(["Pasteles", "Bebidas", "Galletas"]);

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      const { data: productosData, error } = await supabase.from("productos").select("*");
      if (!error && productosData) {
        setProductos(productosData);
        const cats = [...new Set(productosData.map((p) => p.categoria)), "Galletas"];
        setCategorias(cats);
      }

      if (session) {
        const { data: pedidoPendiente } = await supabase
          .from("pedidos")
          .select("id")
          .eq("usuario_id", session.user.id)
          .eq("estado", "pendiente")
          .maybeSingle();

        if (pedidoPendiente) {
          const { count } = await supabase
            .from("detalles_pedido")
            .select("*", { count: "exact", head: true })
            .eq("pedido_id", pedidoPendiente.id);
          setCarritoCount(count || 0);
        }
      }
    };

    obtenerDatos();
  }, []);

  const agregarAlCarrito = async (producto) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert("⚠️ Debes iniciar sesión para agregar productos al carrito.");
      return;
    }

    // Buscar o crear pedido pendiente
    let { data: pedidoExistente, error: pedidoError } = await supabase
      .from("pedidos")
      .select("*")
      .eq("usuario_id", session.user.id)
      .eq("estado", "pendiente")
      .maybeSingle();

    if (pedidoError) {
      console.error("❌ Error buscando pedido:", pedidoError);
      return;
    }

    if (!pedidoExistente) {
      const { data: nuevoPedido, error: errorPedido } = await supabase
        .from("pedidos")
        .insert([{ usuario_id: session.user.id, total: 0, estado: "pendiente" }])
        .select()
        .single();

      if (errorPedido) {
        alert("❌ Error al crear el pedido");
        console.error(errorPedido);
        return;
      }
      pedidoExistente = nuevoPedido;
    }

    // Revisar si el producto ya está en el carrito
    const { data: existente } = await supabase
      .from("detalles_pedido")
      .select("*")
      .eq("pedido_id", pedidoExistente.id)
      .eq("producto_id", producto.id)
      .maybeSingle();

    if (existente) {
      await supabase
        .from("detalles_pedido")
        .update({
          cantidad: existente.cantidad + 1,
          subtotal: (existente.cantidad + 1) * producto.precio,
        })
        .eq("id", existente.id);
    } else {
      await supabase.from("detalles_pedido").insert([
        {
          pedido_id: pedidoExistente.id,
          producto_id: producto.id,
          cantidad: 1,
          subtotal: producto.precio,
        },
      ]);
    }

    // ✅ Recalcular cantidad de productos en el carrito
    const { count } = await supabase
      .from("detalles_pedido")
      .select("*", { count: "exact", head: true })
      .eq("pedido_id", pedidoExistente.id);

    setCarritoCount(count || 0);
    alert(`✅ ${producto.nombre} agregado al carrito`);
  };

  const productosFiltrados =
    categoriaSeleccionada === "todas"
      ? productos
      : productos.filter((p) => p.categoria === categoriaSeleccionada);

  return (
    <div className="home-container">
      <h1>🍰 Bienvenidos a SweetShop 🥤🍪</h1>

      {/* 🔹 Barra de navegación */}
      <div className="nav-bar">
        {!session ? (
          <a href="/login">
            <button className="btn-login">Iniciar sesión</button>
          </a>
        ) : (
          <>
            <a href="/historial">
              <button>📦 Historial</button>
            </a>
            <a href="/cart">
              <button>🛒 ({carritoCount}) Carrito</button>
            </a>
            <a href="/perfil">
              <button>👤 Perfil</button>
            </a>
          </>
        )}
      </div>

      {/* 🔹 Filtro por categoría */}
      <div className="filtro-container">
        <label>Filtrar por categoría: </label>
        <select
          value={categoriaSeleccionada}
          onChange={(e) => setCategoriaSeleccionada(e.target.value)}
        >
          <option value="todas">Todas</option>
          {categorias.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* 🔹 Lista de productos */}
      <div className="productos-grid">
        {productosFiltrados.map((p) => (
          <div key={p.id} className="producto-card">
            <img src={p.imagen_url} alt={p.nombre} />
            <h3>{p.nombre}</h3>
            <p>{p.descripcion}</p>
            <p>
              <strong>${p.precio}</strong>
            </p>
            <button onClick={() => agregarAlCarrito(p)}>Agregar al carrito 🛒</button>
          </div>
        ))}
      </div>
    </div>
  );
}
