const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const db = new Low(new JSONFile('db.json'));
await db.read();
db.data ||= { users: [], transactions: [], marketUpdates: [] };

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/auth/login', async (req, res) => {
  // In a real app, you would validate credentials here
  const token = jwt.sign({ id: 'user123' }, JWT_SECRET);
  res.json({ token });
});

app.get('/api/verify/status', authenticateToken, async (req, res) => {
  const user = db.data.users.find(u => u.id === req.user.id);
  res.json({ status: user?.verified ? 'verified' : 'pending' });
});

app.get('/api/market/updates', authenticateToken, async (req, res) => {
  const updates = db.data.marketUpdates;
  res.json({ updates });
});

app.post('/api/transactions', authenticateToken, async (req, res) => {
  const { type, details } = req.body;
  
  // Store transaction
  const transaction = {
    id: Date.now().toString(),
    type,
    details,
    userId: req.user.id,
    timestamp: new Date().toISOString()
  };
  
  db.data.transactions.push(transaction);
  await db.write();

  // Send email notification
  const emailContent = `
    New ${type} transaction request:
    ${JSON.stringify(details, null, 2)}
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: type === 'buy' ? 'buy@pi-bb.com' : 'sell@pi-bb.com',
    subject: `New ${type.toUpperCase()} Transaction Request`,
    text: emailContent
  });

  res.json({ success: true, transactionId: transaction.id });
});

// Start server
app.listen(port, () => {
  console.log(`PIBB backend server running on port ${port}`);
});
