import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useMapAnimations } from '../hooks/useMapAnimations';
import { TRIP_STATES } from '../shared/websocket-events.js';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

console.log('SimpleMapboxComponent - Token:', MAPBOX_ACCESS_TOKEN ? 'Available' : 'Missing');

function SimpleMapboxComponent({ 
  userLocation, 
  nearbyCabs = [], 
  pickupLocation, 
  dropLocation,
  driverLocation,
  currentPath,
  onPickupSelect,
  onDropSelect,
  tripState
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [selectionMode, setSelectionMode] = useState(null); // 'pickup' or 'drop'
  const [hasInitializedBounds, setHasInitializedBounds] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);
  const markersRef = useRef({
    cabs: new Map(),
    pickup: null,
    drop: null,
    driver: null,
    user: null
  });
  const pathSourceRef = useRef(null);
  const pathLayerRef = useRef(null);
  const previousDriverLocationRef = useRef(null);
  
  // Animation utilities
  const {
    animateMarkerMovement,
    animatePolylineDraw,
    calculateBearing,
    getOptimalDuration,
    clearAnimations
  } = useMapAnimations();

  useEffect(() => {
    // Check if token is available
    if (!MAPBOX_ACCESS_TOKEN) {
      setError('Mapbox access token is missing');
      return;
    }

    // Check if container is available
    if (!mapContainerRef.current) {
      setError('Map container not found');
      return;
    }

    // Set the token
    mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

    try {
      console.log('Creating Mapbox map...');
      
      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: 'mapbox://styles/mapbox/streets-v11', // Using v11 for better compatibility
        center: [90.4125, 23.8103], // Dhaka coordinates
        zoom: 12
      });

      // Handle map load
      map.on('load', () => {
        console.log('Map loaded successfully!');
        
        // Add path source and layer for route visualization
        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: []
            }
          }
        });
        
        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#FF6B35',
            'line-width': 6,
            'line-opacity': 0.8
          }
        });
        
        pathSourceRef.current = map.getSource('route');
        pathLayerRef.current = map.getLayer('route');
        
        setMapLoaded(true);
        
        // Add user location marker if available
        if (userLocation) {
          addUserLocationMarker(userLocation);
        }
        
        // Add map click handler for location selection
        map.on('click', handleMapClick);
        
        // Track user interaction to prevent auto-fitting after user moves map
        map.on('dragstart', () => setUserInteracted(true));
        map.on('zoomstart', () => setUserInteracted(true));
      });

      // Handle errors
      map.on('error', (e) => {
        console.error('Map error:', e);
        setError('Map failed to load: ' + e.error?.message);
      });

      mapRef.current = map;

      // Cleanup function
      return () => {
        console.log('Cleaning up map...');
        clearAnimations();
        if (map) {
          map.remove();
        }
      };
    } catch (err) {
      console.error('Error creating map:', err);
      setError('Error creating map: ' + err.message);
    }
  }, []);

  // Add user location marker
  const addUserLocationMarker = (location) => {
    if (!mapRef.current || !mapLoaded) return;
    
    try {
      if (markersRef.current.user) {
        markersRef.current.user.remove();
      }
      
      const userMarker = new mapboxgl.Marker({ color: '#4285F4' })
        .setLngLat([location.lng, location.lat])
        .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
        .addTo(mapRef.current);
      
      markersRef.current.user = userMarker;
      console.log('Added user location marker');
    } catch (err) {
      console.error('Error adding user marker:', err);
    }
  };

  // Handle map click for location selection
  const handleMapClick = (e) => {
    // Only allow location selection when in IDLE state and callbacks are provided
    if (tripState !== TRIP_STATES.IDLE || (!onPickupSelect && !onDropSelect)) {
      return;
    }
    
    const { lng, lat } = e.lngLat;
    const location = { lat, lng };
    
    // Show selection mode popup instead of auto-selecting
    if (selectionMode === 'pickup' && onPickupSelect) {
      console.log('Setting pickup location via map click:', location);
      onPickupSelect(location);
      setSelectionMode(null);
    } else if (selectionMode === 'drop' && onDropSelect) {
      console.log('Setting drop location via map click:', location);
      onDropSelect(location);
      setSelectionMode(null);
    } else {
      // Show selection popup if no mode is active
      showLocationSelectionPopup(location);
    }
  };
  
  // Show location selection popup
  const showLocationSelectionPopup = (location) => {
    const popup = new mapboxgl.Popup({
      closeButton: true,
      closeOnClick: false,
      className: 'location-selection-popup'
    })
    .setLngLat([location.lng, location.lat])
    .setHTML(`
      <div class="location-popup">
        <h3>Select Location Type</h3>
        <button class="btn-pickup" onclick="window.selectPickup(${location.lat}, ${location.lng})">
          📍 Set as Pickup
        </button>
        <button class="btn-drop" onclick="window.selectDrop(${location.lat}, ${location.lng})">
          🎯 Set as Destination
        </button>
      </div>
    `)
    .addTo(mapRef.current);
    
    // Set global functions for popup buttons
    window.selectPickup = (lat, lng) => {
      if (onPickupSelect) {
        onPickupSelect({ lat, lng });
      }
      popup.remove();
    };
    
    window.selectDrop = (lat, lng) => {
      if (onDropSelect) {
        onDropSelect({ lat, lng });
      }
      popup.remove();
    };
  };

  // Update nearby cabs with smooth animations
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !nearbyCabs.length) return;
    
    try {
      // Update existing cabs and add new ones
      nearbyCabs.forEach(cab => {
        const existingMarker = markersRef.current.cabs.get(cab.id);
        
        if (existingMarker) {
          // Animate existing marker to new position
          const currentPos = existingMarker.getLngLat();
          const targetPos = { lat: cab.lat, lng: cab.lng };
          
          // Only animate if there's significant movement
          const distance = Math.sqrt(
            Math.pow(targetPos.lat - currentPos.lat, 2) + 
            Math.pow(targetPos.lng - currentPos.lng, 2)
          );
          
          if (distance > 0.0001) { // About 10 meters
            const duration = getOptimalDuration(
              { lat: currentPos.lat, lng: currentPos.lng },
              targetPos,
              50 // 50 km/h speed for nearby cabs
            );
            animateMarkerMovement(existingMarker, targetPos, duration);
          }
        } else {
          // Create new cab marker with custom car icon
          const cabElement = document.createElement('div');
          cabElement.className = 'cab-marker';
          cabElement.style.width = '30px';
          cabElement.style.height = '30px';
          cabElement.style.borderRadius = '50%';
          cabElement.style.backgroundColor = '#FF6B35';
          cabElement.style.border = '3px solid white';
          cabElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
          cabElement.style.cursor = 'pointer';
          cabElement.innerHTML = '🚗';
          cabElement.style.fontSize = '14px';
          cabElement.style.display = 'flex';
          cabElement.style.alignItems = 'center';
          cabElement.style.justifyContent = 'center';
          
          const cabMarker = new mapboxgl.Marker({ element: cabElement })
            .setLngLat([cab.lng, cab.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Available Cab</h3><p>Tap to request</p>`))
            .addTo(mapRef.current);
          
          markersRef.current.cabs.set(cab.id, cabMarker);
        }
      });
      
      // Remove cabs that are no longer nearby
      const currentCabIds = new Set(nearbyCabs.map(cab => cab.id));
      markersRef.current.cabs.forEach((marker, id) => {
        if (!currentCabIds.has(id)) {
          marker.remove();
          markersRef.current.cabs.delete(id);
        }
      });
      
      console.log(`Updated ${nearbyCabs.length} cab markers`);
    } catch (err) {
      console.error('Error updating cabs:', err);
    }
  }, [nearbyCabs, mapLoaded, animateMarkerMovement, getOptimalDuration]);

  // Update pickup location
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    try {
      if (markersRef.current.pickup) {
        markersRef.current.pickup.remove();
        markersRef.current.pickup = null;
      }
      
      if (pickupLocation) {
        const pickupMarker = new mapboxgl.Marker({ color: '#34A853' })
          .setLngLat([pickupLocation.lng, pickupLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
          .addTo(mapRef.current);
        
        markersRef.current.pickup = pickupMarker;
        console.log('Added pickup marker');
      }
    } catch (err) {
      console.error('Error updating pickup:', err);
    }
  }, [pickupLocation, mapLoaded]);

  // Update drop location
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    try {
      if (markersRef.current.drop) {
        markersRef.current.drop.remove();
        markersRef.current.drop = null;
      }
      
      if (dropLocation) {
        const dropMarker = new mapboxgl.Marker({ color: '#EA4335' })
          .setLngLat([dropLocation.lng, dropLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Drop Location</h3>'))
          .addTo(mapRef.current);
        
        markersRef.current.drop = dropMarker;
        console.log('Added drop marker');
      }
    } catch (err) {
      console.error('Error updating drop:', err);
    }
  }, [dropLocation, mapLoaded]);

  // Update driver location with smooth animation and rotation
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    
    try {
      if (driverLocation) {
        if (markersRef.current.driver) {
          // Animate existing driver marker to new position
          const currentPos = markersRef.current.driver.getLngLat();
          const targetPos = { lat: driverLocation.lat, lng: driverLocation.lng };
          
          // Calculate bearing for car rotation
          const bearing = calculateBearing(
            currentPos.lat, currentPos.lng,
            targetPos.lat, targetPos.lng
          );
          
          // Update car rotation
          const driverElement = markersRef.current.driver.getElement();
          if (driverElement) {
            driverElement.style.transform = `rotate(${bearing}deg)`;
          }
          
          // Animate to new position
          const duration = getOptimalDuration(
            { lat: currentPos.lat, lng: currentPos.lng },
            targetPos,
            30 // 30 km/h average speed
          );
          
          animateMarkerMovement(markersRef.current.driver, targetPos, duration);
          previousDriverLocationRef.current = driverLocation;
        } else {
          // Create new driver marker with custom car icon
          const driverElement = document.createElement('div');
          driverElement.className = 'driver-marker';
          driverElement.style.width = '40px';
          driverElement.style.height = '40px';
          driverElement.style.borderRadius = '50%';
          driverElement.style.backgroundColor = '#4285F4';
          driverElement.style.border = '4px solid white';
          driverElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
          driverElement.style.cursor = 'pointer';
          driverElement.innerHTML = '🚕';
          driverElement.style.fontSize = '20px';
          driverElement.style.display = 'flex';
          driverElement.style.alignItems = 'center';
          driverElement.style.justifyContent = 'center';
          driverElement.style.transition = 'transform 0.3s ease';
          
          const driverMarker = new mapboxgl.Marker({ element: driverElement })
            .setLngLat([driverLocation.lng, driverLocation.lat])
            .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Driver</h3><p>On the way!</p>'))
            .addTo(mapRef.current);
          
          markersRef.current.driver = driverMarker;
          previousDriverLocationRef.current = driverLocation;
          console.log('Added driver marker');
        }
      } else if (markersRef.current.driver) {
        // Remove driver marker when no longer needed
        markersRef.current.driver.remove();
        markersRef.current.driver = null;
        previousDriverLocationRef.current = null;
      }
    } catch (err) {
      console.error('Error updating driver:', err);
    }
  }, [driverLocation, mapLoaded, animateMarkerMovement, calculateBearing, getOptimalDuration]);

  // Handle path visualization with animated drawing
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || !pathSourceRef.current) return;
    
    try {
      if (currentPath && currentPath.path && currentPath.path.length > 0) {
        console.log('Drawing path:', currentPath.type, 'with', currentPath.path.length, 'points');
        
        // Update path color based on type
        const pathColor = currentPath.color || (currentPath.type === 'pickup' ? '#FF6B35' : '#4285F4');
        mapRef.current.setPaintProperty('route', 'line-color', pathColor);
        
        // Clear previous path
        pathSourceRef.current.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        });
        
        // Animate path drawing
        animatePolylineDraw(pathSourceRef.current, currentPath.path, 100);
        
        // Fit map to show the path
        const coordinates = currentPath.path.map(point => [point.lng, point.lat]);
        const bounds = new mapboxgl.LngLatBounds();
        coordinates.forEach(coord => bounds.extend(coord));
        
        // Add padding and animate to bounds
        mapRef.current.fitBounds(bounds, {
          padding: 50,
          duration: 1000
        });
      } else {
        // Clear path when no current path
        pathSourceRef.current.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: []
          }
        });
      }
    } catch (err) {
      console.error('Error updating path:', err);
    }
  }, [currentPath, mapLoaded, animatePolylineDraw]);

  // Auto-fit map bounds when locations change (only initially or when explicitly requested)
  useEffect(() => {
    if (!mapRef.current || !mapLoaded || userInteracted) return;
    
    try {
      const bounds = new mapboxgl.LngLatBounds();
      let hasPoints = false;
      
      // Add user location
      if (userLocation) {
        bounds.extend([userLocation.lng, userLocation.lat]);
        hasPoints = true;
      }
      
      // Add pickup location
      if (pickupLocation) {
        bounds.extend([pickupLocation.lng, pickupLocation.lat]);
        hasPoints = true;
      }
      
      // Add drop location
      if (dropLocation) {
        bounds.extend([dropLocation.lng, dropLocation.lat]);
        hasPoints = true;
      }
      
      // Add driver location
      if (driverLocation) {
        bounds.extend([driverLocation.lng, driverLocation.lat]);
        hasPoints = true;
      }
      
      // Only include nearby cabs if we don't have other locations
      if (nearbyCabs.length > 0 && !pickupLocation && !dropLocation) {
        nearbyCabs.forEach(cab => {
          bounds.extend([cab.lng, cab.lat]);
          hasPoints = true;
        });
      }
      
      // Fit bounds if we have points and haven't initialized bounds yet
      if (hasPoints && !hasInitializedBounds) {
        mapRef.current.fitBounds(bounds, {
          padding: 80,
          duration: 1500,
          maxZoom: 14
        });
        setHasInitializedBounds(true);
      }
    } catch (err) {
      console.error('Error fitting bounds:', err);
    }
  }, [userLocation, pickupLocation, dropLocation, driverLocation, nearbyCabs, mapLoaded, userInteracted, hasInitializedBounds]);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f5f5f5'
      }}>
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#ffebee', 
          border: '1px solid #f44336',
          borderRadius: '8px',
          maxWidth: '400px'
        }}>
          <h3 style={{ color: '#c62828', marginBottom: '10px' }}>Map Error</h3>
          <p style={{ color: '#666' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      <div 
        ref={mapContainerRef}
        style={{ 
          width: '100%', 
          height: '100%' 
        }}
      />
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          zIndex: 1000
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #4285F4',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 10px'
            }} />
            <p>Loading Map...</p>
          </div>
        </div>
      )}
      
      {/* Map interaction hints */}
      {mapLoaded && tripState === TRIP_STATES.IDLE && (
        <div style={{
          position: 'absolute',
          top: 20,
          left: 20,
          right: 20,
          zIndex: 1000,
          pointerEvents: 'none'
        }}>
          <div style={{
            backgroundColor: 'rgba(66, 133, 244, 0.95)',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            fontSize: '14px',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(10px)'
          }}>
            {selectionMode === 'pickup' && '📍 Click on the map to set pickup location'}
            {selectionMode === 'drop' && '🎯 Click on the map to set destination'}
            {!selectionMode && !pickupLocation && !dropLocation && '💡 Click on the map to select locations or use search boxes below'}
            {!selectionMode && pickupLocation && !dropLocation && '✅ Pickup set! Click map or search to add destination'}
            {!selectionMode && pickupLocation && dropLocation && '🚗 Ready to book your ride!'}
          </div>
        </div>
      )}
      
      {/* Location Selection Buttons */}
      {mapLoaded && tripState === TRIP_STATES.IDLE && !selectionMode && (
        <div style={{
          position: 'absolute',
          top: 80,
          left: 20,
          zIndex: 1000,
          display: 'flex',
          gap: '8px'
        }}>
          <button
            style={{
              backgroundColor: '#34A853',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => setSelectionMode('pickup')}
          >
            📍 Set Pickup
          </button>
          <button
            style={{
              backgroundColor: '#EA4335',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              borderRadius: '6px',
              fontSize: '12px',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
            onClick={() => setSelectionMode('drop')}
          >
            🎯 Set Destination
          </button>
          {selectionMode && (
            <button
              style={{
                backgroundColor: '#666',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
              }}
              onClick={() => setSelectionMode(null)}
            >
              Cancel
            </button>
          )}
        </div>
      )}
      
      <style jsx global>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .location-selection-popup .mapboxgl-popup-content {
          padding: 0;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .location-popup {
          padding: 16px;
          text-align: center;
          min-width: 200px;
        }
        
        .location-popup h3 {
          margin: 0 0 12px 0;
          color: #333;
          font-size: 14px;
        }
        
        .location-popup .btn-pickup,
        .location-popup .btn-drop {
          display: block;
          width: 100%;
          padding: 8px 12px;
          margin: 6px 0;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .location-popup .btn-pickup {
          background-color: #34A853;
          color: white;
        }
        
        .location-popup .btn-pickup:hover {
          background-color: #2E7D32;
        }
        
        .location-popup .btn-drop {
          background-color: #EA4335;
          color: white;
        }
        
        .location-popup .btn-drop:hover {
          background-color: #C62828;
        }
      `}</style>
    </div>
  );
}

export default SimpleMapboxComponent;