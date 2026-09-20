import api, { unwrap } from './axios'

export const getCards = () => unwrap(api.get('/cards'))
export const getCard = (id) => unwrap(api.get(`/cards/${id}`))
export const getCardTransactions = (id) => unwrap(api.get(`/cards/${id}/transactions`))
export const createCard = (payload) => unwrap(api.post('/cards', payload))
export const updateCard = (id, payload) => unwrap(api.put(`/cards/${id}`, payload))
export const deleteCard = (id) => unwrap(api.delete(`/cards/${id}`))
