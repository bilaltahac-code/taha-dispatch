import "./DayTabs.css";
export default function DayTabs() {
  const days = [];

  const dayNames = [
    "ראשון",
    "שני",
    "שלישי",
    "רביעי",
    "חמישי",
    "שישי",
    "שבת",
  ];

  for (let i = 0; i < 10; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);

    days.push({
      day: dayNames[date.getDay()],
      date: `${String(date.getDate()).padStart(2, "0")}/${String(
        date.getMonth() + 1
      ).padStart(2, "0")}`,
    });
  }

  return (
    <div
  style={{
    display: "flex",
    flexDirection: "row-reverse",
    background: "#fff",
    borderBottom: "1px solid #ddd",
  }}
>
      {days.map((d, index) => (
        <div
          key={index}
          style={{
            width: 120,
            padding: 10,
            textAlign: "center",
            borderRight: "1px solid #eee",
            cursor: "pointer",
          }}
        >
          <div style={{ fontWeight: "bold" }}>{d.day}</div>

          <div style={{ color: "#777", marginTop: 5 }}>
            {d.date}
          </div>
        </div>
      ))}
    </div>
  );
}