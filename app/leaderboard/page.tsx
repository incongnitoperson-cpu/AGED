import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function LeaderboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('school_id,schools(name)').eq('id', user.id).single()
  if (!profile?.school_id) redirect('/onboarding')

  const { data: rows, error } = await supabase.rpc('get_school_leaderboard', { p_school_id: profile.school_id })
  const schoolName = Array.isArray(profile.schools) ? profile.schools[0]?.name : (profile.schools as any)?.name

  return (
    <main className="shell">
      <nav className="nav"><Link className="logo" href="/feed">AGED</Link><div className="navlinks"><Link href="/feed">Daily 5</Link><Link href="/profile">Profile</Link></div></nav>
      <div className="eyebrow">{schoolName || 'Campus'}</div>
      <h2>Leaderboard</h2>
      {error && <section className="card"><p className="muted">Run <code>supabase/phase2.sql</code> once in Supabase to enable the leaderboard.</p></section>}
      {!error && rows?.map((row: any, i: number) => (
        <section className="card" key={row.user_id}>
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <div><strong style={{ fontSize: 22 }}>#{i + 1} @{row.username || 'player'}</strong><div className="muted">{row.correct_count}-{Math.max(row.resolved_count - row.correct_count, 0)} record</div></div>
            <strong>{row.accuracy}%</strong>
          </div>
        </section>
      ))}
    </main>
  )
}
