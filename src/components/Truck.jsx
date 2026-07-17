import { useState } from "react";

import "./Truck.css";
import Route from "./Route";

export default function Truck({
  truck,
  canDelete = false,
  onDeleteTruck,
  onAddRoute,
  onDeleteRoute,
  onMoveRoute,
  onDropOrder,
  onRemoveOrder,
  onToggleDispatched,
  onRenameTruck,
  onUpdateRouteNote,
}) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [truckName, setTruckName] = useState(truck.name || "");

  const startEditingName = () => {
    setTruckName(truck.name || "");
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setTruckName(truck.name || "");
    setIsEditingName(false);
  };

  const saveTruckName = () => {
    const normalizedName = truckName.trim();

    if (!normalizedName) {
      window.alert("יש להזין שם משאית");
      return;
    }

    onRenameTruck(truck.id, normalizedName);
    setIsEditingName(false);
  };

  const handleNameKeyDown = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      saveTruckName();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      cancelEditingName();
    }
  };

  const handleDeleteTruck = () => {
    if (!canDelete || !onDeleteTruck) {
      return;
    }

    const confirmed = window.confirm(
      `למחוק את המשאית "${truck.name}"?\nכל ההזמנות שלה יחזרו להזמנות החדשות.`
    );

    if (!confirmed) {
      return;
    }

    onDeleteTruck(truck.id);
  };

  const totalOrders = truck.routes.reduce(
    (total, route) => total + route.orders.length,
    0
  );

  return (
    <section
      style={{
        minWidth: 0,
        overflow: "hidden",
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: "var(--radius-large)",
        boxShadow: "var(--shadow-medium)",
      }}
    >
      <div
        style={{
          minHeight: 62,
          padding: "12px 14px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          background:
            "linear-gradient(135deg, var(--primary), var(--primary-dark))",
          color: "#ffffff",
        }}
      >
        {isEditingName ? (
          <div
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 7,
            }}
          >
            <input
              autoFocus
              type="text"
              value={truckName}
              onChange={(event) =>
                setTruckName(event.target.value)
              }
              onKeyDown={handleNameKeyDown}
              style={{
                flex: 1,
                minWidth: 0,
                height: 38,
                padding: "7px 10px",
                border: "1px solid rgba(255,255,255,0.55)",
                borderRadius: 8,
                background: "#ffffff",
                color: "var(--text-main)",
                fontSize: 15,
                fontWeight: 800,
              }}
            />

            <button
              type="button"
              onClick={saveTruckName}
              style={{
                minHeight: 38,
                padding: "7px 11px",
                borderRadius: 8,
                background: "#ffffff",
                color: "var(--success)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              שמור
            </button>

            <button
              type="button"
              onClick={cancelEditingName}
              style={{
                minHeight: 38,
                padding: "7px 11px",
                borderRadius: 8,
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.28)",
                color: "#ffffff",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              ביטול
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  minWidth: 38,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: 10,
                  background: "rgba(255,255,255,0.16)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  fontSize: 20,
                }}
              >
                🚚
              </div>

              <div
                style={{
                  minWidth: 0,
                }}
              >
                <h2
                  title={truck.name}
                  style={{
                    margin: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontSize: 18,
                    lineHeight: 1.2,
                    fontWeight: 800,
                  }}
                >
                  {truck.name}
                </h2>

                <div
                  style={{
                    marginTop: 4,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    color: "rgba(255,255,255,0.82)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  <span>{truck.routes.length} מסלולים</span>
                  <span>•</span>
                  <span>{totalOrders} הזמנות</span>
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={startEditingName}
                style={{
                  minHeight: 34,
                  padding: "6px 10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.14)",
                  border: "1px solid rgba(255,255,255,0.26)",
                  color: "#ffffff",
                  fontSize: 11,
                  fontWeight: 800,
                }}
              >
                שינוי שם
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteTruck}
                  title="מחיקת משאית"
                  style={{
                    width: 34,
                    height: 34,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                    background: "rgba(255, 82, 82, 0.22)",
                    border: "1px solid rgba(255,255,255,0.28)",
                    color: "#ffffff",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  🗑
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          padding: 12,
          background: "var(--surface-soft)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {truck.routes.map((route, index) => (
            <Route
              key={route.id}
              route={route}
              truckId={truck.id}
              canDelete={index !== 0}
              canMoveUp={index > 0}
              canMoveDown={index < truck.routes.length - 1}
              onMoveUp={() =>
                onMoveRoute(truck.id, route.id, "up")
              }
              onMoveDown={() =>
                onMoveRoute(truck.id, route.id, "down")
              }
              onDeleteRoute={() =>
                onDeleteRoute(truck.id, route.id)
              }
              onDropOrder={(
                orderId,
                routeId,
                sourceTruckId,
                sourceRouteId
              ) =>
                onDropOrder(
                  orderId,
                  truck.id,
                  routeId,
                  sourceTruckId,
                  sourceRouteId
                )
              }
              onRemoveOrder={(orderId) =>
                onRemoveOrder(orderId, truck.id, route.id)
              }
              onToggleDispatched={(orderId) =>
                onToggleDispatched(
                  orderId,
                  truck.id,
                  route.id
                )
              }
              onUpdateRouteNote={(routeId, note) =>
                onUpdateRouteNote(
                  truck.id,
                  routeId,
                  note
                )
              }
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => onAddRoute(truck.id)}
          style={{
            width: "100%",
            minHeight: 40,
            marginTop: 10,
            padding: "8px 12px",
            border: "1px dashed var(--primary)",
            borderRadius: "var(--radius-small)",
            background: "var(--primary-light)",
            color: "var(--primary)",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          ＋ הוסף מסלול
        </button>
      </div>
    </section>
  );
}