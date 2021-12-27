import { useEffect } from "react"
import { Can } from "../components/Can"
import { useAuth } from "../contexts/AuthContext"
import { onlyAuth } from "../middlewares/onlyAuth"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"

export default function Dashboard() {
  const { user, signOut } = useAuth()

  useEffect(() => {
    api.get('/me')
      .then(response => console.log(response))
  }, [])

  return (
    <>
      <h1>Email: {user?.email}</h1>

      <button
        onClick={signOut}
      >Sign out</button>

      <Can
        permissions={['metrics.list']}
      >
        <div>Métricas</div>
      </Can>
    </>
  )
}

export const getServerSideProps = onlyAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)

  await apiClient.get('/me')

  return {
    props: {}
  }
})