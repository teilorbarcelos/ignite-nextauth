import axios, { AxiosError } from "axios"
import { GetServerSidePropsContext } from "next"
import { parseCookies, setCookie } from "nookies"
import { signOut } from "../contexts/AuthContext"

interface FailedRequestsQueueProps {
  onSuccess: (token: string) => void
  onFailure: (error: AxiosError) => void
}

type Context = undefined | GetServerSidePropsContext

let isRefreshing = false
let failedRequestsQueue: FailedRequestsQueueProps[] = []

export function setupAPIClient(ctx: Context = undefined) {
  let cookies = parseCookies(ctx)

  const api = axios.create({
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
          cookies = parseCookies(ctx)

          const { 'myNextAuth.refreshToken': refreshToken } = cookies
          const originalConfig = error.config

          if (!isRefreshing) {
            isRefreshing = true

            api.post('/refresh', {
              refreshToken
            }).then(response => {
              const { token, refreshToken: newRefreshToken } = response.data

              setCookie(ctx, 'myNextAuth.token', token, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })

              setCookie(ctx, 'myNextAuth.refreshToken', newRefreshToken, {
                maxAge: 60 * 60 * 24 * 30, // 30 days
                path: '/'
              })

              api.defaults.headers.common['Authorization'] = `Bearer ${token}`

              failedRequestsQueue.forEach(request => request.onSuccess(token))
              failedRequestsQueue = []
            }).catch(error => {
              failedRequestsQueue.forEach(request => request.onFailure(error))
              failedRequestsQueue = []

              if (process.browser) {
                signOut()
              }
            }).finally(() => {
              isRefreshing = false
            })
          }

          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {

                if (!originalConfig?.headers) {
                  return reject('No valid headers configuration!')
                }

                originalConfig.headers['Authorization'] = `Bearer ${token}`

                resolve(api(originalConfig))
              },

              onFailure: (error: AxiosError) => {
                reject(error)
              }
            })
          })
        } else {
          if (process.browser) {
            signOut()
          }
        }
      }
      return Promise.reject(error);
    }
  )

  return api
}