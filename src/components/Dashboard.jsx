// src/components/Dashboard.jsx
import { useState, useEffect } from 'react';
import './Dashboard.css';
// Import komponen Chart.js yang dibutuhkan
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);


// DUMMY DATA UNTUK SIMULASI DASHBOARD
const dummyStats = {
  totalGames: 12500,
  priceRange: '$0.00 - $69.99',
  averageReview: 8.5,
  correlationResults: [ // Hasil Korelasi Koefisien Pearson (Fitur #5)
    { factor: 'Price', target: 'Review Score', pearson: 0.15, pValue: 0.001 },
    { factor: 'Review Number', target: 'Review Score', pearson: 0.78, pValue: 0.000 },
    { factor: 'Genre (Action)', target: 'Review Score', pearson: 0.45, pValue: 0.000 },
    { factor: 'Genre (RPG)', target: 'Review Score', pearson: 0.62, pValue: 0.000 },
  ],
  // Data simulasi untuk Grafik Distribusi Ulasan per Genre (Fitur #5)
  genreDistribution: {
    labels: ['Action', 'RPG', 'Strategy', 'Indie', 'Simulation'],
    positiveReviews: [1500, 2100, 750, 1200, 450],
    mixedReviews: [300, 450, 200, 350, 100],
    negativeReviews: [100, 150, 50, 80, 20],
  }
};

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // TODO: Ganti dengan fetch data dari backend Flask/Django Anda
  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setStats(dummyStats);
      setLoading(false);
    }, 1500);
  }, []);
  
  const handleDownloadReport = () => {
      // Fitur #10: Mengunduh grafik atau visualisasi sebagai PNG/PDF
      console.log('Downloading visual reports (Fitur #10)...');
      alert('Simulasi: Laporan visual akan diunduh sebagai PNG/PDF.');
  };

  // Data dan Opsi untuk Grafik Batang (Distribusi Ulasan per Genre)
  const chartData = {
    labels: stats?.genreDistribution.labels,
    datasets: [
      {
        label: 'Positive Reviews',
        data: stats?.genreDistribution.positiveReviews,
        backgroundColor: '#10b981', // Hijau Primary
      },
      {
        label: 'Mixed Reviews',
        data: stats?.genreDistribution.mixedReviews,
        backgroundColor: '#fbbf24', // Kuning/Orange
      },
      {
        label: 'Negative Reviews',
        data: stats?.genreDistribution.negativeReviews,
        backgroundColor: '#ef4444', // Merah
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: false,
      },
    },
    scales: {
        x: {
            stacked: true,
        },
        y: {
            stacked: true,
            beginAtZero: true,
        },
    }
  };


  if (loading) {
    return <div className="dashboard loading-state"><p>Memuat hasil analisis data...</p></div>;
  }
  
  if (!stats) {
      return <div className="dashboard empty-state"><p>Data analisis belum tersedia. Silakan unggah dataset terlebih dahulu.</p></div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard Statistik Analisis Korelasi</h1>
          <p>Ringkasan hasil analisis korelasi harga, ulasan, dan genre terhadap tipe ulasan game Steam.</p>
        </div>
        <button className="btn-primary" onClick={handleDownloadReport}>
            📥 Download Report (PNG/PDF)
        </button>
      </div>

      {/* 1. Statistik Deskriptif */}
      <h2>Ringkasan Dataset</h2>
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Game</h3>
          <p className="stat-value">{stats.totalGames.toLocaleString()}</p>
        </div>
        <div className="stat-card">
          <h3>Rentang Harga</h3>
          <p className="stat-value">{stats.priceRange}</p>
        </div>
        <div className="stat-card">
          <h3>Rata-rata Ulasan</h3>
          <p className="stat-value">⭐ {stats.averageReview}</p>
        </div>
      </div>
      
      {/* 2. Hasil Korelasi (Pearson) - Fitur #5 */}
      <h2>Hasil Korelasi Koefisien Pearson</h2>
      <div className="card correlation-results">
        <p className="card-description">Nilai koefisien korelasi (r) menunjukkan hubungan linier antara faktor dan variabel target (Review Score/Review Type). Nilai mendekati 1.0 berarti korelasi positif kuat.</p>
        <table className="correlation-table">
            <thead>
                <tr>
                    <th>Faktor Korelasi</th>
                    <th>Variabel Target</th>
                    <th>Koefisien Pearson (r)</th>
                    <th>P-value</th>
                </tr>
            </thead>
            <tbody>
                {stats.correlationResults.map((result, index) => (
                    <tr key={index}>
                        <td>{result.factor}</td>
                        <td>{result.target}</td>
                        <td className={result.pearson > 0.5 ? 'high-corr' : result.pearson > 0.1 ? 'medium-corr' : 'low-corr'}>
                            {result.pearson.toFixed(2)}
                        </td>
                        <td>{result.pValue}</td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* 3. Visualisasi Data (Chart.js Implementasi) */}
      <h2>Visualisasi Utama</h2>
      <div className="charts-container">
        
        {/* Heatmap Korelasi - Menggunakan Tabel sebagai Representasi Heatmap (Fitur #5) */}
        <div className="chart-card">
          <h3>Heatmap Korelasi Antar Variabel (Simulasi)</h3>
          <div className="chart-placeholder heatmap-placeholder">
              {/* Representasi Heatmap: Di frontend React, ini bisa diimplementasikan dengan pustaka khusus 
              atau dengan styling tabel yang lebih canggih. Untuk saat ini, kita fokus pada grafik. */}
              <p>Menggunakan tabel korelasi di atas sebagai representasi utama hasil korelasi.</p>
              <p>Visualisasi Heatmap (Fitur #5) dapat diintegrasikan di sini menggunakan Plotly.js atau styling tabel lebih lanjut.</p>
          </div>
        </div>
        
        {/* Grafik Distribusi Ulasan per Genre (Fitur #5) */}
        <div className="chart-card">
          <h3>Distribusi Ulasan per Genre (Grafik Batang)</h3>
          <div className="chart-wrapper">
              <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;