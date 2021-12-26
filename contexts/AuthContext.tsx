import Router from "next/router"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"
import { destroyCookie, parseCookies, setCookie } from 'nookies'
import { api } from "../services/api"

interface CredentialsProps {
  email: string
  password: string
}

interface AuthContextData {
  signIn(credentials: CredentialsProps): Promise<void>
  isAuthenticated: boolean
  user: UserProps | null
}

interface AuthContextProviderProps {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function signOut() {
  destroyCookie(undefined, 'myNextAuth.token')
  destroyCookie(undefined, 'myNextAuth.refreshToken')

  Router.push('/')
}

interface UserProps extends Partial<UserSessionProps> {
  email: string
}

interface UserSessionProps {
  permissions: string[]
  roles: string[]
  token: string
  refreshToken: string
  error?: string
}

export function AuthProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)

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

      setIsAuthenticated(true)

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`

      Router.push('/dashboard')
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}