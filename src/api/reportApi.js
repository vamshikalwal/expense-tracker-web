import api, { unwrap } from './axios'

export const getSummary = (period = 'monthly') => unwrap(api.get('/reports/summary', { params: { period } }))
export const getCategoryReport = () => unwrap(api.get('/reports/category'))
export const getCardReport = () => unwrap(api.get('/reports/by-card'))
export const getDailyReport = (params) => unwrap(api.get('/reports/daily', { params }))
export const getBudgetSummary = (month) => unwrap(api.get('/reports/budget-summary', { params: { month } }))
