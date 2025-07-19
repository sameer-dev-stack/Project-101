import React, { useState } from 'react';

const SimpleWorkingMap = ({ 
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
  const handleMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert click position to coordinates
    const lat = 40.7128 + (y - rect.height/2) * 0.0001;
    const lng = -74.0060 + (x - rect.width/2) * 0.0001;
    
    if (tripState === 'idle') {
      if (!pickupLocation) {
        onPickupSelect({ lat, lng });
      } else if (!dropLocation) {
        onDropSelect({ lat, lng });
      }
    }
  };

  return (
    <div 
      onClick={handleMapClick}
      style={{
        width: '100%',
        height: '100%',
        minHeight: '400px',
        backgroundColor: '#e0f2fe',
        backgroundImage: `
          linear-gradient(45deg, #bbdefb 25%, transparent 25%),
          linear-gradient(-45deg, #bbdefb 25%, transparent 25%),
          linear-gradient(45deg, transparent 75%, #bbdefb 75%),
          linear-gradient(-45deg, transparent 75%, #bbdefb 75%)
        `,
        backgroundSize: '30px 30px',
        backgroundPosition: '0 0, 0 15px, 15px -15px, -15px 0px',
        position: 'relative',
        border: '3px solid #2196f3',
        borderRadius: '12px',
        cursor: tripState === 'idle' ? 'crosshair' : 'default',
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '16px',
        backgroundColor: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontWeight: 'bold',
        fontSize: '16px',
        color: '#1565c0'
      }}>
        🗽 New York City Map
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        backgroundColor: 'white',
        padding: '10px 14px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontSize: '14px',
        color: '#666',
        textAlign: 'center',
        maxWidth: '180px'
      }}>
        {tripState === 'idle' ? 'Click to select pickup & drop' : 'Trip in progress...'}
      </div>

      {/* Your Location */}
      <div style={{
        position: 'absolute',
        top: '45%',
        left: '45%',
        backgroundColor: '#2196f3',
        color: 'white',
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid white',
        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
        fontSize: '16px',
        fontWeight: 'bold'
      }}>
        📍
      </div>

      {/* Nearby Cabs */}
      {[1,2,3,4,5].map(i => (
        <div key={i} style={{
          position: 'absolute',
          top: `${30 + Math.sin(i) * 20}%`,
          left: `${40 + Math.cos(i) * 25}%`,
          backgroundColor: '#4caf50',
          color: 'white',
          width: '28px',
          height: '28px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid white',
          boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
          fontSize: '14px'
        }}>
          🚗
        </div>
      ))}

      {/* Pickup Location */}
      {pickupLocation && (
        <div style={{
          position: 'absolute',
          top: '30%',
          left: '30%',
          backgroundColor: '#ff9800',
          color: 'white',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          P
        </div>
      )}

      {/* Drop Location */}
      {dropLocation && (
        <div style={{
          position: 'absolute',
          top: '60%',
          left: '65%',
          backgroundColor: '#f44336',
          color: 'white',
          width: '30px',
          height: '30px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          fontSize: '14px',
          fontWeight: 'bold'
        }}>
          D
        </div>
      )}

      {/* Driver Location */}
      {driverLocation && (
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '55%',
          backgroundColor: '#9c27b0',
          color: 'white',
          width: '34px',
          height: '34px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '3px solid white',
          boxShadow: '0 3px 10px rgba(0,0,0,0.3)',
          fontSize: '16px',
          animation: 'pulse 2s infinite'
        }}>
          🚕
        </div>
      )}

      {/* Route Line */}
      {currentPath && pickupLocation && dropLocation && (
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}>
          <line
            x1="30%"
            y1="30%"
            x2="65%"
            y2="60%"
            stroke={currentPath.color || '#2196f3'}
            strokeWidth="4"
            strokeDasharray="8,4"
            style={{
              animation: 'dash 2s linear infinite'
            }}
          />
        </svg>
      )}

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        backgroundColor: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        fontSize: '12px',
        color: '#333',
        fontWeight: '500'
      }}>
        📍 You | 🚗 Cabs | P Pickup | D Drop | 🚕 Driver
      </div>

      {/* Status */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        right: '16px',
        backgroundColor: '#4caf50',
        color: 'white',
        padding: '8px 12px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 'bold'
      }}>
        🔴 LIVE
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        @keyframes dash {
          to { stroke-dashoffset: -12; }
        }
      `}} />
    </div>
  );
};

export default SimpleWorkingMap;