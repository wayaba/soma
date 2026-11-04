import { useContext } from 'react'

import MenuLink from './MenuLink'
import AuthContext from '../../context/AuthContext'
const LogOutBtn = () => {
  const context = useContext(AuthContext)

  const logOut = () => {
    localStorage.removeItem('somauser')
    localStorage.removeItem('SOMAEXPIREDTIME')
    context?.getLoggedIn && context.getLoggedIn()
  }

  return <MenuLink to="/#" label="Logout" onClick={logOut} />
}

export default LogOutBtn
