import "./Header.css";

export default function Header() {
  return (
    <header className="app-header">
      <div className="app-header__brand">
        <div className="app-header__logo-wrapper">
          <img
            className="app-header__logo"
            src="/taha-logo.png"
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

      <div className="app-header__status">
        <span className="app-header__status-dot" />
        <span>המערכת פעילה</span>
      </div>
    </header>
  );
}