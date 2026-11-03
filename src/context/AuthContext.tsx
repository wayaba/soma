import { createContext, useEffect, useState, type ReactNode } from 'react'
import { authService } from '@/services/auth.service'

interface AuthContextType {
  loggedIn: any
  getLoggedIn: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthContextProviderProps {
  children: ReactNode
}

const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [loggedIn, setLoggedIn] = useState<any>(undefined)

  async function getLoggedIn() {
    const { data } = await authService.loggedIn()
    setLoggedIn(data)
  }

  useEffect(() => {
    getLoggedIn()
  }, [])

  return <AuthContext.Provider value={{ loggedIn, getLoggedIn }}>{children}</AuthContext.Provider>
}

export default AuthContext
export { AuthContextProvider }
