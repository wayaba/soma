import React from 'react'
import type { User } from '@/types/types'
import type { Field } from './GenericList'

export interface ItemUserProps {
  item: User
  fields: Field<User>[]
}

const ItemUser: React.FC<ItemUserProps> = ({ item, fields }) => {
  return (
    <tr>
      {fields.map(({ key, formatter }) => {
        const value = item[key as keyof User]
        return (
          <td className="p-2" key={String(key)}>
            {formatter ? formatter(value, item) : String(value ?? '')}
          </td>
        )
      })}
    </tr>
  )
}

export default ItemUser
