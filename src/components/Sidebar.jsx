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
    <aside
      style={{
        width: 270,
        minWidth: 270,
        height: "100%",
        background: "var(--surface)",
        borderLeft:
          "1px solid var(--border)",
        display: "flex",
        flexDirection: "column",
        boxShadow:
          "-4px 0 18px rgba(16, 24, 40, 0.04)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "12px",
          borderBottom:
            "1px solid var(--border)",
          background: "var(--surface)",
        }}
      >
        <button
          type="button"
          onClick={onSelectFiles}
          style={{
            width: "100%",
            minHeight: 42,
            padding: "9px 12px",
            borderRadius:
              "var(--radius-small)",
            background:
              "linear-gradient(135deg, var(--primary), var(--primary-dark))",
            color: "#ffffff",
            fontWeight: 700,
            fontSize: 14,
            boxShadow:
              "0 5px 14px rgba(18, 97, 201, 0.2)",
          }}
        >
          ＋ הוסף הזמנות PDF
        </button>

        <div
          style={{
            marginTop: 13,
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 8,
          }}
        >
          <h2
            style={{
              margin: 0,
              color: "var(--text-main)",
              fontSize: 17,
              fontWeight: 800,
            }}
          >
            הזמנות חדשות
          </h2>

          <div
            style={{
              minWidth: 28,
              height: 28,
              padding: "0 8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 8,
              background: "var(--primary)",
              color: "#ffffff",
              fontSize: 13,
              fontWeight: 800,
            }}
          >
            {orders.length}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            marginTop: 11,
          }}
        >
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
              height: 38,
              padding: "8px 11px",
              borderRadius:
                "var(--radius-small)",
              fontSize: 13,
              boxSizing: "border-box",
              background:
                "var(--surface-soft)",
            }}
          />
        </div>

        <div
          style={{
            marginTop: 7,
            color:
              "var(--text-secondary)",
            fontSize: 11,
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
          padding: "10px",
        }}
      >
        {orders.length === 0 && (
          <div
            style={{
              minHeight: 160,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "var(--text-muted)",
              border:
                "1px dashed var(--border-dark)",
              borderRadius:
                "var(--radius-medium)",
              background:
                "var(--surface-soft)",
              padding: 18,
            }}
          >
            <div
              style={{
                fontSize: 28,
                marginBottom: 7,
              }}
            >
              ▤
            </div>

            <div
              style={{
                color:
                  "var(--text-secondary)",
                fontSize: 13,
                fontWeight: 700,
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
                marginTop: 30,
                textAlign: "center",
                color: "var(--text-muted)",
                fontSize: 13,
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
                marginBottom: 8,
                padding: isEditing
                  ? 11
                  : "10px 11px",
                background:
                  "var(--surface)",
                border:
                  "1px solid var(--border)",
                borderRadius:
                  "var(--radius-medium)",
                boxShadow:
                  "var(--shadow-small)",
                cursor: isEditing
                  ? "default"
                  : "grab",
                transition:
                  "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
              }}
              onMouseEnter={(event) => {
                if (!isEditing) {
                  event.currentTarget.style.transform =
                    "translateY(-1px)";

                  event.currentTarget.style.boxShadow =
                    "var(--shadow-medium)";

                  event.currentTarget.style.borderColor =
                    "var(--border-dark)";
                }
              }}
              onMouseLeave={(event) => {
                event.currentTarget.style.transform =
                  "translateY(0)";

                event.currentTarget.style.boxShadow =
                  "var(--shadow-small)";

                event.currentTarget.style.borderColor =
                  "var(--border)";
              }}
            >
              {isEditing ? (
                <>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 4,
                      color:
                        "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 700,
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
                      height: 35,
                      padding: "7px 9px",
                      borderRadius: 7,
                      boxSizing:
                        "border-box",
                      fontSize: 13,
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 8,
                      marginBottom: 4,
                      color:
                        "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 700,
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
                      height: 35,
                      padding: "7px 9px",
                      borderRadius: 7,
                      boxSizing:
                        "border-box",
                      fontSize: 13,
                    }}
                  />

                  <label
                    style={{
                      display: "block",
                      marginTop: 8,
                      marginBottom: 4,
                      color:
                        "var(--text-secondary)",
                      fontSize: 11,
                      fontWeight: 700,
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
                      height: 35,
                      padding: "7px 9px",
                      borderRadius: 7,
                      boxSizing:
                        "border-box",
                      fontSize: 13,
                    }}
                  />

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1fr 1fr",
                      gap: 7,
                      marginTop: 9,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        saveEditing(order.id)
                      }
                      style={{
                        minHeight: 34,
                        padding: "7px 8px",
                        borderRadius: 7,
                        background:
                          "var(--primary)",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      שמור
                    </button>

                    <button
                      type="button"
                      onClick={cancelEditing}
                      style={{
                        minHeight: 34,
                        padding: "7px 8px",
                        borderRadius: 7,
                        background: "#687386",
                        color: "#ffffff",
                        fontSize: 12,
                        fontWeight: 700,
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
                      alignItems:
                        "flex-start",
                      justifyContent:
                        "space-between",
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
                          fontSize: 16,
                          lineHeight: 1.2,
                          fontWeight: 800,
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
                          color:
                            "var(--text-main)",
                          fontSize: 13,
                          lineHeight: 1.35,
                          fontWeight: 600,
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
                        width: 31,
                        height: 31,
                        minWidth: 31,
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          "center",
                        borderRadius: 8,
                        background:
                          "var(--primary-light)",
                        color:
                          "var(--primary)",
                        fontSize: 17,
                      }}
                    >
                      ▤
                    </div>
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        "space-between",
                      gap: 7,
                    }}
                  >
                    <span
                      title={
                        order.destination ||
                        "לא הוגדר יעד"
                      }
                      style={{
                        maxWidth: 145,
                        display:
                          "inline-block",
                        padding: "4px 8px",
                        overflow: "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace: "nowrap",
                        borderRadius: 999,
                        background:
                          order.destination
                            ? "var(--primary-light)"
                            : "var(--surface-soft)",
                        color:
                          order.destination
                            ? "var(--primary-dark)"
                            : "var(--text-muted)",
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {order.destination ||
                        "לא הוגדר יעד"}
                    </span>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "1.25fr 1fr 1fr",
                      gap: 6,
                      marginTop: 9,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        handleOpenPdf(order)
                      }
                      style={{
                        minHeight: 31,
                        padding: "6px 7px",
                        borderRadius: 7,
                        background:
                          "var(--success-light)",
                        color:
                          "var(--success)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      פתח
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        startEditing(order)
                      }
                      style={{
                        minHeight: 31,
                        padding: "6px 7px",
                        borderRadius: 7,
                        background: "#fff5dc",
                        color: "#9a6300",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      ערוך
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(order)
                      }
                      style={{
                        minHeight: 31,
                        padding: "6px 7px",
                        borderRadius: 7,
                        background:
                          "var(--danger-light)",
                        color:
                          "var(--danger)",
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      מחק
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