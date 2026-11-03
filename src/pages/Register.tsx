import React, { useState, useRef } from 'react'
import { authService } from '@/services/auth.service'
import ErrorMsg from '../components/ui/ErrorMsg'
import { isEmail } from 'validator'

const Register: React.FC = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<{ username?: string; email?: string; password?: string }>({})
  const formRef = useRef<HTMLFormElement>(null)

  const cleanValues = () => {
    setUsername('')
    setPassword('')
    setEmail('')
    setMessage('')
    setSuccess(false)
    setErrors({})
    setLoading(false)
  }

  const validate = () => {
    const newErrors: { username?: string; email?: string; password?: string } = {}
    if (!username) newErrors.username = 'Este campo es requerido!'
    else if (username.length < 3 || username.length > 20) newErrors.username = 'El usuario tiene que tener entre 3 y 20 caracteres.'
    if (!email) newErrors.email = 'Este campo es requerido!'
    else if (!isEmail(email)) newErrors.email = 'No es un correo válido.'
    if (!password) newErrors.password = 'Este campo es requerido!'
    else if (password.length < 6 || password.length > 40) newErrors.password = 'La clave tiene que tener entre 6 y 40 caracteres.'
    return newErrors
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setSuccess(false)
    setLoading(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      try {
        const response = await authService.register(username, email, password)
        setMessage(response.data.message)
        setSuccess(true)
      } catch (error: any) {
        const resMessage = (error.response && error.response.data && error.response.data.message) || error.message || error.toString()
        setMessage(resMessage)
        setSuccess(false)
      } finally {
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  const renderMessage = (success: boolean, message: string) => {
    if (success) {
      return (
        <div className="mt-4 flex flex-col items-center">
          <div className="text-green-200 text-sm rounded-md p-1">{message}</div>
          <button
            onClick={cleanValues}
            className="rounded-xl border border-brand-line bg-white px-6 py-2 text-center text-brand-ink shadow-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"
            type="button"
          >
            Registrar nuevo usuario
          </button>
        </div>
      )
    } else {
      return <ErrorMsg message={message} />
    }
  }

  return (
    <div className="brand-panel mx-auto my-8 max-w-md px-8 py-9 sm:px-12">
      <div className="text-brand-ink">
        <div className="mb-8 flex flex-col items-center">
          <img src="//ssl.gstatic.com/accounts/ui/avatar_2x.png" alt="profile-img" className="profile-img-card" />
          <h1 className="mb-2 text-2xl font-bold text-soma">Registro de usuarios</h1>
          <span className="text-sm text-brand-muted">Nuevos usuarios para ingresar al sistema</span>
        </div>
        <form onSubmit={handleRegister} ref={formRef} className="flex flex-col items-center" noValidate>
          {!success && (
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 text-lg w-full">
                <input
                  type="text"
                  className="rounded-3xl text-gray-700 border-none focus:bg-slate-200 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md w-full"
                  name="username"
                  placeholder="usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  autoComplete="username"
                />
                {errors.username && <ErrorMsg message={errors.username} />}
              </div>
              <div className="mb-4 text-lg w-full">
                <input
                  type="text"
                  className="rounded-3xl text-gray-700 border-none focus:bg-slate-200 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md w-full"
                  name="email"
                  placeholder="correo"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
                {errors.email && <ErrorMsg message={errors.email} />}
              </div>
              <div className="mb-4 text-lg w-full">
                <input
                  type="password"
                  className="rounded-3xl text-gray-700 border-none focus:bg-slate-200 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md w-full"
                  name="password"
                  placeholder="clave"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                />
                {errors.password && <ErrorMsg message={errors.password} />}
              </div>
              <div className="mt-8 flex justify-center text-lg text-black">
                <button
                  type="submit"
                  className="brand-button rounded-3xl px-10 py-2"
                  disabled={loading || success}
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                      Cargando...
                    </div>
                  ) : (
                    <span className="hover:text-gray-300">Registrar</span>
                  )}
                </button>
              </div>
            </div>
          )}
          {message && renderMessage(success, message)}
        </form>
      </div>
    </div>
  )
}

export default Register
