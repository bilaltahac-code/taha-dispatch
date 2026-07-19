import { useMemo, useState } from "react";

const CONTROL_STYLE = {
  width: "100%",
  minHeight: 44,
  padding: "9px 12px",
  border: "1px solid var(--border, #dbe3ee)",
  borderRadius: 12,
  background: "var(--surface-soft, #f8fafc)",
  color: "var(--text-main, #0f172a)",
  fontFamily: "inherit",
  fontSize: 14,
  fontWeight: 700,
  boxSizing: "border-box",
  outline: "none",
  transition: "border-color 160ms ease, box-shadow 160ms ease, background 160ms ease",
};

const LABEL_STYLE = {
  display: "block",
  marginBottom: 7,
  color: "var(--text-muted, #64748b)",
  fontSize: 12,
  fontWeight: 900,
};

const focusControl = (event) => {
  event.currentTarget.style.borderColor = "var(--primary, #2563eb)";
  event.currentTarget.style.background = "var(--surface, #ffffff)";
  event.currentTarget.style.boxShadow = "0 0 0 3px rgba(37, 99, 235, 0.12)";
};

const blurControl = (event) => {
  event.currentTarget.style.borderColor = "var(--border, #dbe3ee)";
  event.currentTarget.style.background = "var(--surface-soft, #f8fafc)";
  event.currentTarget.style.boxShadow = "none";
};

const liftButton = (event) => {
  event.currentTarget.style.transform = "translateY(-1px)";
  event.currentTarget.style.filter = "brightness(1.05)";
  event.currentTarget.style.boxShadow = "0 8px 18px rgba(15, 23, 42, 0.14)";
};

const resetButton = (event) => {
  event.currentTarget.style.transform = "translateY(0)";
  event.currentTarget.style.filter = "none";
  event.currentTarget.style.boxShadow = event.currentTarget.dataset.baseShadow || "none";
};

