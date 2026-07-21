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
      const pdfSource =
        order.pdfUrl ||
        order.pdf ||
        order.localPdfPath ||
        "";

      if (!pdfSource) {
        window.alert(
          "לא נמצא קובץ PDF להזמנה"
        );

        return;
      }

      if (window.electronAPI?.openPdf) {
        const result =
          await window.electronAPI.openPdf(
            pdfSource
          );

        if (result?.success === false) {
          window.alert(
            result.error ||
              "לא ניתן לפתוח את קובץ ה-PDF"
          );
        }

        return;
      }

      if (
        typeof pdfSource === "string" &&
        /^https?:\/\//i.test(pdfSource)
      ) {
        window.open(
          pdfSource,
          "_blank",
          "noopener,noreferrer"
        );

        return;
      }

      window.alert(
        "לא ניתן לפתוח את קובץ ה-PDF"
      );
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
        background: "#ffffff",
        border: "1px solid #d9e3f0",
        borderRadius: 18,
        boxShadow:
          "0 10px 30px rgba(15, 45, 85, 0.08)",
      }}
    >
      <div
        style={{
          minHeight: 66,
          padding: "13px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          borderBottom:
            "1px solid #e5ebf3",
          background:
            "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
        }}
      >
        <div
          style={{
            minWidth: 0,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              minWidth: 48,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 14,
              background:
                "linear-gradient(145deg, #eaf3ff, #d7e8ff)",
              color: "#114b8c",
              fontSize: 23,
              boxShadow:
                "inset 0 0 0 1px rgba(27, 93, 160, 0.08)",
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
                color: "#102f57",
                fontSize: 20,
                fontWeight: 900,
              }}
            >
              {route.name}
            </div>

            <div
              style={{
                marginTop: 3,
                color: "#7587a2",
                fontSize: 12,
                fontWeight: 800,
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
            gap: 7,
          }}
        >
          <button
            type="button"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            title="העבר למעלה"
            style={{
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border:
                "1px solid #d6e0ed",
              borderRadius: 11,
              background: canMoveUp
                ? "linear-gradient(180deg, #ffffff, #f1f6fc)"
                : "#f2f4f7",
              color: "#173d6d",
              opacity: canMoveUp ? 1 : 0.35,
              fontSize: 20,
              fontWeight: 900,
              cursor: canMoveUp
                ? "pointer"
                : "default",
              boxShadow: canMoveUp
                ? "0 4px 10px rgba(23, 61, 109, 0.08)"
                : "none",
              transition:
                "transform 0.18s ease, box-shadow 0.18s ease",
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
              width: 40,
              height: 40,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border:
                "1px solid #d6e0ed",
              borderRadius: 11,
              background: canMoveDown
                ? "linear-gradient(180deg, #ffffff, #f1f6fc)"
                : "#f2f4f7",
              color: "#173d6d",
              opacity: canMoveDown ? 1 : 0.35,
              fontSize: 20,
              fontWeight: 900,
              cursor: canMoveDown
                ? "pointer"
                : "default",
              boxShadow: canMoveDown
                ? "0 4px 10px rgba(23, 61, 109, 0.08)"
                : "none",
              transition:
                "transform 0.18s ease, box-shadow 0.18s ease",
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
                width: 40,
                height: 40,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border:
                  "1px solid #fecaca",
                borderRadius: 11,
                background:
                  "linear-gradient(180deg, #fffafa, #fff0f1)",
                color: "#c82333",
                fontSize: 17,
                fontWeight: 900,
                cursor: "pointer",
                boxShadow:
                  "0 4px 10px rgba(200, 35, 51, 0.08)",
              }}
            >
              🗑
            </button>
          )}
        </div>
      </div>

      <div
        style={{
          padding: 14,
          background:
            "linear-gradient(180deg, #f7faff 0%, #f2f6fb 100%)",
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
            height: 44,
            marginBottom: 12,
            padding: "9px 13px",
            border:
              "1px solid #d4deeb",
            borderRadius: 12,
            boxSizing: "border-box",
            fontSize: 14,
            fontWeight: 600,
            color: "#243b5a",
            background: "#ffffff",
            boxShadow:
              "0 3px 10px rgba(17, 55, 95, 0.04)",
            outline: "none",
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
            minHeight: 100,
            padding:
              route.orders.length === 0
                ? 12
                : 10,
            border:
              "1.5px dashed #9fb5d1",
            borderRadius: 15,
            background:
              "rgba(255, 255, 255, 0.82)",
          }}
        >
          {route.orders.length === 0 ? (
            <div
              style={{
                minHeight: 78,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                color: "#8293aa",
                fontSize: 13,
                fontWeight: 800,
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
                  marginBottom: 14,
                  padding: 16,
                  border: order.dispatched
                    ? "1px solid #b9dfc7"
                    : "1px solid #d9e4f0",
                  borderRadius: 18,
                  background: order.dispatched
                    ? "linear-gradient(180deg, #f7fff9 0%, #effaf3 100%)"
                    : "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                  boxShadow:
                    "0 7px 20px rgba(15, 55, 95, 0.08)",
                  cursor: "grab",
                  transition:
                    "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(-2px)";
                  event.currentTarget.style.boxShadow =
                    "0 14px 30px rgba(15, 55, 95, 0.14)";
                  event.currentTarget.style.borderColor =
                    order.dispatched ? "#9fd4b2" : "#c8d8ea";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform =
                    "translateY(0)";
                  event.currentTarget.style.boxShadow =
                    "0 7px 20px rgba(15, 55, 95, 0.08)";
                  event.currentTarget.style.borderColor =
                    order.dispatched ? "#b9dfc7" : "#d9e4f0";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems: "flex-start",
                    gap: 12,
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
                        color: "#084a8c",
                        fontSize: 21,
                        lineHeight: 1.2,
                        fontWeight: 950,
                        direction: "ltr",
                        textAlign: "right",
                        letterSpacing: "0.2px",
                      }}
                    >
                      {order.orderNumber}
                    </div>

                    <div
                      title={order.customer}
                      style={{
                        marginTop: 7,
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace: "nowrap",
                        color: "#213754",
                        fontSize: 15,
                        lineHeight: 1.35,
                        fontWeight: 850,
                      }}
                    >
                      {order.customer}
                    </div>
                  </div>

                  <div
                    style={{
                      width: 42,
                      height: 42,
                      minWidth: 42,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 12,
                      background:
                        "linear-gradient(145deg, #edf5ff, #deecfb)",
                      color: "#1d5ca5",
                      fontSize: 19,
                    }}
                  >
                    📄
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <div
                    title={
                      order.destination ||
                      "לא הוגדר יעד"
                    }
                    style={{
                      maxWidth: "100%",
                      display: "inline-block",
                      padding: "6px 10px",
                      overflow: "hidden",
                      textOverflow:
                        "ellipsis",
                      whiteSpace: "nowrap",
                      borderRadius: 999,
                      background:
                        order.destination
                          ? "#edf4ff"
                          : "#f1f4f8",
                      color:
                        order.destination
                          ? "#315d91"
                          : "#8290a4",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    📍{" "}
                    {order.destination ||
                      "לא הוגדר יעד"}
                  </div>

                  {order.dispatched && (
                    <span
                      style={{
                        padding: "6px 11px",
                        borderRadius: 999,
                        background:
                          "linear-gradient(180deg, #dff7e8, #cfefda)",
                        color: "#08783d",
                        fontSize: 12,
                        fontWeight: 900,
                        boxShadow:
                          "0 3px 8px rgba(8, 120, 61, 0.08)",
                      }}
                    >
                      ✓ יצאה
                    </span>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1fr 1fr 1fr",
                    gap: 9,
                    marginTop: 15,
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      handleOpenPdf(order)
                    }
                    style={{
                      minHeight: 46,
                      padding: "8px 7px",
                      border: "1px solid #bee5ca",
                      borderRadius: 13,
                      background:
                        "linear-gradient(180deg, #f1fff5, #e6f8ec)",
                      color: "#147a3c",
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow:
                        "0 4px 10px rgba(30, 135, 70, 0.08)",
                      transition:
                        "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(-1px)";
                      event.currentTarget.style.boxShadow =
                        "0 7px 14px rgba(30, 135, 70, 0.14)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(0)";
                      event.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(30, 135, 70, 0.08)";
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
                      minHeight: 46,
                      padding: "8px 7px",
                      border: order.dispatched
                        ? "1px solid #c8d2df"
                        : "1px solid #bfd4f0",
                      borderRadius: 13,
                      background: order.dispatched
                        ? "linear-gradient(180deg, #f4f6f9, #e9edf2)"
                        : "linear-gradient(180deg, #f1f7ff, #e4effd)",
                      color: order.dispatched
                        ? "#667386"
                        : "#245b9f",
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow: order.dispatched
                        ? "0 4px 10px rgba(90, 105, 125, 0.08)"
                        : "0 4px 10px rgba(35, 93, 160, 0.09)",
                      transition:
                        "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(-1px)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(0)";
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
                      minHeight: 46,
                      padding: "8px 7px",
                      border: "1px solid #f3c1c7",
                      borderRadius: 13,
                      background:
                        "linear-gradient(180deg, #fff4f5, #ffe9eb)",
                      color: "#bd2434",
                      fontSize: 13,
                      fontWeight: 900,
                      cursor: "pointer",
                      boxShadow:
                        "0 4px 10px rgba(190, 35, 52, 0.08)",
                      transition:
                        "transform 0.18s ease, box-shadow 0.18s ease",
                    }}
                    onMouseEnter={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(-1px)";
                      event.currentTarget.style.boxShadow =
                        "0 7px 14px rgba(190, 35, 52, 0.14)";
                    }}
                    onMouseLeave={(event) => {
                      event.currentTarget.style.transform =
                        "translateY(0)";
                      event.currentTarget.style.boxShadow =
                        "0 4px 10px rgba(190, 35, 52, 0.08)";
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