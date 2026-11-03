import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import MenuLink from './ui/MenuLink'
import AuthContext from '@/context/AuthContext'
import { authService } from '@/services/auth.service'
import LogOutBtn from './ui/LogoutBtn'
import { Soma } from '@/svg/Soma'
import type { User } from '@/types/types'

const Menu: React.FC = () => {
  let currentUser: User | null = null
  let showAdminBoard = false
  const authContext = useContext(AuthContext)
  const loggedIn = authContext?.loggedIn

  if (loggedIn) {
    currentUser = authService.getCurrentUser()
    console.log('Current User:', currentUser) // Log para verificar el usuario actual
    showAdminBoard = !!(
      currentUser &&
      currentUser.roles &&
      currentUser.roles.some((role) => (typeof role === 'string' ? role === 'ROLE_ADMIN' : role.name === 'ROLE_ADMIN'))
    )
  }

  return (
    <header id="header-soma" className="sticky top-3 z-10 mx-4 mb-7 flex items-center justify-between rounded-2xl border border-brand-line bg-white/95 px-4 py-2 shadow-[0_12px_32px_rgba(6,31,102,0.08)] backdrop-blur sm:mx-8">
      <Link
        to={loggedIn ? '/dashboard' : '/'}
        className="flex items-center rounded-lg px-2 py-1 no-underline hover:no-underline"
      >
        <Soma />
      </Link>
      <nav className="flex items-center gap-2 text-sm font-semibold text-brand-muted">
        {loggedIn && <MenuLink to="/dashboard" label="Reportes" />}
        {showAdminBoard && <MenuLink to="/register" label="Registrar Usuario" />}
        {showAdminBoard && <MenuLink to="/users" label="Lista Usuarios" />}
        {/* ...otros links... */}
      </nav>
      {loggedIn && <LogOutBtn />}
    </header>
  )
}

export default Menu
