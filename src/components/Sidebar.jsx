import { useState } from 'react'; // SINTAKS DIPERBAIKI: Menggunakan 'from'
import { useNavigate, useLocation } from 'react-router-dom';
import './Sidebar.css';

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeMenu, setActiveMenu] = useState(location.pathname);

  // URUTAN MENU BARU SESUAI PERMINTAAN:
  // 1. Home
  // 2. Import data
  // 3. Games (Daftar & Filter, edit, tambahkan, dan hapus data game)
  // 4. Dashboard (Analisis)
  const menuItems = [
    { id: 'home', path: '/', icon: '🏠', label: 'Home' },
    { id: 'dataset', path: '/dataset', icon: '📁', label: 'Import Data' },
    { id: 'games', path: '/games', icon: '🎮', label: 'Games (Data)' },
    { id: 'dashboard', path: '/dashboard', icon: '📊', label: 'Dashboard (Analisis)' }, 
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