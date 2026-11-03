type CardProps = {
  label: string
}

const Card = ({ label }: CardProps) => {
  return (
    <div>
      <p className="text-primary text-sm font-semibold uppercase leading-5">{label}</p>
    </div>
  )
}

export default Card
