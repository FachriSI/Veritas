import './Home.css';

function Home() {
  const stats = [
    { id: 1, title: 'Total Games', value: '2,543', change: '+12%', icon: '🎮', color: '#667eea' },
    { id: 2, title: 'Total Users', value: '45,231', change: '+8%', icon: '👥', color: '#f59e0b' },
    { id: 3, title: 'Active Players', value: '1,234', change: '+23%', icon: '🎯', color: '#10b981' },
    { id: 4, title: 'Datasets', value: '567', change: '+5%', icon: '📊', color: '#ef4444' },
  ];

  const recentActivity = [
    { id: 1, game: 'The Witcher 3', action: 'Added to dataset', time: '2 hours ago', status: 'Completed' },
    { id: 2, game: 'Cyberpunk 2077', action: 'Updated metadata', time: '5 hours ago', status: 'Pending' },
    { id: 3, game: 'Red Dead Redemption 2', action: 'Review submitted', time: '1 day ago', status: 'Processing' },
    { id: 4, game: 'GTA V', action: 'Data verified', time: '2 days ago', status: 'Completed' },
    { id: 5, game: 'Elden Ring', action: 'Added to dataset', time: '3 days ago', status: 'Completed' },
  ];

  return (
    <div className="home">
      <div className="home-header">
        <h1>Welcome to Veritas Dashboard</h1>
        <p>Monitor and manage your game datasets efficiently</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat) => (
          <div key={stat.id} className="stat-card" style={{ borderLeftColor: stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-content">
              <p className="stat-title">{stat.title}</p>
              <h3 className="stat-value">{stat.value}</h3>
              <span className="stat-change" style={{ color: stat.color }}>{stat.change}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="content-grid">
        <div className="card">
          <div className="card-header">
            <h3>Recent Activity</h3>
            <button className="btn-secondary">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Game</th>
                  <th>Action</th>
                  <th>Time</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.game}</td>
                    <td>{activity.action}</td>
                    <td>{activity.time}</td>
                    <td>
                      <span className={`status-badge ${activity.status.toLowerCase()}`}>
                        {activity.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="quick-actions">
            <button className="action-btn">
              <span>📁</span>
              View Datasets
            </button>
            <button className="action-btn">
              <span>🎮</span>
              Browse Games
            </button>
            <button className="action-btn">
              <span>➕</span>
              Add New Game
            </button>
            <button className="action-btn">
              <span>📊</span>
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
