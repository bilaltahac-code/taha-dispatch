import "./Sidebar.css";

export default function Sidebar({ orders, onSelectFiles }) {
  return (
    <div
      style={{
        width: 320,
        minWidth: 320,
        background: "white",
        borderLeft: "1px solid #ddd",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: 20,
          borderBottom: "1px solid #eee",
        }}
      >
        <h2 style={{ margin: 0 }}>📄 הזמנות חדשות</h2>

        <button
          onClick={onSelectFiles}
          style={{
            width: "100%",
            marginTop: 20,
            padding: 12,
            border: "none",
            borderRadius: 8,
            background: "#1976d2",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          ➕ הוסף הזמנות
        </button>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 15,
        }}
      >
        {orders.length === 0 && (
          <div
            style={{
              textAlign: "center",
              color: "#888",
              marginTop: 40,
            }}
          >
            אין הזמנות חדשות
          </div>
        )}

        {orders.map((order) => (
          <div
            key={order.id}
            draggable
            onDragStart={(e) =>
              e.dataTransfer.setData("orderId", order.id)
            }
            style={{
              background: "#fafafa",
              border: "1px solid #ddd",
              borderRadius: 10,
              padding: 12,
              marginBottom: 10,
              cursor: "grab",
            }}
          >
            <b>{order.orderNumber}</b>

            <div
              style={{
                marginTop: 6,
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
          </div>
        ))}
      </div>
    </div>
  );
}