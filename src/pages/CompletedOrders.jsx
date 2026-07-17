import { useMemo, useState } from "react";

export default function CompletedOrders({
  completedOrders,
  onBack,
  onRestoreOrder,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTruck, setSelectedTruck] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return dateValue;
    }

    return new Intl.DateTimeFormat("he-IL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const formatPlannedDate = (dateValue) => {
    if (!dateValue) {
      return "-";
    }

    const parts = String(dateValue).split("-");

    if (parts.length !== 3) {
      return dateValue;
    }

    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  const truckNames = useMemo(() => {
    const names = completedOrders
      .map((order) => order.truckName)
      .filter(Boolean);

    return [...new Set(names)].sort((first, second) =>
      first.localeCompare(second, "he")
    );
  }, [completedOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = searchTerm
      .trim()
      .toLowerCase();

    return completedOrders.filter((order) => {
      const orderNumber = String(
        order.orderNumber || ""
      ).toLowerCase();

      const customer = String(
        order.customer || ""
      ).toLowerCase();

      const destination = String(
        order.destination || ""
      ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        orderNumber.includes(normalizedSearch) ||
        customer.includes(normalizedSearch) ||
        destination.includes(normalizedSearch);

      const matchesTruck =
        selectedTruck === "all" ||
        order.truckName === selectedTruck;

      const matchesDate =
        !selectedDate ||
        order.plannedDate === selectedDate;

      return matchesSearch && matchesTruck && matchesDate;
    });
  }, [
    completedOrders,
    searchTerm,
    selectedTruck,
    selectedDate,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTruck("all");
    setSelectedDate("");
  };

  const handleRestoreOrder = (order) => {
    const confirmed = window.confirm(
      `להחזיר את הזמנה ${order.orderNumber} לסידור?`
    );

    if (!confirmed) {
      return;
    }

    onRestoreOrder(order.id);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedTruck !== "all" ||
    selectedDate !== "";

  return (
    <div
      style={{
        direction: "rtl",
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background: "var(--background)",
        color: "var(--text-main)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          boxShadow: "var(--shadow-small)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1500,
            minHeight: 74,
            margin: "0 auto",
            padding: "12px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 14,
            boxSizing: "border-box",
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
                width: 44,
                height: 44,
                minWidth: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 12,
                background: "var(--primary-light)",
                color: "var(--primary)",
                fontSize: 22,
              }}
            >
              ✓
            </div>

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 22,
                  lineHeight: 1.2,
                  fontWeight: 900,
                }}
              >
                הזמנות שהושלמו
              </h1>

              <div
                style={{
                  marginTop: 4,
                  color: "var(--text-muted)",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                מוצגות {filteredOrders.length} מתוך{" "}
                {completedOrders.length} הזמנות
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              minHeight: 40,
              padding: "8px 18px",
              borderRadius: "var(--radius-small)",
              background: "var(--primary)",
              color: "#ffffff",
              fontSize: 14,
              fontWeight: 800,
              boxShadow:
                "0 4px 10px rgba(25, 118, 210, 0.18)",
            }}
          >
            חזרה לסידור
          </button>
        </div>
      </header>

      <main
        style={{
          width: "100%",
          maxWidth: 1500,
          margin: "0 auto",
          padding: 18,
          paddingBottom: 40,
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px, 2fr) minmax(170px, 1fr) minmax(170px, 1fr) auto",
            gap: 12,
            alignItems: "end",
            padding: 14,
            marginBottom: 16,
            background: "var(--surface)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-medium)",
            boxShadow: "var(--shadow-small)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              חיפוש הזמנה
            </label>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="מספר הזמנה, לקוח או יעד..."
              style={{
                width: "100%",
                minHeight: 42,
                padding: "9px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-small)",
                background: "var(--surface-soft)",
                color: "var(--text-main)",
                fontFamily: "inherit",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              משאית
            </label>

            <select
              value={selectedTruck}
              onChange={(event) =>
                setSelectedTruck(event.target.value)
              }
              style={{
                width: "100%",
                minHeight: 42,
                padding: "9px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-small)",
                background: "var(--surface-soft)",
                color: "var(--text-main)",
                fontFamily: "inherit",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            >
              <option value="all">כל המשאיות</option>

              {truckNames.map((truckName) => (
                <option key={truckName} value={truckName}>
                  {truckName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 6,
                color: "var(--text-muted)",
                fontSize: 12,
                fontWeight: 800,
              }}
            >
              תאריך סידור
            </label>

            <input
              type="date"
              value={selectedDate}
              onChange={(event) =>
                setSelectedDate(event.target.value)
              }
              style={{
                width: "100%",
                minHeight: 42,
                padding: "8px 12px",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-small)",
                background: "var(--surface-soft)",
                color: "var(--text-main)",
                fontFamily: "inherit",
                fontSize: 14,
                boxSizing: "border-box",
                outline: "none",
              }}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            style={{
              minHeight: 42,
              padding: "9px 16px",
              borderRadius: "var(--radius-small)",
              background: hasActiveFilters
                ? "var(--danger)"
                : "var(--border)",
              color: hasActiveFilters
                ? "#ffffff"
                : "var(--text-muted)",
              cursor: hasActiveFilters
                ? "pointer"
                : "not-allowed",
              fontSize: 13,
              fontWeight: 800,
              whiteSpace: "nowrap",
              opacity: hasActiveFilters ? 1 : 0.75,
            }}
          >
            נקה סינון
          </button>
        </section>

        {completedOrders.length === 0 ? (
          <div
            style={{
              minHeight: 260,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-large)",
              boxShadow: "var(--shadow-small)",
            }}
          >
            <div
              style={{
                width: 58,
                height: 58,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 16,
                background: "var(--surface-soft)",
                fontSize: 28,
              }}
            >
              📦
            </div>

            <div
              style={{
                marginTop: 14,
                fontSize: 18,
                fontWeight: 900,
              }}
            >
              עדיין אין הזמנות שהושלמו
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              minHeight: 230,
              padding: 40,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-large)",
              boxShadow: "var(--shadow-small)",
            }}
          >
            <div style={{ fontSize: 30 }}>🔍</div>

            <div
              style={{
                marginTop: 12,
                fontSize: 17,
                fontWeight: 900,
              }}
            >
              לא נמצאו הזמנות
            </div>
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(310px, 1fr))",
              gap: 14,
            }}
          >
            {filteredOrders.map((order) => (
              <article
                key={`${order.id}-${order.completedAt}`}
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  background: "var(--surface)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-medium)",
                  boxShadow: "var(--shadow-small)",
                }}
              >
                <div
                  style={{
                    height: 5,
                    background: "var(--success)",
                  }}
                />

                <div style={{ padding: 15 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: "var(--primary)",
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        הזמנה
                      </div>

                      <div
                        style={{
                          marginTop: 2,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 19,
                          fontWeight: 900,
                        }}
                      >
                        {order.orderNumber || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "5px 9px",
                        borderRadius: 999,
                        background: "rgba(24, 134, 75, 0.1)",
                        color: "var(--success)",
                        fontSize: 11,
                        fontWeight: 900,
                      }}
                    >
                      הושלם
                    </div>
                  </div>

                  <div
                    title={order.customer}
                    style={{
                      marginTop: 12,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 16,
                      fontWeight: 800,
                    }}
                  >
                    {order.customer || "לקוח ללא שם"}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      minHeight: 38,
                      padding: "8px 10px",
                      display: "flex",
                      alignItems: "center",
                      gap: 7,
                      borderRadius: "var(--radius-small)",
                      background: "var(--surface-soft)",
                      color: order.destination
                        ? "var(--text-main)"
                        : "var(--text-muted)",
                      fontSize: 13,
                      fontWeight: 700,
                    }}
                  >
                    <span>📍</span>

                    <span
                      title={order.destination}
                      style={{
                        minWidth: 0,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {order.destination || "לא הוגדר יעד"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 9px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-small)",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        משאית
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {order.truckName || "-"}
                      </div>
                    </div>

                   

                    <div
                      style={{
                        padding: "8px 9px",
                        border: "1px solid var(--border)",
                        borderRadius: "var(--radius-small)",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-muted)",
                          fontSize: 10,
                          fontWeight: 800,
                        }}
                      >
                        תאריך סידור
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        {formatPlannedDate(order.plannedDate)}
                      </div>
                    </div>

                   
                  </div>

                  <div
                    style={{
                      marginTop: 13,
                      display: "grid",
                      gridTemplateColumns: order.pdf
                        ? "1fr 1fr"
                        : "1fr",
                      gap: 8,
                    }}
                  >
                    {order.pdf && (
                      <button
                        type="button"
                        onClick={() => window.open(order.pdf)}
                        style={{
                          minHeight: 40,
                          padding: "8px 12px",
                          borderRadius: "var(--radius-small)",
                          background: "var(--success)",
                          color: "#ffffff",
                          fontSize: 13,
                          fontWeight: 800,
                        }}
                      >
                        📄 פתח הזמנה
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRestoreOrder(order)}
                      style={{
                        minHeight: 40,
                        padding: "8px 12px",
                        borderRadius: "var(--radius-small)",
                        background: "var(--primary)",
                        color: "#ffffff",
                        fontSize: 13,
                        fontWeight: 800,
                      }}
                    >
                      ↩ החזר לסידור
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}