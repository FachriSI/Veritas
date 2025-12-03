import './Dashboard.css';

// Komponen Dashboard ini sekarang menampilkan ANALISIS DATA
function Dashboard() {
  // Data dummy untuk Statistik Deskriptif (Akan diganti dengan API)
  const descriptiveStats = [
    { id: 1, title: 'Total Game Di-Analisis', value: '2,543', icon: '🎮', color: '#667eea' },
    { id: 2, title: 'Rata-Rata Harga', value: '$25.99', icon: '💰', color: '#f59e0b' },
    { id: 3, title: 'Rata-Rata Ulasan (Positif)', value: '88%', icon: '👍', color: '#10b981' },
    { id: 4, title: 'Koefisien Korelasi Tertinggi', value: '+0.75 (Price-Review)', icon: '📈', color: '#ef4444' },
  ];

  // Data dummy untuk Hasil Korelasi (Akan diganti dengan komponen grafik interaktif)
  const correlationResults = [
    // Data ini merepresentasikan nilai koefisien Pearson antara variabel independen terhadap Review_type (variabel target)
    { target: 'Review_type (Skor Ulasan)', price: 0.75, review_no: 0.45, genre: -0.12 },
  ];

  const handleExportPDF = () => {
    // TODO: IV. Pelaporan - Implementasi fungsi Export PDF
    // Menggunakan pustaka seperti html2canvas dan jsPDF di frontend
    // atau meminta backend menghasilkan PDF.
    // NOTE: Ganti alert() dengan modal custom.
    console.log('Fungsi Export PDF dipanggil! (Perlu integrasi backend/library frontend)');
    alert('Export Laporan PDF dimulai. Fungsionalitas memerlukan integrasi library sisi klien/server.');
  };

  // Fungsi untuk menentukan badge korelasi
  const getCorrelationBadgeClass = (value) => {
    if (value > 0.5) return 'high';
    if (value < -0.5) return 'negative-high';
    if (value > 0 || value < 0) return 'moderate';
    return 'neutral';
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Analisis Korelasi</h1>
          <p>Visualisasi hasil analisis korelasi Harga, Jumlah Ulasan, dan Genre terhadap Tipe Ulasan Game.</p>
        </div>
        <button className="btn-primary" onClick={handleExportPDF}>
          📥 Export Laporan (PDF)
        </button>
      </div>

      {/* BAGIAN 1: STATISTIK DESKRIPTIF */}
      <h2 className="section-title">Statistik Deskriptif</h2>
      <div className="stats-grid">
        {descriptiveStats.map((stat) => (
          <div key={stat.id} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* BAGIAN 2: HASIL KORELASI & GRAFIK UTAMA */}
      <div className="content-grid">
        {/* Konten 1: Heatmap Korelasi (Menggantikan Recent Orders) */}
        <div className="card large-card">
          <div className="card-header">
            <h3>Hasil Koefisien Korelasi Pearson</h3>
            <p className="subtitle-header">Harga, Jumlah Ulasan, dan Genre vs Review Game</p>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Variabel Target</th>
                  <th>Korelasi Harga (Price)</th>
                  <th>Korelasi Jumlah Ulasan (Review_no)</th>
                  <th>Korelasi Genre</th>
                </tr>
              </thead>
              <tbody>
                {correlationResults.map((result, index) => (
                  <tr key={index}>
                    <td>{result.target}</td>
                    <td><span className={`correlation-badge ${getCorrelationBadgeClass(result.price)}`}>{result.price}</span></td>
                    <td><span className={`correlation-badge ${getCorrelationBadgeClass(result.review_no)}`}>{result.review_no}</span></td>
                    <td><span className={`correlation-badge ${getCorrelationBadgeClass(result.genre)}`}>{result.genre}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* TODO: Tempatkan Visualisasi Heatmap di sini (Menggunakan pustaka Chart) */}
          <div className="chart-placeholder">
            <p>Visualisasi Heatmap Korelasi akan ditampilkan di sini </p>
          </div>
        </div>

        {/* Konten 2: Grafik Distribusi (Menggantikan Quick Actions) */}
        <div className="card small-card">
          <div className="card-header">
            <h3>Grafik Utama</h3>
            <p className="subtitle-header">Distribusi Ulasan per Genre</p>
          </div>
          {/* TODO: Tempatkan Grafik Distribusi di sini (Menggunakan pustaka Chart) */}
          <div className="chart-placeholder">
            <p>Visualisasi Grafik Batang Distribusi Genre akan ditampilkan di sini </p>
          </div>
        </div>
      </div>
      
      {/* Konten 3: Grafik Hubungan Harga vs Jumlah Ulasan */}
      <div className="card span-full-width">
        <div className="card-header">
          <h3>Grafik Utama</h3>
          <p className="subtitle-header">Hubungan Harga (Price) vs Jumlah Ulasan (Review_no)</p>
        </div>
        {/* TODO: Tempatkan Grafik Scatter Plot di sini (Menggunakan pustaka Chart) */}
        <div className="chart-placeholder large-chart-placeholder">
          <p>Visualisasi Scatter Plot Harga vs Jumlah Ulasan akan ditampilkan di sini </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;