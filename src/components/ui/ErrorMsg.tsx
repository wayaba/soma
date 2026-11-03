type ErrorMsgProps = {
  message: string
}

const ErrorMsg = ({ message }: ErrorMsgProps) => {
  return (
    <div className="mt-2">
      <div className="text-red-200 text-sm rounded-md p-1">{message}</div>
    </div>
  )
}

export default ErrorMsg
