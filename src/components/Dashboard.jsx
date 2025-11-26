import './Dashboard.css';

function Dashboard() {
  const stats = [
    { id: 1, title: 'Total Users', value: '2,543', change: '+12%', icon: '👥', color: '#667eea' },
    { id: 2, title: 'Revenue', value: '$45,231', change: '+8%', icon: '💰', color: '#f59e0b' },
    { id: 3, title: 'Orders', value: '1,234', change: '+23%', icon: '🛒', color: '#10b981' },
    { id: 4, title: 'Products', value: '567', change: '+5%', icon: '📦', color: '#ef4444' },
  ];

  const recentOrders = [
    { id: '#12345', customer: 'John Doe', amount: '$234', status: 'Completed' },
    { id: '#12346', customer: 'Jane Smith', amount: '$567', status: 'Pending' },
    { id: '#12347', customer: 'Bob Johnson', amount: '$123', status: 'Processing' },
    { id: '#12348', customer: 'Alice Brown', amount: '$890', status: 'Completed' },
    { id: '#12349', customer: 'Charlie Wilson', amount: '$456', status: 'Pending' },
  ];

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Welcome back! Here's what's happening today.</p>
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
            <h3>Recent Orders</h3>
            <button className="btn-secondary">View All</button>
          </div>
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{order.customer}</td>
                    <td>{order.amount}</td>
                    <td>
                      <span className={`status-badge ${order.status.toLowerCase()}`}>
                        {order.status}
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
              <span>➕</span>
              Add New User
            </button>
            <button className="action-btn">
              <span>📦</span>
              Add Product
            </button>
            <button className="action-btn">
              <span>📊</span>
              Generate Report
            </button>
            <button className="action-btn">
              <span>⚙️</span>
              Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
