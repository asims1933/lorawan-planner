import { useState } from 'react'
import './Login.css'

const PASSWORD = 'SPEKTRA-Edge'

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 10s3.5-6 9-6 9 6 9 6-3.5 6-9 6-9-6-9-6z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  ) : (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l14 14M8.5 8.6A2.5 2.5 0 0 0 12.4 12.4" />
      <path d="M6.3 5.3C4.3 6.5 2.7 8.5 1 10c1.5 2 4.5 6 9 6a9 9 0 0 0 3.7-.8M10 4c4.5 0 7.5 4 9 6a14 14 0 0 1-2.3 3" />
    </svg>
  )
}

export default function Login({ onLogin }) {
  const [value, setValue] = useState('')
  const [error, setError] = useState(false)
  const [visible, setVisible] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (value === PASSWORD) {
      onLogin()
    } else {
      setError(true)
      setValue('')
    }
  }

  return (
    <div className="login-shell">
      <div className="login-card">
        <p className="login-eyebrow">Local planning tool</p>
        <h1 className="login-title">LoRaWAN Range Estimator</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-input-wrap">
            <input
              className={`login-input${error ? ' login-input-error' : ''}`}
              type={visible ? 'text' : 'password'}
              placeholder="Password"
              value={value}
              onChange={e => { setValue(e.target.value); setError(false) }}
              autoFocus
            />
            <button
              type="button"
              className="login-eye"
              onClick={() => setVisible(v => !v)}
              tabIndex={-1}
              aria-label={visible ? 'Hide password' : 'Show password'}
            >
              <EyeIcon open={visible} />
            </button>
          </div>
          {error && <p className="login-error">Incorrect password. Please try again.</p>}
          <button className="login-btn" type="submit">Log in</button>
        </form>
      </div>
    </div>
  )
}
