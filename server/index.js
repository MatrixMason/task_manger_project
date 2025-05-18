import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

app.use(
  cors({
    origin: ['https://konstanta-tech.ru', 'http://localhost:5173'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  }),
)

app.use(express.json())

const dbPath = join(__dirname, 'db.json')
const db = JSON.parse(readFileSync(dbPath, 'utf-8'))

const authenticateToken = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (!token) {
      return res.status(401).json({ error: 'Необходима авторизация' })
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ error: 'Токен просрочен' })
        }
        return res.status(403).json({ error: 'Недействительный токен' })
      }

      const user = db.users.find((u) => u.id === decoded.userId)
      if (!user) {
        return res.status(403).json({ error: 'Пользователь не найден' })
      }

      if (user.role !== decoded.role) {
        return res.status(403).json({ error: 'Недостаточно прав' })
      }

      req.user = decoded
      next()
    })
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Ошибка авторизации' })
  }
}

app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Необходимо указать email и пароль' })
    }

    const user = db.users.find((u) => u.email === email)
    if (!user) {
      return res.status(400).json({ error: 'Пользователь не найден' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(400).json({ error: 'Неверный пароль' })
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: user.role,
        email: user.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    )

    const { password: _, ...userWithoutPassword } = user

    res.json({
      user: userWithoutPassword,
      accessToken: token,
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/me', authenticateToken, (req, res) => {
  const user = db.users.find((u) => u.id === req.user.userId)
  if (!user) {
    return res.status(404).json({ error: 'Пользователь не найден' })
  }
  const { password, ...userWithoutPassword } = user
  res.json(userWithoutPassword)
})

app.get('/users', authenticateToken, (req, res) => {
  const usersWithoutPasswords = db.users.map(({ password, ...user }) => user)
  res.json(usersWithoutPasswords)
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
