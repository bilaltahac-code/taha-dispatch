import { useMemo, useState } from "react";

import "./Sidebar.css";

export default function Sidebar({
  orders,
  onSelectFiles,
  onDeleteOrder,
  onUpdateOrder,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editOrderNumber, setEditOrderNumber] = useState("");
  const [editCustomer, setEditCustomer] = useState("");
  const [editDestination, setEditDestination] = useState("");

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

      const destination = String(
        order.destination || ""
      ).toLowerCase();

      return (
        orderNumber.includes(normalizedSearch) ||
        customer.includes(normalizedSearch) ||
        destination.includes(normalizedSearch)
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

  const startEditing = (order) => {
    setEditingOrderId(order.id);
    setEditOrderNumber(order.orderNumber || "");
    setEditCustomer(order.customer || "");
    setEditDestination(order.destination || "");
  };

  const cancelEditing = () => {
    setEditingOrderId(null);
    setEditOrderNumber("");
    setEditCustomer("");
    setEditDestination("");
  };

  const saveEditing = (orderId) => {
    const normalizedOrderNumber = editOrderNumber.trim();
    const normalizedCustomer = editCustomer.trim();
    const normalizedDestination = editDestination.trim();

    if (!normalizedOrderNumber || !normalizedCustomer) {
      window.alert("יש להזין מספר הזמנה ושם לקוח");
      return;
    }

    onUpdateOrder(orderId, {
      orderNumber: normalizedOrderNumber,
      customer: normalizedCustomer,
      destination: normalizedDestination,
    });

    cancelEditing();
  };

  const handleDelete = (order) => {
    const confirmed = window.confirm(
      `למחוק את הזמנה ${order.orderNumber}?`
    );

    if (!confirmed) {
      return;
    }

    onDeleteOrder(order.id);

    if (editingOrderId === order.id) {
      cancelEditing();
    }
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
          placeholder="חיפוש לפי מספר, לקוח או יעד..."
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

        {filteredOrders.map((order) => {
          const isEditing = editingOrderId === order.id;

          return (
            <div
              key={order.id}
              draggable={!isEditing}
              onDragStart={(event) =>
                handleDragStart(event, order.id)
              }
              style={{
                background: "#fafafa",
                border: "1px solid #ddd",
                borderRadius: 10,
                padding: 12,
                marginBottom: 10,
                cursor: isEditing ? "default" : "grab",
              }}
            >
              {isEditing ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    מספר הזמנה
                  </label>

                  <input
                    type="text"
                    value={editOrderNumber}
                    onChange={(event) =>
                      setEditOrderNumber(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 10,
                      marginBottom: 5,
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    שם לקוח
                  </label>

                  <input
                    type="text"
                    value={editCustomer}
                    onChange={(event) =>
                      setEditCustomer(event.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 10,
                      marginBottom: 5,
                      fontSize: 13,
                      fontWeight: "bold",
                      color: "#555",
                    }}
                  >
                    יעד
                  </label>

                  <input
                    type="text"
                    value={editDestination}
                    onChange={(event) =>
                      setEditDestination(event.target.value)
                    }
                    placeholder="לאן ההזמנה יוצאת?"
                    style={{
                      width: "100%",
                      padding: 9,
                      border: "1px solid #ccc",
                      borderRadius: 6,
                      boxSizing: "border-box",
                      fontFamily: "inherit",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginTop: 10,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => saveEditing(order.id)}
                      style={{
                        padding: 8,
                        border: "none",
                        borderRadius: 6,
                        background: "#1976d2",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      שמור
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{
                        padding: 8,
                        border: "none",
                        borderRadius: 6,
                        background: "#757575",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ביטול
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div
                    style={{
                      fontSize: 19,
                      fontWeight: "bold",
                      color: "#1976d2",
                    }}
                  >
                    {order.orderNumber}
                  </div>

                  <div
                    style={{
                      marginTop: 7,
                      color: "#444",
                      fontSize: 16,
                    }}
                  >
                    {order.customer}
                  </div>

                  <div
                    style={{
                      marginTop: 9,
                      color: order.destination
                        ? "#1f2937"
                        : "#999",
                      fontSize: 15,
                      fontWeight: order.destination
                        ? "bold"
                        : "normal",
                    }}
                  >
                    📍 {order.destination || "לא הוגדר יעד"}
                  </div>

                  <button
                    type="button"
                    onClick={() => window.open(order.pdf)}
                    style={{
                      marginTop: 12,
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

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                      marginTop: 8,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => startEditing(order)}
                      style={{
                        padding: 8,
                        border: "none",
                        borderRadius: 6,
                        background: "#f9a825",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      ✏️ ערוך
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDelete(order)}
                      style={{
                        padding: 8,
                        border: "none",
                        borderRadius: 6,
                        background: "#e53935",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: "bold",
                      }}
                    >
                      🗑️ מחק
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}