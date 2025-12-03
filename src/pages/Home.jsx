// src/pages/Home.jsx
import { useNavigate } from 'react-router-dom';
import './Home.css';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-page">
      <div className="home-hero card">
        <h1>Veritas</h1>
        <p className="subtitle">
          Platform analisis data game Steam untuk mengungkap korelasi antara Harga, Ulasan, dan Genre game terhadap Review game.
        </p>
        
        <div className="app-purpose">
            <div className="purpose-item">
                <h3>Analisis Korelasi Kuat</h3>
                <p>Menggunakan Koefisien Pearson untuk mengukur hubungan linier antar variabel, seperti Harga dan Jumlah Ulasan terhadap Tipe Ulasan (Review Type).</p>
            </div>
            <div className="purpose-item">
                <h3>Manajemen Data Fleksibel</h3>
                <p>Mendukung unggah dataset CSV/Excel dan penambahan data game secara manual.</p>
            </div>
            <div className="purpose-item">
                <h3>Visualisasi Interaktif</h3>
                <p>Dashboard yang dilengkapi Heatmap Korelasi dan Grafik Distribusi Genre untuk pengambilan keputusan berbasis data.</p>
            </div>
        </div>
      </div>

      <div className="home-actions-section">
        <h2>Mulai Eksplorasi Data</h2>
        <div className="home-action-cards">
          
          <div className="action-card card" onClick={() => navigate('/dashboard')}>
            <h3>Lihat Hasil Analisis</h3>
            <p>Akses Dashboard Statistik untuk melihat hasil korelasi dan visualisasi data terkini.</p>
          </div>
          
          <div className="action-card card" onClick={() => navigate('/dataset')}>
            <h3>Unggah Dataset Baru</h3>
            <p>Lakukan pembaruan data dengan mengunggah file CSV atau Excel baru ke server.</p>
          </div>
          
          <div className="action-card card" onClick={() => navigate('/games')}>
            <h3>Kelola Data Game</h3>
            <p>Lihat, cari, filter, dan kelola semua data game yang sudah ada dalam database.</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default Home;