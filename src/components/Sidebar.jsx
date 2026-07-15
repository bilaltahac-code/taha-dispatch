import { useMemo, useState } from "react";

import "./Sidebar.css";

export default function Sidebar({
  orders,
  onSelectFiles,
}) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    if (!normalizedSearch) {
      return orders;
    }

    return orders.filter((order) => {
      const orderNumber = String(
        order.orderNumber || ""
      ).toLowerCase();

      const customer = String(
        order.customer || ""
      ).toLowerCase();

      return (
        orderNumber.includes(normalizedSearch) ||
        customer.includes(normalizedSearch)
      );
    });
  }, [orders, searchTerm]);

  const handleDragStart = (event, orderId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData(
      "orderId",
      String(orderId)
    );
    event.dataTransfer.setData("sourceTruckId", "");
    event.dataTransfer.setData("sourceRouteId", "");
  };

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
        <h2 style={{ margin: 0 }}>
          📄 הזמנות חדשות
        </h2>

        <button
          type="button"
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

        <input
          type="search"
          value={searchTerm}
          onChange={(event) =>
            setSearchTerm(event.target.value)
          }
          placeholder="חיפוש לפי מספר או לקוח..."
          style={{
            width: "100%",
            marginTop: 12,
            padding: 11,
            border: "1px solid #d5d9dd",
            borderRadius: 8,
            outline: "none",
            fontFamily: "inherit",
            fontSize: 14,
            boxSizing: "border-box",
          }}
        />

        <div
          style={{
            marginTop: 10,
            color: "#777",
            fontSize: 13,
          }}
        >
          נמצאו {filteredOrders.length} מתוך{" "}
          {orders.length} הזמנות
        </div>
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

        {orders.length > 0 &&
          filteredOrders.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#888",
                marginTop: 40,
              }}
            >
              לא נמצאו הזמנות
            </div>
          )}

        {filteredOrders.map((order) => (
          <div
            key={order.id}
            draggable
            onDragStart={(event) =>
              handleDragStart(event, order.id)
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
              type="button"
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