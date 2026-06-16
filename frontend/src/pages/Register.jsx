import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'

const avatars = ['A', 'B', 'C', 'D', 'E', 'F']
const currencies = ['USD', 'EUR', 'INR', 'GBP', 'CAD', 'AUD']

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    currency: 'INR',
    avatar: 'A',
    monthlyBudget: 0,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const update = (name, value) => setForm((current) => ({ ...current, [name]: value }))

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await register({ ...form, monthlyBudget: Number(form.monthlyBudget) })
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
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Choose your currency and monthly budget.</p>
        </div>
        {error && <p className="form-error">{error}</p>}
        <label className="form-group">
          <span className="form-label">Name</span>
          <input className="form-control" value={form.name} onChange={(event) => update('name', event.target.value)} required />
        </label>
        <label className="form-group">
          <span className="form-label">Email</span>
          <input className="form-control" type="email" value={form.email} onChange={(event) => update('email', event.target.value)} required />
        </label>
        <label className="form-group">
          <span className="form-label">Password</span>
          <input className="form-control" type="password" value={form.password} onChange={(event) => update('password', event.target.value)} required />
        </label>
        <div className="form-grid">
          <label className="form-group">
            <span className="form-label">Currency</span>
            <select className="form-control" value={form.currency} onChange={(event) => update('currency', event.target.value)}>
              {currencies.map((currency) => <option key={currency}>{currency}</option>)}
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Monthly budget</span>
            <input className="form-control" type="number" min="0" value={form.monthlyBudget} onChange={(event) => update('monthlyBudget', event.target.value)} />
          </label>
        </div>
        <div className="form-group">
          <span className="form-label">Avatar</span>
          <div className="avatar-grid">
            {avatars.map((avatar) => (
              <button key={avatar} className={`avatar-option ${form.avatar === avatar ? 'selected' : ''}`} type="button" onClick={() => update('avatar', avatar)}>
                {avatar}
              </button>
            ))}
          </div>
        </div>
        <button className="btn btn-primary btn-block" disabled={loading} type="submit">
          {loading ? 'Creating...' : 'Create account'}
        </button>
        <p className="auth-footer">
          Already registered? <Link className="auth-link" to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  )
}
