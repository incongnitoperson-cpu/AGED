import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionCard from '@/components/PredictionCard'
import { signOut } from '@/app/login/actions'

export default async function Feed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('username,school_id,schools(name)')
    .eq('id', user.id)
    .single()

  if (!profile?.school_id) redirect('/onboarding')

  const { data: predictions } = await supabase
    .from('predictions')
    .select('id,question,status,closes_at')
    .eq('school_id', profile.school_id)
    .eq('status', 'open')
    .lte('opens_at', new Date().toISOString())
    .order('created_at', { ascending: false })
    .limit(5)

  const predictionIds = predictions?.map((p) => p.id) || []
  const { data: votes } = predictionIds.length
    ? await supabase.from('votes').select('prediction_id,choice').eq('user_id', user.id).in('prediction_id', predictionIds)
    : { data: [] as { prediction_id: string; choice: string }[] }

  const voteMap = new Map(votes?.map((v) => [v.prediction_id, v.choice]))
  const schoolName = Array.isArray(profile.schools) ? profile.schools[0]?.name : (profile.schools as { name?: string } | null)?.name

  return (
    <main className="shell">
      <nav className="nav">
        <Link className="logo" href="/">AGED</Link>
        <div className="navlinks">
          <Link href="/leaderboard">Leaderboard</Link>
          <Link href="/profile">Profile</Link>
          <form action={signOut}><button style={{ background: 'none', border: 0, color: 'inherit', padding: 0 }}>Log out</button></form>
        </div>
      </nav>

      <div style={{ marginBottom: 20 }}>
        <div className="eyebrow">{schoolName || 'Your campus'}</div>
        <h2>Today’s takes</h2>
        <p className="muted">Pick before you peek.</p>
      </div>

      {!predictions?.length && (
        <section className="card">
          <div className="question">No live takes yet.</div>
          <p className="muted">Add the launch questions in Supabase, then refresh this page.</p>
        </section>
      )}

      {predictions?.map((prediction) => (
        <PredictionCard key={prediction.id} prediction={prediction} userId={user.id} initialVote={voteMap.get(prediction.id)} />
      ))}
    </main>
  )
}
