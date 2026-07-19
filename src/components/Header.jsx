import "./Header.css";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo-wrapper">
          <img
            className="app-header__logo"
            src="./taha-logo.png"
            alt="מוצרי בטון טאהא"
          />
        </div>

        <div className="app-header__divider" />

        <div className="app-header__titles">
          <div className="app-header__title">
            TAHA DISPATCH
          </div>

          <div className="app-header__subtitle">
            מערכת סידור משאיות
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 18,
        }}
      >
        <div className="app-header__status">
          <span className="app-header__status-dot" />
          <span>המערכת פעילה</span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 14px",
            background: "rgba(25,118,210,0.08)",
            border: "1px solid rgba(25,118,210,0.15)",
            borderRadius: 12,
            fontSize: 13,
            fontWeight: 700,
            color: "#1976d2",
          }}
        >
          <span>📅</span>

          <span>
            {new Date().toLocaleDateString("he-IL", {
              weekday: "long",
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        </div>
      </div>
    </header>
  );
}