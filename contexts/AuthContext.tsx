import Router from "next/router"
import { createContext, ReactNode, useContext, useState } from "react"
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

interface UserProps {
  email: string
  permissions: string[]
  roles: string[]
  error?: string
}
export function AuthProvider({ children }: AuthContextProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(!!user)

  async function signIn({ email, password }: CredentialsProps) {
    try {
      const response = await api.post<UserProps>('/sessions', {
        email,
        password
      })

      const { permissions, roles } = response.data

      setUser({
        email,
        permissions,
        roles
      })

      setIsAuthenticated(true)

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