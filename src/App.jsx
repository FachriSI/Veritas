import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Dataset from './pages/Dataset'
import Games from './pages/Games'

function App() {
  return (
    <Router>
      <div className="admin-layout">
        <Sidebar />
        <div className="main-content">
          <Navbar />
          <div className="content-wrapper">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/dataset" element={<Dataset />} />
              <Route path="/games" element={<Games />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  )
}

export default App
