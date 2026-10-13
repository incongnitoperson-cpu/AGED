'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Prediction = {
  id: string
  question: string
  status: string
  closes_at: string | null
}

export default function PredictionCard({ prediction, userId, initialVote }: { prediction: Prediction; userId: string; initialVote?: string | null }) {
  const [vote, setVote] = useState<string | null>(initialVote || null)
  const [confidence, setConfidence] = useState<'LEAN' | 'LOCK'>('LEAN')
  const [consensus, setConsensus] = useState<{ yeah_percent: number; nah_percent: number; total_count: number } | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function loadConsensus() {
    const supabase = createClient()
    const { data } = await supabase.rpc('get_consensus_after_vote', { p_prediction_id: prediction.id })
    if (data?.[0]) setConsensus(data[0])
  }

  async function cast(choice: 'YEAH' | 'NAH') {
    if (vote || loading) return
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.from('votes').insert({
      user_id: userId,
      prediction_id: prediction.id,
      choice,
      confidence,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setVote(choice)
    setLoading(false)
    await loadConsensus()
  }

  return (
    <article className="card">
      <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="pill">{prediction.status.toUpperCase()}</span>
        {!vote && (
          <button className="pill" onClick={() => setConfidence(confidence === 'LEAN' ? 'LOCK' : 'LEAN')} style={{ background: 'transparent', color: 'inherit' }}>
            {confidence}
          </button>
        )}
      </div>
      <div className="question">{prediction.question}</div>

      {!vote ? (
        <div className="row">
          <button className="voteBtn" onClick={() => cast('YEAH')}>YEAH</button>
          <button className="voteBtn" onClick={() => cast('NAH')}>NAH</button>
        </div>
      ) : (
        <>
          <p className="muted">You picked <strong style={{ color: 'white' }}>{vote}</strong>.</p>
          {!consensus ? (
            <button className="btn secondary" onClick={loadConsensus}>Reveal consensus</button>
          ) : (
            <div>
              <div className="row" style={{ justifyContent: 'space-between' }}>
                <strong>YEAH {consensus.yeah_percent}%</strong>
                <strong>NAH {consensus.nah_percent}%</strong>
              </div>
              <div className="bar"><div style={{ width: `${consensus.yeah_percent}%` }} /></div>
              <p className="muted">{consensus.total_count} prediction{consensus.total_count === 1 ? '' : 's'}</p>
            </div>
          )}
        </>
      )}
      {error && <p className="error">{error}</p>}
    </article>
  )
}
