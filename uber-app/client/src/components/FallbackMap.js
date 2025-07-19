import React, { useState, useEffect } from 'react';

const FallbackMap = ({ 
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

  // Try to load Mapbox, fallback to simple map if it fails
  const [useMapbox, setUseMapbox] = useState(true);
  const [mapboxError, setMapboxError] = useState(null);

  useEffect(() => {
    // Check if mapbox-gl is available and token is valid
    try {
      const mapboxgl = require('mapbox-gl');
      const token = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
      
      if (!token || token.length < 10) {
        throw new Error('Invalid Mapbox token');
      }
      
      mapboxgl.accessToken = token;
      
      // Test if we can create a map (this will fail if token is invalid)
      const testContainer = document.createElement('div');
      testContainer.style.width = '1px';
      testContainer.style.height = '1px';
      testContainer.style.position = 'absolute';
      testContainer.style.top = '-1000px';
      document.body.appendChild(testContainer);
      
      const testMap = new mapboxgl.Map({
        container: testContainer,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-74.006, 40.7128],
        zoom: 10
      });
      
      testMap.on('load', () => {
        testMap.remove();
        document.body.removeChild(testContainer);
        console.log('Mapbox validated successfully');
      });
      
      testMap.on('error', (e) => {
        console.error('Mapbox validation failed:', e);
        testMap.remove();
        document.body.removeChild(testContainer);
        setMapboxError(e.error?.message || 'Mapbox failed to load');
        setUseMapbox(false);
      });
      
    } catch (error) {
      console.error('Mapbox not available:', error);
      setMapboxError(error.message);
      setUseMapbox(false);
    }
  }, []);

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
        console.log('Pickup selected:', { lat, lng });
      } else if (!dropLocation) {
        onDropSelect({ lat, lng });
        console.log('Drop selected:', { lat, lng });
      }
    }
  };

  const getMarkerPosition = (location) => {
    const x = 50 + (location.lng - mapCenter.lng) * 5000;
    const y = 50 + (mapCenter.lat - location.lat) * 5000;
    return {
      left: Math.max(5, Math.min(95, x)) + '%',
      top: Math.max(5, Math.min(95, y)) + '%'
    };
  };

  const markerStyle = {
    position: 'absolute',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '3px solid white',
    transform: 'translate(-50%, -50%)',
    zIndex: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    color: 'white',
    boxShadow: '0 3px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer'
  };

  const mapStyle = {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    background: `
      radial-gradient(circle at 30% 20%, rgba(120, 190, 250, 0.3) 0%, transparent 50%),
      radial-gradient(circle at 70% 80%, rgba(96, 165, 250, 0.3) 0%, transparent 50%),
      linear-gradient(135deg, #dbeafe 0%, #bfdbfe 30%, #93c5fd  60%, #60a5fa 100%)
    `,
    position: 'relative',
    cursor: tripState === 'idle' ? 'crosshair' : 'default',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '3px solid #3b82f6',
    backgroundImage: `
      repeating-linear-gradient(
        0deg,
        rgba(255,255,255,0.15),
        rgba(255,255,255,0.15) 1px,
        transparent 1px,
        transparent 25px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255,255,255,0.15),
        rgba(255,255,255,0.15) 1px,
        transparent 1px,
        transparent 25px
      )
    `,
    backgroundSize: '25px 25px'
  };

  return (
    <div style={mapStyle} onClick={handleMapClick}>
      {/* Status banner */}
      {mapboxError && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          right: '10px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          zIndex: 30,
          textAlign: 'center'
        }}>
          Mapbox unavailable - using offline map
        </div>
      )}

      {/* Map title */}
      <div style={{
        position: 'absolute',
        top: mapboxError ? '50px' : '15px',
        left: '15px',
        background: 'rgba(255,255,255,0.95)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '700',
        color: '#1f2937',
        zIndex: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        🗽 New York City
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: mapboxError ? '50px' : '15px',
        right: '15px',
        background: 'rgba(255,255,255,0.95)',
        padding: '10px 15px',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#6b7280',
        zIndex: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        maxWidth: '200px',
        textAlign: 'center'
      }}>
        {tripState === 'idle' ? (
          <div>
            <div style={{fontWeight: '600', marginBottom: '4px'}}>🎯 Select Locations</div>
            <div>Click map or use buttons below</div>
          </div>
        ) : (
          <div>
            <div style={{fontWeight: '600', marginBottom: '4px'}}>🚗 Trip Active</div>
            <div>Enjoy your ride!</div>
          </div>
        )}
      </div>

      {/* User location */}
      {userLocation && (
        <div 
          style={{
            ...markerStyle,
            ...getMarkerPosition(userLocation),
            backgroundColor: '#3b82f6'
          }}
          title="Your Location"
        >
          📍
        </div>
      )}

      {/* Nearby cabs */}
      {nearbyCabs.map((cab, index) => (
        <div 
          key={index}
          style={{
            ...markerStyle,
            ...getMarkerPosition(cab),
            backgroundColor: '#10b981'
          }}
          title="Available Cab"
        >
          🚗
        </div>
      ))}

      {/* Pickup location */}
      {pickupLocation && (
        <div 
          style={{
            ...markerStyle,
            ...getMarkerPosition(pickupLocation),
            backgroundColor: '#f59e0b',
            color: '#000'
          }}
          title="Pickup Location"
        >
          📍
        </div>
      )}

      {/* Drop location */}
      {dropLocation && (
        <div 
          style={{
            ...markerStyle,
            ...getMarkerPosition(dropLocation),
            backgroundColor: '#ef4444'
          }}
          title="Drop Location"
        >
          🎯
        </div>
      )}

      {/* Driver location */}
      {driverLocation && (
        <div 
          style={{
            ...markerStyle,
            ...getMarkerPosition(driverLocation),
            backgroundColor: '#8b5cf6',
            fontSize: '16px'
          }}
          title="Your Driver"
        >
          🚕
        </div>
      )}

      {/* Route visualization */}
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
            <marker id="routeArrow" markerWidth="12" markerHeight="8" 
             refX="12" refY="4" orient="auto" markerUnits="strokeWidth">
              <path d="M0,0 L0,8 L12,4 z" fill={currentPath.color || '#3b82f6'} />
            </marker>
          </defs>
          <polyline
            points={currentPath.path.map(point => {
              const pos = getMarkerPosition(point);
              const x = parseFloat(pos.left) * 4; // Convert % to viewport units
              const y = parseFloat(pos.top) * 4;
              return `${x},${y}`;
            }).join(' ')}
            fill="none"
            stroke={currentPath.color || '#3b82f6'}
            strokeWidth="6"
            strokeDasharray="12,6"
            strokeLinecap="round"
            strokeLinejoin="round"
            markerEnd="url(#routeArrow)"
            style={{
              filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))',
              animation: 'routeAnimation 3s linear infinite'
            }}
          />
        </svg>
      )}

      {/* Map legend */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        left: '15px',
        background: 'rgba(255,255,255,0.95)',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#374151',
        zIndex: 20,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontWeight: '500'
      }}>
        📍 You | 🚗 Cabs | 📍 Pickup | 🎯 Drop | 🚕 Driver
      </div>

      {/* Performance indicator */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        background: 'rgba(16, 185, 129, 0.9)',
        color: 'white',
        padding: '6px 10px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: '600',
        zIndex: 20
      }}>
        ⚡ LIVE
      </div>

      {/* CSS Animations */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes routeAnimation {
          0% { stroke-dashoffset: 0; }
          100% { stroke-dashoffset: -18; }
        }
      `}} />
    </div>
  );
};

export default FallbackMap;