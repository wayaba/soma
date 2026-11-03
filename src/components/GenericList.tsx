import React from 'react'

export interface Field<T> {
  key: keyof T | string
  label: string
  formatter?: (val: any, record?: T) => React.ReactNode
}

interface GenericListProps<T> {
  items: T[]
  fields: Field<T>[]
  RowComponent: React.ComponentType<{ item: T; fields: Field<T>[] }>
  getKey: (item: T) => string
}

function GenericList<T>({ items, fields, RowComponent, getKey }: GenericListProps<T>) {
  return (
    <div className="flex w-full max-w-6xl mx-auto">
      <table className="mt-3 w-full overflow-hidden rounded-xl border border-brand-line bg-white shadow-sm">
        <thead className="bg-brand-canvas">
          <tr>
            {fields.map(({ key, label }) => (
              <th key={String(key)} className="px-4 py-2 text-left font-medium text-gray-700">
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-brand-line">
          {items.map((item) => (
            <RowComponent item={item} fields={fields} key={getKey(item)} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default GenericList
