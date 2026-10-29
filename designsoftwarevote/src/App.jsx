import { useEffect, useMemo, useState } from 'react'
import './App.css'

const totalVoters = 11
const defaultOptions = [
  {
    id: 1,
    name: 'SOLIDWORKS',
    category: '3D CAD',
    description: 'A strong choice for parametric modeling, assemblies, and manufacturing workflows.',
    votes: 0,
    accent: 'violet',
  },
  {
    id: 2,
    name: 'AutoDesk',
    category: 'Design suite',
    description: 'A comprehensive platform for design, visualization, and engineering collaboration.',
    votes: 0,
    accent: 'sky',
  },
  {
    id: 3,
    name: 'No Preference',
    category: 'Open choice',
    description: 'No strong preference yet and open to the best tool for the team’s workflow.',
    votes: 0,
    accent: 'green',
  },
]

const buildBallotState = (payload = {}) => ({
  options: payload.options || defaultOptions,
  voters: payload.voters || {},
  totalVoters: payload.totalVoters || totalVoters,
  votesCast: payload.votesCast || 0,
  winningOption: payload.winningOption || null,
})

function App() {
  const [email, setEmail] = useState('')
  const [ballot, setBallot] = useState(buildBallotState())
  const [voterStatus, setVoterStatus] = useState('')
  const [showAdminReset, setShowAdminReset] = useState(false)
  const [adminCode, setAdminCode] = useState('')
  const [adminStatus, setAdminStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchBallot = async () => {
    try {
      const response = await fetch('/api/ballot')
      const data = await response.json()
      setBallot(buildBallotState(data))
    } catch (error) {
      setVoterStatus('Could not load the live vote data. Please try again in a moment.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchBallot()
  }, [])

  const normalizedEmail = email.trim().toLowerCase()
  const selectedId = normalizedEmail ? ballot.voters[normalizedEmail] ?? null : null
  const userHasVoted = Boolean(normalizedEmail && ballot.voters[normalizedEmail])

  const totalVotes = useMemo(
    () => ballot.options.reduce((sum, option) => sum + option.votes, 0),
    [ballot.options]
  )

  const leadingOption = useMemo(() => {
    if (!ballot.options.length || totalVotes === 0) return null
    return [...ballot.options].sort((a, b) => b.votes - a.votes)[0]
  }, [ballot.options, totalVotes])

  const getShare = (votes) => {
    if (totalVotes === 0) return 0
    return ((votes / totalVotes) * 100).toFixed(1)
  }

  const handleVote = async (optionId) => {
    if (!normalizedEmail) {
      setVoterStatus('Enter your work email before voting.')
      return
    }

    if (userHasVoted) {
      setVoterStatus('This email has already voted. Only one vote is allowed per person.')
      return
    }

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, optionId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setVoterStatus(data.message || 'Unable to record your vote.')
        return
      }

      setVoterStatus('Vote recorded successfully.')
      setBallot(buildBallotState(data.ballot))
    } catch (error) {
      setVoterStatus('The vote could not be submitted. Please try again.')
    }
  }

  const handleResetVotes = async () => {
    try {
      const response = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: adminCode }),
      })

      const data = await response.json()

      if (!response.ok) {
        setAdminStatus(data.message || 'Incorrect admin code. Access denied.')
        return
      }

      setAdminCode('')
      setAdminStatus('All votes have been reset.')
      setBallot(buildBallotState(data.ballot))
      setShowAdminReset(false)
    } catch (error) {
      setAdminStatus('Reset failed. Please try again.')
    }
  }

  return (
    <main className="vote-app">
      <header className="topbar">
        <div>
          <p className="eyebrow">Engineering design software vote</p>
          <h1>Engineering Design Software Vote</h1>
        </div>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setShowAdminReset((currentValue) => !currentValue)}
        >
          Admin reset
        </button>
      </header>

      {showAdminReset && (
        <section className="admin-panel">
          <label htmlFor="admin-reset">Admin password</label>
          <div className="admin-controls">
            <input
              id="admin-reset"
              type="password"
              value={adminCode}
              onChange={(event) => setAdminCode(event.target.value)}
              placeholder="Enter admin code"
            />
            <button type="button" className="reset-button" onClick={handleResetVotes}>
              Reset votes
            </button>
          </div>
          {adminStatus && <p className="admin-status">{adminStatus}</p>}
        </section>
      )}

      <section className="voter-entry">
        <label htmlFor="email">Your work email</label>
        <div className="email-row">
          <input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
          />
        </div>
        {voterStatus && <p className="voter-status">{voterStatus}</p>}
      </section>

      <section className="hero">
        <div className="hero__copy">
          <p className="eyebrow">Internal voting</p>
          <h2>Choose the design platform your engineering team wants to standardize on.</h2>
          <p className="hero__subtitle">
            This vote helps align the team around the software that best supports design,
            modeling, and cross-functional engineering workflows.
          </p>
        </div>

        <div className="stats-panel">
          <div className="stat-card">
            <span className="stat-label">Total voters</span>
            <strong>{ballot.totalVoters}</strong>
          </div>
          <div className="stat-card">
            <span className="stat-label">Votes cast</span>
            <strong>{totalVotes}</strong>
          </div>
        </div>
      </section>

      <section className="ballot-grid" aria-label="Voting options">
        {ballot.options.map((option, index) => {
          const isSelected = selectedId === option.id
          const share = Number(getShare(option.votes))
          const isDisabled = !normalizedEmail || userHasVoted

          return (
            <article
              key={option.id}
              className={`option-card ${isSelected ? 'selected' : ''}`}
            >
              <div className="option-header">
                <span className="rank-badge">#{index + 1}</span>
                <span className={`tag tag--${option.accent}`}>{option.category}</span>
              </div>

              <div className="option-body">
                <h3>{option.name}</h3>
                <p>{option.description}</p>
              </div>

              <div className="option-metrics">
                <span>{option.votes} votes</span>
                <span>{share}% share</span>
              </div>

              <div className="progress-bar" aria-hidden="true">
                <span style={{ width: `${share}%` }} />
              </div>

              <button
                type="button"
                className={`vote-button ${isSelected ? 'is-active' : ''}`}
                onClick={() => handleVote(option.id)}
                disabled={isDisabled}
              >
                {isSelected ? 'Your vote' : userHasVoted ? 'Vote locked' : 'Vote for this'}
              </button>
            </article>
          )
        })}
      </section>

      <section className="insight-grid">
        <div className="panel">
          <p className="panel-label">Winner</p>
          {leadingOption ? (
            <>
              <h3>{leadingOption.name}</h3>
              <p>
                Leading with <strong>{leadingOption.votes}</strong> votes and a{' '}
                <strong>{getShare(leadingOption.votes)}%</strong> share of the total ballot.
              </p>
            </>
          ) : (
            <>
              <h3>No votes yet</h3>
              <p>Cast a vote below to start the tally.</p>
            </>
          )}
        </div>

        <div className="panel">
          <p className="panel-label">Your vote</p>
          {selectedId ? (
            <>
              <h3>{ballot.options.find((option) => option.id === selectedId)?.name}</h3>
              <p>
                You have already voted once. The ballot is locked to your email address.
              </p>
            </>
          ) : (
            <>
              <h3>No vote selected</h3>
              <p>Enter your work email and choose one option to vote.</p>
            </>
          )}
        </div>
      </section>

      {isLoading && <p className="loading-state">Loading current ballot…</p>}
    </main>
  )
}

export default App
