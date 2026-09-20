import api, { unwrap } from './axios'

export const getTransactions = (params) => unwrap(api.get('/transactions', { params }))
export const filterTransactions = (params) => unwrap(api.get('/transactions/filter', { params }))
export const getTransaction = (id) => unwrap(api.get(`/transactions/${id}`))
export const createTransaction = (payload) => unwrap(api.post('/transactions', payload))
export const updateTransaction = (id, payload) => unwrap(api.put(`/transactions/${id}`, payload))
export const deleteTransaction = (id) => unwrap(api.delete(`/transactions/${id}`))
