import Router from "next/router"
import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <h1>Email: {user?.email}</h1>
  )
}