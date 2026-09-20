import api, { unwrap } from './axios'

export const getBanks = () => unwrap(api.get('/banks'))
export const getBank = (id) => unwrap(api.get(`/banks/${id}`))
export const getBankTransactions = (id) => unwrap(api.get(`/banks/${id}/transactions`))
export const createBank = (payload) => unwrap(api.post('/banks', payload))
export const updateBank = (id, payload) => unwrap(api.put(`/banks/${id}`, payload))
export const deleteBank = (id) => unwrap(api.delete(`/banks/${id}`))
