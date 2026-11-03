import { Navigate, Outlet } from 'react-router-dom'
import { authService } from '@/services/auth.service'

const PrivateRoute = () => {
  const currentUser = authService.getCurrentUser()

  if (!currentUser) {
    // No está logueado, redirige a login
    return <Navigate to="/login" replace />
  }

  // Si hay lógica de roles, agregar aquí
  // if (roles && !roles.some(role => currentUser.roles.includes(role))) {
  //   return <Navigate to="/unauthorized" replace />
  // }

  return <Outlet />
}
export default PrivateRoute
