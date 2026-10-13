import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import PredictionCard from '@/components/PredictionCard'

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
  const shortSchool = schoolName?.replace(' University', '').replace('UC ', '') || 'Campus'
  const answered = votes?.length || 0
  const total = predictions?.length || 5
  const initial = (profile.username || user.email || 'A').charAt(0).toUpperCase()

  return (
    <main className="shell">
      <nav className="nav">
        <button className="campus-pill">{shortSchool.toUpperCase()}⌄</button>
        <Link className="logo" href="/feed">aged</Link>
        <Link className="avatar" href="/profile">{initial}</Link>
      </nav>

      <section className="page-heading">
        <div className="eyebrow">TODAY AT {shortSchool.toUpperCase()}</div>
        <div className="display">5 takes. <span className="soft">Don’t overthink it.</span></div>
        <div className="progress-row">
          <div className="progress"><div style={{ width: `${Math.min(100, total ? (answered / total) * 100 : 0)}%` }} /></div>
          <div className="progress-count">{answered}/{total}</div>
        </div>
      </section>

      {!predictions?.length && (
        <section className="card empty-state">
          <div className="eyebrow">NOTHING LIVE YET</div>
          <div className="question">Today’s takes are loading up.</div>
          <p className="muted">Once an admin publishes questions for {shortSchool}, they’ll appear here.</p>
        </section>
      )}

      {predictions?.map((prediction, i) => (
        <PredictionCard
          key={prediction.id}
          prediction={prediction}
          userId={user.id}
          initialVote={voteMap.get(prediction.id)}
          index={i + 1}
          total={predictions.length}
        />
      ))}

      <nav className="bottom-nav">
        <Link className="active" href="/feed"><span className="nav-icon">◉</span><span>Today</span></Link>
        <Link href="/leaderboard"><span className="nav-icon">♙</span><span>Campus</span></Link>
        <Link href="/leaderboard"><span className="nav-icon">♢</span><span>Squads</span></Link>
        <Link href="/admin"><span className="nav-icon">＋</span><span>Drop</span></Link>
        <Link href="/profile"><span className="nav-icon">♧</span><span>You</span></Link>
      </nav>
    </main>
  )
}
