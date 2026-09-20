import { format, parseISO } from 'date-fns'

export const money = (value = 0) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(value) || 0)
export const shortDate = (value) => {
  if (!value) return '—'
  try { return format(typeof value === 'string' ? parseISO(value) : value, 'dd MMM yyyy') } catch { return value }
}
export const monthKey = (date = new Date()) => format(date, 'yyyy-MM-01')
export const todayKey = (date = new Date()) => format(date, 'yyyy-MM-dd')
export const asList = (value) => Array.isArray(value) ? value : value?.content || value?.data || value?.items || []
export const errorMessage = (error) => error?.response?.data?.message || error?.response?.data?.error || error?.message || 'Something went wrong. Please try again.'
