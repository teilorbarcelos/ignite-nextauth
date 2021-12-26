import Router from "next/router"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { api } from "../services/api"

export default function Dashboard() {
  const { user } = useAuth()

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
      .catch(error => console.log(error))
  }, [])

  return (
    <h1>Email: {user?.email}</h1>
  )
}