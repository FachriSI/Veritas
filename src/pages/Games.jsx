// src/pages/Games.jsx
import { useState, useEffect, useCallback } from 'react';
import './Games.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:5000'; 
const GAMES_PER_PAGE = 10; // Jumlah default data per halaman
const MAX_TAGS_TO_SHOW = 3; // Batasan tampilan tags di tabel (agar rapi)
const MAX_VISIBLE_TAGS = 18; // Batas tags yang ditampilkan di filter (agar tidak terlalu panjang)

function Games() {
  const navigate = useNavigate();
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // State untuk Pagination dan Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState([]); 
  const [selectedReviewTypes, setSelectedReviewTypes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // State yang berasal dari Backend & Filter Dinamis
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [availableFilterTags, setAvailableFilterTags] = useState([]); // Daftar Tags unik dari DB
  const [showAllTags, setShowAllTags] = useState(false); // State untuk Show More/Less filter

  // Review Types yang Didefinisikan
  const reviewTypes = ['Positive', 'Mixed', 'Negative'];

  // --- FUNGSI 1: Fetch Data Game dari Backend ---
  const fetchGames = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const searchParams = new URLSearchParams();
    searchParams.append('page', currentPage);
    searchParams.append('per_page', GAMES_PER_PAGE);

    if (searchTerm) {
      searchParams.append('search', searchTerm);
    }
    
    if (selectedTags.length > 0) {
      searchParams.append('genre', selectedTags.join(','));
    }
    
    if (selectedReviewTypes.length > 0) {
      searchParams.append('review_type', selectedReviewTypes.join(','));
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/games/data?${searchParams.toString()}`);
      const result = await response.json();

      if (response.ok) {
        setGames(result.data); 
        setTotalPages(result.pagination.total_pages); 
        setTotalRecords(result.pagination.total_records); 
      } else {
        setError(result.message || 'Gagal mengambil data game dari server.');
        setGames([]);
      }
    } catch (err) {
      console.error('Fetch Games Error:', err);
      setError('Gagal terhubung ke API backend. Pastikan server Flask berjalan.');
      setGames([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchTerm, selectedTags, selectedReviewTypes]); 

  // --- FUNGSI 2: Fetch Daftar Tags untuk Filter (Dinamis) ---
  const fetchAvailableTags = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tags-for-filter`);
      const result = await response.json();

      if (response.ok) {
        setAvailableFilterTags(result.tags);
      } else {
        console.error('Failed to fetch filter tags:', result.message);
      }
    } catch (err) {
      console.error('Network Error: Cannot fetch filter tags.', err);
    }
  }, []);

  // Effect untuk menjalankan fetchGames dan fetchAvailableTags saat komponen dimuat
  useEffect(() => {
    fetchGames();
    fetchAvailableTags(); 
  }, [fetchGames, fetchAvailableTags]);

  // Handler untuk mengubah halaman
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  // Handler untuk Toggle Filter Tags (Genre)
  const toggleFilter = (filterName, value) => {
    setCurrentPage(1); 
      
    if (filterName === 'tag') { 
      setSelectedTags(prev => 
        prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
      );
    } else if (filterName === 'reviewType') {
      setSelectedReviewTypes(prev => 
        prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
      );
    }
  };


  // --- CRUD Handlers ---
  const handleEdit = (gameId) => {
    console.log(`[CRUD] Edit game ID: ${gameId}`);
    alert(`Fitur Edit Game ID ${gameId} belum diimplementasikan.`);
    // TODO: Implementasi navigasi ke form edit
  };

  const handleDelete = async (gameId) => {
    if (!window.confirm(`Yakin ingin menghapus game ID ${gameId} secara permanen?`)) {
      return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/api/games/${gameId}`, {
            method: 'DELETE',
        });

        if (response.ok) {
            alert(`Game ID ${gameId} berhasil dihapus.`);
            fetchGames(); // Refresh data setelah penghapusan
        } else {
            const result = await response.json();
            alert(`Gagal menghapus game: ${result.message || 'Error server.'}`);
        }
    } catch (err) {
        alert('Gagal terhubung ke server saat menghapus game.');
    }
  };

  const handleExportCSV = () => {
    console.log('Exporting filtered data to CSV...');
  };
  
  const handleAddNewGame = () => {
    navigate('/games/add');
  };
  
  // --- LOGIKA FILTER SHOW MORE/LESS ---
  const tagsToDisplay = showAllTags 
        ? availableFilterTags 
        : availableFilterTags.slice(0, MAX_VISIBLE_TAGS);
        
  const hiddenTagCount = availableFilterTags.length - MAX_VISIBLE_TAGS;

  
  return (
    <div className="games">
      <div className="games-header">
        <div>
          <h1>Games Database</h1>
          <p>Browse and manage games from Steam dataset ({totalRecords} games total)</p>
        </div>
        <div className="games-actions">
          <input
            type="text"
            placeholder="Search games..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
            }}
          />
          <button 
            className="btn-primary" 
            onClick={handleAddNewGame} 
            style={{ background: '#10b981', marginRight: '1rem' }}
          >
            ➕ Tambah Data Game
          </button>
          <button className="btn-primary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Bagian Filter */}
      <div className="card filters-container">
        <h4>Filter Data:</h4>
        
        {/* Filter TAGS (Genre) - MENGGUNAKAN availableFilterTags */}
        <div className="filter-group">
            <p className="filter-label">
                Tags ({tagsToDisplay.length} dari {availableFilterTags.length} ditampilkan):
            </p>
            <div className="filter-buttons tag-filters">
                {tagsToDisplay.map((tag) => ( 
                    <button
                        key={tag}
                        className={`filter-btn ${selectedTags.includes(tag) ? 'active' : ''}`}
                        onClick={() => toggleFilter('tag', tag)}
                        title={`Filter berdasarkan tag: ${tag}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
            
            {/* Tombol Show More/Show Less */}
            {hiddenTagCount > 0 && !showAllTags && (
                <button 
                    className="btn-secondary filter-show-toggle" 
                    onClick={() => setShowAllTags(true)}
                    style={{ marginTop: '10px', marginLeft: '5px' }} 
                >
                    + Tampilkan {hiddenTagCount} Tags Lainnya
                </button>
            )}

            {showAllTags && (
                <button 
                    className="btn-secondary filter-show-toggle" 
                    onClick={() => setShowAllTags(false)}
                    style={{ marginTop: '10px', marginLeft: '5px' }}
                >
                    Tampilkan Lebih Sedikit
                </button>
            )}
        </div>
        
        {/* Filter Review Type */}
        <div className="filter-group">
            <p className="filter-label">Review Type:</p>
            <div className="filter-buttons">
                {reviewTypes.map((type) => (
                    <button
                        key={type}
                        className={`filter-btn ${selectedReviewTypes.includes(type) ? 'active' : ''}`}
                        onClick={() => toggleFilter('reviewType', type)}
                    >
                        {type}
                    </button>
                ))}
            </div>
        </div>

      </div> {/* End filters-container */}

      <div className="games-content">
        <div className="card">
          {error && <div className="empty-state" style={{ color: '#ef4444' }}>
              <p>❌ Error: {error}</p>
          </div>}
          
          {loading && totalRecords > 0 ? (
            <div className="loading-state">
              <p>Mengambil data dari database...</p>
            </div>
          ) : games.length === 0 ? (
            <div className="empty-state">
              <p>No games found matching the criteria.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="games-table">
                  <thead>
                    <tr>
                      <th>Game Title</th>
                      <th>Tags</th> 
                      <th>Review Type</th> 
                      <th>Review No.</th> 
                      <th>Release Date</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {games.map((game) => {
                       // LOGIKA UNTUK TRUNCATE TAGS DI TABEL
                       const tagsArray = (game?.tags || '').split(',').map(t => t.trim()).filter(t => t !== '');
                       const tagsToShow = tagsArray.slice(0, MAX_TAGS_TO_SHOW);
                       const hiddenTagCount = tagsArray.length - tagsToShow.length;
                       
                       return (
                      <tr key={game?.id || game?.name}>
                        <td className="game-title">{game?.name || '-'}</td>
                        
                        {/* Tampilan Tags yang Diperpendek */}
                        <td className="tags-column" title={tagsArray.join(', ')}>
                            {tagsToShow.map((tag, i) => (
                                <span key={i} className="tag-display-badge">
                                    {tag}
                                </span>
                            ))}
                            {hiddenTagCount > 0 && (
                                <span className="tag-display-badge more-tags-badge">
                                    +{hiddenTagCount} more
                                </span>
                            )}
                        </td>
                        
                        <td>
                            <span className={`status-badge ${game?.review_type?.toLowerCase() || 'unknown'}`}>
                                {game?.review_type || 'Unknown'}
                            </span>
                        </td>
                        
                        <td>{game?.review_no?.toLocaleString() || '-'}</td>
                        <td>{game?.release_date || '-'}</td>
                        {/* FIX KRITIS: Menggunakan parseFloat untuk toFixed() */}
                        <td>${(parseFloat(game?.price) || 0).toFixed(2)}</td> 
                        
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="Edit"
                              onClick={() => handleEdit(game?.id)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              title="Delete"
                              onClick={() => handleDelete(game?.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    )})}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Games;