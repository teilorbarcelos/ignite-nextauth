import { FormEvent, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { onlyGuest } from '../middlewares/onlyGuest'
import styles from '../styles/Home.module.css'

export default function Home() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    const data = {
      email,
      password
    }

    await signIn(data)
  }

  return (
    <form onSubmit={e => handleSubmit(e)} className={styles.container}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder='Digite o e-mail'
      />

      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder='Digite a senha'
      />
      <button type="submit">Entrar</button>
    </form>
  )
}

export const getServerSideProps = onlyGuest(async (ctx) => {


  return {
    props: {}
  }
})