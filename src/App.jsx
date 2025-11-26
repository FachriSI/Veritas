import './App.css'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'

function App() {
  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Navbar />
        <div className="content-wrapper">
          <Dashboard />
        </div>
      </div>
    </div>
  )
}

export default App
