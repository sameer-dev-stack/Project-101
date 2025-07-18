// WebSocket event definitions matching Android repo specification
export const WEBSOCKET_EVENTS = {
  // Client → Server Events
  NEARBY_CABS: 'nearByCabs',
  REQUEST_CAB: 'requestCab',

  // Server → Client Events
  NEARBY_CABS_RESPONSE: 'nearByCabs',
  CAB_BOOKED: 'cabBooked',
  PICKUP_PATH: 'pickUpPath',
  LOCATION_UPDATE: 'location',
  CAB_IS_ARRIVING: 'cabIsArriving',
  CAB_ARRIVED: 'cabArrived',
  TRIP_START: 'tripStart',
  TRIP_PATH: 'tripPath',
  TRIP_END: 'tripEnd',

  // Error Events
  DIRECTION_API_FAILED: 'directionApiFailed',
  ROUTES_NOT_AVAILABLE: 'routesNotAvailable'
};

// Trip state definitions
export const TRIP_STATES = {
  IDLE: 'idle',
  BOOKING: 'booking',
  PICKUP: 'pickup',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

// Valid state transitions
export const VALID_TRANSITIONS = {
  [TRIP_STATES.IDLE]: [TRIP_STATES.BOOKING],
  [TRIP_STATES.BOOKING]: [TRIP_STATES.PICKUP, TRIP_STATES.IDLE],
  [TRIP_STATES.PICKUP]: [TRIP_STATES.IN_PROGRESS, TRIP_STATES.IDLE],
  [TRIP_STATES.IN_PROGRESS]: [TRIP_STATES.COMPLETED],
  [TRIP_STATES.COMPLETED]: [TRIP_STATES.IDLE]
};

// Animation constants
export const ANIMATION_CONFIG = {
  CAR_ANIMATION_DURATION: 3000, // 3 seconds for car movement
  PATH_ANIMATION_SPEED: 50, // milliseconds per point
  EASING_FUNCTION: 'easeInOutCubic',
  UPDATE_FREQUENCY: 2500 // 2.5 seconds for location updates
};

// Path colors
export const PATH_COLORS = {
  PICKUP: '#FF6B35',
  TRIP: '#4285F4'
};

// Utility functions for event validation
export function validateEventStructure(event, eventType) {
  if (!event || typeof event !== 'object') {
    return false;
  }

  if (event.type !== eventType) {
    return false;
  }

  switch (eventType) {
    case WEBSOCKET_EVENTS.NEARBY_CABS:
      return typeof event.lat === 'number' && typeof event.lng === 'number';
    
    case WEBSOCKET_EVENTS.REQUEST_CAB:
      return typeof event.pickUpLat === 'number' && 
             typeof event.pickUpLng === 'number' &&
             typeof event.dropLat === 'number' && 
             typeof event.dropLng === 'number';
    
    case WEBSOCKET_EVENTS.LOCATION_UPDATE:
      return typeof event.lat === 'number' && typeof event.lng === 'number';
    
    default:
      return true;
  }
}

export function isValidStateTransition(fromState, toState) {
  return VALID_TRANSITIONS[fromState]?.includes(toState) ?? false;
}