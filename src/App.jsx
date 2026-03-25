import { Routes, Route, NavLink } from 'react-router-dom'
import RangeEstimator from './pages/RangeEstimator.jsx'
import './App.css'

function App() {
  return (
    <div className="app-layout">
      <nav className="sidebar">
        <div className="sidebar-header">
          <h1 className="sidebar-title">LoRaWAN Planner</h1>
        </div>
        <ul className="nav-links">
          <li>
            <NavLink
              to="/"
              className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
              end
            >
              Range Estimator
            </NavLink>
          </li>
          {/* Future sections go here */}
        </ul>
      </nav>
      <main className="main-content">
        <Routes>
          <Route path="/" element={<RangeEstimator />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
