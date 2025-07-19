import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { WEBSOCKET_EVENTS, validateEventStructure } from '../shared/websocket-events.js';
import CabSimulator from './services/CabSimulator.js';
import DirectionsService from './services/DirectionsService.js';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
  },
  transports: ['websocket', 'polling']
});

const PORT = process.env.PORT || 3003;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? false : ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));

// JWT authentication middleware
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

// Initialize services
const cabSimulator = new CabSimulator();
const directionsService = new DirectionsService();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    connectedClients: io.sockets.sockets.size
  });
});

// Protected API endpoints
app.get('/api/user/profile', authenticateToken, (req, res) => {
  res.json({ 
    userId: req.user.id,
    email: req.user.email,
    role: req.user.role || 'rider'
  });
});

app.get('/api/validate-user', authenticateToken, (req, res) => {
  res.json({ 
    valid: true, 
    user: req.user 
  });
});

// Active trips storage
const activeTrips = new Map();
const connectedClients = new Map();

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  connectedClients.set(socket.id, {
    id: socket.id,
    connectedAt: new Date(),
    lastActivity: new Date()
  });

  // Send initial connection confirmation
  socket.emit('connected', { 
    message: 'Connected to ridesharing server',
    timestamp: new Date().toISOString()
  });

  // Handle client messages
  socket.on('message', async (data) => {
    try {
      // Update last activity
      const client = connectedClients.get(socket.id);
      if (client) {
        client.lastActivity = new Date();
      }

      console.log(`Received message from ${socket.id}:`, data);

      if (!data || !data.type) {
        console.error('Invalid message format:', data);
        return;
      }

      switch (data.type) {
        case WEBSOCKET_EVENTS.NEARBY_CABS:
          await handleNearbyCabs(socket, data);
          break;

        case WEBSOCKET_EVENTS.REQUEST_CAB:
          await handleRequestCab(socket, data);
          break;

        default:
          console.log(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { 
        message: 'Error processing request',
        details: error.message 
      });
    }
  });

  // Handle ping for connection health
  socket.on('ping', () => {
    socket.emit('pong', { timestamp: new Date().toISOString() });
    // Update last activity
    const client = connectedClients.get(socket.id);
    if (client) {
      client.lastActivity = new Date();
    }
  });

  // Handle disconnection
  socket.on('disconnect', (reason) => {
    console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    
    // Clean up client data
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

// Handle nearby cabs request
async function handleNearbyCabs(socket, data) {
  if (!validateEventStructure(data, WEBSOCKET_EVENTS.NEARBY_CABS)) {
    console.error('Invalid nearByCabs request:', data);
    return;
  }

  try {
    const nearbyCabs = cabSimulator.getNearbyCabs(data.lat, data.lng, 2000); // 2km radius
    
    socket.emit(WEBSOCKET_EVENTS.NEARBY_CABS_RESPONSE, {
      type: WEBSOCKET_EVENTS.NEARBY_CABS_RESPONSE,
      locations: nearbyCabs
    });
  } catch (error) {
    console.error('Error getting nearby cabs:', error);
    socket.emit(WEBSOCKET_EVENTS.ROUTES_NOT_AVAILABLE, {
      type: WEBSOCKET_EVENTS.ROUTES_NOT_AVAILABLE
    });
  }
}

// Handle cab booking request
async function handleRequestCab(socket, data) {
  if (!validateEventStructure(data, WEBSOCKET_EVENTS.REQUEST_CAB)) {
    console.error('Invalid requestCab request:', data);
    return;
  }

  try {
    const tripId = `trip_${Date.now()}_${socket.id}`;
    const pickupLocation = { lat: data.pickUpLat, lng: data.pickUpLng };
    const dropLocation = { lat: data.dropLat, lng: data.dropLng };

    // Find nearest available cab
    const nearestCab = cabSimulator.findNearestCab(pickupLocation.lat, pickupLocation.lng);
    
    if (!nearestCab) {
      console.log('No cabs available');
      socket.emit(WEBSOCKET_EVENTS.ROUTES_NOT_AVAILABLE, {
        type: WEBSOCKET_EVENTS.ROUTES_NOT_AVAILABLE
      });
      return;
    }

    // Create trip record
    const trip = {
      id: tripId,
      clientId: socket.id,
      pickupLocation,
      dropLocation,
      driverLocation: nearestCab,
      status: 'booked',
      createdAt: new Date()
    };

    activeTrips.set(tripId, trip);

    // Confirm booking
    socket.emit(WEBSOCKET_EVENTS.CAB_BOOKED, {
      type: WEBSOCKET_EVENTS.CAB_BOOKED,
      tripId: tripId
    });

    // Start trip simulation
    startTripSimulation(socket, trip);

  } catch (error) {
    console.error('Error booking cab:', error);
    socket.emit(WEBSOCKET_EVENTS.DIRECTION_API_FAILED, {
      type: WEBSOCKET_EVENTS.DIRECTION_API_FAILED
    });
  }
}

// Trip simulation
async function startTripSimulation(socket, trip) {
  try {
    console.log(`Starting trip simulation for ${trip.id}`);

    // Phase 1: Calculate and send pickup path
    const pickupPath = await directionsService.getRoute(
      trip.driverLocation,
      trip.pickupLocation
    );

    if (pickupPath) {
      socket.emit(WEBSOCKET_EVENTS.PICKUP_PATH, {
        type: WEBSOCKET_EVENTS.PICKUP_PATH,
        path: pickupPath
      });

      // Simulate driver movement to pickup
      await simulateDriverMovement(socket, trip, pickupPath, 'pickup');
    }

    // Check if trip still exists (client might have disconnected)
    if (!activeTrips.has(trip.id)) {
      return;
    }

    // Phase 2: Driver arriving
    socket.emit(WEBSOCKET_EVENTS.CAB_IS_ARRIVING, {
      type: WEBSOCKET_EVENTS.CAB_IS_ARRIVING
    });

    await sleep(3000); // 3 seconds

    if (!activeTrips.has(trip.id)) {
      return;
    }

    // Phase 3: Driver arrived
    socket.emit(WEBSOCKET_EVENTS.CAB_ARRIVED, {
      type: WEBSOCKET_EVENTS.CAB_ARRIVED
    });

    await sleep(5000); // 5 seconds wait time

    if (!activeTrips.has(trip.id)) {
      return;
    }

    // Phase 4: Trip start
    socket.emit(WEBSOCKET_EVENTS.TRIP_START, {
      type: WEBSOCKET_EVENTS.TRIP_START
    });

    // Phase 5: Calculate and send trip path
    const tripPath = await directionsService.getRoute(
      trip.pickupLocation,
      trip.dropLocation
    );

    if (tripPath) {
      socket.emit(WEBSOCKET_EVENTS.TRIP_PATH, {
        type: WEBSOCKET_EVENTS.TRIP_PATH,
        path: tripPath
      });

      // Simulate trip movement
      await simulateDriverMovement(socket, trip, tripPath, 'trip');
    }

    if (!activeTrips.has(trip.id)) {
      return;
    }

    // Phase 6: Trip end
    socket.emit(WEBSOCKET_EVENTS.TRIP_END, {
      type: WEBSOCKET_EVENTS.TRIP_END
    });

    // Clean up trip
    activeTrips.delete(trip.id);
    console.log(`Trip ${trip.id} completed`);

  } catch (error) {
    console.error('Error in trip simulation:', error);
    socket.emit(WEBSOCKET_EVENTS.DIRECTION_API_FAILED, {
      type: WEBSOCKET_EVENTS.DIRECTION_API_FAILED
    });
    
    // Clean up failed trip
    activeTrips.delete(trip.id);
  }
}

// Simulate driver movement along path
async function simulateDriverMovement(socket, trip, path, phase) {
  if (!path || path.length < 2) {
    console.error('Invalid path for movement simulation');
    return;
  }

  const totalPoints = path.length;
  const updateInterval = 2500; // 2.5 seconds between updates
  
  for (let i = 0; i < totalPoints; i++) {
    // Check if trip still exists
    if (!activeTrips.has(trip.id)) {
      console.log(`Trip ${trip.id} cancelled during ${phase} phase`);
      return;
    }

    const currentLocation = path[i];
    
    // Update driver location
    trip.driverLocation = currentLocation;
    
    // Send location update to client
    socket.emit(WEBSOCKET_EVENTS.LOCATION_UPDATE, {
      type: WEBSOCKET_EVENTS.LOCATION_UPDATE,
      lat: currentLocation.lat,
      lng: currentLocation.lng
    });

    // Don't wait after the last point
    if (i < totalPoints - 1) {
      await sleep(updateInterval);
    }
  }
}

// Utility function for delays
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Cleanup inactive clients periodically
setInterval(() => {
  const now = new Date();
  const timeoutMs = 10 * 60 * 1000; // 10 minutes

  for (const [clientId, client] of connectedClients.entries()) {
    if (now.getTime() - client.lastActivity.getTime() > timeoutMs) {
      console.log(`Cleaning up inactive client: ${clientId}`);
      connectedClients.delete(clientId);
      
      // Clean up any trips for this client
      for (const [tripId, trip] of activeTrips.entries()) {
        if (trip.clientId === clientId) {
          activeTrips.delete(tripId);
        }
      }
    }
  }
}, 60000); // Check every minute

// Error handling
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Ridesharing server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`WebSocket server ready for connections`);
});