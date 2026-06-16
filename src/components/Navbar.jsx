import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">🏢</span>
          <span className="logo-text">NimaStruc</span>
        </div>
        <div className="navbar-subtitle">
          Professional Structural Audit Platform
        </div>
      </div>
    </nav>
  );
}
