import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login.jsx";
import Home from "./Home.jsx";
import Cart from "./Cart.jsx";
import Historial from "./Historial.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";
import Pago from "./Pago.jsx";
import Perfil from "./Perfil.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      {/* 🏠 Ruta principal (la tienda visible sin login) */}
      <Route path="/" element={<Home />} />

      {/* 🔁 Ruta extra opcional: /home también carga la tienda */}
      <Route path="/home" element={<Home />} />

      {/* 🛒 Ruta Carrito protegida */}
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />

      <Route
  path="/perfil"
  element={
    <ProtectedRoute>
      <Perfil />
    </ProtectedRoute>
  }
/>

      {/* 📦 Ruta Historial protegida */}
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <Historial />
          </ProtectedRoute>
        }
      />

<Route
  path="/Pago"
  element={
    <ProtectedRoute>
      <Pago />
    </ProtectedRoute>
  }
/>

      {/* 🔐 Ruta Login (si quieres mantenerla) */}
      <Route path="/login" element={<Login />} />
    </Routes>
  </BrowserRouter>
);

