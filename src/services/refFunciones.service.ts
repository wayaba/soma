import axios from 'axios'
import authHeader from './auth-header'
import { env } from '../lib/env'

const baseUri = env.BACKEND_URI + '/api/refFunciones'

export const refFuncionesService = {
  getAllFab,
  getAllCip
}

function getAllFab() {
  return axios
    .get(`${baseUri}/allFab`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function getAllCip() {
  return axios
    .get(`${baseUri}/allCip`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}
