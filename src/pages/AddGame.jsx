// src/pages/AddGame.jsx
import { useState } from 'react';
import './AddGame.css';
import { useNavigate } from 'react-router-dom';

function AddGame() {
  const navigate = useNavigate();
  // State untuk menyimpan data input game baru
  const [newGame, setNewGame] = useState({
    Name: '',
    Price: '',
    Release_date: '',
    Review_no: '',
    Review_type: 'Positive', // Default value
    Tags: '',
    Description: ''
  });

  const reviewTypes = ['Positive', 'Mixed', 'Negative'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewGame(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('[CRUD] Submitting new game data:', newGame);
    
    // TODO: Backend - Lakukan validasi data yang ketat sesuai Fitur #3
    // TODO: Backend - Ganti ini dengan Panggilan API POST/Fetch ke backend (Flask/Django)
    
    // Simulasi sukses
    alert(`Data Game "${newGame.Name}" berhasil ditambahkan (simulasi). Data akan masuk ke proses analisis.`);
    
    // Reset form atau navigasi kembali ke halaman Games
    setNewGame({
        Name: '',
        Price: '',
        Release_date: '',
        Review_no: '',
        Review_type: 'Positive',
        Tags: '',
        Description: ''
    });
    navigate('/games'); // Kembali ke daftar game setelah submit (opsional)
  };

  return (
    <div className="add-game">
      <div className="add-game-header">
        <h1>➕ Tambah Data Game Baru</h1>
        <p>Masukkan rincian data game secara manual. Data ini akan langsung masuk ke proses analisis setelah disimpan.</p>
        <button className="btn-secondary" onClick={() => navigate('/games')}>← Kembali ke Daftar Game</button>
      </div>

      <div className="card form-card">
        <form onSubmit={handleSubmit}>
          
          {/* Kelompok Input Data Utama */}
          <div className="form-group">
            <label htmlFor="Name">Nama Game (Wajib)</label>
            <input
              type="text"
              id="Name"
              name="Name"
              value={newGame.Name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Price">Harga (Price) - (Wajib)</label>
              <input
                type="number"
                id="Price"
                name="Price"
                value={newGame.Price}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Release_date">Tanggal Rilis (Release Date) - (Wajib)</label>
              <input
                type="date"
                id="Release_date"
                name="Release_date"
                value={newGame.Release_date}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Review_no">Jumlah Ulasan (Review No.) - (Wajib)</label>
              <input
                type="number"
                id="Review_no"
                name="Review_no"
                value={newGame.Review_no}
                onChange={handleChange}
                min="0"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Review_type">Tipe Ulasan (Review Type) - (Wajib)</label>
              <select
                id="Review_type"
                name="Review_type"
                value={newGame.Review_type}
                onChange={handleChange}
                required
              >
                {reviewTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
          
          {/* Tags (Genre) */}
          <div className="form-group">
            <label htmlFor="Tags">Tags/Genre (Pisahkan dengan koma, cth: Action, RPG, Fantasy) - (Wajib)</label>
            <input
              type="text"
              id="Tags"
              name="Tags"
              value={newGame.Tags}
              onChange={handleChange}
              placeholder="Contoh: Action, RPG, Open World"
              required
            />
          </div>

          {/* Deskripsi */}
          <div className="form-group">
            <label htmlFor="Description">Deskripsi Game (Wajib)</label>
            <textarea
              id="Description"
              name="Description"
              rows="4"
              value={newGame.Description}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" className="btn-primary submit-btn">
            💾 Simpan Data Game
          </button>
        </form>
      </div>
    </div>
  );
}

export default AddGame;