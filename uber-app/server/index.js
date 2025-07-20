import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { body, validationResult } from 'express-validator';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://ridesharing-101.netlify.app', 'http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 5001;

// Security middleware
app.use(helmet());

// CORS configuration with debugging
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.NODE_ENV === 'production' 
      ? ['https://ridesharing-101.netlify.app', process.env.CORS_ORIGIN].filter(Boolean)
      : ['http://localhost:3000', 'http://localhost:3001'];
    
    console.log('CORS check - Origin:', origin);
    console.log('CORS check - Allowed origins:', allowedOrigins);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('CORS_ORIGIN env var:', process.env.CORS_ORIGIN);
    
    // Allow requests with no origin (mobile apps, postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// Connect to MongoDB (using in-memory for demo)
const users = new Map();
const trips = new Map();

// User Model Schema (simplified)
const createUser = (email, password, name) => {
  const id = Date.now().toString();
  const hashedPassword = bcrypt.hashSync(password, 10);
  const user = {
    id,
    email,
    password: hashedPassword,
    name,
    createdAt: new Date()
  };
  users.set(id, user);
  return user;
};

const findUserByEmail = (email) => {
  for (const user of users.values()) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
};

const findUserById = (id) => {
  return users.get(id);
};

// JWT Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'uber-secret-key', (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = decoded;
    next();
  });
};

// Auth Routes
app.post('/api/auth/signup', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password, name } = req.body;

    // Check if user already exists
    const existingUser = findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = createUser(email, password, name);

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET || 'uber-secret-key',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/auth/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').exists()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'Validation failed', 
        errors: errors.array() 
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = findUserByEmail(email);
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      },
      process.env.JWT_SECRET || 'uber-secret-key',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/api/auth/verify', authenticateToken, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connectedClients: io.sockets.sockets.size
  });
});

// Protected ridesharing routes
app.get('/api/rides/history', authenticateToken, (req, res) => {
  const userTrips = Array.from(trips.values()).filter(trip => trip.userId === req.user.id);
  res.json({ trips: userTrips });
});

// Dhaka ridesharing simulation data
const nearbyCabsData = [
  { lat: 23.8103, lng: 90.4125 }, // Central Dhaka
  { lat: 23.7461, lng: 90.3742 }, // Dhanmondi
  { lat: 23.7925, lng: 90.4078 }, // Gulshan
  { lat: 23.7937, lng: 90.4037 }, // Banani
  { lat: 23.7387, lng: 90.3950 }, // Shahbagh
  { lat: 23.8759, lng: 90.3795 }, // Uttara
  { lat: 23.7104, lng: 90.4074 }, // Old Dhaka
  { lat: 23.8433, lng: 90.3978 }  // Airport Area
];

// Active trips storage
const activeTrips = new Map();
const connectedClients = new Map();

// WebSocket authentication
const authenticateSocket = (socket, next) => {
  const token = socket.handshake.query.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }

  jwt.verify(token, process.env.JWT_SECRET || 'uber-secret-key', (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = decoded;
    next();
  });
};

// WebSocket connection handling with authentication
io.use(authenticateSocket);

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id} (User: ${socket.user.email})`);
  
  connectedClients.set(socket.id, {
    id: socket.id,
    userId: socket.user.id,
    email: socket.user.email,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  socket.emit('connected', { 
    message: 'Connected to Uber server',
    user: socket.user,
    timestamp: new Date().toISOString()
  });

  // Handle nearby cabs request
  socket.on('nearByCabs', (data) => {
    console.log(`Nearby cabs request from ${socket.user.email}:`, data);
    
    if (data.lat && data.lng) {
      // Simulate nearby cabs around user location
      const cabs = nearbyCabsData.map(cab => ({
        lat: cab.lat + (Math.random() - 0.5) * 0.01,
        lng: cab.lng + (Math.random() - 0.5) * 0.01
      }));
      
      socket.emit('nearByCabs', {
        type: 'nearByCabs',
        locations: cabs
      });
    }
  });

  // Handle cab booking request
  socket.on('requestCab', async (data) => {
    console.log(`Cab request from ${socket.user.email}:`, data);
    
    if (data.pickUpLat && data.pickUpLng && data.dropLat && data.dropLng) {
      const tripId = `trip_${Date.now()}_${socket.id}`;
      
      // Create trip record
      const trip = {
        id: tripId,
        userId: socket.user.id,
        clientId: socket.id,
        pickupLocation: { lat: data.pickUpLat, lng: data.pickUpLng },
        dropLocation: { lat: data.dropLat, lng: data.dropLng },
        paymentMethod: data.paymentMethod || null,
        status: 'booked',
        createdAt: new Date()
      };

      activeTrips.set(tripId, trip);
      trips.set(tripId, trip);

      // Confirm booking
      socket.emit('cabBooked', {
        type: 'cabBooked',
        tripId: tripId
      });

      // Start trip simulation
      startTripSimulation(socket, trip);
    }
  });

  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id} (${socket.user.email}), reason: ${reason}`);
    
    connectedClients.delete(socket.id);
    
    // Cancel any active trip for this client
    for (const [tripId, trip] of activeTrips.entries()) {
      if (trip.clientId === socket.id) {
        console.log(`Cancelling trip ${tripId} due to client disconnect`);
        activeTrips.delete(tripId);
        break;
      }
    }
  });
});

