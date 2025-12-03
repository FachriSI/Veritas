import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dataset from './pages/Dataset'
import Games from './pages/Games'
import Dashboard from './components/Dashboard' // Import Dashboard untuk rute baru
import AddGame from './pages/AddGame.jsx';

function App() {
  return (
    <Router>
      <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="content-wrapper">
           <Routes>
              {/* Rute Utama */}
              <Route path="/" element={<Home />} /> 
              {/* Rute CRUD Data */}
              <Route path="/dataset" element={<Dataset />} />
              {/* Rute Tampilan Data & Filter */}
              <Route path="/games" element={<Games />} />
              {/* Rute Analisis & Visualisasi BARU */}
              <Route path="/dashboard" element={<Dashboard />} /> 
              <Route path="/games/add" element={<AddGame />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App