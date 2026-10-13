'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

type Prediction = {
  id: string
  question: string
  status: string
  closes_at: string | null
}

export default function PredictionCard({
  prediction,
  userId,
  initialVote,
  index,
  total,
}: {
  prediction: Prediction
  userId: string
  initialVote?: string | null
  index: number
  total: number
}) {
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

  useEffect(() => {
    if (initialVote) loadConsensus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  const closeLabel = prediction.closes_at
    ? new Date(prediction.closes_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
    : 'soon'

  return (
    <article className="card prediction-card">
      <div className="card-meta">
        <span className="pill hot">● HOT</span>
        <span className="eyebrow">{index} OF {total}</span>
      </div>

      <div className="question">{prediction.question}</div>
      <p className="muted">Closes {closeLabel}</p>

      {!vote ? (
        <div className="vote-zone">
          <div className="row" style={{ justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="vote-label">YOU’RE ON THE RECORD</div>
            <button
              className={`pill ${confidence === 'LOCK' ? 'locked' : ''}`}
              onClick={() => setConfidence(confidence === 'LEAN' ? 'LOCK' : 'LEAN')}
            >
              {confidence === 'LOCK' ? '🔒 LOCK' : 'LEAN'}
            </button>
          </div>
          <div className="row">
            <button className="voteBtn yeah" disabled={loading} onClick={() => cast('YEAH')}>YEAH</button>
            <button className="voteBtn nah" disabled={loading} onClick={() => cast('NAH')}>NAH</button>
          </div>
        </div>
      ) : (
        <div className="consensus-box">
          <div className="vote-label">✓ YOU SAID {vote}</div>
          {consensus ? (
            <>
              <div className="bar"><div style={{ width: `${consensus.yeah_percent}%` }} /></div>
              <div className="row" style={{ justifyContent: 'space-between', fontSize: 13, fontWeight: 1000 }}>
                <span>YEAH {consensus.yeah_percent}%</span>
                <span>NAH {consensus.nah_percent}%</span>
              </div>
              <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
                {consensus.total_count} real vote{consensus.total_count === 1 ? '' : 's'} so far.
              </p>
            </>
          ) : (
            <button className="btn secondary" onClick={loadConsensus}>Show campus split</button>
          )}
        </div>
      )}

      {error && <p className="error">{error}</p>}
    </article>
  )
}
