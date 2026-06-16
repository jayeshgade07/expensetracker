import { useState } from 'react'

const initialForm = {
  title: '',
  amount: '',
  category: '',
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  description: '',
}

export default function TransactionModal({ transaction, onClose, onSubmit }) {
  const [form, setForm] = useState(() => (
    transaction
      ? {
          title: transaction.title || '',
          amount: transaction.amount || '',
          category: transaction.category || '',
          type: transaction.type || 'expense',
          date: transaction.date ? transaction.date.slice(0, 10) : initialForm.date,
          description: transaction.description || '',
        }
      : initialForm
  ))
  const [error, setError] = useState('')

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')

    if (!form.title.trim() || !form.amount || !form.category.trim()) {
      setError('Title, amount and category are required.')
      return
    }

    await onSubmit({ ...form, amount: Number(form.amount) })
  }

  return (
    <div className="modal-overlay">
      <form className="modal-content glass" onSubmit={handleSubmit}>
        <button className="modal-close" type="button" onClick={onClose} aria-label="Close">x</button>
        <h2>{transaction ? 'Edit transaction' : 'Add transaction'}</h2>
        {error && <p className="form-error">{error}</p>}
        <div className="form-grid">
          <label className="form-group">
            <span className="form-label">Title</span>
            <input className="form-control" name="title" value={form.title} onChange={handleChange} />
          </label>
          <label className="form-group">
            <span className="form-label">Amount</span>
            <input className="form-control" name="amount" type="number" min="0" step="0.01" value={form.amount} onChange={handleChange} />
          </label>
          <label className="form-group">
            <span className="form-label">Type</span>
            <select className="form-control" name="type" value={form.type} onChange={handleChange}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </label>
          <label className="form-group">
            <span className="form-label">Category</span>
            <input className="form-control" name="category" value={form.category} onChange={handleChange} />
          </label>
          <label className="form-group">
            <span className="form-label">Date</span>
            <input className="form-control" name="date" type="date" value={form.date} onChange={handleChange} />
          </label>
          <label className="form-group form-full">
            <span className="form-label">Description</span>
            <textarea className="form-control" name="description" rows="3" value={form.description} onChange={handleChange} />
          </label>
        </div>
        <div className="form-actions">
          <button className="btn btn-secondary" type="button" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" type="submit">Save</button>
        </div>
      </form>
    </div>
  )
}
