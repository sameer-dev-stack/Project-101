import React, { useState, useEffect } from 'react';

const SimpleMap = ({ 
  userLocation, 
  nearbyCabs = [], 
  pickupLocation, 
  dropLocation,
  driverLocation,
  currentPath,
  tripState,
  onPickupSelect,
  onDropSelect
}) => {
  const [mapCenter, setMapCenter] = useState({ lat: 40.7128, lng: -74.0060 });

  useEffect(() => {
    if (userLocation) {
      setMapCenter(userLocation);
    }
  }, [userLocation]);

  const handleMapClick = (e) => {
    // Simulate clicking on different areas of the map
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Generate random coordinates based on click position
    const lat = mapCenter.lat + (y - rect.height/2) * 0.0001;
    const lng = mapCenter.lng + (x - rect.width/2) * 0.0001;
    
    if (tripState === 'idle') {
      if (!pickupLocation) {
        onPickupSelect({ lat, lng });
      } else if (!dropLocation) {
        onDropSelect({ lat, lng });
      }
    }
  };

  const getMarkerStyle = (type, location) => {
    const baseStyle = {
      position: 'absolute',
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid white',
      transform: 'translate(-50%, -50%)',
      zIndex: 10,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '12px',
      fontWeight: 'bold',
      color: 'white'
    };

    const colors = {
      user: '#007bff',
      cab: '#28a745',
      pickup: '#ffc107',
      drop: '#dc3545',
      driver: '#6f42c1'
    };

    // Calculate position based on lat/lng relative to map center
    const x = 50 + (location.lng - mapCenter.lng) * 5000;
    const y = 50 + (mapCenter.lat - location.lat) * 5000;

    return {
      ...baseStyle,
      backgroundColor: colors[type],
      left: Math.max(10, Math.min(90, x)) + '%',
      top: Math.max(10, Math.min(90, y)) + '%'
    };
  };

  const getMarkerText = (type) => {
    switch (type) {
      case 'user': return '📍';
      case 'cab': return '🚗';
      case 'pickup': return 'P';
      case 'drop': return 'D';
      case 'driver': return '🚕';
      default: return '';
    }
  };

  return (
    <div className="simple-map">
      <div 
        className="map-canvas"
        onClick={handleMapClick}
        style={{
          width: '100%',
          height: '100%',
          background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%)',
          position: 'relative',
          cursor: tripState === 'idle' ? 'crosshair' : 'default',
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          overflow: 'hidden'
        }}
      >
        {/* Street pattern overlay */}
        <div className="street-pattern" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 50px,
              rgba(255,255,255,0.1) 50px,
              rgba(255,255,255,0.1) 52px
            )
          `
        }} />

        {/* User location */}
        {userLocation && (
          <div style={getMarkerStyle('user', userLocation)}>
            {getMarkerText('user')}
          </div>
        )}

        {/* Nearby cabs */}
        {nearbyCabs.map((cab, index) => (
          <div key={index} style={getMarkerStyle('cab', cab)}>
            {getMarkerText('cab')}
          </div>
        ))}

        {/* Pickup location */}
        {pickupLocation && (
          <div style={getMarkerStyle('pickup', pickupLocation)}>
            {getMarkerText('pickup')}
          </div>
        )}

        {/* Drop location */}
        {dropLocation && (
          <div style={getMarkerStyle('drop', dropLocation)}>
            {getMarkerText('drop')}
          </div>
        )}

        {/* Driver location */}
        {driverLocation && (
          <div style={getMarkerStyle('driver', driverLocation)}>
            {getMarkerText('driver')}
          </div>
        )}

        {/* Route path */}
        {currentPath && currentPath.path && currentPath.path.length > 1 && (
          <svg 
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              pointerEvents: 'none'
            }}
          >
            <polyline
              points={currentPath.path.map(point => {
                const x = (50 + (point.lng - mapCenter.lng) * 5000);
                const y = (50 + (mapCenter.lat - point.lat) * 5000);
                return `${Math.max(0, Math.min(100, x))}%,${Math.max(0, Math.min(100, y))}%`;
              }).join(' ')}
              fill="none"
              stroke={currentPath.color || '#007bff'}
              strokeWidth="3"
              strokeDasharray="5,5"
              style={{
                animation: 'dash 1s linear infinite'
              }}
            />
          </svg>
        )}

        {/* Map controls */}
        <div className="map-info" style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '10px',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#333'
        }}>
          <div>📍 New York City</div>
          <div>{tripState === 'idle' ? 'Click to select locations' : 'Trip in progress'}</div>
        </div>

        {/* Legend */}
        <div className="map-legend" style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(255,255,255,0.9)',
          padding: '8px',
          borderRadius: '6px',
          fontSize: '10px',
          color: '#333'
        }}>
          <div>📍 You | 🚗 Cabs | P Pickup | D Drop | 🚕 Driver</div>
        </div>
      </div>

    </div>
  );
};

export default SimpleMap;