import { useState } from 'react'
import { Routes, Route, NavLink } from 'react-router-dom'
import RangeEstimator from './pages/RangeEstimator.jsx'
import './App.css'

const NAV_ITEMS = [
  {
    to: '/', end: true, label: 'Range Estimator',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <circle cx="10" cy="13" r="2" />
        <path d="M6.5 9.5a5 5 0 0 1 7 0" />
        <path d="M3.5 6.5a9.5 9.5 0 0 1 13 0" />
      </svg>
    ),
  },
  {
    to: '/link-budget', label: 'Link Budget', placeholder: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="12" width="3" height="5" rx="0.5" />
        <rect x="8.5" y="7.5" width="3" height="9.5" rx="0.5" />
        <rect x="14" y="3" width="3" height="14" rx="0.5" />
      </svg>
    ),
  },
  {
    to: '/gateway-placement', label: 'Gateway Placement', placeholder: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 2a5 5 0 0 1 5 5c0 4.5-5 11-5 11S5 11.5 5 7a5 5 0 0 1 5-5z" />
        <circle cx="10" cy="7" r="1.8" />
      </svg>
    ),
  },
  {
    to: '/coverage-map', label: 'Coverage Map', placeholder: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="10,2 17,5.5 17,14.5 10,18 3,14.5 3,5.5" />
        <polygon points="10,6 14,8 14,12 10,14 6,12 6,8" />
      </svg>
    ),
  },
  {
    to: '/fresnel', label: 'Fresnel Zone', placeholder: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <ellipse cx="10" cy="10" rx="8" ry="4" />
        <circle cx="2" cy="10" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="18" cy="10" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/battery', label: 'Battery Estimator', placeholder: true,
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1.5" y="6" width="14" height="8" rx="1.5" />
        <path d="M15.5 9v2h3V9h-3z" />
        <rect x="3.5" y="8" width="6" height="4" rx="0.5" fill="currentColor" stroke="none" opacity="0.6" />
      </svg>
    ),
  },
]

export default function App() {
  const [collapsed, setCollapsed] = useState(true)

  return (
    <div className="app-layout">
      <nav className={`sidebar${collapsed ? ' sidebar-collapsed' : ''}`}>
        <div className="sidebar-header">
          <span className="sidebar-title">LoRaWAN Planner</span>
          <button
            className="sidebar-toggle"
            onClick={() => setCollapsed(c => !c)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {collapsed
                ? <path d="M7 4l6 6-6 6" />
                : <path d="M13 4l-6 6 6 6" />}
            </svg>
          </button>
        </div>

        <ul className="nav-links">
          {NAV_ITEMS.map(item =>
            item.placeholder ? (
              <li key={item.to}>
                <span className="nav-link nav-placeholder" title={item.label}>
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </span>
              </li>
            ) : (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  end={item.end}
                  title={item.label}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.label}</span>
                </NavLink>
              </li>
            )
          )}
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
