export default function authHeader(): { [key: string]: string } {
  const current = localStorage.getItem('somauser')
  const legacy = localStorage.getItem('eticosuser')
  if (!current && legacy) localStorage.setItem('somauser', legacy)
  const user = JSON.parse(current ?? legacy ?? 'null') as { accessToken?: string } | null

  if (user && user.accessToken) {
    // return { Authorization: 'Bearer ' + user.accessToken }; // for Spring Boot back-end
    return { 'x-access-token': user.accessToken } // for Node.js Express back-end
  } else {
    return {}
  }
}
