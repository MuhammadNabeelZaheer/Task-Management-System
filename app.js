// app.js

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());

// Mock database arrays
let users = [];
let tasks = [];

// Middleware for user authentication
const authenticateUser = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded.user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Routes for user management
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = { username, password: hashedPassword };
    users.push(user);
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = users.find(user => user.username === username);
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const payload = { user: { username } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Routes for task management
app.post('/tasks', authenticateUser, (req, res) => {
  const { title, description, dueDate, category, priority } = req.body;
  const task = { title, description, dueDate, category, priority, completed: false };
  tasks.push(task);
  res.status(201).json({ message: 'Task created successfully' });
});

app.get('/tasks', authenticateUser, (req, res) => {
  const { sortBy } = req.query;
  let sortedTasks = [...tasks];
  if (sortBy === 'dueDate') {
    sortedTasks.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
  } else if (sortBy === 'category') {
    sortedTasks.sort((a, b) => a.category.localeCompare(b.category));
  } else if (sortBy === 'completed') {
    sortedTasks = sortedTasks.filter(task => task.completed);
  }
  res.json(sortedTasks);
});

app.patch('/tasks/:id', authenticateUser, (req, res) => {
  const taskId = parseInt(req.params.id);
  const { completed } = req.body;
  const task = tasks.find(task => task.id === taskId);
  if (!task) return res.status(404).json({ message: 'Task not found' });
  task.completed = completed;
  res.json({ message: 'Task updated successfully' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
