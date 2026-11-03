import axios from 'axios'
import authHeader from './auth-header'
import { env } from '../lib/env'

const uri = env.BACKEND_URI + '/api/refAlarmas'

export const refAlarmaService = {
  getAll
}

function getAll() {
  return axios
    .get(`${uri}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      throw err
    })
}
