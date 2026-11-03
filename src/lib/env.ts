/// <reference types="vite/client" />

export const env = {
  BACKEND_URI: import.meta.env.VITE_REACT_APP_BACKEND_URI,
  TIMEOUT_SESSION: import.meta.env.VITE_REACT_APP_TIMEOUT_SESSION
}
