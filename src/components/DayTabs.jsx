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
    });
  }

  const activeDate = selectedDate || days[0].key;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        background: "#ffffff",
        borderBottom: "1px solid #dddddd",
        overflowX: "auto",
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
              minWidth: 120,
              padding: 12,
              textAlign: "center",
              border: "none",
              borderRight: "1px solid #eeeeee",
              borderBottom: isActive
                ? "3px solid #1976d2"
                : "3px solid transparent",
              background: isActive ? "#eaf3ff" : "#ffffff",
              color: isActive ? "#1976d2" : "#222222",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            <div style={{ fontWeight: "bold" }}>
              {day.dayName}
            </div>

            <div
              style={{
                marginTop: 5,
                color: isActive ? "#1976d2" : "#777777",
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