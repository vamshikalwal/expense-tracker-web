import { useEffect, useState } from 'react'
import { Activity, ArrowUpRight, CreditCard, Landmark, MoreHorizontal, Receipt, TrendingDown, Wallet } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { getSummary, getCategoryReport, getDailyReport } from '../api/reportApi'
import { getTransactions } from '../api/transactionApi'
import { asList, errorMessage, money, shortDate, todayKey } from '../utils/format'
import { ErrorState, SectionHeader, StatCard } from '../components/common/UI'

const chartColors = ['#121212', '#a7c7b7', '#e2b86e', '#c8b9ea']
const fallbackTrend = [
  { day: '01', amount: 2100 }, { day: '05', amount: 4700 }, { day: '09', amount: 3200 },
  { day: '13', amount: 6800 }, { day: '17', amount: 5300 }, { day: '21', amount: 8200 },
  { day: '25', amount: 7400 }, { day: '29', amount: 9400 },
]

export default function Dashboard() {
  const [data, setData] = useState({ summary: {}, category: [], daily: [], transactions: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const [summary, category, daily, transactions] = await Promise.all([
        getSummary(), getCategoryReport(), getDailyReport({ startDate: '2026-09-01', endDate: todayKey() }),
        getTransactions({ page: 0, size: 5 }),
      ])
      setData({ summary: summary || {}, category: asList(category), daily: asList(daily), transactions: asList(transactions) })
    } catch (err) { setError(errorMessage(err)) } finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])
  const { summary, category, daily, transactions } = data
  const total = summary.totalExpense ?? summary.totalSpending ?? summary.total ?? 0
  const balance = summary.balance ?? summary.totalBalance ?? 0
  const trend = daily.length ? daily : fallbackTrend
  const transactionCount = summary.transactionCount ?? (transactions.length || '—')

  return <div className="dashboard-grid">
    {error && <div className="grid-span"><ErrorState message={error} onRetry={load} /></div>}
    <div className="hero-grid">
      <div className="balance-card"><div className="balance-glow" /><div className="balance-head"><span className="overline">TOTAL SPENDING <span className="live-dot" /></span><button className="icon-button dark-icon"><MoreHorizontal size={18} /></button></div><div className="balance-amount">{loading ? '—' : money(total)}</div><div className="balance-foot"><span>September 2026</span><span className="balance-trend"><TrendingDown size={14} /> 8.4% vs last month</span></div><div className="balance-lines" /></div>
      <div className="insight-card"><div><span className="overline">MONTHLY INSIGHT</span><h3>You're spending with<br /><em>intention.</em></h3><p>Your spending is 12% lower than your average over the last 3 months.</p></div><span className="insight-icon"><Activity size={20} /></span></div>
    </div>
    <div className="stats-grid"><StatCard label="Available balance" value={balance} meta="Updated just now" icon={Wallet} /><StatCard label="Transactions" value={transactionCount} formatValue={false} meta="This month" icon={Receipt} tone="soft" /><StatCard label="Top category" value={summary.topCategory || category[0]?.category || '—'} meta={summary.topCategoryAmount ? money(summary.topCategoryAmount) : 'Keep an eye on it'} icon={Activity} tone="soft" /></div>
    <div className="chart-card large-chart"><SectionHeader title="Spending pulse" action={() => {}} actionLabel="This month" /><div className="chart-legend"><span><i className="legend-dot black" /> Actual spending</span><span className="muted">SEPTEMBER 2026</span></div><ResponsiveContainer width="100%" height={245}><AreaChart data={trend} margin={{ top: 12, right: 4, left: -25, bottom: 0 }}><defs><linearGradient id="pulseFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#111" stopOpacity={0.15} /><stop offset="100%" stopColor="#111" stopOpacity={0} /></linearGradient></defs><CartesianGrid vertical={false} stroke="#eeeae4" /><XAxis dataKey={(item) => item.day || item.date?.slice(-2)} axisLine={false} tickLine={false} tick={{ fill: '#9b9892', fontSize: 11 }} /><YAxis axisLine={false} tickLine={false} tick={{ fill: '#9b9892', fontSize: 11 }} tickFormatter={(value) => `₹${value / 1000}k`} /><Tooltip formatter={(value) => [money(value), 'Spend']} /><Area type="monotone" dataKey={(item) => item.amount ?? item.total ?? item.value ?? 0} stroke="#161616" strokeWidth={2.5} fill="url(#pulseFill)" /></AreaChart></ResponsiveContainer></div>
    <div className="side-stack"><div className="category-card"><SectionHeader title="By category" action={() => {}} /><div className="donut-wrap"><ResponsiveContainer width="48%" height={150}><PieChart><Pie data={category.length ? category : [{ category: 'No data', amount: 1 }]} dataKey={(item) => item.amount ?? item.total ?? item.value ?? 1} nameKey="category" innerRadius={44} outerRadius={63} stroke="none">{(category.length ? category : [{ category: 'No data' }]).map((_, index) => <Cell key={index} fill={category.length ? chartColors[index % chartColors.length] : '#e7e4de'} />)}</Pie><Tooltip formatter={(value) => money(value)} /></PieChart></ResponsiveContainer><div className="legend-list">{category.slice(0, 4).map((item, index) => <div key={item.category || index}><span><i style={{ background: chartColors[index % chartColors.length] }} />{item.category || item.name}</span><strong>{money(item.amount ?? item.total ?? item.value)}</strong></div>)}{!category.length && <span className="muted">Category data will appear here.</span>}</div></div></div><div className="quick-card"><span className="overline">QUICK VIEW</span><div className="quick-row"><span className="quick-icon green"><Landmark size={17} /></span><div><strong>Connected banks</strong><small>Manage your accounts</small></div><ArrowUpRight size={16} /></div><div className="quick-row"><span className="quick-icon sand"><CreditCard size={17} /></span><div><strong>Cards & limits</strong><small>Review spending power</small></div><ArrowUpRight size={16} /></div></div></div>
    <div className="recent-card"><SectionHeader title="Recent transactions" action={() => {}} /><div className="transaction-list">{transactions.length ? transactions.slice(0, 5).map((tx, index) => <div className="transaction-row" key={tx.id || index}><div className={`tx-icon tone-${index % 3}`}><Receipt size={17} /></div><div className="tx-main"><strong>{tx.paymentName || tx.name || 'Transaction'}</strong><span>{tx.category || 'Other'} · {shortDate(tx.date)}</span></div><strong className="tx-amount">− {money(tx.amount)}</strong></div>) : <div className="mini-empty"><Receipt size={18} /><span>Your latest spending will show up here.</span></div>}</div></div>
  </div>
}
