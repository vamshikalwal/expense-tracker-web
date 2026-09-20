import api, { unwrap } from './axios'

export const getBudgets = (month) => unwrap(api.get('/budgets', { params: { month } }))
export const createBudget = (payload) => unwrap(api.post('/budgets', payload))
export const updateBudget = (id, payload) => unwrap(api.put(`/budgets/${id}`, payload))
export const deleteBudget = (id) => unwrap(api.delete(`/budgets/${id}`))
