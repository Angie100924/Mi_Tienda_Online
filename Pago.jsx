import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe("TU_PUBLISHABLE_KEY_AQUI");

export default function Pago() {
  const [loading, setLoading] = useState(false);

  const simularPago = async () => {
    setLoading(true);

    // 🔹 Aquí podrías integrar un backend real con Stripe Checkout
    // Por ahora, simularemos el pago:
    setTimeout(() => {
      alert("✅ Pago simulado exitoso. ¡Gracias por tu compra!");
      window.location.href = "/historial"; // redirige al historial
    }, 2000);
  };

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h1>💳 Confirmación de Pedido</h1>
      <p>Simularemos un pago con Stripe Sandbox.</p>
      <button
        onClick={simularPago}
        disabled={loading}
        style={{
          backgroundColor: "#635bff",
          color: "white",
          padding: "12px 24px",
          border: "none",
          borderRadius: "8px",
          fontSize: "16px",
          cursor: "pointer",
        }}
      >
        {loading ? "Procesando..." : "Pagar con Stripe 💳"}
      </button>
    </div>
  );
}
