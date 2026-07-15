export default function DestinationModal({
  order,
  destination,
  pendingCount,
  onDestinationChange,
  onConfirm,
}) {
  if (!order) {
    return null;
  }

  const handleKeyDown = (event) => {
    if (event.key !== "Enter") {
      return;
    }

    event.preventDefault();
    onConfirm();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0, 0, 0, 0.45)",
        padding: 20,
      }}
    >
      <div
        style={{
          width: 430,
          maxWidth: "100%",
          background: "white",
          borderRadius: 16,
          padding: 24,
          boxShadow: "0 20px 50px rgba(0,0,0,.25)",
        }}
      >
        <h2
          style={{
            margin: 0,
            color: "#1f2937",
          }}
        >
          📍 יעד ההזמנה
        </h2>

        <div
          style={{
            marginTop: 18,
            padding: 14,
            borderRadius: 10,
            background: "#f4f6f8",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              color: "#1976d2",
              fontSize: 18,
            }}
          >
            {order.orderNumber}
          </div>

          <div
            style={{
              marginTop: 6,
              color: "#444",
            }}
          >
            {order.customer}
          </div>
        </div>

        <input
          autoFocus
          type="text"
          value={destination}
          onChange={(event) =>
            onDestinationChange(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="כתוב לאן ההזמנה יוצאת..."
          style={{
            width: "100%",
            marginTop: 18,
            padding: 13,
            border: "1px solid #cfd5dc",
            borderRadius: 9,
            boxSizing: "border-box",
            outline: "none",
            fontFamily: "inherit",
            fontSize: 16,
          }}
        />

        <div
          style={{
            marginTop: 8,
            color: "#777",
            fontSize: 13,
          }}
        >
          אפשר להשאיר ריק וללחוץ Enter
        </div>

        <button
          type="button"
          onClick={onConfirm}
          style={{
            width: "100%",
            marginTop: 18,
            padding: 12,
            border: "none",
            borderRadius: 9,
            background: "#1976d2",
            color: "white",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: 16,
          }}
        >
          הוסף הזמנה
        </button>

        {pendingCount > 1 && (
          <div
            style={{
              marginTop: 12,
              textAlign: "center",
              color: "#777",
              fontSize: 13,
            }}
          >
            נשארו עוד {pendingCount - 1} הזמנות
          </div>
        )}
      </div>
    </div>
  );
}