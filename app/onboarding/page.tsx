import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export default async function Onboarding() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: schools } = await supabase.from('schools').select('id,name').order('name')

  async function saveSchool(formData: FormData) {
    'use server'
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) redirect('/login')
    const schoolId = String(formData.get('school_id') || '')
    await supabase.from('profiles').update({ school_id: schoolId }).eq('id', user.id)
    redirect('/feed')
  }

  return (
    <main className="shell">
      <div className="logo" style={{ marginBottom: 28 }}>AGED</div>
      <section className="card">
        <div className="eyebrow">One thing first</div>
        <h2>Pick your campus.</h2>
        <form action={saveSchool}>
          <select className="input" name="school_id" required defaultValue="">
            <option value="" disabled>Select school</option>
            {schools?.map((school) => <option key={school.id} value={school.id}>{school.name}</option>)}
          </select>
          <button className="btn full" type="submit">Enter AGED</button>
        </form>
      </section>
    </main>
  )
}
