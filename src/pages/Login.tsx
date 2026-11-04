import { useState, useContext } from 'react'
import { authService } from '@/services/auth.service'
import ErrorMsg from '@/components/ui/ErrorMsg'
import AuthContext from '@/context/AuthContext'
import { useNavigate } from 'react-router-dom'
import type { LoginErrors } from '@/types/types'

const Login = () => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<LoginErrors>({})

  const authContext = useContext(AuthContext)
  if (!authContext) {
    throw new Error('AuthContext is undefined. Please ensure AuthProvider is correctly set up.')
  }
  const navigate = useNavigate()
  const validate = (): LoginErrors => {
    const newErrors: LoginErrors = {}
    if (!username) newErrors.username = 'Este campo es requerido!'
    if (!password) newErrors.password = 'Este campo es requerido!'
    return newErrors
  }

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage('')
    setLoading(true)
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length === 0) {
      try {
        await authService.login(username, password)
        localStorage.removeItem('SOMAEXPIREDTIME')
        // Si tienes una función para actualizar el contexto de usuario, úsala aquí
        if (authContext.getLoggedIn) authContext.getLoggedIn()
        navigate('/dashboard', { replace: true })
      } catch (error: unknown) {
        let resMessage = 'Error desconocido'
        if (typeof error === 'object' && error !== null) {
          if (
            'response' in error &&
            error.response &&
            typeof error.response === 'object' &&
            'data' in error.response &&
            error.response.data &&
            typeof error.response.data === 'object' &&
            'message' in error.response.data
          ) {
            resMessage = (error.response.data as any).message
          } else if ('message' in error) {
            resMessage = (error as any).message
          }
        }
        setMessage(resMessage)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }

  return (
    <div className="brand-panel mx-auto my-10 max-w-md px-8 py-10 sm:px-12">
      <div className="text-brand-ink">
        <div className="mb-8 flex flex-col items-center">
          <img src="//ssl.gstatic.com/accounts/ui/avatar_2x.png" alt="profile-img" className="profile-img-card" />
          <h1 className="mb-2 text-2xl font-bold text-soma">Ingresar a SOMA</h1>
          <span className="text-sm text-brand-muted">Accedé a los reportes de planta</span>
        </div>
        <form onSubmit={handleLogin} className="flex flex-col items-center">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 text-lg">
              <input
                type="text"
                className="rounded-3xl text-gray-700 border-none focus:bg-slate-200 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md"
                name="username"
                placeholder="usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              {errors.username && <ErrorMsg message={errors.username} />}
            </div>

            <div className="mb-4 text-lg">
              <input
                type="password"
                className="rounded-3xl text-gray-700 border-none focus:bg-slate-200 px-6 py-2 text-center shadow-lg outline-none backdrop-blur-md"
                name="password"
                value={password}
                placeholder="*********"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              {errors.password && <ErrorMsg message={errors.password} />}
            </div>
            <div className="mt-8 flex justify-center text-lg text-black">
              <button type="submit" className="brand-button rounded-3xl px-10 py-2" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin"></span>
                    Cargando...
                  </div>
                ) : (
                  <span className="hover:text-gray-300">Login</span>
                )}
              </button>
            </div>
            {message && <ErrorMsg message={message} />}
          </div>
        </form>
      </div>
    </div>
  )
}

export default Login
