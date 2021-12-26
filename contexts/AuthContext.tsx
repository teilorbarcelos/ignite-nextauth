import { createContext, ReactNode, useContext, useState } from "react"

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
    console.log({ email, password })
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