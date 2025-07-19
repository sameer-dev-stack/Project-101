import React, { useState, useEffect } from 'react';

const BasicMap = ({ 
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
  const [mapCenter] = useState({ lat: 40.7128, lng: -74.0060 });

  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Generate coordinates based on click position
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

  const mapStyle = {
    width: '100%',
    height: '100%',
    minHeight: '400px',
    background: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)',
    position: 'relative',
    cursor: tripState === 'idle' ? 'crosshair' : 'default',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        rgba(255,255,255,0.1),
        rgba(255,255,255,0.1) 1px,
        transparent 1px,
        transparent 20px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.1),
        rgba(255,255,255,0.1) 1px,
        transparent 1px,
        transparent 20px
      )
    `,
    backgroundSize: '20px 20px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #1976d2'
  };

  const getMarkerPosition = (location) => {
    const x = 50 + (location.lng - mapCenter.lng) * 5000;
    const y = 50 + (mapCenter.lat - location.lat) * 5000;
    return {
      left: Math.max(5, Math.min(95, x)) + '%',
      top: Math.max(5, Math.min(95, y)) + '%'
    };
  };

  const markerBaseStyle = {
    position: 'absolute',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    border: '2px solid white',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
  };

  return (
    <div style={mapStyle} onClick={handleMapClick}>
      {/* Map Title */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: '600',
        color: '#333',
        zIndex: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        🗽 New York City
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#666',
        zIndex: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        maxWidth: '200px'
      }}>
        {tripState === 'idle' ? 'Click map or use buttons below' : 'Trip in progress...'}
      </div>

      {/* User location */}
      {userLocation && (
        <div style={{
          ...markerBaseStyle,
          ...getMarkerPosition(userLocation),
          backgroundColor: '#007bff'
        }}>
          📍
        </div>
      )}

      {/* Nearby cabs */}
      {nearbyCabs.map((cab, index) => (
        <div key={index} style={{
          ...markerBaseStyle,
          ...getMarkerPosition(cab),
          backgroundColor: '#28a745'
        }}>
          🚗
        </div>
      ))}

      {/* Pickup location */}
      {pickupLocation && (
        <div style={{
          ...markerBaseStyle,
          ...getMarkerPosition(pickupLocation),
          backgroundColor: '#ffc107',
          color: '#000'
        }}>
          P
        </div>
      )}

      {/* Drop location */}
      {dropLocation && (
        <div style={{
          ...markerBaseStyle,
          ...getMarkerPosition(dropLocation),
          backgroundColor: '#dc3545'
        }}>
          D
        </div>
      )}

      {/* Driver location */}
      {driverLocation && (
        <div style={{
          ...markerBaseStyle,
          ...getMarkerPosition(driverLocation),
          backgroundColor: '#6f42c1'
        }}>
          🚕
        </div>
      )}

      {/* Route line */}
      {currentPath && currentPath.path && currentPath.path.length > 1 && (
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 5
        }}>
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" 
             refX="0" refY="3.5" orient="auto">
              <polygon points="0 0, 10 3.5, 0 7" fill={currentPath.color || '#007bff'} />
            </marker>
          </defs>
          <polyline
            points={currentPath.path.map(point => {
              const pos = getMarkerPosition(point);
              return `${parseFloat(pos.left)} ${parseFloat(pos.top)}`;
            }).join(' ')}
            fill="none"
            stroke={currentPath.color || '#007bff'}
            strokeWidth="4"
            strokeDasharray="8,4"
            markerEnd="url(#arrowhead)"
            style={{
              strokeDashoffset: '0',
              animation: 'dashMove 2s linear infinite'
            }}
          />
        </svg>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '10px',
        left: '10px',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '11px',
        color: '#333',
        zIndex: 20,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        📍 You | 🚗 Available Cabs | P Pickup | D Drop | 🚕 Your Driver
      </div>

      {/* CSS Animation */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes dashMove {
          to {
            stroke-dashoffset: -12;
          }
        }
      `}} />
    </div>
  );
};

export default BasicMap;