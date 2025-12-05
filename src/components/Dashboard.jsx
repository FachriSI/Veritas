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

const API_BASE_URL = 'http://localhost:5000'; 

// Skema data untuk menyimpan hasil dari backend
const initialStats = {
  stats: {},
  correlation: {},
  genre_data: { distribution: {}, avg_score: {} },
  classification: null, // NEW: Untuk hasil klasifikasi
  ml_error: null, // NEW: Untuk error ML (misalnya data kurang)
};

const Dashboard = () => {
  const [statsData, setStatsData] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fungsi untuk mem-fetch data analisis dari backend Flask
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard-stats`);
      const result = await response.json();

      if (response.ok) {
        if (result.message || result.ml_error) {
            // Menggabungkan error umum (DB kosong) dan error ML (data kurang)
            setError(result.message || result.ml_error);
            setStatsData(initialStats);
        } else {
            setStatsData(result);
        }
      } else {
        setError(result.message || 'Gagal mengambil data statistik dari server.');
      }
    } catch (err) {
      console.error('Fetch Dashboard Error:', err);
      setError('Gagal terhubung ke API backend. Pastikan server Flask berjalan.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);
  
  const handleDownloadReport = () => {
      // Fitur #10: Mengunduh grafik atau visualisasi sebagai PNG/PDF
      console.log('Downloading visual reports (Fitur #10)...');
      alert('Simulasi: Laporan visual akan diunduh sebagai PNG/PDF (Perlu integrasi library seperti html2canvas/Plotly.js).');
  };
  
  // --- Pengolahan Data untuk Grafik Batang (Distribusi Game per Genre) ---
  let chartData, chartOptions;
  const genreDistribution = statsData.genre_data?.distribution || {};
  const labels = Object.keys(genreDistribution);

  if (labels.length > 0) {
      // Grafik menampilkan Total Game per Genre (Top 10 dari backend analyzer.py)
      chartData = {
          labels: labels,
          datasets: [
              {
                  label: 'Total Game',
                  data: Object.values(genreDistribution),
                  backgroundColor: '#3b82f6', // Biru Secondary
              },
          ],
      };

      chartOptions = {
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
                stacked: false,
            },
            y: {
                stacked: false,
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Jumlah Game'
                }
            },
        }
      };
  }

  // --- Rendering Conditional ---

  if (loading) {
    return <div className="dashboard loading-state"><p>Memuat hasil analisis data...</p></div>;
  }
  
  if (error) {
      return <div className="dashboard empty-state"><p>❌ {error}</p></div>;
  }
  
  const stats = statsData.stats;
  const correlation = statsData.correlation;
  const correlationKeys = Object.keys(correlation);
  const classification = statsData.classification;
  
  if (stats.total_games === 0) {
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

      {/* 1. Statistik Deskriptif (Fitur #5.a) */}
      <h2>Ringkasan Dataset</h2>
      <div className="stats-cards">
        <div className="stat-card">
          <h3>Total Game</h3>
          <p className="stat-value">{stats.total_games?.toLocaleString() || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Rentang Harga</h3>
          <p className="stat-value">{stats.price_range || '-'}</p>
        </div>
        <div className="stat-card">
          {/* LABEL DIPERBAIKI: Rata-rata Jumlah Ulasan */}
          <h3>Rata-rata Jumlah Ulasan (Review Count)</h3>
          <p className="stat-value">⭐ {stats.avg_review_no?.toFixed(2) || '0.00'}</p>
        </div>
      </div>
      
      {/* 2. Hasil Korelasi (Pearson) - Fitur #5.b */}
      <h2>Hasil Korelasi Koefisien Pearson</h2>
      <div className="card correlation-results">
        <p className="card-description">Nilai koefisien korelasi (r) menunjukkan hubungan linier antara faktor dan variabel target (Review Score/Review Type). Nilai mendekati 1.0 berarti korelasi positif kuat.</p>
        <table className="correlation-table">
            <thead>
                <tr>
                    <th>Faktor Korelasi</th>
                    <th>Variabel Target</th>
                    <th>Koefisien Pearson (r)</th>
                </tr>
            </thead>
            <tbody>
                {correlationKeys.map((key, index) => (
                    <tr key={index}>
                        {/* Format Key dari snake_case ke Judul yang mudah dibaca */}
                        <td>{key.replace(/_/g, ' ').replace('vs', 'vs').replace('review score', 'Review Score').replace('review no', 'Review Number')}</td>
                        <td>Review Score</td>
                        {/* Menampilkan nilai korelasi dari backend */}
                        <td className={
                            correlation[key] > 0.5 ? 'high-corr' : 
                            correlation[key] > 0.1 ? 'medium-corr' : 
                            'low-corr'
                        }>
                            {correlation[key]?.toFixed(4) || '0.0000'}
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>

      {/* 3. Hasil Klasifikasi Random Forest (Fitur #5.c) - BARU */}
      <h2 style={{ color: '#3b82f6' }}>Hasil Klasifikasi (Random Forest)</h2>
      {classification ? (
          <div className="charts-container" style={{ gridTemplateColumns: '1fr 1fr' }}>
              
              {/* Metrik Klasifikasi */}
              <div className="chart-card">
                  <h3>Metrik Evaluasi Model</h3>
                  <table className="correlation-table" style={{ marginTop: '15px' }}>
                      <thead>
                          <tr>
                              <th>Metrik</th>
                              <th>Nilai</th>
                          </tr>
                      </thead>
                      <tbody>
                          {Object.entries(classification.metrics).map(([key, value]) => (
                              <tr key={key}>
                                  <td><strong>{key}</strong></td>
                                  <td>{value}</td>
                              </tr>
                          ))}
                      </tbody>
                  </table>
                  
                  {/* Feature Importances (Sebagai list sederhana) */}
                  <h4 style={{ marginTop: '20px', fontSize: '1.1rem' }}>Feature Importances:</h4>
                  <ul style={{ paddingLeft: '20px', fontSize: '0.9rem' }}>
                    {Object.entries(classification.feature_importances)
                        .sort(([, a], [, b]) => b - a)
                        .map(([feature, importance]) => (
                            <li key={feature}>{feature.replace(/_/g, ' ')}: **{importance}**</li>
                        ))}
                  </ul>
              </div>

              {/* Confusion Matrix (Visualisasi dalam bentuk tabel) */}
              <div className="chart-card">
                  <h3>Confusion Matrix</h3>
                  {classification.confusion_matrix && (
                      <table className="correlation-table" style={{ marginTop: '15px' }}>
                          <thead>
                              <tr>
                                  <th>Actual \ Predicted</th>
                                  {/* Kolom Prediksi */}
                                  {classification.confusion_matrix.columns.map((col, index) => (
                                      <th key={index}>{col}</th>
                                  ))}
                              </tr>
                          </thead>
                          <tbody>
                              {/* Baris Aktual */}
                              {classification.confusion_matrix.data.map((row, rowIndex) => (
                                  <tr key={rowIndex}>
                                      {/* Label Baris Aktual */}
                                      <td style={{ fontWeight: 'bold' }}>{classification.confusion_matrix.index[rowIndex]}</td>
                                      {/* Nilai Data */}
                                      {row.map((value, colIndex) => (
                                          <td 
                                              key={colIndex} 
                                              style={{ 
                                                  backgroundColor: rowIndex === colIndex ? '#d1fae5' : '#f9fafb', // Hijau untuk True Positives (Diagonal)
                                                  fontWeight: rowIndex === colIndex ? 'bold' : 'normal' 
                                              }}
                                          >
                                              {value}
                                          </td>
                                      ))}
                                  </tr>
                              ))}
                          </tbody>
                      </table>
                  )}
              </div>
          </div>
      ) : (
           <div className="card correlation-results">
              <p className="card-description">Model Klasifikasi tidak dapat dilatih. Kemungkinan data tidak mencukupi (minimal 100 baris) atau terlalu sedikit kategori ulasan yang ada.</p>
              <div className="chart-placeholder" style={{ height: '150px' }}>
                  <p>Model Klasifikasi Gagal Dibuat/Dijalankan.</p>
              </div>
          </div>
      )}


      {/* 4. Visualisasi Lanjutan (Fitur #5.d) */}
      <h2>Visualisasi Lanjutan</h2>
      <div className="charts-container">
        
        {/* Heatmap Korelasi - Placeholder (Fitur #5.b) */}
        <div className="chart-card">
          <h3>Heatmap Korelasi Antar Variabel (Visualisasi TODO)</h3>
          <div className="chart-placeholder heatmap-placeholder">
              <p>Visualisasi Heatmap atau Scatter Plot (Harga vs Ulasan) dapat diintegrasikan di sini.</p>
          </div>
        </div>
        
        {/* Grafik Distribusi Game per Genre (Fitur #5.b) */}
        {chartData && (
            <div className="chart-card">
              <h3>Distribusi Game per Genre (Top 10)</h3>
              <div className="chart-wrapper">
                  <Bar data={chartData} options={chartOptions} />
              </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;