import { useState, useEffect } from 'react';
import './Games.css';

function Games() {
  // State untuk data games yang akan diisi dari CSV
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const gamesPerPage = 10;

  // TODO: Backend - Ganti dengan fetch data dari CSV
  // Fungsi ini akan memanggil API backend untuk load CSV
  useEffect(() => {
    loadGamesFromCSV();
  }, []);

  const loadGamesFromCSV = async () => {
    setLoading(true);
    try {
      // TODO: Backend Developer - Implement CSV loading
      // Example endpoint: await fetch('/api/games/load-csv')
      // Expected CSV columns: id, title, genre, rating, platform, release_date, developer, publisher, price, tags
      
      // Dummy data untuk template - HAPUS ini dan ganti dengan data dari backend
      const dummyData = [
        { 
          id: 1, 
          title: 'The Witcher 3: Wild Hunt', 
          genre: 'RPG', 
          rating: 9.8, 
          platform: 'PC, PS4, Xbox', 
          release_date: '2015-05-19',
          developer: 'CD Projekt Red',
          publisher: 'CD Projekt',
          price: 39.99,
          tags: 'RPG, Open World, Fantasy'
        },
        { 
          id: 2, 
          title: 'Cyberpunk 2077', 
          genre: 'Action RPG', 
          rating: 8.5, 
          platform: 'PC, PS5, Xbox', 
          release_date: '2020-12-10',
          developer: 'CD Projekt Red',
          publisher: 'CD Projekt',
          price: 59.99,
          tags: 'RPG, Sci-Fi, Open World'
        },
        // Add more dummy data or remove and fetch from backend
      ];

      setGames(dummyData);
      setFilteredGames(dummyData);
    } catch (error) {
      console.error('Error loading games from CSV:', error);
      // TODO: Backend - Handle error (show notification to user)
    } finally {
      setLoading(false);
    }
  };

  // Filter berdasarkan genre
  const genres = ['all', ...new Set(games.map(game => game.genre))];

  // Handle search
  useEffect(() => {
    let filtered = games;

    // Filter by genre
    if (selectedGenre !== 'all') {
      filtered = filtered.filter(game => game.genre === selectedGenre);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.developer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.tags?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredGames(filtered);
    setCurrentPage(1);
  }, [searchTerm, selectedGenre, games]);

  // Pagination
  const indexOfLastGame = currentPage * gamesPerPage;
  const indexOfFirstGame = indexOfLastGame - gamesPerPage;
  const currentGames = filteredGames.slice(indexOfFirstGame, indexOfLastGame);
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);

  // TODO: Backend - Implement these functions
  const handleView = (gameId) => {
    console.log('View game:', gameId);
    // TODO: Navigate to game detail page or show modal
  };

  const handleEdit = (gameId) => {
    console.log('Edit game:', gameId);
    // TODO: Open edit form or navigate to edit page
  };

  const handleDelete = (gameId) => {
    console.log('Delete game:', gameId);
    // TODO: Show confirmation and call API to delete
  };

  const handleExportCSV = () => {
    // TODO: Backend - Implement CSV export functionality
    console.log('Exporting filtered data to CSV...');
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
          <button className="btn-primary" onClick={handleExportCSV}>
            📥 Export CSV
          </button>
        </div>
      </div>

      <div className="games-filters">
        {genres.map((genre) => (
          <button
            key={genre}
            className={`filter-btn ${selectedGenre === genre ? 'active' : ''}`}
            onClick={() => setSelectedGenre(genre)}
          >
            {genre === 'all' ? 'All Games' : genre}
          </button>
        ))}
      </div>

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
                      <th>Genre</th>
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
                        <td>{game.genre}</td>
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

      {/* Backend Integration Guide */}
      <div style={{ display: 'none' }}>
        {/* 
          BACKEND INTEGRATION GUIDE:
          
          1. CSV Loading Endpoint:
             - Create endpoint: GET /api/games/load-csv
             - Response format: Array of game objects
             - Expected fields: id, title, genre, rating, platform, release_date, developer, publisher, price, tags
          
          2. CSV Export Endpoint:
             - Create endpoint: GET /api/games/export-csv?genre={genre}&search={searchTerm}
             - Return filtered CSV file
          
          3. CRUD Operations:
             - View: GET /api/games/{id}
             - Edit: PUT /api/games/{id}
             - Delete: DELETE /api/games/{id}
          
          4. CSV File Location:
             - Store CSV in: /data/steam_games.csv
             - Or use configurable path from environment variable
          
          5. Error Handling:
             - Return proper error messages
             - Handle missing CSV file
             - Validate CSV format
        */}
      </div>
    </div>
  );
}

export default Games;
