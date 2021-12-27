import Router from "next/router"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { api } from "../services/apiClient"

interface User {
  email: string;
  permissions: string[];
  roles: string[]
}

interface CredentialsProps {
  email: string
  password: string
}

interface AuthContextData {
  signIn: (credentials: CredentialsProps) => Promise<void>
  isAuthenticated: boolean
  user: User
  signOut: () => void
}

interface AuthContextProviderProps {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

// let authChannel: BroadcastChannel

export function signOut() {
  destroyCookie(undefined, 'myNextAuth.token')
  destroyCookie(undefined, 'myNextAuth.refreshToken')

  // authChannel.postMessage('signOut')

  Router.push('/')
}

export interface UserProps {
  email: string
  permissions: string[]
  roles: string[]
}

interface UserSessionProps {
  permissions: string[]
  roles: string[]
  token: string
  refreshToken: string
  error?: string
}

export function AuthProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<User>({} as User)
  const isAuthenticated = !!user

  // logo abaixo está uma funcionalidade
  // bem legal de deslogar e logar todas as abas ao mesmo tempo
  // pena que entra em loop infinito

  // useEffect(() => {
  //   authChannel = new BroadcastChannel('auth')

  //   authChannel.onmessage = (message) => {
  //     switch (message.data) {
  //       case 'signOut':

  //         signOut()
  //         authChannel.close()

  //         break

  //       case 'signIn':
  //         Router.push('/dashboard')
  //         authChannel.close()
  //         break

  //       default:
  //         break
  //     }
  //   }
  // }, [])

  useEffect(() => {
    const { 'myNextAuth.token': token } = parseCookies()

    if (token) {
      api.get<UserProps>('/me').then(response => {
        const { email, permissions, roles } = response.data

        setUser({
          email,
          permissions,
          roles
        })
      }).catch(() => {
        signOut()
      })
    }
  }, [])

  async function signIn({ email, password }: CredentialsProps) {
    try {
      const response = await api.post<UserSessionProps>('/sessions', {
        email,
        password
      })

      const { permissions, roles, token, refreshToken } = response.data

      setCookie(undefined, 'myNextAuth.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'myNextAuth.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        email,
        permissions,
        roles
      })

      // api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      api.defaults.headers['Authorization'] = `Bearer ${token}` // tipagem errada no axios...

      Router.push('/dashboard')

      // authChanel.postMessage('signIn')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}