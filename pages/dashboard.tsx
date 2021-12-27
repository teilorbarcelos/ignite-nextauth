import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useCan } from "../hooks/useCan"
import { onlyAuth } from "../middlewares/onlyAuth"
import { setupAPIClient } from "../services/api"
import { api } from "../services/apiClient"

export default function Dashboard() {
  const { user } = useAuth()

  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list']
  })

  // useEffect(() => {
  //   api.get('/me')
  //     .then(response => console.log(response))
  // }, [])

  return (
    <>
      <h1>Email: {user?.email}</h1>
      {
        userCanSeeMetrics &&
        <div>Métricas</div>
      }
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