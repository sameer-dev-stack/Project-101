import { useState, useCallback } from 'react';

const TRIP_STATES = {
  IDLE: 'idle',
  BOOKING: 'booking', 
  PICKUP: 'pickup',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
};

export const useTripState = () => {
  const [tripState, setTripState] = useState(TRIP_STATES.IDLE);
  const [tripData, setTripData] = useState({
    id: null,
    pickupLocation: null,
    dropLocation: null,
    driver: null,
    estimatedTime: null,
    startTime: null,
    endTime: null
  });

  const updateTripState = useCallback((newState, data = {}) => {
    console.log(`Trip state changing from ${tripState} to ${newState}`);
    
    // Validate state transitions
    const validTransitions = {
      [TRIP_STATES.IDLE]: [TRIP_STATES.BOOKING],
      [TRIP_STATES.BOOKING]: [TRIP_STATES.PICKUP, TRIP_STATES.IDLE],
      [TRIP_STATES.PICKUP]: [TRIP_STATES.IN_PROGRESS, TRIP_STATES.IDLE],
      [TRIP_STATES.IN_PROGRESS]: [TRIP_STATES.COMPLETED, TRIP_STATES.IDLE],
      [TRIP_STATES.COMPLETED]: [TRIP_STATES.IDLE]
    };

    if (!validTransitions[tripState]?.includes(newState)) {
      console.warn(`Invalid state transition from ${tripState} to ${newState}`);
      return false;
    }

    setTripState(newState);
    
    // Update trip data based on state
    setTripData(prev => {
      const updated = { ...prev, ...data };
      
      switch (newState) {
        case TRIP_STATES.BOOKING:
          updated.startTime = new Date();
          break;
        case TRIP_STATES.PICKUP:
          updated.driver = data.driver || prev.driver;
          updated.estimatedTime = data.estimatedTime || prev.estimatedTime;
          break;
        case TRIP_STATES.IN_PROGRESS:
          updated.actualStartTime = new Date();
          break;
        case TRIP_STATES.COMPLETED:
          updated.endTime = new Date();
          break;
        case TRIP_STATES.IDLE:
          if (tripState === TRIP_STATES.COMPLETED) {
            // Keep completed trip data for history
            return updated;
          } else {
            // Reset for cancelled trips
            return {
              id: null,
              pickupLocation: null,
              dropLocation: null,
              driver: null,
              estimatedTime: null,
              startTime: null,
              endTime: null
            };
          }
        default:
          break;
      }
      
      return updated;
    });

    return true;
  }, [tripState]);

  const resetTrip = useCallback(() => {
    setTripState(TRIP_STATES.IDLE);
    setTripData({
      id: null,
      pickupLocation: null,
      dropLocation: null,
      driver: null,
      estimatedTime: null,
      startTime: null,
      endTime: null
    });
  }, []);

  const getTripDuration = useCallback(() => {
    if (tripData.startTime && tripData.endTime) {
      return Math.round((tripData.endTime - tripData.startTime) / 1000 / 60); // minutes
    }
    return null;
  }, [tripData.startTime, tripData.endTime]);

  const isActive = tripState !== TRIP_STATES.IDLE && tripState !== TRIP_STATES.COMPLETED;

  return {
    tripState,
    tripData,
    updateTripState,
    resetTrip,
    getTripDuration,
    isActive,
    TRIP_STATES
  };
};