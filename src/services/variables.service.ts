import axios from 'axios'
import authHeader from './auth-header'
import { env } from '@/lib/env'

const baseUri = env.BACKEND_URI + '/api/variables'

export const variablesService = {
  getAllFab,
  getByIdLoteFab,
  getClosestByDateFab,
  getAllCip,
  getByIdLoteCip,
  getClosestByDateCip
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

function getByIdLoteFab(idLote: string) {
  return axios
    .get(`${baseUri}/byIdLoteFab?idLote=${encodeURIComponent(idLote)}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function getClosestByDateFab(fecha: string) {
  return axios
    .get(`${baseUri}/closestDateFab?fecha=${encodeURIComponent(fecha)}`, { headers: authHeader() })
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

function getByIdLoteCip(idLote: string) {
  return axios
    .get(`${baseUri}/byIdLoteCip?idLote=${encodeURIComponent(idLote)}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}

function getClosestByDateCip(fecha: string) {
  return axios
    .get(`${baseUri}/closestDateCip?fecha=${encodeURIComponent(fecha)}`, { headers: authHeader() })
    .then((res) => res)
    .catch((err) => {
      console.log('Error: ' + err)
      throw err
    })
}
