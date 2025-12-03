// src/pages/Dataset.jsx
import { useState } from 'react';
import './Dataset.css';

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
      if (!supportedFormats.includes(file.type) && !file.name.endsWith('.csv')) {
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

    // TODO: Backend - Ganti dengan panggilan API POST ke backend Python/Flask/Django Anda
    const formData = new FormData();
    formData.append('datasetFile', selectedFile);

    try {
        // --- SIMULASI UPLOAD DATASET KE SERVER ---
        await new Promise(resolve => setTimeout(resolve, 3000)); 

        // Setelah upload/proses parsing berhasil di backend:
        setUploadStatus(`🎉 Berhasil! Dataset "${selectedFile.name}" berhasil diunggah dan siap dianalisis. Proses Automatic Data Parsing selesai.`);
        // Reset file input setelah sukses (opsional)
        setSelectedFile(null); 
    } catch (error) {
        console.error('Upload Error:', error);
        setUploadStatus('❌ Gagal mengunggah file. Silakan coba lagi.');
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
            Unggah file Anda di sini. Data akan otomatis masuk ke proses Automatic Data Parsing di server. Mendukung format .csv dan .xlsx.
        </p>
        
        <div className="upload-container">
          <input
            type="file"
            id="datasetFile"
            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
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
            {isUploading ? 'Memproses...' : '⬆️ Unggah dan Proses Data'}
          </button>
        </div>
        
        {/* Status Upload */}
        {uploadStatus && (
            <div className={`upload-status ${uploadStatus.startsWith('❌') ? 'error' : uploadStatus.startsWith('🎉') ? 'success' : ''}`}>
                <p>{uploadStatus}</p>
            </div>
        )}
      </div>
      
      {/* TODO: Tambahkan tabel untuk melihat riwayat atau status dataset yang sudah diunggah */}

    </div>
  );
}

export default Dataset;