// Trip simulation
async function startTripSimulation(socket, trip) {
  try {
    console.log(`Starting trip simulation for ${trip.id}`);

    // Simulate pickup path (simplified) - Start from random nearby Dhaka location
    const driverStartLocation = nearbyCabsData[Math.floor(Math.random() * nearbyCabsData.length)];
    const pickupPath = generateSimplePath(
      { 
        lat: driverStartLocation.lat + (Math.random() - 0.5) * 0.01, 
        lng: driverStartLocation.lng + (Math.random() - 0.5) * 0.01 
      },
      trip.pickupLocation
    );

    socket.emit('pickUpPath', {
      type: 'pickUpPath',
      path: pickupPath
    });

    // Simulate driver movement to pickup
    await simulateDriverMovement(socket, trip, pickupPath);

    if (!activeTrips.has(trip.id)) return;

    // Driver arriving
    socket.emit('cabIsArriving', { type: 'cabIsArriving' });
    await sleep(3000);

    if (!activeTrips.has(trip.id)) return;

    // Driver arrived
    socket.emit('cabArrived', { type: 'cabArrived' });
    await sleep(5000);

    if (!activeTrips.has(trip.id)) return;

    // Trip start
    socket.emit('tripStart', { type: 'tripStart' });

    // Simulate trip path
    const tripPath = generateSimplePath(trip.pickupLocation, trip.dropLocation);
    
    socket.emit('tripPath', {
      type: 'tripPath',
      path: tripPath
    });

    // Simulate trip movement
    await simulateDriverMovement(socket, trip, tripPath);

    if (!activeTrips.has(trip.id)) return;

    // Trip end
    socket.emit('tripEnd', { type: 'tripEnd' });
    
    // Update trip status
    trip.status = 'completed';
    trip.completedAt = new Date();

    activeTrips.delete(trip.id);
    console.log(`Trip ${trip.id} completed`);

  } catch (error) {
    console.error('Error in trip simulation:', error);
    socket.emit('error', { message: 'Trip simulation failed' });
    activeTrips.delete(trip.id);
  }
}

// Simulate driver movement along path
async function simulateDriverMovement(socket, trip, path) {
  if (!path || path.length < 2) return;

  const updateInterval = 2500;
  
  for (let i = 0; i < path.length; i++) {
    if (!activeTrips.has(trip.id)) {
      console.log(`Trip ${trip.id} cancelled during movement`);
      return;
    }

    const currentLocation = path[i];
    
    socket.emit('location', {
      type: 'location',
      lat: currentLocation.lat,
      lng: currentLocation.lng
    });

    if (i < path.length - 1) {
      await sleep(updateInterval);
    }
  }
}

// Generate simple path between two points
function generateSimplePath(start, end) {
  const path = [];
  const steps = 5;
  
  for (let i = 0; i <= steps; i++) {
    const ratio = i / steps;
    const lat = start.lat + (end.lat - start.lat) * ratio;
    const lng = start.lng + (end.lng - start.lng) * ratio;
    path.push({ lat, lng });
  }
  
  return path;
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start server
server.listen(PORT, () => {
  console.log(`🚗 Uber-like server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket server ready for authenticated connections`);
});