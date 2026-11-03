import axios, { type AxiosResponse } from 'axios'
import authHeader from './auth-header'
import type { User } from '@/types/types'

const API_URL = 'http://localhost:5000/api/auth/'

export const authService = {
  login(username: string, password: string): Promise<User> {
    return axios
      .post<User>(API_URL + 'signin', {
        username,
        password
      })
      .then((response: AxiosResponse<User>) => {
        if (response.data.accessToken) {
          localStorage.setItem('somauser', JSON.stringify(response.data))
          localStorage.removeItem('eticosuser')
        }
        return response.data
      })
  },

  logout(): void {
    localStorage.removeItem('somauser')
    localStorage.removeItem('SOMAEXPIREDTIME')
    localStorage.removeItem('eticosuser')
    localStorage.removeItem('ETICOSEXPIREDTIME')
  },

  register(username: string, email: string, password: string) {
    return axios.post(API_URL + 'signup', {
      username,
      email,
      password
    })
  },

  getCurrentUser(): User | null {
    const current = localStorage.getItem('somauser')
    const legacy = localStorage.getItem('eticosuser')
    if (!current && legacy) localStorage.setItem('somauser', legacy)
    const user = current ?? legacy
    return user ? JSON.parse(user) : null
  },

  loggedIn(): Promise<AxiosResponse<any>> {
    return axios
      .get(`${API_URL}loggedIn`, { headers: authHeader() })
      .then((res) => res)
      .catch((err) => {
        console.log('Error: ' + err)
        throw err
      })
  }
}
