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
        minHeight: "100vh",
        background: "#f4f6f8",
        padding: 24,
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                color: "#1f2937",
              }}
            >
              ✅ הזמנות שהושלמו
            </h1>

            <div
              style={{
                marginTop: 6,
                color: "#6b7280",
              }}
            >
              מוצגות {filteredOrders.length} מתוך{" "}
              {completedOrders.length} הזמנות
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            style={{
              padding: "10px 18px",
              border: "none",
              borderRadius: 8,
              background: "#1976d2",
              color: "white",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 15,
              whiteSpace: "nowrap",
            }}
          >
            חזרה לסידור
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(240px, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto",
            gap: 12,
            alignItems: "end",
            background: "white",
            borderRadius: 14,
            padding: 18,
            marginBottom: 20,
            boxShadow: "0 2px 8px rgba(0,0,0,.08)",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                marginBottom: 7,
                color: "#444",
                fontWeight: "bold",
                fontSize: 14,
              }}
            >
              חיפוש
            </label>

            <input
              type="search"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(event.target.value)
              }
              placeholder="מספר, לקוח או יעד..."
              style={{
                width: "100%",
                padding: 11,
                border: "1px solid #d5d9dd",
                borderRadius: 8,
                outline: "none",
                fontFamily: "inherit",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 7,
                color: "#444",
                fontWeight: "bold",
                fontSize: 14,
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
                padding: 11,
                border: "1px solid #d5d9dd",
                borderRadius: 8,
                outline: "none",
                fontFamily: "inherit",
                fontSize: 14,
                background: "white",
                boxSizing: "border-box",
              }}
            >
              <option value="all">כל המשאיות</option>

              {truckNames.map((truckName) => (
                <option
                  key={truckName}
                  value={truckName}
                >
                  {truckName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              style={{
                display: "block",
                marginBottom: 7,
                color: "#444",
                fontWeight: "bold",
                fontSize: 14,
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
                padding: 10,
                border: "1px solid #d5d9dd",
                borderRadius: 8,
                outline: "none",
                fontFamily: "inherit",
                fontSize: 14,
                boxSizing: "border-box",
              }}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            style={{
              padding: "11px 18px",
              border: "none",
              borderRadius: 8,
              background: hasActiveFilters
                ? "#e53935"
                : "#d6d6d6",
              color: "white",
              cursor: hasActiveFilters
                ? "pointer"
                : "not-allowed",
              fontWeight: "bold",
              whiteSpace: "nowrap",
            }}
          >
            נקה סינון
          </button>
        </div>

        {completedOrders.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 50,
              textAlign: "center",
              color: "#777",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}
          >
            עדיין אין הזמנות שהושלמו
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              background: "white",
              borderRadius: 14,
              padding: 50,
              textAlign: "center",
              color: "#777",
              boxShadow: "0 2px 8px rgba(0,0,0,.08)",
            }}
          >
            לא נמצאו הזמנות לפי הסינון
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16,
            }}
          >
            {filteredOrders.map((order) => (
              <div
                key={`${order.id}-${order.completedAt}`}
                style={{
                  background: "white",
                  borderRadius: 14,
                  padding: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,.08)",
                  borderTop: "4px solid #43a047",
                }}
              >
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#1976d2",
                  }}
                >
                  הזמנה {order.orderNumber}
                </div>

                <div
                  style={{
                    marginTop: 8,
                    fontSize: 17,
                    fontWeight: "bold",
                    color: "#333",
                  }}
                >
                  {order.customer}
                </div>

                <div
                  style={{
                    marginTop: 9,
                    color: order.destination
                      ? "#1f2937"
                      : "#999",
                    fontWeight: order.destination
                      ? "bold"
                      : "normal",
                  }}
                >
                  📍 יעד:{" "}
                  {order.destination || "לא הוגדר יעד"}
                </div>

                <div
                  style={{
                    marginTop: 16,
                    color: "#555",
                    lineHeight: 1.9,
                  }}
                >
                  <div>
                    🚚 משאית: {order.truckName || "-"}
                  </div>

                  <div>
                    📍 מסלול: {order.routeName || "-"}
                  </div>

                  <div>
                    📅 תאריך סידור:{" "}
                    {formatPlannedDate(order.plannedDate)}
                  </div>

                  <div>
                    ✅ הושלם:{" "}
                    {formatDate(order.completedAt)}
                  </div>
                </div>

                {order.pdf && (
                  <button
                    type="button"
                    onClick={() => window.open(order.pdf)}
                    style={{
                      marginTop: 16,
                      width: "100%",
                      padding: 10,
                      border: "none",
                      borderRadius: 8,
                      background: "#43a047",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "bold",
                    }}
                  >
                    📄 פתח הזמנה
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleRestoreOrder(order)}
                  style={{
                    marginTop: 10,
                    width: "100%",
                    padding: 10,
                    border: "none",
                    borderRadius: 8,
                    background: "#1976d2",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  ↩️ החזר לסידור
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}