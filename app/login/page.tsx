import Link from 'next/link'
import { signIn, signUp } from './actions'

export default async function Login({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const params = await searchParams
  return (
    <main className="shell">
      <nav className="nav"><Link className="logo" href="/">AGED</Link></nav>
      <section className="card">
        <div className="eyebrow">Join AGED</div>
        <h2>Make your calls count.</h2>
        {params.error && <p className="error">{params.error}</p>}
        <form>
          <label>Username</label>
          <input className="input" name="username" placeholder="cooper" />
          <label>Email</label>
          <input className="input" name="email" type="email" required placeholder="you@school.edu" />
          <label>Password</label>
          <input className="input" name="password" type="password" minLength={6} required placeholder="••••••••" />
          <div className="row">
            <button className="btn" formAction={signUp}>Create account</button>
            <button className="btn secondary" formAction={signIn}>Log in</button>
          </div>
        </form>
      </section>
    </main>
  )
}
