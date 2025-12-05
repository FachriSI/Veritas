// fachrisi/veritas/Veritas-d06486815343be9adc846227d91b86cd0ab5adef/src/pages/Dataset.jsx

import { useState } from 'react';
import './Dataset.css';

const API_BASE_URL = 'http://localhost:5000'; 

function Dataset() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Daftar format yang didukung sesuai dokumen (CSV/XLSX)
  const supportedFormats = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
  const maxFileSizeMB = 100; // Contoh batas ukuran file

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!supportedFormats.includes(file.type) && !file.name.toLowerCase().endsWith('.csv') && !file.name.toLowerCase().endsWith('.xlsx')) {
        setSelectedFile(null);
        setUploadStatus('❌ Error: Format file harus .csv atau .xlsx.');
        return;
      }
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        setSelectedFile(null);
        setUploadStatus(`❌ Error: Ukuran file melebihi batas ${maxFileSizeMB}MB.`);
        return;
      }
      setSelectedFile(file);
      setUploadStatus(`✅ File terpilih: ${file.name}`);
    } else {
      setSelectedFile(null);
      setUploadStatus('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('⚠️ Silakan pilih file terlebih dahulu.');
      return;
    }

    setIsUploading(true);
    setUploadStatus(`⏳ Mengunggah dan memproses ${selectedFile.name}...`);

    const formData = new FormData();
    formData.append('file', selectedFile); 

    try {
        const response = await fetch(`${API_BASE_URL}/upload-dataset`, {
            method: 'POST',
            body: formData,
        });

        const result = await response.json();

        if (response.ok) {
            setUploadStatus(`🎉 Berhasil! ${result.message} Data berhasil disimpan: ${result.total_records} record.`);
            setSelectedFile(null); 
            document.getElementById('datasetFile').value = '';
        } else {
            setUploadStatus(`❌ Gagal memproses file. Pesan Error: ${result.message || 'Terjadi kesalahan server.'}`);
        }

    } catch (error) {
        console.error('Upload Error:', error);
        setUploadStatus('❌ Gagal terhubung ke server atau terjadi error jaringan. Pastikan backend (Flask) berjalan di ' + API_BASE_URL);
    } finally {
        setIsUploading(false);
    }
  };

  // NEW FUNCTION: Handle Clear Database
  const handleClearDatabase = async () => {
    // 1. Popup Warning
    if (!window.confirm("PERINGATAN KERAS!\n\nAnda yakin ingin MENGHAPUS SEMUA DATA PERMANEN dari tabel Games?\n\nAksi ini TIDAK dapat dibatalkan!")) {
      setUploadStatus('⚠️ Penghapusan database dibatalkan.');
      return; // Batalkan jika pengguna menekan 'Cancel'
    }

    setUploadStatus('⏳ Membersihkan database...');
    setIsUploading(true); 

    try {
      const response = await fetch(`${API_BASE_URL}/api/clear-database`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus(`🗑️ Berhasil! ${result.message}`);
      } else {
        setUploadStatus(`❌ Gagal membersihkan database. Pesan Error: ${result.message || 'Terjadi kesalahan server.'}`);
      }

    } catch (error) {
      console.error('Clear DB Error:', error);
      setUploadStatus('❌ Gagal terhubung ke server atau terjadi error jaringan saat membersihkan database. Pastikan backend berjalan.');
    } finally {
      setIsUploading(false);
    }
  };


  return (
    <div className="dataset">
      <div className="dataset-header">
        <div>
          <h1>Manajemen Dataset</h1>
          <p>Fitur untuk mengunggah file data mentah (CSV/Excel) untuk memulai analisis korelasi data game Steam.</p>
        </div>
      </div>

      <div className="card upload-card">
        <h2>Upload Dataset Baru (CSV/Excel)</h2>
        <p className="description">
            Unggah file Anda di sini. Data akan otomatis masuk ke proses **Automatic Data Parsing** dan **Preprocessing** di server sebelum disimpan ke database. Mendukung format .csv dan .xlsx.
        </p>
        
        <div className="upload-container">
          <input
            type="file"
            id="datasetFile"
            accept=".csv, .xlsx, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
            onChange={handleFileChange}
            disabled={isUploading}
            style={{ display: 'none' }} // Sembunyikan input default
          />
          
          <div className="file-input-area">
              <label htmlFor="datasetFile" className={`custom-file-button ${isUploading ? 'disabled' : ''}`}>
                  {selectedFile ? 'Ganti File' : 'Pilih File CSV/Excel'}
              </label>
              <span className="file-name-display">
                  {selectedFile ? selectedFile.name : 'Belum ada file yang dipilih'}
              </span>
          </div>

          <button
            className="btn-primary upload-btn"
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? 'Memproses Data...' : '⬆️ Unggah dan Proses Data'}
          </button>
        </div>
        
        {/* Status Upload */}
        {uploadStatus && (
            <div className={`upload-status ${uploadStatus.startsWith('❌') ? 'error' : uploadStatus.startsWith('🎉') || uploadStatus.startsWith('🗑️') ? 'success' : ''}`}>
                <p>{uploadStatus}</p>
            </div>
        )}
      </div>
      
      {/* NEW: Clear Database Card */}
      <div className="card clear-card">
        <h2>Hapus Semua Data Database</h2>
        <p className="description">
            Gunakan fitur ini untuk **mengosongkan seluruh data game** dari database Anda. Ideal untuk memulai ulang dengan dataset baru tanpa data lama.
        </p>
        <button 
            className="btn-danger" 
            onClick={handleClearDatabase}
            disabled={isUploading}
        >
            ⚠️ Clear Semua Data Game
        </button>
      </div>

    </div>
  );
}

export default Dataset;