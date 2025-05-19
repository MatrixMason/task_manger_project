import express from 'express'
import cors from 'cors'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { readFileSync, writeFileSync } from 'fs'
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
    debugger

    const user = db.users.find((u) => u.email === email)
    if (!user) {
      return res.status(401).json({ error: 'Неверное имя пользователя или пароль' })
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

    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password

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
  const userWithoutPassword = { ...user }
  delete userWithoutPassword.password
  res.json(userWithoutPassword)
})

app.get('/users', authenticateToken, (req, res) => {
  const usersWithoutPasswords = db.users.map((user) => {
    const userWithoutPassword = { ...user }
    delete userWithoutPassword.password
    return userWithoutPassword
  })
  res.json(usersWithoutPasswords)
})

app.post('/users', async (req, res) => {
  try {
    const { email, password, name, role } = req.body

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Необходимо указать email, пароль и имя' })
    }

    const existingUser = db.users.find((u) => u.email === email)
    if (existingUser) {
      return res.status(400).json({ error: 'Пользователь с таким email уже существует' })
    }

    const hashedPassword = password.startsWith('$2b$') ? password : await bcrypt.hash(password, 10)
    const newUser = {
      id: Date.now().toString(),
      email,
      password: hashedPassword,
      name,
      role,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.users.push(newUser)

    writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8')

    const token = jwt.sign(
      {
        userId: newUser.id,
        role: newUser.role,
        email: newUser.email,
      },
      JWT_SECRET,
      { expiresIn: '24h' },
    )

    const userWithoutPassword = { ...newUser }
    delete userWithoutPassword.password

    res.status(201).json({
      user: userWithoutPassword,
      accessToken: token,
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/projects', authenticateToken, (req, res) => {
  res.json(db.projects)
})

app.post('/projects', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body

    if (!name) {
      return res.status(400).json({ error: 'Название проекта обязательно' })
    }

    const newProject = {
      id: Math.random().toString(36).substr(2, 4),
      name,
      description,
      status: 'active',
      teamMembers: [],
      updatedAt: new Date().toISOString(),
    }

    db.projects.push(newProject)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(201).json(newProject)
  } catch (error) {
    console.error('Create project error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/tasks', authenticateToken, (req, res) => {
  res.json(db.tasks)
})

app.post('/tasks', authenticateToken, (req, res) => {
  try {
    const { title, description, status, priority, assignedTo, projectId, deadline } = req.body

    if (!title) {
      return res.status(400).json({ error: 'Название задачи обязательно' })
    }

    const newTask = {
      id: Math.random().toString(36).substr(2, 4),
      title,
      description,
      status: status || 'todo',
      priority: priority || 'medium',
      assignedTo,
      projectId,
      deadline,
      attachments: [],
      createdBy: req.user.userId,
      completed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    db.tasks.push(newTask)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(201).json(newTask)
  } catch (error) {
    console.error('Create task error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.patch('/projects/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const { name, description, status, teamMembers } = req.body

    const projectIndex = db.projects.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    const updatedProject = {
      ...db.projects[projectIndex],
      name: name || db.projects[projectIndex].name,
      description: description !== undefined ? description : db.projects[projectIndex].description,
      status: status || db.projects[projectIndex].status,
      teamMembers: teamMembers || db.projects[projectIndex].teamMembers,
      updatedAt: new Date().toISOString(),
    }

    db.projects[projectIndex] = updatedProject
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.json(updatedProject)
  } catch (error) {
    console.error('Update project error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.patch('/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const { title, description, status, priority, assignedTo, projectId, deadline, completed } =
      req.body

    const taskIndex = db.tasks.findIndex((t) => t.id === id)
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Задача не найдена' })
    }

    const updatedTask = {
      ...db.tasks[taskIndex],
      title: title || db.tasks[taskIndex].title,
      description: description !== undefined ? description : db.tasks[taskIndex].description,
      status: status || db.tasks[taskIndex].status,
      priority: priority || db.tasks[taskIndex].priority,
      assignedTo: assignedTo !== undefined ? assignedTo : db.tasks[taskIndex].assignedTo,
      projectId: projectId !== undefined ? projectId : db.tasks[taskIndex].projectId,
      deadline: deadline !== undefined ? deadline : db.tasks[taskIndex].deadline,
      completed: completed !== undefined ? completed : db.tasks[taskIndex].completed,
      updatedAt: new Date().toISOString(),
    }

    db.tasks[taskIndex] = updatedTask
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.json(updatedTask)
  } catch (error) {
    console.error('Update task error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.get('/comments', authenticateToken, (req, res) => {
  try {
    const { taskId } = req.query

    if (!taskId) {
      return res.status(400).json({ error: 'Необходимо указать ID задачи' })
    }

    const taskComments = db.comments.filter((comment) => comment.taskId === taskId)
    res.json(taskComments)
  } catch (error) {
    console.error('Get comments error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.post('/comments', authenticateToken, (req, res) => {
  try {
    const { taskId, text, attachments = [] } = req.body

    if (!taskId || !text) {
      return res.status(400).json({ error: 'Необходимо указать ID задачи и текст комментария' })
    }

    const task = db.tasks.find((t) => t.id === taskId)
    if (!task) {
      return res.status(404).json({ error: 'Задача не найдена' })
    }

    const newComment = {
      id: Math.random().toString(16).slice(2, 6),
      taskId,
      text,
      userId: req.user.userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      attachments,
    }

    db.comments.push(newComment)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(201).json(newComment)
  } catch (error) {
    console.error('Create comment error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.patch('/comments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const { text } = req.body

    if (!text) {
      return res.status(400).json({ error: 'Необходимо указать текст комментария' })
    }

    const commentIndex = db.comments.findIndex((c) => c.id === id)
    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Комментарий не найден' })
    }

    if (db.comments[commentIndex].userId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет прав на редактирование этого комментария' })
    }

    const updatedComment = {
      ...db.comments[commentIndex],
      text,
      updatedAt: new Date().toISOString(),
    }

    db.comments[commentIndex] = updatedComment
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.json(updatedComment)
  } catch (error) {
    console.error('Update comment error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/comments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const commentIndex = db.comments.findIndex((c) => c.id === id)

    if (commentIndex === -1) {
      return res.status(404).json({ error: 'Комментарий не найден' })
    }

    if (db.comments[commentIndex].userId !== req.user.userId) {
      return res.status(403).json({ error: 'Нет прав на удаление этого комментария' })
    }

    db.comments.splice(commentIndex, 1)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(204).send()
  } catch (error) {
    console.error('Delete comment error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/tasks/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const user = db.users.find((u) => u.id === req.user.userId)

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Только администраторы могут удалять задачи' })
    }

    const taskIndex = db.tasks.findIndex((t) => t.id === id)
    if (taskIndex === -1) {
      return res.status(404).json({ error: 'Задача не найдена' })
    }

    db.comments = db.comments.filter((c) => c.taskId !== id)

    db.tasks.splice(taskIndex, 1)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(204).send()
  } catch (error) {
    console.error('Delete task error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/projects/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const user = db.users.find((u) => u.id === req.user.userId)

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Только администраторы могут удалять проекты' })
    }

    const projectIndex = db.projects.findIndex((p) => p.id === id)
    if (projectIndex === -1) {
      return res.status(404).json({ error: 'Проект не найден' })
    }

    const projectTasks = db.tasks.filter((t) => t.projectId === id)
    projectTasks.forEach((task) => {
      db.comments = db.comments.filter((c) => c.taskId !== task.id)
    })

    db.tasks = db.tasks.filter((t) => t.projectId !== id)

    db.projects.splice(projectIndex, 1)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(204).send()
  } catch (error) {
    console.error('Delete project error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.patch('/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const { name, email, role } = req.body
    const currentUser = db.users.find((u) => u.id === req.user.userId)

    const userIndex = db.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    if (role && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Только администраторы могут менять роли' })
    }

    if (id !== currentUser.id && currentUser.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав на редактирование этого пользователя' })
    }

    if (email) {
      const emailExists = db.users.some((u) => u.email === email && u.id !== id)
      if (emailExists) {
        return res.status(400).json({ error: 'Пользователь с таким email уже существует' })
      }
    }

    const updatedUser = {
      ...db.users[userIndex],
      ...(name && { name }),
      ...(email && { email }),
      ...(role && { role }),
      updatedAt: new Date().toISOString(),
    }

    db.users[userIndex] = updatedUser
    writeFileSync(dbPath, JSON.stringify(db, null, 2))

    const { password, ...userWithoutPassword } = updatedUser
    res.json(userWithoutPassword)
  } catch (error) {
    console.error('Update user error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.delete('/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params
    const adminUser = db.users.find((u) => u.id === req.user.userId)

    if (adminUser.role !== 'admin') {
      return res.status(403).json({ error: 'Только администраторы могут удалять пользователей' })
    }

    if (id === req.user.userId) {
      return res.status(400).json({ error: 'Нельзя удалить свой собственный аккаунт' })
    }

    const userIndex = db.users.findIndex((u) => u.id === id)
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Пользователь не найден' })
    }

    db.comments = db.comments.filter((c) => c.userId !== id)

    db.tasks.forEach((task) => {
      if (task.assignedTo === id) {
        task.assignedTo = null
      }
    })

    db.projects.forEach((project) => {
      if (project.teamMembers) {
        project.teamMembers = project.teamMembers.filter((memberId) => memberId !== id)
      }
    })

    db.users.splice(userIndex, 1)
    writeFileSync(dbPath, JSON.stringify(db, null, 2))
    res.status(204).send()
  } catch (error) {
    console.error('Delete user error:', error)
    res.status(500).json({ error: 'Ошибка сервера' })
  }
})

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
})
