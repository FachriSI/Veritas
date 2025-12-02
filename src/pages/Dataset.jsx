import './Dataset.css';

function Dataset() {
  // Data ini nantinya akan di-fetch dari backend
  const steamDataset = {
    name: "Steam Games Dataset",
    description: "Complete collection of Steam games with ratings, genres, and metadata",
    totalGames: 2543,
    lastUpdated: "2025-12-02",
    size: "45.2 MB",
    format: "CSV",
    columns: [
      "Game ID", "Title", "Genre", "Rating", "Release Date", 
      "Developer", "Publisher", "Platform", "Price", "Tags"
    ]
  };

  return (
    <div className="dataset">
      <div className="dataset-header">
        <h1>Steam Dataset</h1>
        <p>View and manage Steam games dataset</p>
      </div>

      <div className="dataset-content">
        <div className="dataset-main-card">
          <div className="dataset-hero">
            <div className="dataset-icon-large">🎮</div>
            <div className="dataset-info">
              <h2>{steamDataset.name}</h2>
              <p>{steamDataset.description}</p>
            </div>
          </div>

          <div className="dataset-stats-grid">
            <div className="stat-item">
              <span className="stat-icon">📊</span>
              <div>
                <p className="stat-label">Total Games</p>
                <h3 className="stat-value">{steamDataset.totalGames.toLocaleString()}</h3>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📅</span>
              <div>
                <p className="stat-label">Last Updated</p>
                <h3 className="stat-value">{steamDataset.lastUpdated}</h3>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">💾</span>
              <div>
                <p className="stat-label">File Size</p>
                <h3 className="stat-value">{steamDataset.size}</h3>
              </div>
            </div>
            <div className="stat-item">
              <span className="stat-icon">📄</span>
              <div>
                <p className="stat-label">Format</p>
                <h3 className="stat-value">{steamDataset.format}</h3>
              </div>
            </div>
          </div>

          <div className="dataset-columns">
            <h3>Dataset Columns</h3>
            <div className="columns-grid">
              {steamDataset.columns.map((column, index) => (
                <div key={index} className="column-tag">
                  {column}
                </div>
              ))}
            </div>
          </div>

          <div className="dataset-actions">
            <button className="btn-primary">
              <span>👁️</span>
              View Games
            </button>
            <button className="btn-secondary">
              <span>📥</span>
              Download CSV
            </button>
            <button className="btn-secondary">
              <span>🔄</span>
              Refresh Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dataset;
