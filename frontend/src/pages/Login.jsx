import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form)
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="auth-wrapper">
      <form className="auth-card glass" onSubmit={handleSubmit}>
        <div className="auth-header">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to manage your money clearly.</p>
        </div>
        {error && <p className="form-error">{error}</p>}
        <label className="form-group">
          <span className="form-label">Email</span>
          <input className="form-control" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required />
        </label>
        <label className="form-group">
          <span className="form-label">Password</span>
          <input className="form-control" type="password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required />
        </label>
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="auth-footer">
          New here? <Link className="auth-link" to="/register">Create account</Link>
        </p>
      </form>
    </main>
  )
}
