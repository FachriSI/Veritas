import { useState, useEffect, useCallback } from 'react';
import './Games.css';
import { useNavigate } from 'react-router-dom';

function Games() {
  const navigate = useNavigate();
  // State untuk data games yang akan diisi dari backend
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State untuk Multi-select Filters (MENGGANTI GENRES DENGAN TAGS)
  const [selectedTags, setSelectedTags] = useState([]); // Diubah dari selectedGenres
  const [selectedReviewTypes, setSelectedReviewTypes] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const gamesPerPage = 10;

  // Review Types yang Didefinisikan
  const reviewTypes = ['Positive', 'Mixed', 'Negative'];

  // TODO: Backend - Ganti dengan fetch data dari backend
  const loadGamesFromCSV = useCallback(async () => {
    setLoading(true);
    try {
      // Dummy data untuk template. Sekarang menggunakan kolom 'tags' sebagai kategori utama.
      const dummyData = [
        { 
          id: 1, 
          title: 'The Witcher 3: Wild Hunt', 
          // genre: 'RPG', <-- DIHAPUS
          review_type: 'Positive',
          rating: 9.8, 
          platform: 'PC, PS4, Xbox', 
          release_date: '2015-05-19',
          price: 39.99,
          tags: 'RPG, Open World, Fantasy, Action-Adventure' // Tags ada di CSV mentah
        },
        { 
          id: 2, 
          title: 'Cyberpunk 2077', 
          // genre: 'Action RPG', <-- DIHAPUS
          review_type: 'Mixed',
          rating: 8.5, 
          platform: 'PC, PS5, Xbox', 
          release_date: '2020-12-10',
          price: 59.99,
          tags: 'Sci-Fi, Open World, Action, RPG, Cyberpunk'
        },
        { id: 3, title: 'Red Dead Redemption 2', review_type: 'Positive', rating: 9.7, platform: 'PC, PS4, Xbox', release_date: '2019-12-05', price: 59.99, tags: 'Open World, Western, Adventure, Action' },
        { id: 4, title: 'Baldur\'s Gate 3', review_type: 'Positive', rating: 9.6, platform: 'PC, PS5', release_date: '2023-08-03', price: 69.99, tags: 'RPG, Fantasy, Turn-Based, Strategy' },
        { id: 5, title: 'Halo Infinite', review_type: 'Mixed', rating: 8.0, platform: 'PC, Xbox', release_date: '2021-12-08', price: 59.99, tags: 'FPS, Sci-Fi, Shooter, Multiplayer' },
        { id: 6, title: 'Stardew Valley', review_type: 'Positive', rating: 9.9, platform: 'PC, Switch, Mobile', release_date: '2016-02-26', price: 14.99, tags: 'Farming Sim, Pixel Graphics, Simulation' },
        { id: 7, title: 'Elden Ring', review_type: 'Positive', rating: 9.5, platform: 'PC, PS5, Xbox', release_date: '2022-02-25', price: 59.99, tags: 'Souls-like, Open World, Fantasy, Action, Difficult' },
        { id: 8, title: 'Among Us', review_type: 'Negative', rating: 7.5, platform: 'PC, Mobile, Switch', release_date: '2018-11-16', price: 4.99, tags: 'Multiplayer, Social Deduction, Party Game' },
        { id: 9, title: 'FIFA 24', review_type: 'Negative', rating: 7.0, platform: 'PC, PS5, Xbox', release_date: '2023-09-29', price: 69.99, tags: 'Soccer, Simulation, Sports' },
        { id: 10, title: 'Resident Evil 4', review_type: 'Positive', rating: 9.0, platform: 'PC, PS5, Xbox', release_date: '2023-03-24', price: 59.99, tags: 'Horror, Action, Remake, Survival' },
      ];

      setGames(dummyData);
      setFilteredGames(dummyData);
    } catch (error) {
      console.error('Error loading games from CSV:', error);
      // Ganti alert dengan console.log/custom modal
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGamesFromCSV();
  }, [loadGamesFromCSV]);

  // Semua TAGS unik dari semua game (Digunakan untuk tombol filter)
  const allAvailableTags = Array.from(
    new Set(games.flatMap(game => 
      game.tags.split(',').map(tag => tag.trim())
    ))
  ).sort();

  // Logic Toggle Multi-Select Filters
  const toggleFilter = (filterName, value) => {
    if (filterName === 'tag') { // Diubah dari 'genre' menjadi 'tag'
      setSelectedTags(prev => 
        prev.includes(value) ? prev.filter(t => t !== value) : [...prev, value]
      );
    } else if (filterName === 'reviewType') {
      setSelectedReviewTypes(prev => 
        prev.includes(value) ? prev.filter(r => r !== value) : [...prev, value]
      );
    }
  };

  // Logic Filtering Utama
  useEffect(() => {
    let filtered = games;

    // 1. Filter by TAGS (Multi-Select)
    if (selectedTags.length > 0) {
      filtered = filtered.filter(game => {
        // Cek apakah game memiliki SEMUA tag yang dipilih (AND condition)
        const gameTags = game.tags.split(',').map(tag => tag.trim());
        return selectedTags.every(selectedTag => gameTags.includes(selectedTag));
      });
    }

    // 2. Filter by Review Types (Multi-Select)
    if (selectedReviewTypes.length > 0) {
      filtered = filtered.filter(game => selectedReviewTypes.includes(game.review_type));
    }
    
    // 3. Filter by Search Term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.developer?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGames(filtered);
    // Reset ke halaman 1 setiap kali filter berubah
    setCurrentPage(1); 
  }, [searchTerm, selectedTags, selectedReviewTypes, games]); // Diubah dari selectedGenres menjadi selectedTags

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  // CRUD Handlers (Ganti alert() dengan console.log)
  const handleView = (gameId) => {
    console.log(`[CRUD] View game ID: ${gameId}`);
    // TODO: Implementasi navigasi ke detail game
  };

  const handleEdit = (gameId) => {
    console.log(`[CRUD] Edit game ID: ${gameId}`);
    // TODO: Implementasi form edit
  };

  const handleDelete = (gameId) => {
    console.log(`[CRUD] Delete game ID: ${gameId}`);
    // TODO: Implementasi API DELETE dan refresh data
  };

  const handleExportCSV = () => {
    // TODO: Backend - Implement CSV export functionality
    console.log('Exporting filtered data to CSV...');
  };
  
  const handleAddNewGame = () => {
    navigate('/games/add');
  };

  return (
    <div className="games">
      <div className="games-header">
        <div>
          <h1>Games Database</h1>
          <p>Browse and manage games from Steam dataset ({filteredGames.length} games)</p>
        </div>
        <div className="games-actions">
          <input
            type="text"
            placeholder="Search games..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        
        {/* Filter TAGS (MENGGANTIKAN GENRE) */}
        <div className="filter-group">
            <p className="filter-label">Tags:</p>
            <div className="filter-buttons tag-filters">
                {allAvailableTags.map((tag) => (
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
          {loading ? (
            <div className="loading-state">
              <p>Loading games from CSV...</p>
            </div>
          ) : currentGames.length === 0 ? (
            <div className="empty-state">
              <p>No games found. Please check your dataset or search criteria.</p>
            </div>
          ) : (
            <>
              <div className="table-container">
                <table className="games-table">
                  <thead>
                    <tr>
                      <th>Game Title</th>
                      <th>Tags</th> {/* Diubah dari Genre */}
                      <th>Review Type</th> 
                      <th>Rating</th>
                      <th>Platform</th>
                      <th>Release Date</th>
                      <th>Price</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentGames.map((game) => (
                      <tr key={game.id}>
                        <td className="game-title">{game.title}</td>
                        {/* Menampilkan Tags dengan Tampilan Khusus (Badge/Tag) */}
                        <td className="tags-column">
                            {game.tags.split(',').map((tag, i) => (
                                <span key={i} className="tag-display-badge">
                                    {tag.trim()}
                                </span>
                            ))}
                        </td>
                        <td>
                            <span className={`status-badge ${game.review_type.toLowerCase()}`}>{game.review_type}</span>
                        </td>
                        <td>
                          <span className="rating">⭐ {game.rating}</span>
                        </td>
                        <td>{game.platform}</td>
                        <td>{new Date(game.release_date).toLocaleDateString()}</td>
                        <td>${game.price}</td>
                        <td>
                          <div className="action-buttons">
                            <button
                              className="btn-icon"
                              title="View"
                              onClick={() => handleView(game.id)}
                            >
                              👁️
                            </button>
                            <button
                              className="btn-icon"
                              title="Edit"
                              onClick={() => handleEdit(game.id)}
                            >
                              ✏️
                            </button>
                            <button
                              className="btn-icon"
                              title="Delete"
                              onClick={() => handleDelete(game.id)}
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="pagination-info">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
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