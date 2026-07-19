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

  const handleButtonEnter = (event) => {
    event.currentTarget.style.transform = "translateY(-1px)";
    event.currentTarget.style.filter = "brightness(1.08)";
  };

  const handleButtonLeave = (event) => {
    event.currentTarget.style.transform = "translateY(0)";
    event.currentTarget.style.filter = "none";
  };

  return (
    <section
      style={{
        position: "relative",
        minWidth: 0,
        overflow: "hidden",
        background: "var(--surface, #ffffff)",
        border: "1px solid var(--border, #e2e8f0)",
        borderRadius: 20,
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
        transition:
          "transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease",
      }}
    >
      <div
        style={{
          position: "relative",
          minHeight: 74,
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 14,
          overflow: "hidden",
          background:
            "linear-gradient(135deg, var(--primary, #2563eb) 0%, var(--primary-dark, #1e40af) 100%)",
          color: "#ffffff",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: -55,
            left: -30,
            width: 145,
            height: 145,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.09)",
            pointerEvents: "none",
          }}
        />

        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            right: "42%",
            bottom: -80,
            width: 170,
            height: 170,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.05)",
            pointerEvents: "none",
          }}
        />

        {isEditingName ? (
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <input
              autoFocus
              type="text"
              value={truckName}
              onChange={(event) => setTruckName(event.target.value)}
              onKeyDown={handleNameKeyDown}
              placeholder="שם המשאית"
              style={{
                flex: 1,
                minWidth: 0,
                height: 42,
                padding: "8px 12px",
                outline: "none",
                border: "1px solid rgba(255,255,255,0.65)",
                borderRadius: 11,
                background: "#ffffff",
                boxShadow: "0 5px 15px rgba(15,23,42,0.12)",
                color: "var(--text-main, #0f172a)",
                fontFamily: "inherit",
                fontSize: 15,
                fontWeight: 800,
              }}
            />

            <button
              type="button"
              onClick={saveTruckName}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
              style={{
                minHeight: 42,
                padding: "8px 14px",
                border: "1px solid rgba(255,255,255,0.75)",
                borderRadius: 11,
                background: "#ffffff",
                boxShadow: "0 5px 15px rgba(15,23,42,0.12)",
                color: "var(--success, #15803d)",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
                transition: "transform 160ms ease, filter 160ms ease",
              }}
            >
              שמור
            </button>

            <button
              type="button"
              onClick={cancelEditingName}
              onMouseEnter={handleButtonEnter}
              onMouseLeave={handleButtonLeave}
              style={{
                minHeight: 42,
                padding: "8px 13px",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: 11,
                background: "rgba(255,255,255,0.13)",
                color: "#ffffff",
                fontFamily: "inherit",
                fontSize: 12,
                fontWeight: 900,
                cursor: "pointer",
                backdropFilter: "blur(8px)",
                transition: "transform 160ms ease, filter 160ms ease",
              }}
            >
              ביטול
            </button>
          </div>
        ) : (
          <>
            <div
              style={{
                position: "relative",
                zIndex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 46,
                  height: 46,
                  minWidth: 46,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid rgba(255,255,255,0.24)",
                  borderRadius: 14,
                  background: "rgba(255,255,255,0.14)",
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.16)",
                  fontSize: 23,
                  backdropFilter: "blur(8px)",
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
                    fontSize: 19,
                    lineHeight: 1.25,
                    fontWeight: 900,
                    letterSpacing: "-0.2px",
                  }}
                >
                  {truck.name}
                </h2>

                <div
                  style={{
                    marginTop: 7,
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 7,
                  }}
                >
                  <span
                    style={{
                      padding: "3px 8px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.92)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {truck.routes.length} מסלולים
                  </span>

                  <span
                    style={{
                      padding: "3px 8px",
                      border: "1px solid rgba(255,255,255,0.18)",
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.12)",
                      color: "rgba(255,255,255,0.92)",
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {totalOrders} הזמנות
                  </span>
                </div>
              </div>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 1,
                display: "flex",
                alignItems: "center",
                gap: 8,
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={startEditingName}
                onMouseEnter={handleButtonEnter}
                onMouseLeave={handleButtonLeave}
                title="שינוי שם המשאית"
                style={{
                  minHeight: 38,
                  padding: "7px 12px",
                  border: "1px solid rgba(255,255,255,0.28)",
                  borderRadius: 11,
                  background: "rgba(255,255,255,0.13)",
                  color: "#ffffff",
                  fontFamily: "inherit",
                  fontSize: 11,
                  fontWeight: 900,
                  cursor: "pointer",
                  backdropFilter: "blur(8px)",
                  transition: "transform 160ms ease, filter 160ms ease",
                }}
              >
                ✏️ שינוי שם
              </button>

              {canDelete && (
                <button
                  type="button"
                  onClick={handleDeleteTruck}
                  onMouseEnter={handleButtonEnter}
                  onMouseLeave={handleButtonLeave}
                  title="מחיקת משאית"
                  aria-label="מחיקת משאית"
                  style={{
                    width: 38,
                    height: 38,
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(255,255,255,0.3)",
                    borderRadius: 11,
                    background: "rgba(239,68,68,0.28)",
                    color: "#ffffff",
                    fontSize: 16,
                    cursor: "pointer",
                    transition: "transform 160ms ease, filter 160ms ease",
                  }}
                >
                  🗑️
                </button>
              )}
            </div>
          </>
        )}
      </div>

      <div
        style={{
          padding: 14,
          background:
            "linear-gradient(180deg, var(--surface-soft, #f8fafc) 0%, var(--surface, #ffffff) 100%)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
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
          onMouseEnter={(event) => {
            event.currentTarget.style.transform = "translateY(-1px)";
            event.currentTarget.style.background =
              "var(--primary, #2563eb)";
            event.currentTarget.style.color = "#ffffff";
            event.currentTarget.style.boxShadow =
              "0 7px 18px rgba(37,99,235,0.18)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform = "translateY(0)";
            event.currentTarget.style.background =
              "var(--primary-light, #eff6ff)";
            event.currentTarget.style.color =
              "var(--primary, #2563eb)";
            event.currentTarget.style.boxShadow = "none";
          }}
          style={{
            width: "100%",
            minHeight: 44,
            marginTop: 12,
            padding: "9px 14px",
            border: "1.5px dashed var(--primary, #2563eb)",
            borderRadius: 13,
            background: "var(--primary-light, #eff6ff)",
            color: "var(--primary, #2563eb)",
            fontFamily: "inherit",
            fontSize: 13,
            fontWeight: 900,
            cursor: "pointer",
            transition:
              "transform 170ms ease, background 170ms ease, color 170ms ease, box-shadow 170ms ease",
          }}
        >
          ＋ הוסף מסלול
        </button>
      </div>
    </section>
  );
}