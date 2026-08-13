import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wallet,
  Plus,
  ArrowUpRight,
  TrendingDown,
  PieChart,
  Calendar,
  CreditCard,
  Search,
  Filter,
  Trash2,
  X,
  Edit2,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
  Utensils,
  Home,
  BookOpen,
  Bus,
  Tag
} from 'lucide-react'
import PageTransition from '../../components/ui/PageTransition'
import GlassCard from '../../components/ui/GlassCard'
import AnimatedProgress from '../../components/ui/AnimatedProgress'
import { useAuth } from '../../context/AuthContext'

const CATEGORIES = [
  { id: 'hostel', label: 'Hostel & Rent', icon: Home, color: 'text-purple-400 bg-purple-500/15 border-purple-500/30' },
  { id: 'mess', label: 'Mess & Food', icon: Utensils, color: 'text-amber-400 bg-amber-500/15 border-amber-500/30' },
  { id: 'academics', label: 'Books & Academics', icon: BookOpen, color: 'text-blue-400 bg-blue-500/15 border-blue-500/30' },
  { id: 'personal', label: 'Personal & Fun', icon: ShoppingBag, color: 'text-pink-400 bg-pink-500/15 border-pink-500/30' },
  { id: 'transport', label: 'Travel & Transport', icon: Bus, color: 'text-cyan-400 bg-cyan-500/15 border-cyan-500/30' },
  { id: 'misc', label: 'Miscellaneous', icon: Tag, color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/30' }
]

export default function ExpenseTrackerPage() {
  const { user } = useAuth()
  const storageKey = user?.email || 'guest'

  // Monthly Budget limit state
  const [monthlyBudget, setMonthlyBudget] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoMonthlyBudget:${storageKey}`)
      return saved ? parseInt(saved, 10) : 6000
    } catch { return 6000 }
  })
  const [budgetModalOpen, setBudgetModalOpen] = useState(false)
  const [tempBudgetInput, setTempBudgetInput] = useState(`${monthlyBudget}`)

  // Expenses list state — Defaults to empty list [] so initial spent starts at ₹0!
  const [expenses, setExpenses] = useState(() => {
    try {
      const saved = localStorage.getItem(`univoExpenses:${storageKey}`)
      if (saved !== null) return JSON.parse(saved)
      return []
    } catch { return [] }
  })

  // Add Expense Form state
  const [addModalOpen, setAddModalOpen] = useState(false)
  const [form, setForm] = useState({
    title: '',
    amount: '',
    category: 'mess',
    paymentMethod: 'UPI',
    date: new Date().toISOString().slice(0, 10)
  })

  // Filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  // Calculated totals
  const totalSpent = useMemo(() => {
    return expenses.reduce((sum, item) => sum + (Number(item.amount) || 0), 0)
  }, [expenses])

  const remainingBudget = useMemo(() => {
    return monthlyBudget - totalSpent
  }, [monthlyBudget, totalSpent])

  const spentPercentage = useMemo(() => {
    if (monthlyBudget <= 0) return 0
    return Math.min(100, Math.round((totalSpent / monthlyBudget) * 100))
  }, [totalSpent, monthlyBudget])

  const categoryTotals = useMemo(() => {
    const map = {}
    CATEGORIES.forEach((c) => { map[c.id] = 0 })
    expenses.forEach((item) => {
      if (map[item.category] !== undefined) {
        map[item.category] += Number(item.amount) || 0
      } else {
        map['misc'] = (map['misc'] || 0) + (Number(item.amount) || 0)
      }
    })
    return map
  }, [expenses])

  const filteredExpenses = useMemo(() => {
    return expenses.filter((item) => {
      const matchCat = selectedCategory === 'all' || item.category === selectedCategory
      const matchSearch = !searchQuery.trim() || item.title.toLowerCase().includes(searchQuery.trim().toLowerCase())
      return matchCat && matchSearch
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [expenses, selectedCategory, searchQuery])

  // Save Expense Handler
  const handleAddExpense = (e) => {
    e.preventDefault()
    if (!form.title.trim() || !form.amount) return
    const newEntry = {
      id: `tx-${Date.now()}`,
      title: form.title.trim(),
      amount: parseFloat(form.amount) || 0,
      category: form.category,
      paymentMethod: form.paymentMethod,
      date: form.date || new Date().toISOString().slice(0, 10)
    }
    const next = [newEntry, ...expenses]
    setExpenses(next)
    localStorage.setItem(`univoExpenses:${storageKey}`, JSON.stringify(next))
    setForm({ title: '', amount: '', category: 'mess', paymentMethod: 'UPI', date: new Date().toISOString().slice(0, 10) })
    setAddModalOpen(false)
  }

  // Delete Expense
  const handleDeleteExpense = (id) => {
    const next = expenses.filter((item) => item.id !== id)
    setExpenses(next)
    localStorage.setItem(`univoExpenses:${storageKey}`, JSON.stringify(next))
  }

  // Save Monthly Budget
  const handleSaveBudget = (e) => {
    e.preventDefault()
    const val = parseInt(tempBudgetInput, 10)
    if (isNaN(val) || val <= 0) return
    setMonthlyBudget(val)
    localStorage.setItem(`univoMonthlyBudget:${storageKey}`, `${val}`)
    setBudgetModalOpen(false)
  }

  return (
    <PageTransition>
      {/* HEADER SECTION */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">STUDENT FINANCIALS</p>
          <h1 className="font-display text-4xl font-bold tracking-tight mt-1 text-[var(--accent-solid)]">
            Expense Tracker
          </h1>
          <p className="text-[var(--text-muted)] text-sm mt-1">
            Track hostel, mess, academics, and personal student spending with real-time monthly budget alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setTempBudgetInput(`${monthlyBudget}`)
              setBudgetModalOpen(true)
            }}
            className="px-3.5 py-2.5 rounded-xl bg-[var(--surface-control)] hover:bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all text-[var(--text-primary)]"
          >
            <Edit2 size={14} className="text-[var(--accent-solid)]" /> Set Monthly Budget
          </button>

          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl univo-gradient-bg text-black text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
          >
            <Plus size={16} /> Log Expense
          </button>
        </div>
      </div>

      {/* HERO MONTHLY BUDGET CARD */}
      <GlassCard className="mb-6 !p-0 overflow-hidden" delay={0.1}>
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[var(--text-muted)] font-semibold flex items-center gap-1.5">
                <Wallet size={16} className="text-[var(--accent-solid)]" /> Monthly Budget Summary
              </span>
              <div className="flex items-baseline gap-3 mt-1">
                <span className="font-display text-4xl md:text-5xl font-bold text-[var(--text-primary)]">
                  ₹{totalSpent.toLocaleString('en-IN')}
                </span>
                <span className="text-sm font-semibold text-[var(--text-muted)]">
                  spent of ₹{monthlyBudget.toLocaleString('en-IN')} limit
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
                remainingBudget < 0
                  ? 'bg-red-500/20 border-red-500/40 text-red-400'
                  : spentPercentage >= 80
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
                  : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              }`}>
                {remainingBudget < 0 ? (
                  <AlertTriangle size={15} />
                ) : spentPercentage >= 80 ? (
                  <AlertTriangle size={15} />
                ) : (
                  <CheckCircle size={15} />
                )}
                {remainingBudget < 0
                  ? `Over Budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}`
                  : `₹${remainingBudget.toLocaleString('en-IN')} Remaining`}
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-semibold text-[var(--text-muted)]">
              <span>{spentPercentage}% of monthly budget used</span>
              <span>Target &le; 100%</span>
            </div>
            <AnimatedProgress value={spentPercentage} height={8} delay={0.2} />
          </div>
        </div>
      </GlassCard>

      {/* CATEGORIES GRID SUMMARY */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {CATEGORIES.map((cat, idx) => {
          const Icon = cat.icon
          const amount = categoryTotals[cat.id] || 0
          const pct = totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0

          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => setSelectedCategory(selectedCategory === cat.id ? 'all' : cat.id)}
              className={`p-3.5 rounded-2xl glass-card border transition-all cursor-pointer ${
                selectedCategory === cat.id ? 'border-[var(--accent-solid)] bg-[var(--accent-solid)]/10' : 'border-[var(--border-subtle)] hover:bg-[var(--surface-hover)]'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-2 rounded-xl ${cat.color}`}>
                  <Icon size={16} />
                </span>
                <span className="text-[10px] font-mono text-[var(--text-subtle)]">{pct}%</span>
              </div>
              <p className="text-xs font-medium text-[var(--text-secondary)] truncate">{cat.label}</p>
              <p className="text-base font-bold font-display text-[var(--text-primary)] mt-0.5">
                ₹{amount.toLocaleString('en-IN')}
              </p>
            </motion.div>
          )
        })}
      </div>

      {/* TRANSACTIONS SECTION */}
      <GlassCard delay={0.25}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <CreditCard size={18} className="text-[var(--accent-solid)]" />
            <h2 className="font-display font-semibold text-lg text-[var(--text-primary)]">Expense Log</h2>
            <span className="text-xs text-[var(--text-subtle)] font-mono">({filteredExpenses.length} entries)</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search */}
            <div className="relative flex-1 md:w-56">
              <Search size={14} className="absolute left-3 top-2.5 text-[var(--text-subtle)]" />
              <input
                type="text"
                placeholder="Search expense..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
              />
            </div>

            {/* Category Filter Pills */}
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all' ? 'univo-gradient-bg text-black' : 'bg-[var(--surface-control)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* EXPENSE TABLE / LIST */}
        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
          <AnimatePresence mode="popLayout">
            {filteredExpenses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-8 text-center border border-dashed border-[var(--border-subtle)] rounded-2xl space-y-2"
              >
                <Wallet size={28} className="mx-auto text-[var(--text-subtle)]" />
                <p className="text-sm font-semibold text-[var(--text-secondary)]">No expenses recorded yet</p>
                <p className="text-xs text-[var(--text-subtle)]">Log your mess fees, hostel rent, or daily snacks to keep your budget on track.</p>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(true)}
                  className="px-4 py-2 rounded-xl univo-gradient-bg text-black text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus size={14} /> Log First Expense
                </button>
              </motion.div>
            ) : (
              filteredExpenses.map((tx) => {
                const catObj = CATEGORIES.find((c) => c.id === tx.category) || CATEGORIES[5]
                const Icon = catObj.icon

                return (
                  <motion.div
                    key={tx.id}
                    layout
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-3.5 rounded-xl bg-[var(--surface-control)] border border-[var(--border-subtle)] hover:border-[var(--border-strong)] flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className={`p-2.5 rounded-xl shrink-0 ${catObj.color}`}>
                        <Icon size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{tx.title}</p>
                        <div className="flex items-center gap-2 text-xs text-[var(--text-subtle)] mt-0.5">
                          <span>{catObj.label}</span>
                          <span>&middot;</span>
                          <span className="font-mono">{tx.paymentMethod}</span>
                          <span>&middot;</span>
                          <span>{new Date(tx.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="font-display text-base font-bold text-[var(--text-primary)]">
                        -₹{Number(tx.amount).toLocaleString('en-IN')}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteExpense(tx.id)}
                        className="text-[var(--text-subtle)] hover:text-red-400 cursor-pointer p-1"
                        aria-label="Delete expense"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                )
              })
            )}
          </AnimatePresence>
        </div>
      </GlassCard>

      {/* LOG EXPENSE MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setAddModalOpen(false)}>
          <form className="glass-panel w-full max-w-md rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl" onSubmit={handleAddExpense}>
            <button type="button" className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setAddModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">NEW TRANSACTION</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Log Expense</h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mess Bill, Laundromat, Book Printout..."
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    required
                    placeholder="e.g. 250"
                    value={form.amount}
                    onChange={(e) => setForm({ ...form, amount: e.target.value })}
                    className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[var(--text-secondary)] mb-1">Payment Method</label>
                  <select
                    value={form.paymentMethod}
                    onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}
                    className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
                  >
                    <option value="UPI" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">UPI / GPay</option>
                    <option value="Cash" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Cash</option>
                    <option value="Card" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Card</option>
                    <option value="Bank Transfer" className="bg-[var(--surface-modal)] text-[var(--text-primary)]">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.id} className="bg-[var(--surface-modal)] text-[var(--text-primary)]">
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[var(--text-secondary)] mb-1">Date</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full bg-[var(--surface-modal)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] cursor-pointer"
                />
              </div>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-3 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Plus size={16} /> Save Expense Record
            </button>
          </form>
        </div>
      )}

      {/* EDIT BUDGET MODAL */}
      {budgetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setBudgetModalOpen(false)}>
          <form className="glass-panel w-full max-w-sm rounded-2xl p-6 relative space-y-4 bg-[var(--surface-modal)] text-[var(--text-primary)] border border-[var(--border-strong)] shadow-2xl" onSubmit={handleSaveBudget}>
            <button type="button" className="absolute top-4 right-4 text-[var(--text-subtle)] hover:text-[var(--text-primary)] cursor-pointer" onClick={() => setBudgetModalOpen(false)} aria-label="Close">
              <X size={18} />
            </button>
            <p className="settingsEyebrow text-[var(--accent-solid)] font-bold">MONTHLY TARGET</p>
            <h2 className="text-xl font-bold font-display text-[var(--text-primary)]">Set Monthly Budget</h2>

            <div className="space-y-3 text-xs">
              <label className="block font-semibold text-[var(--text-secondary)]">Monthly Budget Limit (₹)</label>
              <input
                type="number"
                min="100"
                required
                placeholder="e.g. 5000"
                value={tempBudgetInput}
                onChange={(e) => setTempBudgetInput(e.target.value)}
                className="w-full bg-[var(--surface-control)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-solid)] text-base font-bold font-mono"
              />
              <p className="text-[11px] text-[var(--text-subtle)]">
                This limit will be used to calculate your remaining monthly allowance and spending progress.
              </p>
            </div>

            <button type="submit" className="w-full univo-gradient-bg text-black font-semibold rounded-xl py-2.5 text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-2">
              <Edit2 size={14} /> Update Monthly Budget
            </button>
          </form>
        </div>
      )}
    </PageTransition>
  )
}
