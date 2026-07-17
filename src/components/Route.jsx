import { useEffect, useState } from "react";

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
  onUpdateRouteNote,
}) {
  const [routeNote, setRouteNote] = useState(
    route.note || ""
  );

  useEffect(() => {
    setRouteNote(route.note || "");
  }, [route.note]);

  const handleDrop = (event) => {
    event.preventDefault();

    const orderId =
      event.dataTransfer.getData("orderId");

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

  const handleOrderDragStart = (
    event,
    orderId
  ) => {
    event.dataTransfer.effectAllowed = "move";

    event.dataTransfer.setData(
      "orderId",
      String(orderId)
    );

    event.dataTransfer.setData(
      "sourceTruckId",
      String(truckId || "")
    );

    event.dataTransfer.setData(
      "sourceRouteId",
      String(route.id)
    );
  };

  const saveRouteNote = () => {
    if (
      typeof onUpdateRouteNote !== "function"
    ) {
      return;
    }

    onUpdateRouteNote(
      route.id,
      routeNote.trim()
    );
  };

  const handleNoteKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.blur();
    }
  };

  const handleOpenPdf = async (order) => {
    try {
      if (!order.pdf) {
        window.alert(
          "לא נמצא קובץ PDF להזמנה"
        );
        return;
      }

      if (!window.electronAPI?.openPdf) {
        window.alert(
          "לא ניתן לפתוח את קובץ ה-PDF"
        );
        return;
      }

      const result =
        await window.electronAPI.openPdf(
          order.pdf
        );

      if (result?.success === false) {
        window.alert(
          result.error ||
            "לא ניתן לפתוח את קובץ ה-PDF"
        );
      }
    } catch (error) {
      console.error(
        "Failed to open PDF:",
        error
      );

      window.alert(
        "לא ניתן לפתוח את קובץ ה-PDF"
      );
    }
  };

  return (
    <section
      style={{
        overflow: "hidden",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-medium)",
        boxShadow: "var(--shadow-small)",
      }}
    >
      <div
        style={{
          minHeight: 52,
          padding: "10px 12px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 10,
          borderBottom:
            "1px solid var(--border)",
          background: "#ffffff",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 9,
          }}
        >
          <div
            style={{
              width: 34,
              height: 34,
              minWidth: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 9,
              background:
                "var(--primary-light)",
              color: "var(--primary)",
              fontSize: 16,
              fontWeight: 800,
            }}
          >
            📍
          </div>

          <div style={{ minWidth: 0 }}>
            <div
              title={route.name}
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                color: "var(--text-main)",
                fontSize: 16,
                fontWeight: 900,
              }}
            >
              {route.name}
            </div>

            <div
              style={{
                marginTop: 2,
                color:
                  "var(--text-secondary)",
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {route.orders.length} הזמנות
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
          }}
        >
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="העבר למעלה"
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: canMoveUp
                ? "var(--surface-soft)"
                : "#f2f4f7",
              color:
                "var(--text-secondary)",
              opacity: canMoveUp ? 1 : 0.35,
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            ↑
          </button>

          <button
            type="button"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            title="העבר למטה"
            style={{
              width: 34,
              height: 34,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: canMoveDown
                ? "var(--surface-soft)"
                : "#f2f4f7",
              color:
                "var(--text-secondary)",
              opacity: canMoveDown
                ? 1
                : 0.35,
              fontSize: 16,
              fontWeight: 900,
            }}
          >
            ↓
          </button>

          {canDelete && (
            <button
              type="button"
              onClick={onDeleteRoute}
              title="מחק מסלול"
              style={{
                width: 34,
                height: 34,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 8,
                background:
                  "var(--danger-light)",
                color: "var(--danger)",
                fontSize: 14,
                fontWeight: 900,
              }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: 10,
          background: "var(--surface-soft)",
        }}
      >
        <input
          type="text"
          value={routeNote}
          onChange={(event) =>
            setRouteNote(event.target.value)
          }
          onBlur={saveRouteNote}
          onKeyDown={handleNoteKeyDown}
          placeholder="הערה למסלול..."
          style={{
            width: "100%",
            height: 38,
            marginBottom: 9,
            padding: "8px 10px",
            borderRadius: 8,
            boxSizing: "border-box",
            fontSize: 13,
            background: "#ffffff",
          }}
        />

        <div
          onDragOver={(event) => {
            event.preventDefault();

            event.dataTransfer.dropEffect =
              "move";
          }}
          onDrop={handleDrop}
          style={{
            minHeight: 88,
            padding:
              route.orders.length === 0
                ? 9
                : 8,
            border:
              "1.5px dashed var(--border-dark)",
            borderRadius: 10,
            background: "#ffffff",
          }}
        >
          {route.orders.length === 0 ? (
            <div
              style={{
                minHeight: 68,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              גרור הזמנות לכאן
            </div>
          ) : (
            route.orders.map((order) => (
              <article
                key={order.id}
                draggable
                onDragStart={(event) =>
                  handleOrderDragStart(
                    event,
                    order.id
                  )
                }
                style={{
                  marginBottom: 8,
                  padding: 11,
                  border: order.dispatched
                    ? "1px solid #9bd3ae"
                    : "1px solid var(--border)",
                  borderRadius: 10,
                  background: order.dispatched
                    ? "var(--success-light)"
                    : "#ffffff",
                  boxShadow:
                    "var(--shadow-small)",
                  cursor: "grab",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: 8,
                  }}
                >
                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        color:
                          "var(--primary)",
                        fontSize: 17,
                        lineHeight: 1.2,
                        fontWeight: 900,
                        direction: "ltr",
                        textAlign: "right",
                      }}
                    >
                      {order.orderNumber}
                    </div>

                    <div
                      title={order.customer}
                      style={{
                        marginTop: 5,
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace: "nowrap",
                        color:
                          "var(--text-main)",
                        fontSize: 14,
                        lineHeight: 1.35,
                        fontWeight: 800,
                      }}
                    >
                      {order.customer}
                    </div>
                  </div>

                  {order.dispatched && (
                    <span
                      style={{
                        flexShrink: 0,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "#ccebd8",
                        color:
                          "var(--success)",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      יצאה
                    </span>
                  )}
                </div>

                <div
                  title={
                    order.destination ||
                    "לא הוגדר יעד"
                  }
                  style={{
                    maxWidth: "100%",
                    marginTop: 8,
                    display: "inline-block",
                    padding: "5px 8px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    borderRadius: 999,
                    background:
                      order.destination
                        ? "var(--primary-light)"
                        : "var(--surface-soft)",
                    color: order.destination
                      ? "var(--primary-dark)"
                      : "var(--text-muted)",
                    fontSize: 11,
                    fontWeight: 800,
                  }}
                >
                  📍{" "}
                  {order.destination ||
                    "לא הוגדר יעד"}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr 1fr",
                    gap: 10,
                    marginTop: 12,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenPdf(order)
                    }
                    style={{
                      height: 50,
                      padding: "8px",
                      border: "none",
                      borderRadius: 10,
                      background: "#22c55e",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    📄 פתח
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onToggleDispatched(
                        order.id,
                        truckId,
                        route.id
                      )
                    }
                    style={{
                      height: 50,
                      padding: "8px",
                      border: "none",
                      borderRadius: 10,
                      background:
                        order.dispatched
                          ? "#94a3b8"
                          : "#2563eb",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    {order.dispatched
                      ? "↩ בטל יציאה"
                      : "🚚 הזמנה יצאה"}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onRemoveOrder(
                        order.id,
                        truckId,
                        route.id
                      )
                    }
                    style={{
                      height: 50,
                      padding: "8px",
                      border: "none",
                      borderRadius: 10,
                      background: "#ef4444",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 900,
                      cursor: "pointer",
                    }}
                  >
                    🗑 הסר מהמסלול
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </section>
  );
}