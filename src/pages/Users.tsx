import { useEffect, useState } from 'react'
import { userService } from '@/services/user.service'
import GenericList, { type Field } from '@/components/GenericList'
import ItemUser from '@/components/ItemUser'
import type { User } from '@/types/types'

const Users = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let isMounted = true
    const fetchUsers = async () => {
      setLoading(true)
      try {
        const res = await userService.getAll()
        console.log('Users fetched:', res.data) // Log para verificar los datos
        if (isMounted) setUsers(res.data)
      } catch {
        // Manejo de error opcional
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchUsers()
    return () => {
      isMounted = false
    }
  }, [])

  // Configuración de columnas/fields para GenericList
  const fields: Field<User>[] = [
    { key: 'username', label: 'Usuario' },
    { key: 'email', label: 'Correo' },
    {
      key: 'roles',
      label: 'Roles',
      formatter: (roles: any) =>
        Array.isArray(roles)
          ? roles
              .map((role: any) => role?.name)
              .filter(Boolean)
              .join(', ')
          : roles?.name || ''
    }
  ]

  return (
    <div className="brand-panel mx-auto my-8 max-w-5xl p-6 sm:p-10">
      <div className="text-brand-ink">
        <div className="mb-8 flex flex-col items-center">
          <img src="//ssl.gstatic.com/accounts/ui/avatar_2x.png" alt="profile-img" className="profile-img-card" />
          <h1 className="mb-2 text-2xl font-bold text-soma">Lista de usuarios</h1>
          <span className="text-sm text-brand-muted">Lista de usuarios para ingresar al sistema</span>
        </div>
        {loading && <p className="mb-3 text-sm text-brand-muted">Cargando usuarios…</p>}
        <GenericList items={users} fields={fields} RowComponent={ItemUser} getKey={(user) => user.username || ''} />
      </div>
    </div>
  )
}

export default Users
