import { useCallback, useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import TransactionModal from '../components/TransactionModal'
import { useAuth } from '../context/useAuth'

const emptyPagination = { page: 1, totalPages: 1, totalItems: 0 }

export default function Transactions() {
  const { token, user } = useAuth()
  const [transactions, setTransactions] = useState([])
  const [pagination, setPagination] = useState(emptyPagination)
  const [filters, setFilters] = useState({ search: '', type: '', category: '', page: 1, limit: 8 })
  const [modalTransaction, setModalTransaction] = useState(null)
  const [isModalOpen, setModalOpen] = useState(false)
  const [error, setError] = useState('')

  const loadTransactions = useCallback(async () => {
    try {
      setError('')
      const data = await apiRequest('/transactions', { token, query: filters })
      setTransactions(data.transactions)
      setPagination(data.pagination)
    } catch (err) {
      setError(err.message)
    }
  }, [filters, token])

  useEffect(() => {
    async function load() {
      await loadTransactions()
    }
    load()
  }, [loadTransactions])

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  const openCreate = () => {
    setModalTransaction(null)
    setModalOpen(true)
  }

  const openEdit = (transaction) => {
    setModalTransaction(transaction)
    setModalOpen(true)
  }

  const saveTransaction = async (payload) => {
    try {
      if (modalTransaction) {
        await apiRequest(`/transactions/${modalTransaction._id}`, { method: 'PUT', token, body: payload })
      } else {
        await apiRequest('/transactions', { method: 'POST', token, body: payload })
      }
      setModalOpen(false)
      await loadTransactions()
    } catch (err) {
      setError(err.message)
    }
  }

  const deleteTransaction = async (id) => {
    try {
      await apiRequest(`/transactions/${id}`, { method: 'DELETE', token })
      await loadTransactions()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Manage</p>
          <h1>Transactions</h1>
        </div>
        <button className="btn btn-primary" type="button" onClick={openCreate}>Add transaction</button>
      </div>

      {error && <p className="form-error">{error}</p>}

      <section className="filter-bar glass">
        <label className="filter-item">
          <span className="form-label">Search</span>
          <input className="form-control" value={filters.search} onChange={(event) => updateFilter('search', event.target.value)} placeholder="Title or notes" />
        </label>
        <label className="filter-item">
          <span className="form-label">Type</span>
          <select className="form-control" value={filters.type} onChange={(event) => updateFilter('type', event.target.value)}>
            <option value="">All</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
        </label>
        <label className="filter-item">
          <span className="form-label">Category</span>
          <input className="form-control" value={filters.category} onChange={(event) => updateFilter('category', event.target.value)} />
        </label>
      </section>

      <section className="glass table-card">
        <div className="transactions-table-container">
          <table className="transactions-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Type</th>
                <th>Date</th>
                <th>Amount</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id}>
                  <td>{transaction.title}</td>
                  <td>{transaction.category}</td>
                  <td><span className={`badge badge-${transaction.type}`}>{transaction.type}</span></td>
                  <td>{new Date(transaction.date).toLocaleDateString()}</td>
                  <td>{formatMoney(transaction.amount, user?.currency || 'USD')}</td>
                  <td className="row-actions">
                    <button className="btn btn-secondary btn-small" type="button" onClick={() => openEdit(transaction)}>Edit</button>
                    <button className="btn btn-danger btn-small" type="button" onClick={() => deleteTransaction(transaction._id)}>Delete</button>
                  </td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan="6" className="empty-state">No transactions found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination-row">
          <span className="pagination-info">{pagination.totalItems} records</span>
          <div className="pagination-controls">
            <button className="btn btn-secondary btn-small" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} type="button">Prev</button>
            <span className="pagination-info">Page {pagination.page} of {pagination.totalPages || 1}</span>
            <button className="btn btn-secondary btn-small" disabled={filters.page >= pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} type="button">Next</button>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <TransactionModal
          transaction={modalTransaction}
          onClose={() => setModalOpen(false)}
          onSubmit={saveTransaction}
        />
      )}
    </>
  )
}

function formatMoney(value, currency) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency }).format(value)
}
