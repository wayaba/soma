import axios from 'axios'
import authHeader from './auth-header'
import { env } from '../lib/env'

const uri = env.BACKEND_URI + '/api/recetasCip'

export const recetaCipService = {
  getAll,
  getById,
  getByLote,
  search
}

function getAll() {
  return axios
    .get(`${uri}/`, { headers: authHeader() })
    .then((res) => {
      console.log(res)
      return res
    })
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function getById(id: string) {
  return axios
    .get(`${uri}/${id}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function getByLote(lote: any) {
  return axios
    .post(`${uri}/lote`, lote, { headers: authHeader() })
    .then((res) => {
      console.log(res)
      return res
    })
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function search(recetaSearch: any) {
  return axios
    .post(`${uri}/search`, recetaSearch, { headers: authHeader() })
    .then((res) => res.data)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}
