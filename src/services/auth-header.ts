export default function authHeader(): { [key: string]: string } {
  const current = localStorage.getItem('somauser')
  const user = JSON.parse(current ?? 'null') as { accessToken?: string } | null

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken }
  } else {
    return {}
  }
}
