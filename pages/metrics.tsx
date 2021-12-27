import { onlyAuth } from "../middlewares/onlyAuth"
import { setupAPIClient } from "../services/api"

export default function Metrics() {

  return (
    <>
      <h1>Metrics Page</h1>
    </>
  )
}

export const getServerSideProps = onlyAuth(async (ctx) => {
  const apiClient = setupAPIClient(ctx)

  await apiClient.get('/me')

  return {
    props: {}
  }
}, {
  permissions: ['metrics.list'],
  roles: ['administrator']
})