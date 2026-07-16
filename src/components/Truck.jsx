import { useState } from "react";

import "./Truck.css";
import Route from "./Route";

export default function Truck({
  truck,
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

  return (
    <div
      style={{
        background: "white",
        borderRadius: 15,
        padding: 20,
        marginBottom: 20,
        boxShadow: "0 2px 8px rgba(0,0,0,.08)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        {isEditingName ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flex: 1,
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
                padding: 10,
                border: "1px solid #cfd5dc",
                borderRadius: 8,
                outline: "none",
                fontFamily: "inherit",
                fontSize: 18,
                fontWeight: "bold",
              }}
            />

            <button
              type="button"
              onClick={saveTruckName}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: 8,
                background: "#43a047",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              שמור
            </button>

            <button
              type="button"
              onClick={cancelEditingName}
              style={{
                padding: "10px 14px",
                border: "none",
                borderRadius: 8,
                background: "#757575",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ביטול
            </button>
          </div>
        ) : (
          <>
            <h2
              style={{
                margin: 0,
              }}
            >
              🚚 {truck.name}
            </h2>

            <button
              type="button"
              onClick={startEditingName}
              style={{
                padding: "8px 12px",
                border: "none",
                borderRadius: 8,
                background: "#f9a825",
                color: "white",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              ✏️ שינוי שם
            </button>
          </>
        )}
      </div>

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

      <button
        type="button"
        onClick={() => onAddRoute(truck.id)}
        style={{
          width: "100%",
          padding: 12,
          background: "#1976d2",
          color: "white",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontWeight: "bold",
          fontSize: 15,
        }}
      >
        ➕ הוסף מסלול
      </button>
    </div>
  );
}