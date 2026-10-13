import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="shell">
      <nav className="nav">
        <div className="logo">AGED</div>
        <div className="navlinks">
          {user ? <Link href="/feed">Daily 5</Link> : <Link href="/login">Log in</Link>}
        </div>
      </nav>

      <section className="hero">
        <div className="eyebrow">Campus predictions</div>
        <h1>MAKE A TAKE.<br/>SEE HOW IT AGES.</h1>
        <p className="muted">Vote on what happens next. See what your campus thinks only after you commit.</p>
        <div className="row" style={{ marginTop: 24 }}>
          <Link className="btn" href={user ? '/feed' : '/login'}>{user ? 'Open Daily 5' : 'Start predicting'}</Link>
          <Link className="btn secondary" href="/leaderboard">Leaderboard</Link>
        </div>
      </section>

      <section className="card">
        <span className="pill">HOW IT WORKS</span>
        <div className="question">Five takes. YEAH or NAH. Consensus stays hidden until you vote.</div>
        <p className="muted">When a prediction resolves, your record and streak update. Good calls age well. Bad calls do not.</p>
      </section>
    </main>
  )
}
