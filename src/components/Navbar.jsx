import './Navbar.css';

function Navbar() {
  return (
    <div className="navbar">
      <div className="navbar-left">
        <button className="menu-toggle">☰</button>
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search..." />
        </div>
      </div>
      <div className="navbar-right">
        <div className="navbar-item">
          <span className="notification-badge">3</span>
          🔔
        </div>
        <div className="navbar-item">
          ✉️
        </div>
        <div className="navbar-profile">
          <img src="https://via.placeholder.com/40" alt="Profile" />
          <span>Admin User</span>
        </div>
      </div>
    </div>
  );
}

export default Navbar;
