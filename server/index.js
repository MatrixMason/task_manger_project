const express = require('express')
const cors = require('cors')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const fs = require('fs')
const path = require('path')

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'password'

app.use(cors({
  origin: ['https://konstanta-tech.ru', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))
app.use(express.json())

const dbPath = path.join(__dirname, 'db.json')
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'))

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) return res.sendStatus(401)

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403)
    req.user = user
    next()
  })
}

app.post('/login', async (req, res) => {
  const { email, password } = req.body
  const user = db.users.find((u) => u.email === email)

  if (!user) return res.status(400).json({ error: 'User not found' })

  const validPassword = await bcrypt.compare(password, user.password)
  if (!validPassword) return res.status(400).json({ error: 'Invalid password' })

  const token = jwt.sign({ id: user.id }, JWT_SECRET)
  res.json({ user, accessToken: token })
})

app.get('/users', authenticateToken, (req, res) => {
  res.json(db.users)
})

app.get('/projects', authenticateToken, (req, res) => {
  res.json(db.projects)
})

app.get('/tasks', authenticateToken, (req, res) => {
  res.json(db.tasks)
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
