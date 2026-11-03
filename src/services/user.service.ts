import axios from 'axios'
import authHeader from './auth-header'
import { env } from '../lib/env'

const uri = env.BACKEND_URI + '/api/users'

export const userService = {
  getAll
}

function getAll() {
  return axios
    .get(`${uri}/`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}
