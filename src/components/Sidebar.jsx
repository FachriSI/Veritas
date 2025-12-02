import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  const menuItems = [
    { id: 'home', path: '/', icon: '🏠', label: 'Home' },
    { id: 'dataset', path: '/dataset', icon: '📁', label: 'Dataset' },
    { id: 'games', path: '/games', icon: '🎮', label: 'Games' },
  ];

  const handleMenuClick = (path) => {
    setActiveMenu(path);
    navigate(path);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <img src="/VeritasLogo.svg" alt="Veritas Logo" className="sidebar-logo" />
        <h2>Veritas</h2>
      </div>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className={`sidebar-item ${activeMenu === item.path ? 'active' : ''}`}
            onClick={() => handleMenuClick(item.path)}
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Sidebar;
