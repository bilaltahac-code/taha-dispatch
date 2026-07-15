import "./Route.css";

export default function Route({
  route,
  onDropOrder,
  onRemoveOrder,
}) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <b>📍 {route.name}</b>

        <div style={{ display: "flex", gap: 5 }}>
          <button>⬆️</button>
          <button>⬇️</button>
          <button>🗑️</button>
        </div>
      </div>

      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();

          const orderId = e.dataTransfer.getData("orderId");

          onDropOrder(orderId, route.id);
        }}
        style={{
          minHeight: 100,
          border: "2px dashed #cfcfcf",
          borderRadius: 10,
          background: "#fafafa",
          padding: 10,
        }}
      >
        {route.orders.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: 30,
            }}
          >
            גרור הזמנות לכאן
          </div>
        ) : (
          route.orders.map((order) => (
            <div
              key={order.id}
              style={{
                background: "white",
                border: "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
              }}
            >
              <b>{order.orderNumber}</b>

              <div
                style={{
                  marginTop: 5,
                  color: "#555",
                }}
              >
                {order.customer}
              </div>

              <button
                onClick={() => window.open(order.pdf)}
                style={{
                  marginTop: 10,
                  width: "100%",
                  padding: 8,
                  border: "none",
                  borderRadius: 6,
                  background: "#43a047",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                📄 פתח הזמנה
              </button>

              <button
                onClick={() => onRemoveOrder(order.id)}
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 8,
                  border: "none",
                  borderRadius: 6,
                  background: "#e53935",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                ❌ הסר מהמסלול
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}