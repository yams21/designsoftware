import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const app = express()
const port = process.env.PORT || 3001
const adminResetCode = process.env.ADMIN_RESET_CODE || 'DesignVoteAdmin'
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dataFile = path.join(__dirname, 'vote-data.json')

const defaultBallot = {
  options: [
    { id: 1, name: 'SOLIDWORKS', category: '3D CAD', votes: 0, accent: 'violet' },
    { id: 2, name: 'AutoDesk', category: 'Design suite', votes: 0, accent: 'sky' },
    { id: 3, name: 'No Preference', category: 'Open choice', votes: 0, accent: 'green' },
  ],
  voters: {},
  totalVoters: 11,
}

const readBallot = () => {
  try {
    if (!fs.existsSync(dataFile)) {
      fs.writeFileSync(dataFile, JSON.stringify(defaultBallot, null, 2), 'utf8')
      return structuredClone(defaultBallot)
    }

    const raw = fs.readFileSync(dataFile, 'utf8')
    const parsed = JSON.parse(raw)

    return {
      ...defaultBallot,
      ...parsed,
      options: parsed.options || defaultBallot.options,
      voters: parsed.voters || {},
      totalVoters: parsed.totalVoters || 11,
    }
  } catch {
    fs.writeFileSync(dataFile, JSON.stringify(defaultBallot, null, 2), 'utf8')
    return structuredClone(defaultBallot)
  }
}

const writeBallot = (ballot) => {
  fs.writeFileSync(dataFile, JSON.stringify(ballot, null, 2), 'utf8')
}

app.use(cors({
  origin: true,
  credentials: true,
}))
app.use(express.json())

app.get('/api/ballot', (_req, res) => {
  const ballot = readBallot()
  res.json(ballot)
})

app.post('/api/vote', (req, res) => {
  const { email, optionId } = req.body || {}

  if (!email || !optionId) {
    return res.status(400).json({ message: 'Email and option are required.' })
  }

  const normalizedEmail = String(email).trim().toLowerCase()
  if (!normalizedEmail || !normalizedEmail.includes('@')) {
    return res.status(400).json({ message: 'Please enter a valid work email.' })
  }

  const ballot = readBallot()

  if (ballot.voters[normalizedEmail]) {
    return res.status(409).json({ message: 'This email has already voted.' })
  }

  const option = ballot.options.find((item) => item.id === Number(optionId))
  if (!option) {
    return res.status(400).json({ message: 'Selected option was not found.' })
  }

  ballot.options = ballot.options.map((item) =>
    item.id === Number(optionId) ? { ...item, votes: item.votes + 1 } : item
  )
  ballot.voters[normalizedEmail] = Number(optionId)

  writeBallot(ballot)

  return res.json({ message: 'Vote recorded', ballot })
})

app.post('/api/reset', (req, res) => {
  const { code } = req.body || {}

  if (code !== adminResetCode) {
    return res.status(403).json({ message: 'Incorrect admin code. Access denied.' })
  }

  const resetBallot = {
    ...defaultBallot,
    options: defaultBallot.options.map((option) => ({ ...option })),
    voters: {},
  }

  writeBallot(resetBallot)
  return res.json({ message: 'All votes cleared', ballot: resetBallot })
})

const distPath = path.join(__dirname, 'dist')
const hasBuiltAssets = fs.existsSync(distPath)

if (hasBuiltAssets) {
  app.use(express.static(distPath))

  app.get('*', (_req, res) => {
    res.sendFile(path.join(distPath, 'index.html'))
  })
}

app.listen(port, '0.0.0.0', () => {
  console.log(`Voting app server running on http://localhost:${port}`)
  console.log(`Network access: http://0.0.0.0:${port}`)
})
