import { useState, useCallback } from 'react';
import { TRIP_STATES, VALID_TRANSITIONS, isValidStateTransition } from '../shared/websocket-events.js';

export function useTripState() {
  const [tripState, setTripState] = useState(TRIP_STATES.IDLE);
  const [tripData, setTripData] = useState({
    startTime: null,
    endTime: null,
    pickupLocation: null,
    dropLocation: null,
    driverInfo: null,
    tripId: null
  });

  // Update trip state with validation
  const updateTripState = useCallback((newState, additionalData = {}) => {
    setTripState(currentState => {
      if (!isValidStateTransition(currentState, newState)) {
        console.error(`Invalid state transition: ${currentState} → ${newState}`);
        return currentState;
      }

      console.log(`Trip state transition: ${currentState} → ${newState}`);

      // Update trip data based on state change
      setTripData(currentData => {
        const updatedData = { ...currentData, ...additionalData };

        switch (newState) {
          case TRIP_STATES.BOOKING:
            updatedData.startTime = new Date();
            updatedData.tripId = `trip_${Date.now()}`;
            break;
          
          case TRIP_STATES.PICKUP:
            // Driver assigned, trip confirmed
            break;
          
          case TRIP_STATES.IN_PROGRESS:
            // Trip started
            break;
          
          case TRIP_STATES.COMPLETED:
            updatedData.endTime = new Date();
            break;
          
          case TRIP_STATES.IDLE:
            // Reset trip data
            return {
              startTime: null,
              endTime: null,
              pickupLocation: null,
              dropLocation: null,
              driverInfo: null,
              tripId: null
            };
        }

        return updatedData;
      });

      return newState;
    });
  }, []);

  // Update trip data without changing state
  const updateTripData = useCallback((newData) => {
    setTripData(currentData => ({
      ...currentData,
      ...newData
    }));
  }, []);

  // Reset trip to idle state
  const resetTrip = useCallback(() => {
    updateTripState(TRIP_STATES.IDLE);
  }, [updateTripState]);

  // Get trip duration in minutes
  const getTripDuration = useCallback(() => {
    if (!tripData.startTime) return 0;
    
    const endTime = tripData.endTime || new Date();
    const durationMs = endTime.getTime() - tripData.startTime.getTime();
    return Math.round(durationMs / (1000 * 60)); // Convert to minutes
  }, [tripData.startTime, tripData.endTime]);

  // Check if trip is active (not idle or completed)
  const isActiveTrip = useCallback(() => {
    return tripState !== TRIP_STATES.IDLE && tripState !== TRIP_STATES.COMPLETED;
  }, [tripState]);

  // Get current trip phase for UI display
  const getTripPhase = useCallback(() => {
    switch (tripState) {
      case TRIP_STATES.IDLE:
        return 'Ready to book';
      case TRIP_STATES.BOOKING:
        return 'Booking your ride...';
      case TRIP_STATES.PICKUP:
        return 'Driver on the way';
      case TRIP_STATES.IN_PROGRESS:
        return 'In trip';
      case TRIP_STATES.COMPLETED:
        return 'Trip completed';
      default:
        return 'Unknown';
    }
  }, [tripState]);

  // Get progress steps for UI
  const getProgressSteps = useCallback(() => {
    const steps = [
      { key: 'booking', label: 'Booking', state: TRIP_STATES.BOOKING },
      { key: 'pickup', label: 'Pickup', state: TRIP_STATES.PICKUP },
      { key: 'trip', label: 'Trip', state: TRIP_STATES.IN_PROGRESS },
      { key: 'complete', label: 'Complete', state: TRIP_STATES.COMPLETED }
    ];

    return steps.map(step => ({
      ...step,
      status: getStepStatus(step.state, tripState)
    }));
  }, [tripState]);

  // Helper function to determine step status
  const getStepStatus = (stepState, currentState) => {
    const stateOrder = [
      TRIP_STATES.IDLE,
      TRIP_STATES.BOOKING,
      TRIP_STATES.PICKUP,
      TRIP_STATES.IN_PROGRESS,
      TRIP_STATES.COMPLETED
    ];

    const stepIndex = stateOrder.indexOf(stepState);
    const currentIndex = stateOrder.indexOf(currentState);

    if (currentIndex > stepIndex) return 'completed';
    if (currentIndex === stepIndex) return 'active';
    return 'pending';
  };

  return {
    tripState,
    tripData,
    updateTripState,
    updateTripData,
    resetTrip,
    getTripDuration,
    isActiveTrip,
    getTripPhase,
    getProgressSteps
  };
}