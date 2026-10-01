import api, { unwrap } from './axios'

export const login = (payload) => unwrap(api.post('/auth/login', payload))
export const register = (payload) => unwrap(api.post('/auth/register', payload))
export const getCurrentUser = () => unwrap(api.get('/users/me'))
export const updateProfile = (payload) => unwrap(api.put('/users/me', payload))
export const deleteAccount = (payload) => unwrap(api.delete('/users/me', { data: payload }))
