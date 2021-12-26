import { createContext, ReactNode, useContext, useState } from "react"
import { api } from "../services/api"

interface CredentialsProps {
  email: string
  password: string
}

interface AuthContextData {
  signIn(credentials: CredentialsProps): Promise<void>
  isAuthenticated: boolean
}

interface AuthContextProviderProps {
  children: ReactNode
}

const AuthContext = createContext({} as AuthContextData)

export function AuthProvider({ children }: AuthContextProviderProps) {
  const [isAuthenticated, setisAuthenticated] = useState(false)

  async function signIn({ email, password }: CredentialsProps) {
    try {
      const response = await api.post('/sessions', {
        email,
        password
      })

      console.log(response.data)
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  return context
}