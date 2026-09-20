import api, { unwrap } from './axios'

export const login = (payload) => unwrap(api.post('/auth/login', payload))
export const register = (payload) => unwrap(api.post('/auth/register', payload))
