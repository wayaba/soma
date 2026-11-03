import React from 'react'
import { Link } from 'react-router-dom'

export interface MenuLinkProps {
  to: string
  label: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
}

const MenuLink: React.FC<MenuLinkProps> = ({ to, label, onClick }) => {
  return (
    <Link to={to} className=" text-black hover:text-gray-500 px-3 py-2 rounded-md text-lg  font-medium no-underline hover:no-underline" onClick={onClick}>
      {label}
    </Link>
  )
}

export default MenuLink