export default function CompletedOrders({
  completedOrders = [],
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
      return String(dateValue);
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
      return String(dateValue);
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
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return completedOrders.filter((order) => {
      const orderNumber = String(order.orderNumber || "").toLowerCase();
      const customer = String(order.customer || "").toLowerCase();
      const destination = String(order.destination || "").toLowerCase();
      const truckName = String(order.truckName || "").toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        orderNumber.includes(normalizedSearch) ||
        customer.includes(normalizedSearch) ||
        destination.includes(normalizedSearch) ||
        truckName.includes(normalizedSearch);

      const matchesTruck =
        selectedTruck === "all" || order.truckName === selectedTruck;

      const matchesDate =
        !selectedDate || order.plannedDate === selectedDate;

      return matchesSearch && matchesTruck && matchesDate;
    });
  }, [completedOrders, searchTerm, selectedTruck, selectedDate]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedTruck("all");
    setSelectedDate("");
  };

  const handleRestoreOrder = (order) => {
    const confirmed = window.confirm(
      `להחזיר את הזמנה ${order.orderNumber || ""} לסידור?`
    );

    if (!confirmed || typeof onRestoreOrder !== "function") {
      return;
    }

    onRestoreOrder(order.id);
  };

  const handleOpenPdf = async (pdfPath) => {
    if (!pdfPath) {
      return;
    }

    try {
      if (window.electronAPI?.openPdf) {
        await window.electronAPI.openPdf(pdfPath);
        return;
      }

      if (window.electron?.openPdf) {
        await window.electron.openPdf(pdfPath);
        return;
      }

      if (window.api?.openPdf) {
        await window.api.openPdf(pdfPath);
        return;
      }

      window.open(pdfPath, "_blank", "noopener,noreferrer");
    } catch (error) {
      console.error("Failed to open PDF:", error);
      window.alert("לא ניתן לפתוח את קובץ ההזמנה");
    }
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
        height: "100vh",
        overflowY: "auto",
        overflowX: "hidden",
        background:
          "linear-gradient(180deg, var(--background, #f1f5f9) 0%, #eef3f9 100%)",
        color: "var(--text-main, #0f172a)",
      }}
    >
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: "1px solid rgba(219, 227, 238, 0.9)",
          background: "rgba(255,255,255,0.92)",
          boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
          backdropFilter: "blur(14px)",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 1500,
            minHeight: 82,
            margin: "0 auto",
            padding: "13px 20px",
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
              gap: 13,
            }}
          >
            <div
              style={{
                width: 50,
                height: 50,
                minWidth: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 15,
                background:
                  "linear-gradient(135deg, var(--success, #15803d), #22a55b)",
                boxShadow: "0 8px 18px rgba(21, 128, 61, 0.2)",
                color: "#ffffff",
                fontSize: 24,
                fontWeight: 900,
              }}
            >
              ✓
            </div>

            <div style={{ minWidth: 0 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 24,
                  lineHeight: 1.2,
                  fontWeight: 950,
                  letterSpacing: "-0.3px",
                }}
              >
                הזמנות שהושלמו
              </h1>

              <div
                style={{
                  marginTop: 5,
                  color: "var(--text-muted, #64748b)",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                מוצגות {filteredOrders.length} מתוך {completedOrders.length} הזמנות
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onBack}
            onMouseEnter={liftButton}
            onMouseLeave={resetButton}
            data-base-shadow="0 7px 16px rgba(37, 99, 235, 0.18)"
            style={{
              minHeight: 43,
              padding: "9px 17px",
              border: "1px solid transparent",
              borderRadius: 12,
              background:
                "linear-gradient(135deg, var(--primary, #2563eb), var(--primary-dark, #1e40af))",
              color: "#ffffff",
              fontFamily: "inherit",
              fontSize: 14,
              fontWeight: 900,
              cursor: "pointer",
              boxShadow: "0 7px 16px rgba(37, 99, 235, 0.18)",
              transition:
                "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
            }}
          >
            → חזרה לסידור
          </button>
        </div>
      </header>

      <main
        style={{
          width: "100%",
          maxWidth: 1500,
          margin: "0 auto",
          padding: "20px 18px 44px",
          boxSizing: "border-box",
        }}
      >
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(260px, 2fr) minmax(180px, 1fr) minmax(180px, 1fr) auto",
            gap: 12,
            alignItems: "end",
            padding: 16,
            marginBottom: 18,
            background: "var(--surface, #ffffff)",
            border: "1px solid var(--border, #dbe3ee)",
            borderRadius: 18,
            boxShadow: "0 10px 26px rgba(15, 23, 42, 0.07)",
          }}
        >
          <div>
            <label style={LABEL_STYLE}>חיפוש הזמנה</label>
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onFocus={focusControl}
              onBlur={blurControl}
              placeholder="מספר הזמנה, לקוח, יעד או משאית..."
              style={CONTROL_STYLE}
            />
          </div>

          <div>
            <label style={LABEL_STYLE}>משאית</label>
            <select
              value={selectedTruck}
              onChange={(event) => setSelectedTruck(event.target.value)}
              onFocus={focusControl}
              onBlur={blurControl}
              style={CONTROL_STYLE}
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
            <label style={LABEL_STYLE}>תאריך סידור</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(event) => setSelectedDate(event.target.value)}
              onFocus={focusControl}
              onBlur={blurControl}
              style={CONTROL_STYLE}
            />
          </div>

          <button
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
            onMouseEnter={(event) => {
              if (hasActiveFilters) {
                liftButton(event);
              }
            }}
            onMouseLeave={(event) => {
              if (hasActiveFilters) {
                resetButton(event);
              }
            }}
            style={{
              minHeight: 44,
              padding: "9px 16px",
              border: "1px solid transparent",
              borderRadius: 12,
              background: hasActiveFilters
                ? "var(--danger, #dc2626)"
                : "var(--border, #dbe3ee)",
              color: hasActiveFilters
                ? "#ffffff"
                : "var(--text-muted, #64748b)",
              fontFamily: "inherit",
              fontSize: 13,
              fontWeight: 900,
              whiteSpace: "nowrap",
              cursor: hasActiveFilters ? "pointer" : "not-allowed",
              opacity: hasActiveFilters ? 1 : 0.72,
              transition:
                "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
            }}
          >
            ✕ נקה סינון
          </button>
        </section>

        {completedOrders.length === 0 ? (
          <div
            style={{
              minHeight: 300,
              padding: 42,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--border, #dbe3ee)",
              borderRadius: 20,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
            }}
          >
            <div
              style={{
                width: 72,
                height: 72,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 20,
                background: "var(--surface-soft, #f8fafc)",
                fontSize: 34,
              }}
            >
              📦
            </div>
            <div style={{ marginTop: 16, fontSize: 20, fontWeight: 950 }}>
              עדיין אין הזמנות שהושלמו
            </div>
            <div
              style={{
                marginTop: 7,
                color: "var(--text-muted, #64748b)",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              הזמנות שסומנו כיצאו יופיעו כאן
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div
            style={{
              minHeight: 260,
              padding: 42,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              background: "var(--surface, #ffffff)",
              border: "1px solid var(--border, #dbe3ee)",
              borderRadius: 20,
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.07)",
            }}
          >
            <div style={{ fontSize: 36 }}>🔍</div>
            <div style={{ marginTop: 12, fontSize: 19, fontWeight: 950 }}>
              לא נמצאו הזמנות
            </div>
            <button
              type="button"
              onClick={clearFilters}
              onMouseEnter={liftButton}
              onMouseLeave={resetButton}
              style={{
                minHeight: 40,
                marginTop: 14,
                padding: "8px 15px",
                border: "1px solid var(--border, #dbe3ee)",
                borderRadius: 11,
                background: "var(--surface-soft, #f8fafc)",
                color: "var(--primary, #2563eb)",
                fontFamily: "inherit",
                fontSize: 13,
                fontWeight: 900,
                cursor: "pointer",
                transition:
                  "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
              }}
            >
              נקה סינון
            </button>
          </div>
        ) : (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {filteredOrders.map((order) => (
              <article
                key={`${order.id}-${order.completedAt || "completed"}`}
                onMouseEnter={(event) => {
                  event.currentTarget.style.transform = "translateY(-3px)";
                  event.currentTarget.style.borderColor = "rgba(37, 99, 235, 0.32)";
                  event.currentTarget.style.boxShadow =
                    "0 16px 34px rgba(15, 23, 42, 0.12)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.transform = "translateY(0)";
                  event.currentTarget.style.borderColor =
                    "var(--border, #dbe3ee)";
                  event.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(15, 23, 42, 0.07)";
                }}
                style={{
                  minWidth: 0,
                  overflow: "hidden",
                  background: "var(--surface, #ffffff)",
                  border: "1px solid var(--border, #dbe3ee)",
                  borderRadius: 18,
                  boxShadow: "0 8px 24px rgba(15, 23, 42, 0.07)",
                  transition:
                    "transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease",
                }}
              >
                <div
                  style={{
                    height: 5,
                    background:
                      "linear-gradient(90deg, var(--success, #15803d), #34c275)",
                  }}
                />

                <div style={{ padding: 16 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          color: "var(--primary, #2563eb)",
                          fontSize: 11,
                          fontWeight: 900,
                        }}
                      >
                        מספר הזמנה
                      </div>
                      <div
                        title={order.orderNumber}
                        style={{
                          marginTop: 3,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 20,
                          lineHeight: 1.2,
                          fontWeight: 950,
                        }}
                      >
                        {order.orderNumber || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        padding: "6px 10px",
                        display: "flex",
                        alignItems: "center",
                        gap: 5,
                        border: "1px solid rgba(21, 128, 61, 0.16)",
                        borderRadius: 999,
                        background: "rgba(21, 128, 61, 0.1)",
                        color: "var(--success, #15803d)",
                        fontSize: 11,
                        fontWeight: 950,
                      }}
                    >
                      <span>✓</span>
                      <span>הושלם</span>
                    </div>
                  </div>

                  <div
                    title={order.customer}
                    style={{
                      marginTop: 14,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      fontSize: 16,
                      fontWeight: 900,
                    }}
                  >
                    {order.customer || "לקוח ללא שם"}
                  </div>

                  <div
                    style={{
                      marginTop: 9,
                      minHeight: 40,
                      padding: "9px 11px",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      border: "1px solid rgba(219, 227, 238, 0.85)",
                      borderRadius: 12,
                      background: "var(--surface-soft, #f8fafc)",
                      color: order.destination
                        ? "var(--text-main, #0f172a)"
                        : "var(--text-muted, #64748b)",
                      fontSize: 13,
                      fontWeight: 750,
                      boxSizing: "border-box",
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
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: 9,
                    }}
                  >
                    <div
                      style={{
                        padding: "9px 10px",
                        border: "1px solid var(--border, #dbe3ee)",
                        borderRadius: 12,
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-muted, #64748b)",
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        משאית
                      </div>
                      <div
                        title={order.truckName}
                        style={{
                          marginTop: 4,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 13,
                          fontWeight: 900,
                        }}
                      >
                        {order.truckName || "-"}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "9px 10px",
                        border: "1px solid var(--border, #dbe3ee)",
                        borderRadius: 12,
                        background: "#ffffff",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-muted, #64748b)",
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        תאריך סידור
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900 }}>
                        {formatPlannedDate(order.plannedDate)}
                      </div>
                    </div>

                    <div
                      style={{
                        padding: "9px 10px",
                        border: "1px solid var(--border, #dbe3ee)",
                        borderRadius: 12,
                        background: "#ffffff",
                        gridColumn: order.routeName ? "auto" : "1 / -1",
                      }}
                    >
                      <div
                        style={{
                          color: "var(--text-muted, #64748b)",
                          fontSize: 10,
                          fontWeight: 900,
                        }}
                      >
                        הושלם בתאריך
                      </div>
                      <div style={{ marginTop: 4, fontSize: 13, fontWeight: 900 }}>
                        {formatDate(order.completedAt)}
                      </div>
                    </div>

                    {order.routeName && (
                      <div
                        style={{
                          padding: "9px 10px",
                          border: "1px solid var(--border, #dbe3ee)",
                          borderRadius: 12,
                          background: "#ffffff",
                        }}
                      >
                        <div
                          style={{
                            color: "var(--text-muted, #64748b)",
                            fontSize: 10,
                            fontWeight: 900,
                          }}
                        >
                          מסלול
                        </div>
                        <div
                          title={order.routeName}
                          style={{
                            marginTop: 4,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            fontSize: 13,
                            fontWeight: 900,
                          }}
                        >
                          {order.routeName}
                        </div>
                      </div>
                    )}
                  </div>

                  <div
                    style={{
                      marginTop: 14,
                      display: "grid",
                      gridTemplateColumns: order.pdf ? "1fr 1fr" : "1fr",
                      gap: 9,
                    }}
                  >
                    {order.pdf && (
                      <button
                        type="button"
                        onClick={() => handleOpenPdf(order.pdf)}
                        onMouseEnter={liftButton}
                        onMouseLeave={resetButton}
                        data-base-shadow="0 6px 14px rgba(21, 128, 61, 0.16)"
                        style={{
                          minHeight: 42,
                          padding: "8px 12px",
                          border: "1px solid transparent",
                          borderRadius: 12,
                          background:
                            "linear-gradient(135deg, var(--success, #15803d), #22a55b)",
                          color: "#ffffff",
                          fontFamily: "inherit",
                          fontSize: 13,
                          fontWeight: 900,
                          cursor: "pointer",
                          boxShadow: "0 6px 14px rgba(21, 128, 61, 0.16)",
                          transition:
                            "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
                        }}
                      >
                        📄 פתח הזמנה
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRestoreOrder(order)}
                      onMouseEnter={liftButton}
                      onMouseLeave={resetButton}
                      data-base-shadow="0 6px 14px rgba(37, 99, 235, 0.16)"
                      style={{
                        minHeight: 42,
                        padding: "8px 12px",
                        border: "1px solid transparent",
                        borderRadius: 12,
                        background:
                          "linear-gradient(135deg, var(--primary, #2563eb), var(--primary-dark, #1e40af))",
                        color: "#ffffff",
                        fontFamily: "inherit",
                        fontSize: 13,
                        fontWeight: 900,
                        cursor: "pointer",
                        boxShadow: "0 6px 14px rgba(37, 99, 235, 0.16)",
                        transition:
                          "transform 160ms ease, filter 160ms ease, box-shadow 160ms ease",
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