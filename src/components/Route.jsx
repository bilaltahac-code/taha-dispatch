import "./Route.css";

export default function Route({
  route,
  truckId,
  canDelete,
  canMoveUp,
  canMoveDown,
  onMoveUp,
  onMoveDown,
  onDeleteRoute,
  onDropOrder,
  onRemoveOrder,
  onToggleDispatched,
}) {
  const handleDrop = (event) => {
    event.preventDefault();

    const orderId = event.dataTransfer.getData("orderId");
    const sourceTruckId =
      event.dataTransfer.getData("sourceTruckId");
    const sourceRouteId =
      event.dataTransfer.getData("sourceRouteId");

    if (!orderId) {
      return;
    }

    onDropOrder(
      orderId,
      route.id,
      sourceTruckId,
      sourceRouteId
    );
  };

  const handleOrderDragStart = (event, orderId) => {
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("orderId", String(orderId));
    event.dataTransfer.setData(
      "sourceTruckId",
      String(truckId || "")
    );
    event.dataTransfer.setData(
      "sourceRouteId",
      String(route.id)
    );
  };

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
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            style={{
              cursor: canMoveUp ? "pointer" : "not-allowed",
              opacity: canMoveUp ? 1 : 0.3,
            }}
          >
            ⬆️
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            style={{
              cursor: canMoveDown
                ? "pointer"
                : "not-allowed",
              opacity: canMoveDown ? 1 : 0.3,
            }}
          >
            ⬇️
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={onDeleteRoute}
              style={{ cursor: "pointer" }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={handleDrop}
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
              draggable
              onDragStart={(event) =>
                handleOrderDragStart(event, order.id)
              }
              style={{
                background: order.dispatched
                  ? "#e8f5e9"
                  : "white",
                border: order.dispatched
                  ? "2px solid #43a047"
                  : "1px solid #ddd",
                borderRadius: 8,
                padding: 10,
                marginBottom: 8,
                cursor: "grab",
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: "bold",
                  color: "#1976d2",
                }}
              >
                {order.orderNumber}
              </div>

              <div
                style={{
                  marginTop: 6,
                  color: "#444",
                  fontSize: 15,
                }}
              >
                {order.customer}
              </div>

              <div
                style={{
                  marginTop: 8,
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

              {order.dispatched && (
                <div
                  style={{
                    marginTop: 8,
                    padding: 7,
                    borderRadius: 6,
                    background: "#c8e6c9",
                    color: "#1b5e20",
                    fontWeight: "bold",
                    textAlign: "center",
                  }}
                >
                  🚚 ההזמנה יצאה
                </div>
              )}

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
                  fontWeight: "bold",
                }}
              >
                📄 פתח הזמנה
              </button>

              <button
                type="button"
                onClick={() =>
                  onToggleDispatched(order.id)
                }
                style={{
                  marginTop: 8,
                  width: "100%",
                  padding: 8,
                  border: "none",
                  borderRadius: 6,
                  background: order.dispatched
                    ? "#757575"
                    : "#1976d2",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                {order.dispatched
                  ? "↩️ בטל יציאה"
                  : "🚚 ההזמנה יצאה"}
              </button>

              <button
                type="button"
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