import "./DayTabs.css";

const DAY_NAMES = [
  "ראשון",
  "שני",
  "שלישי",
  "רביעי",
  "חמישי",
  "שישי",
  "שבת",
];

const createDateKey = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

export default function DayTabs({
  selectedDate,
  onSelectDate,
}) {
  const days = [];

  for (let index = 0; index < 10; index += 1) {
    const date = new Date();

    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);

    days.push({
      key: createDateKey(date),
      dayName: DAY_NAMES[date.getDay()],
      formattedDate: `${String(date.getDate()).padStart(
        2,
        "0"
      )}/${String(date.getMonth() + 1).padStart(2, "0")}`,
      isToday: index === 0,
    });
  }

  const activeDate = selectedDate || days[0].key;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        gap: 7,
        paddingBottom: 10,
        overflowX: "auto",
        overflowY: "hidden",
        scrollbarWidth: "thin",
      }}
    >
      {days.map((day) => {
        const isActive = day.key === activeDate;

        return (
          <button
            key={day.key}
            type="button"
            onClick={() => onSelectDate?.(day.key)}
            style={{
              position: "relative",
              minWidth: 104,
              minHeight: 58,
              padding: "8px 12px",
              flexShrink: 0,
              textAlign: "center",
              border: isActive
                ? "1px solid var(--primary)"
                : "1px solid var(--border)",
              borderRadius: "var(--radius-small)",
              background: isActive
                ? "var(--primary)"
                : "var(--surface-soft)",
              color: isActive
                ? "#ffffff"
                : "var(--text-main)",
              boxShadow: isActive
                ? "0 5px 12px rgba(25, 118, 210, 0.18)"
                : "none",
              cursor: "pointer",
              fontFamily: "inherit",
              transition:
                "transform 0.15s ease, box-shadow 0.15s ease, background 0.15s ease",
            }}
          >
            {day.isToday && (
              <span
                style={{
                  position: "absolute",
                  top: 5,
                  left: 7,
                  padding: "2px 5px",
                  borderRadius: 999,
                  background: isActive
                    ? "rgba(255,255,255,0.18)"
                    : "var(--primary-light)",
                  color: isActive
                    ? "#ffffff"
                    : "var(--primary)",
                  fontSize: 8,
                  fontWeight: 900,
                }}
              >
                היום
              </span>
            )}

            <div
              style={{
                fontSize: 13,
                fontWeight: 900,
                lineHeight: 1.2,
              }}
            >
              {day.dayName}
            </div>

            <div
              style={{
                marginTop: 5,
                color: isActive
                  ? "rgba(255,255,255,0.88)"
                  : "var(--text-muted)",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {day.formattedDate}
            </div>
          </button>
        );
      })}
    </div>
  );
}