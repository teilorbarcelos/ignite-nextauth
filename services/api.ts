import axios, { AxiosError } from "axios"
import { parseCookies, setCookie } from "nookies"

let cookies = parseCookies()

export const api = axios.create({
  baseURL: 'http://localhost:3333',
  headers: {
    Authorization: `Bearer ${cookies['myNextAuth.token']}`
  }
})

api.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      if (error.response.data?.code === 'token.expired') {
        cookies = parseCookies()

        const { 'myNextAuth.refreshToken': refreshToken } = cookies

        api.post('/refresh', {
          refreshToken
        }).then(response => {
          const { token, refreshToken: newRefreshToken } = response.data

          setCookie(undefined, 'myNextAuth.token', token, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          })

          setCookie(undefined, 'myNextAuth.refreshToken', newRefreshToken, {
            maxAge: 60 * 60 * 24 * 30, // 30 days
            path: '/'
          })

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`

        })
      } else {

      }
    }
  }
)