const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const cors = require('cors');
const port = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Mock user data (replace with DB later)
const users = [{ email: 'test@example.com', password: 'password123' }];

// Login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  const user = users.find(u => u.email === email && u.password === password);
  if (user) {
    res.json({ message: 'Login successful', success: true });
  } else {
    res.status(401).json({ message: 'Invalid credentials', success: false });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/loginapp', { useNewUrlParser: true, useUnifiedTopology: true });

// User schema
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const User = mongoose.model('User', UserSchema);

// Replace mock user data
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email, password });

  if (user) {
    res.json({ message: 'Login successful', success: true });
  } else {
    res.status(401).json({ message: 'Invalid credentials', success: false });
  }
});

