import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username,schools(name)')
    .eq('id', user.id)
    .single()

  const { data: votes } = await supabase
    .from('votes')
    .select('choice,confidence,predictions(question,status,correct_answer)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const resolved = (votes || []).filter((v: any) => v.predictions?.status === 'resolved' && v.predictions?.correct_answer)
  const correct = resolved.filter((v: any) => v.choice === v.predictions.correct_answer).length
  const total = resolved.length
  const accuracy = total ? Math.round((correct / total) * 100) : 0
  const schoolName = Array.isArray(profile?.schools) ? profile?.schools?.[0]?.name : (profile?.schools as any)?.name

  return (
    <main className="shell">
      <nav className="nav">
        <Link className="logo" href="/feed">AGED</Link>
        <div className="navlinks"><Link href="/feed">Daily 5</Link></div>
      </nav>

      <section className="card">
        <div className="eyebrow">{schoolName || 'Campus'}</div>
        <h2>@{profile?.username || 'player'}</h2>
        <div className="statgrid" style={{ marginTop: 18 }}>
          <div className="stat"><strong>{correct}-{Math.max(total - correct, 0)}</strong><span className="muted">record</span></div>
          <div className="stat"><strong>{accuracy}%</strong><span className="muted">accuracy</span></div>
          <div className="stat"><strong>{votes?.length || 0}</strong><span className="muted">takes</span></div>
        </div>
      </section>

      <h2 style={{ margin: '28px 0 12px' }}>Your calls</h2>
      {votes?.slice(0, 20).map((v: any, i: number) => {
        const isResolved = v.predictions?.status === 'resolved'
        const won = isResolved && v.choice === v.predictions?.correct_answer
        return (
          <section className="card" key={i}>
            <div className="row" style={{ justifyContent: 'space-between' }}>
              <span className="pill">{v.choice} · {v.confidence}</span>
              {isResolved && <span className="pill">{won ? 'AGED WELL' : 'AGED BADLY'}</span>}
            </div>
            <div style={{ fontWeight: 800, fontSize: 18, marginTop: 12 }}>{v.predictions?.question}</div>
          </section>
        )
      })}
    </main>
  )
}
