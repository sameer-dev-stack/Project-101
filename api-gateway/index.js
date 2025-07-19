import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3003', // Ridesharing Frontend
    'http://localhost:3004', // Auth Frontend
    'http://localhost:9002'  // VelocityGo default port
  ],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// JWT validation middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'API Gateway', timestamp: new Date().toISOString() });
});

// Auth service proxy (no authentication required)
app.use('/api/auth', createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL || 'http://localhost:9002',
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api'
  },
  onError: (err, req, res) => {
    console.error('Auth service proxy error:', err.message);
    res.status(503).json({ error: 'Auth service unavailable' });
  }
}));

// Protected ridesharing service proxy
app.use('/api/ridesharing', authenticateToken, createProxyMiddleware({
  target: process.env.RIDESHARING_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  pathRewrite: {
    '^/api/ridesharing': '/api'
  },
  onError: (err, req, res) => {
    console.error('Ridesharing service proxy error:', err.message);
    res.status(503).json({ error: 'Ridesharing service unavailable' });
  }
}));

// WebSocket proxy for ridesharing (with auth validation)
app.use('/ws', (req, res, next) => {
  // Extract token from query parameter for WebSocket connections
  const token = req.query.token;
  
  if (!token) {
    return res.status(401).json({ error: 'WebSocket token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key', (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid WebSocket token' });
    }
    req.user = user;
    next();
  });
}, createProxyMiddleware({
  target: process.env.RIDESHARING_SERVICE_URL || 'http://localhost:3000',
  changeOrigin: true,
  ws: true, // Enable WebSocket proxying
  onError: (err, req, res) => {
    console.error('WebSocket proxy error:', err.message);
    res.status(503).json({ error: 'WebSocket service unavailable' });
  }
}));

// Catch-all route
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal gateway error' });
});

app.listen(PORT, () => {
  console.log(`🚀 API Gateway running on port ${PORT}`);
  console.log(`📋 Routes configured:`);
  console.log(`   - /api/auth/* → Auth Service (${process.env.AUTH_SERVICE_URL || 'http://localhost:9002'})`);
  console.log(`   - /api/ridesharing/* → Ridesharing Service (${process.env.RIDESHARING_SERVICE_URL || 'http://localhost:3000'})`);
  console.log(`   - /ws → WebSocket Service (${process.env.RIDESHARING_SERVICE_URL || 'http://localhost:3000'})`);
});