import React, { useState, useEffect, useCallback } from 'react';
import SimpleMapboxComponent from './components/SimpleMapboxComponent';
import MapboxLocationSearch from './components/MapboxLocationSearch';
import TripStatus from './components/TripStatus';
import NotificationSystem from './components/NotificationSystem';
import { useWebSocket } from './hooks/useWebSocket';
import { useTripState } from './hooks/useTripState';
import { TRIP_STATES } from './shared/websocket-events.js';
import './App.css';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

function App() {
  const [mapError, setMapError] = useState(null);
  const [nearbyCabs, setNearbyCabs] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [locationRequested, setLocationRequested] = useState(false);
  
  // WebSocket connection
  const { 
    socket, 
    isConnected, 
    connectionStatus, 
    sendMessage 
  } = useWebSocket('http://localhost:3003');
  
  // Trip state management
  const {
    tripState,
    tripData,
    updateTripState,
    resetTrip
  } = useTripState();

  // Notification management
  const addNotification = useCallback((type, title, message) => {
    const id = Date.now();
    const notification = { id, type, title, message };
    
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  // Initialize Mapbox
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      setMapError('Mapbox access token not found. Please check your environment configuration.');
      return;
    }
    // Mapbox is initialized in the MapboxMapComponent
  }, []);

  // Get user's current location with improved error handling
  useEffect(() => {
    if (locationRequested) return;
    
    setLocationRequested(true);
    
    const tryGetLocation = async () => {
      // Default location (Dhaka, Bangladesh)
      const defaultLocation = { lat: 23.8103, lng: 90.4125 };
      
      // Check if geolocation is supported
      if (!navigator.geolocation) {
        console.log('Geolocation not supported by this browser');
        addNotification('info', 'Location', 'Location services not supported. Using Dhaka as default location.');
        setUserLocation(defaultLocation);
        return;
      }

      // Check if we're on HTTPS or localhost (required for geolocation)
      const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
      
      if (!isSecureContext) {
        console.log('Geolocation requires HTTPS or localhost');
        addNotification('info', 'Location', 'Location services require HTTPS. Using Dhaka as default location.');
        setUserLocation(defaultLocation);
        return;
      }

      // Try to get location with multiple attempts
      const getLocationWithRetry = (attempt = 1) => {
        const options = {
          enableHighAccuracy: attempt === 1, // Try high accuracy first, then fallback
          timeout: attempt === 1 ? 15000 : 30000, // Longer timeout for second attempt
          maximumAge: attempt === 1 ? 60000 : 300000 // Accept cached location on retry
        };

        navigator.geolocation.getCurrentPosition(
          (position) => {
            const location = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setUserLocation(location);
            console.log('Got user location:', location);
            addNotification('success', 'Location', 'Got your current location successfully!');
          },
          (error) => {
            console.error(`Location error (attempt ${attempt}):`, error);
            
            let errorMessage = 'Could not get your location. ';
            
            switch (error.code) {
              case error.PERMISSION_DENIED:
                errorMessage += 'Location permission denied.';
                break;
              case error.POSITION_UNAVAILABLE:
                errorMessage += 'Location information unavailable.';
                break;
              case error.TIMEOUT:
                errorMessage += 'Location request timed out.';
                break;
              default:
                errorMessage += 'Unknown location error.';
                break;
            }
            
            // Retry once with different settings
            if (attempt === 1) {
              console.log('Retrying location request with fallback settings...');
              setTimeout(() => getLocationWithRetry(2), 1000);
            } else {
              // Give up and use default location
              console.log('Using default location after failed attempts');
              addNotification('info', 'Location', errorMessage + ' Using Dhaka as default location.');
              setUserLocation(defaultLocation);
            }
          },
          options
        );
      };

      // Start location detection
      getLocationWithRetry();
    };

    tryGetLocation();
  }, [locationRequested, addNotification]);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNearbyCabs = (data) => {
      if (data.locations && Array.isArray(data.locations)) {
        setNearbyCabs(data.locations);
      }
    };

    const handleCabBooked = () => {
      updateTripState(TRIP_STATES.PICKUP);
      addNotification('success', 'Cab Booked', 'Your cab has been booked successfully!');
    };

    const handlePickupPath = (data) => {
      if (data.path && Array.isArray(data.path)) {
        setCurrentPath({
          type: 'pickup',
          path: data.path,
          color: '#FF6B35'
        });
      }
    };

    const handleLocationUpdate = (data) => {
      if (data.lat && data.lng) {
        setDriverLocation({
          lat: data.lat,
          lng: data.lng
        });
      }
    };

    const handleCabIsArriving = () => {
      addNotification('warning', 'Driver Update', 'Your driver is arriving!');
    };

    const handleCabArrived = () => {
      addNotification('success', 'Driver Update', 'Your driver has arrived!');
    };

    const handleTripStart = () => {
      updateTripState(TRIP_STATES.IN_PROGRESS);
      addNotification('success', 'Trip Started', 'Your trip has started!');
      setCurrentPath(null); // Clear pickup path
    };

    const handleTripPath = (data) => {
      if (data.path && Array.isArray(data.path)) {
        setCurrentPath({
          type: 'trip',
          path: data.path,
          color: '#4285F4'
        });
      }
    };

    const handleTripEnd = () => {
      updateTripState(TRIP_STATES.COMPLETED);
      addNotification('success', 'Trip Complete', 'Trip completed successfully!');
      setCurrentPath(null);
      setDriverLocation(null);
    };

    const handleDirectionApiFailed = () => {
      addNotification('error', 'Navigation Error', 'Unable to calculate route. Please try again.');
    };

    const handleRoutesNotAvailable = () => {
      addNotification('error', 'Route Error', 'No routes available for this destination.');
    };

    // Register event listeners
    socket.on('nearByCabs', handleNearbyCabs);
    socket.on('cabBooked', handleCabBooked);
    socket.on('pickUpPath', handlePickupPath);
    socket.on('location', handleLocationUpdate);
    socket.on('cabIsArriving', handleCabIsArriving);
    socket.on('cabArrived', handleCabArrived);
    socket.on('tripStart', handleTripStart);
    socket.on('tripPath', handleTripPath);
    socket.on('tripEnd', handleTripEnd);
    socket.on('directionApiFailed', handleDirectionApiFailed);
    socket.on('routesNotAvailable', handleRoutesNotAvailable);

    return () => {
      // Cleanup event listeners
      socket.off('nearByCabs', handleNearbyCabs);
      socket.off('cabBooked', handleCabBooked);
      socket.off('pickUpPath', handlePickupPath);
      socket.off('location', handleLocationUpdate);
      socket.off('cabIsArriving', handleCabIsArriving);
      socket.off('cabArrived', handleCabArrived);
      socket.off('tripStart', handleTripStart);
      socket.off('tripPath', handleTripPath);
      socket.off('tripEnd', handleTripEnd);
      socket.off('directionApiFailed', handleDirectionApiFailed);
      socket.off('routesNotAvailable', handleRoutesNotAvailable);
    };
  }, [socket, updateTripState, addNotification]);

  // Request nearby cabs when location and connection are ready
  useEffect(() => {
    if (!socket || !isConnected || !userLocation) {
      return;
    }

    // Initial request for nearby cabs
    sendMessage({
      type: 'nearByCabs',
      lat: userLocation.lat,
      lng: userLocation.lng
    });
  }, [socket, isConnected, userLocation, sendMessage]);

  // Periodic nearby cabs updates (only when idle)
  useEffect(() => {
    if (!socket || !isConnected || !userLocation || tripState !== TRIP_STATES.IDLE) {
      return;
    }

    const interval = setInterval(() => {
      sendMessage({
        type: 'nearByCabs',
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    }, 5000); // Every 5 seconds (reduced frequency)

    return () => clearInterval(interval);
  }, [socket, isConnected, userLocation, tripState, sendMessage]);

  // Handle cab booking
  const handleBookCab = useCallback(() => {
    if (!pickupLocation || !dropLocation) {
      addNotification('warning', 'Missing Information', 'Please select both pickup and drop locations.');
      return;
    }

    if (!socket || !isConnected) {
      addNotification('error', 'Connection Error', 'Not connected to server. Please try again.');
      return;
    }

    updateTripState(TRIP_STATES.BOOKING);
    
    sendMessage({
      type: 'requestCab',
      pickUpLat: pickupLocation.lat,
      pickUpLng: pickupLocation.lng,
      dropLat: dropLocation.lat,
      dropLng: dropLocation.lng
    });
  }, [pickupLocation, dropLocation, socket, isConnected, sendMessage, updateTripState, addNotification]);

  // Handle trip completion and next ride
  const handleNextRide = useCallback(() => {
    resetTrip();
    setPickupLocation(null);
    setDropLocation(null);
    setDriverLocation(null);
    setCurrentPath(null);
    
    // Request nearby cabs for next ride
    if (socket && isConnected && userLocation) {
      sendMessage({
        type: 'nearByCabs',
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    }
  }, [resetTrip, socket, isConnected, userLocation, sendMessage]);

  if (mapError) {
    return (
      <div className="error-container">
        <div className="error-message">
          <h2>Unable to Load Map</h2>
          <p>{mapError}</p>
          <button 
            className="btn btn-primary" 
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="map-container">
        <SimpleMapboxComponent 
          userLocation={userLocation}
          nearbyCabs={nearbyCabs}
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          driverLocation={driverLocation}
          currentPath={currentPath}
          onPickupSelect={setPickupLocation}
          onDropSelect={setDropLocation}
          tripState={tripState}
        />
        
        <div className="ui-overlay">
          <MapboxLocationSearch
            onPickupSelect={setPickupLocation}
            onDropSelect={setDropLocation}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
            disabled={tripState !== TRIP_STATES.IDLE}
          />
          
          <TripStatus
            tripState={tripState}
            tripData={tripData}
            connectionStatus={connectionStatus}
            isConnected={isConnected}
            onBookCab={handleBookCab}
            onNextRide={handleNextRide}
            pickupLocation={pickupLocation}
            dropLocation={dropLocation}
          />
        </div>
      </div>
      
      <NotificationSystem
        notifications={notifications}
        onRemove={removeNotification}
      />
    </div>
  );
}

export default App;