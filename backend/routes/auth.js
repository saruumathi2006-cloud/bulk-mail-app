const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const auth = require('../middleware/auth');

// Seed default admin if none exists
router.post('/init', async (req, res) => {
  try {
    const existing = await Admin.findOne();
    if (existing) {
      return res.json({ success: true, message: 'Admin already initialized', username: existing.username });
    }
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = new Admin({
      username: 'admin',
      password: hashedPassword,
      name: 'System Admin',
    });
    await admin.save();
    return res.status(201).json({ success: true, message: 'Default admin created (admin / admin123)' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ success: false, message: 'Please provide both username and password' });
  }

  try {
    // Check if user exists or auto-create default if DB is completely empty
    let admin = await Admin.findOne({ username: username.toLowerCase().trim() });
    
    // Auto-bootstrap default credentials if database is freshly empty
    const count = await Admin.countDocuments();
    if (count === 0 && username === 'admin' && password === 'admin123') {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      admin = await Admin.create({ username: 'admin', password: hashedPassword, name: 'System Admin' });
    }

    if (!admin) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username, name: admin.name },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        name: admin.name,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get current logged-in admin
router.get('/me', auth, async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select('-password');
    if (!admin) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, admin });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

