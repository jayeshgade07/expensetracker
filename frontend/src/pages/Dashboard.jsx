import { useEffect, useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { apiRequest } from '../api/client'
import { useAuth } from '../context/useAuth'

const chartColors = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#0ea5e9', '#a855f7']

export default function Dashboard() {
  const { token, user, updateProfile } = useAuth()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [budget, setBudget] = useState(user?.monthlyBudget || 0)
  const [error, setError] = useState('')

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [statsData, transactionData] = await Promise.all([
          apiRequest('/transactions/stats', { token }),
          apiRequest('/transactions', { token, query: { limit: 5 } }),
        ])
        setStats(statsData)
        setRecent(transactionData.transactions)
      } catch (err) {
        setError(err.message)
      }
    }
    loadDashboard()
  }, [token])

  const currency = user?.currency || 'USD'
  const summary = stats?.summary || {}
  const expense = summary.totalExpenses || 0
  const budgetPercent = budget > 0 ? Math.min(Math.round((expense / budget) * 100), 100) : 0

  const insight = useMemo(() => {
    if (!stats) return 'Add transactions to unlock useful spending insights.'
    if (budget > 0 && expense > budget) return 'You are over budget. Review your largest categories first.'
    if (stats.categoryStats?.length) return `${stats.categoryStats[0].category} is your largest expense category.`
    return 'Your balance looks steady. Keep logging transactions regularly.'
  }, [budget, expense, stats])

  const saveBudget = async () => {
    try {
      await updateProfile({ monthlyBudget: Number(budget) })
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Overview</p>
          <h1>Dashboard</h1>
        </div>
      </div>

      {error && <p className="form-error">{error}</p>}

      <section className="metrics-grid">
        <Metric title="Balance" value={summary.balance || 0} currency={currency} />
        <Metric title="Income" value={summary.totalIncome || 0} currency={currency} type="income" />
        <Metric title="Expenses" value={expense} currency={currency} type="expense" />
      </section>

      <section className="budget-widget glass">
        <div className="budget-title-row">
          <h2>Budget progress</h2>
          <div className="inline-controls">
            <input className="form-control budget-input" type="number" min="0" value={budget} onChange={(event) => setBudget(event.target.value)} />
            <button className="btn btn-secondary" type="button" onClick={saveBudget}>Save</button>
          </div>
        </div>
        <div className="budget-progress-header">
          <span>{formatMoney(expense, currency)} spent</span>
          <span>{budgetPercent}%</span>
        </div>
        <div className="budget-progress-bar">
          <div className="budget-progress-fill" style={{ width: `${budgetPercent}%`, background: budgetPercent > 85 ? 'var(--color-danger)' : 'var(--color-success)' }} />
        </div>
      </section>

      <section className="insight-card glass">
        <div className="insight-icon">i</div>
        <div>
          <div className="insight-title">Smart insight</div>
          <p className="insight-text">{insight}</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="chart-card glass">
          <h2>Monthly trend</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={stats?.monthlyTrends || []}>
              <CartesianGrid stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2} />
              <Line type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card glass">
          <h2>Categories</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={stats?.categoryStats || []} dataKey="amount" nameKey="category" outerRadius={90}>
                {(stats?.categoryStats || []).map((item, index) => (
                  <Cell key={item.category} fill={chartColors[index % chartColors.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="chart-card glass">
        <h2>Recent activity</h2>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={recent}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis dataKey="title" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Bar dataKey="amount" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </section>
    </>
  )
}

function Metric({ title, value, currency, type = '' }) {
  return (
    <article className={`metric-card glass ${type}`}>
      <div className="metric-header">
        <span>{title}</span>
      </div>
      <div className="metric-value">{formatMoney(value, currency)}</div>
      <p className="metric-desc">Calculated from saved transactions.</p>
    </article>
  )
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(value)
}
