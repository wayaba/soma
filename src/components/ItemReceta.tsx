import React from 'react'
import type { Receta } from '@/types/types'
import type { Field } from './GenericList'

export interface ItemRecetaProps {
  item: Receta
  fields: Field<Receta>[]
}

const ItemReceta: React.FC<ItemRecetaProps> = ({ item, fields }) => {
  return (
    <tr>
      {fields.map(({ key, formatter }) => {
        const value = item[key as keyof Receta]
        return (
          <td className="p-2" key={String(key)}>
            {formatter ? formatter(value, item) : String(value ?? '')}
          </td>
        )
      })}
    </tr>
  )
}

export default ItemReceta
