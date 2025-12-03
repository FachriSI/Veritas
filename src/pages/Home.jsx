import './Home.css';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  // Aksi navigasi ke rute lain
  const menuActions = [
    { id: 1, title: 'Kelola Dataset (CRUD)', path: '/dataset', icon: '📁', description: 'Unggah, input, edit, dan hapus data game mentah.' },
    { id: 2, title: 'Lihat Daftar Game', path: '/games', icon: '🎮', description: 'Lihat data game dalam tabel, cari, dan saring berdasarkan kriteria.' },
    { id: 3, title: 'Lihat Hasil Analisis', path: '/dashboard', icon: '📊', description: 'Akses statistik deskriptif dan visualisasi korelasi data.' },
  ];

  return (
    <div className="home">
      <div className="home-header">
        <h1>Selamat Datang di Veritas Data Analytics</h1>
        <p>Proyek Analisis Korelasi Harga, Ulasan, dan Genre Game Steam.</p>
      </div>

      <div className="card">
        <div className="card-header">
            <h3>Akses Cepat</h3>
        </div>
        <div className="action-grid">
            {menuActions.map((action) => (
                <button 
                    key={action.id} 
                    className="action-card-btn"
                    onClick={() => navigate(action.path)}
                >
                    <span className="action-icon">{action.icon}</span>
                    <div className="action-info">
                        <h4 className="action-title">{action.title}</h4>
                        <p className="action-description">{action.description}</p>
                    </div>
                    <span className="action-arrow">→</span>
                </button>
            ))}
        </div>
      </div>

      {/* Menghapus Stat Cards dan Recent Activity yang sebelumnya ada */}
      {/* Konten Home ini sekarang fokus sebagai navigasi pusat */}
    </div>
  );
}

export default Home;