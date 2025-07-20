import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft } from 'lucide-react';
import { WS_BASE_URL } from '../config/api';
import ProperMapboxMap from '../components/ProperMapboxMap';
import DhakaLocationSearch from '../components/DhakaLocationSearch';
import TripStatus from '../components/TripStatus';
import { useWebSocket } from '../hooks/useWebSocket';
import { useTripState } from '../hooks/useTripState';

const RidesharingPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userLocation, setUserLocation] = useState(null);
  const [pickupLocation, setPickupLocation] = useState(null);
  const [dropLocation, setDropLocation] = useState(null);
  const [nearbyCabs, setNearbyCabs] = useState([]);
  const [driverLocation, setDriverLocation] = useState(null);
  const [currentPath, setCurrentPath] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [showLocationSearch, setShowLocationSearch] = useState(false);

  // WebSocket connection with auth token
  const token = localStorage.getItem('token');
  const { 
    socket, 
    isConnected, 
    connectionStatus, 
    sendMessage 
  } = useWebSocket(`${WS_BASE_URL}?token=${token}`);

  // Trip state management
  const {
    tripState,
    tripData,
    updateTripState,
    resetTrip
  } = useTripState();

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setUserLocation(location);
        },
        (error) => {
          console.error('Location error:', error);
          // Default to Dhaka, Bangladesh
          setUserLocation({ lat: 23.8103, lng: 90.4125 });
        }
      );
    } else {
      // Default location - Dhaka, Bangladesh
      setUserLocation({ lat: 23.8103, lng: 90.4125 });
    }
  }, []);

  // WebSocket event handlers
  useEffect(() => {
    if (!socket) return;

    const handleNearbyCabs = (data) => {
      if (data.locations && Array.isArray(data.locations)) {
        setNearbyCabs(data.locations);
      }
    };

    const handleCabBooked = () => {
      updateTripState('pickup');
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
      updateTripState('in_progress');
      addNotification('success', 'Trip Started', 'Your trip has started!');
      setCurrentPath(null);
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
      updateTripState('completed');
      addNotification('success', 'Trip Complete', 'Trip completed successfully!');
      setCurrentPath(null);
      setDriverLocation(null);
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
    };
  }, [socket, updateTripState]);

  // Request nearby cabs
  useEffect(() => {
    if (!socket || !isConnected || !userLocation || tripState !== 'idle') {
      return;
    }

    const requestNearbyCabs = () => {
      sendMessage({
        type: 'nearByCabs',
        lat: userLocation.lat,
        lng: userLocation.lng
      });
    };

    // Initial request
    requestNearbyCabs();

    // Periodic updates
    const interval = setInterval(requestNearbyCabs, 5000);
    return () => clearInterval(interval);
  }, [socket, isConnected, userLocation, tripState, sendMessage]);

  // Notification management
  const addNotification = useCallback((type, title, message) => {
    const id = Date.now();
    const notification = { id, type, title, message };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  }, []);

  // Handle cab booking
  const handleBookCab = useCallback((selectedPayment) => {
    if (!pickupLocation || !dropLocation) {
      addNotification('warning', 'তথ্য অনুপস্থিত | Missing Information', 'অনুগ্রহ করে পিকআপ ও গন্তব্যের স্থান নির্বাচন করুন | Please select both pickup and drop locations.');
      return;
    }

    if (!selectedPayment) {
      addNotification('warning', 'পেমেন্ট পদ্ধতি নির্বাচন করুন | Select Payment', 'অনুগ্রহ করে একটি পেমেন্ট পদ্ধতি নির্বাচন করুন | Please select a payment method.');
      return;
    }

    if (!socket || !isConnected) {
      addNotification('error', 'সংযোগ ত্রুটি | Connection Error', 'সার্ভারের সাথে সংযোগ নেই। আবার চেষ্টা করুন | Not connected to server. Please try again.');
      return;
    }

    updateTripState('booking');
    
    sendMessage({
      type: 'requestCab',
      pickUpLat: pickupLocation.lat,
      pickUpLng: pickupLocation.lng,
      dropLat: dropLocation.lat,
      dropLng: dropLocation.lng,
      paymentMethod: selectedPayment
    });

    addNotification('success', 'রাইড বুকিং | Ride Booking', `${selectedPayment.name_bn} দিয়ে রাইড বুক হচ্ছে | Booking ride with ${selectedPayment.name}`);
  }, [pickupLocation, dropLocation, socket, isConnected, sendMessage, updateTripState, addNotification]);

  // Handle trip completion and next ride
  const handleNextRide = useCallback(() => {
    resetTrip();
    setPickupLocation(null);
    setDropLocation(null);
    setDriverLocation(null);
    setCurrentPath(null);
  }, [resetTrip]);

  return (
    <div className="ridesharing-container">
      {/* Header */}
      <header className="ridesharing-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          <ArrowLeft size={20} />
        </button>
        <h1>🇧🇩 রাইড বুক করুন | Book a Ride</h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
          <span>{connectionStatus}</span>
        </div>
      </header>

      {/* Map Container */}
      <div className="map-section">
        <ProperMapboxMap 
          userLocation={userLocation}
          nearbyCabs={nearbyCabs}
          pickupLocation={pickupLocation}
          dropLocation={dropLocation}
          driverLocation={driverLocation}
          currentPath={currentPath}
          tripState={tripState}
          onPickupSelect={setPickupLocation}
          onDropSelect={setDropLocation}
        />
        
        {/* Compact Location Bar */}
        <div className="location-bar">
          <div className="location-inputs">
            <div className="location-input-group">
              <div className="location-dot pickup-dot"></div>
              <input 
                type="text" 
                placeholder="📍 Pick up location | পিকআপ স্থান"
                value={pickupLocation ? `${pickupLocation.name || 'Selected location'}` : ''}
                onClick={() => setShowLocationSearch(true)}
                readOnly
                className="location-input pickup-input"
              />
            </div>
            <div className="location-input-group">
              <div className="location-dot drop-dot"></div>
              <input 
                type="text" 
                placeholder="🎯 Drop location | গন্তব্য স্থান"
                value={dropLocation ? `${dropLocation.name || 'Selected location'}` : ''}
                onClick={() => setShowLocationSearch(true)}
                readOnly
                className="location-input drop-input"
              />
            </div>
          </div>
          <button 
            className="location-search-toggle"
            onClick={() => setShowLocationSearch(!showLocationSearch)}
          >
            {showLocationSearch ? '✕' : '🔍'}
          </button>
        </div>

        {/* Collapsible Location Search */}
        {showLocationSearch && (
          <div className="location-search-modal">
            <div className="location-search-header">
              <h3>📍 Select Locations | স্থান নির্বাচন করুন</h3>
              <button 
                className="close-search-btn"
                onClick={() => setShowLocationSearch(false)}
              >
                ✕
              </button>
            </div>
            <div className="location-search-content">
              <DhakaLocationSearch
                onPickupSelect={(location) => {
                  setPickupLocation(location);
                  setShowLocationSearch(false);
                }}
                onDropSelect={(location) => {
                  setDropLocation(location);
                  setShowLocationSearch(false);
                }}
                pickupLocation={pickupLocation}
                dropLocation={dropLocation}
                disabled={tripState !== 'idle'}
              />
            </div>
          </div>
        )}

        {/* Map Controls */}
        <div className="map-controls">
          <button className="map-control-btn" title="Current Location">
            📍
          </button>
          <button className="map-control-btn" title="Zoom In">
            ➕
          </button>
          <button className="map-control-btn" title="Zoom Out">
            ➖
          </button>
        </div>
      </div>

      {/* Floating Book Button - Show when locations selected and idle */}
      {tripState === 'idle' && pickupLocation && dropLocation && (
        <div className="floating-book-button">
          <button 
            className="book-ride-fab"
            onClick={() => setShowLocationSearch(false)}
          >
            🚗 Book Ride | রাইড বুক করুন
          </button>
        </div>
      )}

      {/* Trip Status - Only show when booking or in trip */}
      {tripState !== 'idle' && (
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
      )}

      {/* Payment and Booking Panel - Show when locations selected */}
      {tripState === 'idle' && pickupLocation && dropLocation && (
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
      )}

      {/* Getting Started Guide - Show when no locations selected */}
      {tripState === 'idle' && (!pickupLocation || !dropLocation) && (
        <div className="getting-started-panel">
          <div className="getting-started-content">
            <div className="getting-started-icon">🚗</div>
            <h3>🇧🇩 ঢাকায় রাইড বুক করুন | Book Your Ride in Dhaka</h3>
            <p>📍 পিকআপ ও গন্তব্যের স্থান নির্বাচন করুন | Select pickup and drop locations to get started</p>
            <button 
              className="start-booking-btn"
              onClick={() => setShowLocationSearch(true)}
            >
              🔍 স্থান নির্বাচন করুন | Choose Locations
            </button>
            <div className="nearby-cabs-info">
              <span>🚕 {nearbyCabs.length} nearby cabs available</span>
            </div>
          </div>
        </div>
      )}

      {/* Notifications */}
      <div className="notifications-container">
        {notifications.map(notification => (
          <div key={notification.id} className={`notification ${notification.type}`}>
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RidesharingPage;