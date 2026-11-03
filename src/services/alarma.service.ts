import axios from 'axios'
import authHeader from './auth-header'
import { env } from '../lib/env'

const uri = env.BACKEND_URI + '/api/alarmas'

export const alarmaService = {
  getAll,
  getByIdLoteFab,
  getByIdLoteCip
}

function getAll() {
  return axios
    .get(`${uri}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      throw err
    })
}

function getByIdLoteFab(idLoteFab: string) {
  return axios
    .get(`${uri}/byIdLoteFab`, { params: { idLoteFab }, headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      throw err
    })
}

function getByIdLoteCip(idLoteCip: string) {
  return axios
    .get(`${uri}/byIdLoteCip`, { params: { idLoteCip }, headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      throw err
    })
}
