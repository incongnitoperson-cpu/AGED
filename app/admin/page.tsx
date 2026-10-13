import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
  if (!profile?.is_admin) redirect('/feed')

  const { data: schools } = await supabase.from('schools').select('id,name').order('name')
  const { data: recent } = await supabase.from('predictions').select('id,question,status,correct_answer').order('created_at', { ascending: false }).limit(20)

  async function createPrediction(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!p?.is_admin) redirect('/feed')
    await supabase.from('predictions').insert({
      question: String(formData.get('question') || ''),
      school_id: String(formData.get('school_id') || ''),
      status: 'open',
      opens_at: new Date().toISOString(),
    })
    redirect('/admin')
  }

  async function resolve(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const { data: p } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single()
    if (!p?.is_admin) redirect('/feed')
    await supabase.from('predictions').update({ status: 'resolved', correct_answer: String(formData.get('answer')) }).eq('id', String(formData.get('id')))
    redirect('/admin')
  }

  return (
    <main className="shell">
      <nav className="nav"><Link className="logo" href="/feed">AGED</Link><div className="navlinks"><Link href="/feed">Daily 5</Link></div></nav>
      <section className="card">
        <div className="eyebrow">Admin</div>
        <h2>Create a take</h2>
        <form action={createPrediction}>
          <label>Question</label>
          <input className="input" name="question" required placeholder="Will Stanford win Friday night?" />
          <label>Campus</label>
          <select className="input" name="school_id" required>{schools?.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
          <button className="btn full">Publish now</button>
        </form>
      </section>

      <h2 style={{ margin: '28px 0 12px' }}>Recent takes</h2>
      {recent?.map((p) => (
        <section className="card" key={p.id}>
          <strong>{p.question}</strong>
          <p className="muted">{p.status}{p.correct_answer ? ` · ${p.correct_answer}` : ''}</p>
          {p.status !== 'resolved' && <form action={resolve} className="row"><input type="hidden" name="id" value={p.id}/><button className="btn secondary" name="answer" value="YEAH">Resolve YEAH</button><button className="btn secondary" name="answer" value="NAH">Resolve NAH</button></form>}
        </section>
      ))}
    </main>
  )
}
