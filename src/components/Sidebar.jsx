import { useMemo, useState } from "react";

import "./Sidebar.css";

export default function Sidebar({
  orders,
  onSelectFiles,
  onDeleteOrder,
  onUpdateOrder,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingOrderId, setEditingOrderId] =
    useState(null);
  const [editOrderNumber, setEditOrderNumber] =
    useState("");
  const [editCustomer, setEditCustomer] =
    useState("");
  const [editDestination, setEditDestination] =
    useState("");

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

    event.dataTransfer.setData(
      "sourceTruckId",
      ""
    );

    event.dataTransfer.setData(
      "sourceRouteId",
      ""
    );
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
    const normalizedOrderNumber =
      editOrderNumber.trim();

    const normalizedCustomer =
      editCustomer.trim();

    const normalizedDestination =
      editDestination.trim();

    if (
      !normalizedOrderNumber ||
      !normalizedCustomer
    ) {
      window.alert(
        "יש להזין מספר הזמנה ושם לקוח"
      );

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

  const handleOpenPdf = async (order) => {
  try {
    if (!order.pdf) {
      window.alert("לא נמצא קובץ PDF להזמנה");
      return;
    }

    // إذا كان رابط Supabase افتحه بالمتصفح
    if (
      typeof order.pdf === "string" &&
      order.pdf.startsWith("http")
    ) {
      window.open(order.pdf, "_blank");
      return;
    }

    // إذا كان ملف محلي افتحه بالإلكترون
    if (!window.electronAPI?.openPdf) {
      window.alert("לא ניתן לפתוח את קובץ ה-PDF");
      return;
    }

    const result = await window.electronAPI.openPdf(order.pdf);

    if (result?.success === false) {
      window.alert(result.error || "לא ניתן לפתוח את קובץ ה-PDF");
    }
  } catch (error) {
    console.error(error);
    window.alert("לא ניתן לפתוח את קובץ ה-PDF");
  }
};

  const handleCardEnter = (
    event,
    isEditing
  ) => {
    if (isEditing) {
      return;
    }

    event.currentTarget.style.transform =
      "translateY(-2px)";

    event.currentTarget.style.boxShadow =
      "0 14px 30px rgba(15, 55, 95, 0.14)";

    event.currentTarget.style.borderColor =
      "#c8d8ea";
  };

  const handleCardLeave = (event) => {
    event.currentTarget.style.transform =
      "translateY(0)";

    event.currentTarget.style.boxShadow =
      "0 7px 20px rgba(15, 55, 95, 0.08)";

    event.currentTarget.style.borderColor =
      "#d9e4f0";
  };

  return (
    <aside
      style={{
        width: 300,
        minWidth: 300,
        height: "100%",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f7f9fc 100%)",
        borderLeft: "1px solid #dbe4ef",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "-8px 0 26px rgba(16, 24, 40, 0.05)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "16px 15px 14px",
          borderBottom: "1px solid #e1e8f1",
          background: "#ffffff",
        }}
      >
        <button
          type="button"
          onClick={onSelectFiles}
          style={{
            width: "100%",
            minHeight: 52,
            padding: "12px 14px",
            border: "none",
            borderRadius: 15,
            background:
              "linear-gradient(135deg, #2368c9 0%, #0e3f83 100%)",
            color: "#ffffff",
            fontWeight: 900,
            fontSize: 16,
            boxShadow:
              "0 9px 20px rgba(17, 79, 160, 0.24)",
            cursor: "pointer",
            transition:
              "transform 0.18s ease, box-shadow 0.18s ease",
          }}
          onMouseEnter={(event) => {
            event.currentTarget.style.transform =
              "translateY(-2px)";

            event.currentTarget.style.boxShadow =
              "0 13px 25px rgba(17, 79, 160, 0.30)";
          }}
          onMouseLeave={(event) => {
            event.currentTarget.style.transform =
              "translateY(0)";

            event.currentTarget.style.boxShadow =
              "0 9px 20px rgba(17, 79, 160, 0.24)";
          }}
        >
          ＋ הוסף הזמנות PDF
        </button>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "#142d4f",
              fontSize: 22,
              fontWeight: 950,
              letterSpacing: "-0.2px",
            }}
          >
            הזמנות חדשות
          </h2>

          <div
            style={{
              minWidth: 40,
              height: 40,
              padding: "0 10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 12,
              background:
                "linear-gradient(145deg, #2b72cf, #1354a3)",
              color: "#ffffff",
              fontSize: 17,
              fontWeight: 950,
              boxShadow:
                "0 5px 12px rgba(25, 92, 174, 0.22)",
            }}
          >
            {orders.length}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 15,
          }}
        >
          <span
            style={{
              position: "absolute",
              left: 13,
              top: "50%",
              transform: "translateY(-50%)",
              color: "#8190a5",
              fontSize: 17,
              pointerEvents: "none",
            }}
          >
            🔍
          </span>

          <input
            type="search"
            value={searchTerm}
            onChange={(event) =>
              setSearchTerm(
                event.target.value
              )
            }
            placeholder="חיפוש הזמנה..."
            style={{
              width: "100%",
              height: 48,
              padding: "10px 42px 10px 13px",
              border: "1px solid #ccd8e7",
              borderRadius: 14,
              fontSize: 14,
              fontWeight: 600,
              boxSizing: "border-box",
              color: "#2d405d",
              background: "#ffffff",
              outline: "none",
              boxShadow:
                "0 3px 10px rgba(17, 55, 95, 0.04)",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 10,
            color: "#75849a",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          מוצגות {filteredOrders.length} מתוך{" "}
          {orders.length}
        </div>
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "14px",
        }}
      >
        {orders.length === 0 && (
          <div
            style={{
              minHeight: 190,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#8492a6",
              border: "1.5px dashed #bdcada",
              borderRadius: 17,
              background:
                "rgba(255, 255, 255, 0.72)",
              padding: 20,
            }}
          >
            <div
              style={{
                width: 54,
                height: 54,
                marginBottom: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                background: "#edf4fc",
                color: "#245c9f",
                fontSize: 26,
              }}
            >
              ▤
            </div>

            <div
              style={{
                color: "#53667f",
                fontSize: 14,
                fontWeight: 850,
              }}
            >
              אין הזמנות חדשות
            </div>
          </div>
        )}

        {orders.length > 0 &&
          filteredOrders.length === 0 && (
            <div
              style={{
                marginTop: 35,
                textAlign: "center",
                color: "#8592a4",
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              לא נמצאו הזמנות
            </div>
          )}

        {filteredOrders.map((order) => {
          const isEditing =
            editingOrderId === order.id;

          return (
            <div
              key={order.id}
              draggable={!isEditing}
              onDragStart={(event) =>
                handleDragStart(
                  event,
                  order.id
                )
              }
              style={{
                marginBottom: 14,
                padding: isEditing
                  ? 15
                  : "16px 15px",
                background:
                  "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                border: "1px solid #d9e4f0",
                borderRadius: 18,
                boxShadow:
                  "0 7px 20px rgba(15, 55, 95, 0.08)",
                cursor: isEditing
                  ? "default"
                  : "grab",
                transition:
                  "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              }}
              onMouseEnter={(event) =>
                handleCardEnter(
                  event,
                  isEditing
                )
              }
              onMouseLeave={handleCardLeave}
            >
              {isEditing ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 5,
                      color: "#66788f",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    מספר הזמנה
                  </label>

                  <input
                    type="text"
                    value={editOrderNumber}
                    onChange={(event) =>
                      setEditOrderNumber(
                        event.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "8px 11px",
                      border: "1px solid #ced9e6",
                      borderRadius: 11,
                      boxSizing: "border-box",
                      fontSize: 14,
                      fontWeight: 700,
                      background: "#ffffff",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 11,
                      marginBottom: 5,
                      color: "#66788f",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    שם לקוח
                  </label>

                  <input
                    type="text"
                    value={editCustomer}
                    onChange={(event) =>
                      setEditCustomer(
                        event.target.value
                      )
                    }
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "8px 11px",
                      border: "1px solid #ced9e6",
                      borderRadius: 11,
                      boxSizing: "border-box",
                      fontSize: 14,
                      fontWeight: 700,
                      background: "#ffffff",
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 11,
                      marginBottom: 5,
                      color: "#66788f",
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    יעד
                  </label>

                  <input
                    type="text"
                    value={editDestination}
                    onChange={(event) =>
                      setEditDestination(
                        event.target.value
                      )
                    }
                    placeholder="לאן ההזמנה יוצאת?"
                    style={{
                      width: "100%",
                      height: 42,
                      padding: "8px 11px",
                      border: "1px solid #ced9e6",
                      borderRadius: 11,
                      boxSizing: "border-box",
                      fontSize: 14,
                      fontWeight: 700,
                      background: "#ffffff",
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: 9,
                      marginTop: 13,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        saveEditing(order.id)
                      }
                      style={{
                        minHeight: 42,
                        padding: "8px 10px",
                        border: "none",
                        borderRadius: 11,
                        background:
                          "linear-gradient(180deg, #2c77d1, #1453a2)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow:
                          "0 5px 12px rgba(23, 84, 165, 0.20)",
                      }}
                    >
                      שמור
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{
                        minHeight: 42,
                        padding: "8px 10px",
                        border: "none",
                        borderRadius: 11,
                        background:
                          "linear-gradient(180deg, #8593a5, #667386)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow:
                          "0 5px 12px rgba(80, 95, 115, 0.16)",
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
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent:
                        "space-between",
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
                          color: "#154f9b",
                          fontSize: 22,
                          lineHeight: 1.15,
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
                          marginTop: 8,
                          color: "#243752",
                          fontSize: 15,
                          lineHeight: 1.4,
                          fontWeight: 850,
                          overflow: "hidden",
                          textOverflow:
                            "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {order.customer}
                      </div>
                    </div>

                    <div
                      style={{
                        width: 48,
                        height: 48,
                        minWidth: 48,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        borderRadius: 14,
                        background:
                          "linear-gradient(145deg, #edf5ff, #deecfb)",
                        color: "#1d5ca5",
                        fontSize: 22,
                        boxShadow:
                          "inset 0 0 0 1px rgba(30, 91, 162, 0.06)",
                      }}
                    >
                      ▤
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "flex-start",
                    }}
                  >
                    <span
                      title={
                        order.destination ||
                        "לא הוגדר יעד"
                      }
                      style={{
                        maxWidth: "100%",
                        display: "inline-block",
                        padding: "7px 11px",
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace: "nowrap",
                        borderRadius: 999,
                        background:
                          order.destination
                            ? "#edf4ff"
                            : "#f0f3f7",
                        color:
                          order.destination
                            ? "#3d6797"
                            : "#7b8798",
                        fontSize: 12,
                        fontWeight: 850,
                      }}
                    >
                      📍{" "}
                      {order.destination ||
                        "לא הוגדר יעד"}
                    </span>
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
                    >
                      📄 פתח
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(order)
                      }
                      style={{
                        minHeight: 46,
                        padding: "8px 7px",
                        border: "1px solid #f1d79e",
                        borderRadius: 13,
                        background:
                          "linear-gradient(180deg, #fffaf0, #fff3d9)",
                        color: "#966000",
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow:
                          "0 4px 10px rgba(160, 103, 0, 0.08)",
                        transition:
                          "transform 0.18s ease, box-shadow 0.18s ease",
                      }}
                    >
                      ✏️ ערוך
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(order)
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
                    >
                      🗑 מחק
                    </button>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
}