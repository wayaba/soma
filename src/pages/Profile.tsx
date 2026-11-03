import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/auth.service'
import type { User } from '@/types/types'

const Profile = () => {
  const [userReady, setUserReady] = useState(false)
  // Ensure currentUser matches the expected User type
  const rawUser = authService.getCurrentUser()
  const currentUser: User | null = rawUser && rawUser.username ? (rawUser as User) : null
  const navigate = useNavigate()

  useEffect(() => {
    if (!currentUser) {
      navigate('/dashboard', { replace: true })
    } else {
      setUserReady(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="brand-panel mx-auto my-8 max-w-2xl p-6 sm:p-10">
      {userReady && currentUser ? (
        <div>
          <h3 className="text-2xl font-bold text-soma">
            Perfil de <strong>{currentUser.username}</strong>
          </h3>

          <p className="mt-5 break-all text-sm text-brand-muted">
            <strong>Token:</strong> {currentUser.accessToken?.substring(0, 20)} ...{' '}
            {currentUser.accessToken?.substr(currentUser.accessToken?.length ? currentUser.accessToken.length - 20 : 0)}
          </p>
          <p>{/* <strong>Id: </strong> {currentUser.id} */}</p>
          <p className="mt-4 text-sm text-brand-muted">
            <strong>Correo: </strong> {currentUser.email}
          </p>
          <strong className="text-soma">Roles: </strong>
          <ul>{currentUser.roles && currentUser.roles.map((role, index) => <li key={index}>{role.name}</li>)}</ul>
        </div>
      ) : null}
    </div>
  )
}
export default Profile
