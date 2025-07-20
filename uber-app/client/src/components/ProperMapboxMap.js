import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { MAPBOX_TOKEN } from '../config/api';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = MAPBOX_TOKEN;

const ProperMapboxMap = ({ 
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
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(90.4125); // Dhaka longitude
  const [lat, setLat] = useState(23.8103); // Dhaka latitude  
  const [zoom, setZoom] = useState(13);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    if (map.current) return; // Initialize map only once

    try {
      console.log('Initializing Mapbox with token:', mapboxgl.accessToken);
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [lng, lat],
        zoom: zoom,
        attributionControl: false
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      map.current.on('load', () => {
        console.log('Mapbox map loaded successfully!');
        setMapLoaded(true);
      });

      map.current.on('error', (e) => {
        console.error('Mapbox error:', e);
        setMapError(e.error?.message || 'Failed to load map');
      });

      // Handle map clicks
      map.current.on('click', (e) => {
        const { lng: clickLng, lat: clickLat } = e.lngLat;
        
        if (tripState === 'idle') {
          if (!pickupLocation) {
            onPickupSelect({ lat: clickLat, lng: clickLng });
            console.log('Pickup selected at:', clickLat, clickLng);
          } else if (!dropLocation) {
            onDropSelect({ lat: clickLat, lng: clickLng });
            console.log('Drop selected at:', clickLat, clickLng);
          }
        }
      });

      // Update map position on move
      map.current.on('move', () => {
        setLng(map.current.getCenter().lng.toFixed(4));
        setLat(map.current.getCenter().lat.toFixed(4));
        setZoom(map.current.getZoom().toFixed(2));
      });

    } catch (error) {
      console.error('Failed to initialize Mapbox:', error);
      setMapError(error.message);
    }
  }, []);

  // Clear all markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Add marker helper
  const addMarker = (lngLat, color, emoji, text) => {
    if (!map.current || !mapLoaded) return;

    const el = document.createElement('div');
    el.style.fontSize = '24px';
    el.style.cursor = 'pointer';
    el.textContent = emoji;

    const marker = new mapboxgl.Marker(el)
      .setLngLat(lngLat)
      .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(text))
      .addTo(map.current);

    markersRef.current.push(marker);
    return marker;
  };

  // Update user location
  useEffect(() => {
    if (!mapLoaded || !userLocation) return;

    clearMarkers();
    
    // Add user marker
    addMarker([userLocation.lng, userLocation.lat], '#007bff', '📍', 'Your Location');
    
    // Fly to user location
    map.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 14,
      duration: 1000
    });
  }, [mapLoaded, userLocation]);

  // Update nearby cabs
  useEffect(() => {
    if (!mapLoaded) return;

    // Clear existing markers
    clearMarkers();
    
    // Re-add user location if exists
    if (userLocation) {
      addMarker([userLocation.lng, userLocation.lat], '#007bff', '📍', 'Your Location');
    }

    // Add cab markers
    nearbyCabs.forEach((cab, index) => {
      addMarker([cab.lng, cab.lat], '#28a745', '🚗', `Available Cab ${index + 1}`);
    });
  }, [mapLoaded, nearbyCabs, userLocation]);

  // Update pickup location
  useEffect(() => {
    if (!mapLoaded || !pickupLocation) return;
    
    addMarker([pickupLocation.lng, pickupLocation.lat], '#ffc107', '🟡', 'Pickup Location');
  }, [mapLoaded, pickupLocation]);

  // Update drop location
  useEffect(() => {
    if (!mapLoaded || !dropLocation) return;
    
    addMarker([dropLocation.lng, dropLocation.lat], '#dc3545', '🔴', 'Drop Location');
    
    // Fit map to show both pickup and drop
    if (pickupLocation) {
      const bounds = new mapboxgl.LngLatBounds();
      bounds.extend([pickupLocation.lng, pickupLocation.lat]);
      bounds.extend([dropLocation.lng, dropLocation.lat]);
      
      map.current.fitBounds(bounds, {
        padding: 50,
        duration: 1000
      });
    }
  }, [mapLoaded, dropLocation, pickupLocation]);

  // Update driver location
  useEffect(() => {
    if (!mapLoaded || !driverLocation) return;
    
    addMarker([driverLocation.lng, driverLocation.lat], '#6f42c1', '🚕', 'Your Driver');
  }, [mapLoaded, driverLocation]);

  // Update route
  useEffect(() => {
    if (!mapLoaded || !currentPath?.path?.length) return;

    const routeId = 'route';
    
    // Remove existing route
    if (map.current.getSource(routeId)) {
      map.current.removeLayer(routeId);
      map.current.removeSource(routeId);
    }

    // Add new route
    const coordinates = currentPath.path.map(point => [point.lng, point.lat]);
    
    map.current.addSource(routeId, {
      type: 'geojson',
      data: {
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: coordinates
        }
      }
    });

    map.current.addLayer({
      id: routeId,
      type: 'line',
      source: routeId,
      layout: {
        'line-join': 'round',
        'line-cap': 'round'
      },
      paint: {
        'line-color': currentPath.color || '#007bff',
        'line-width': 5,
        'line-opacity': 0.8
      }
    });
  }, [mapLoaded, currentPath]);

  if (mapError) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f8f9fa',
        color: '#dc3545',
        fontSize: '16px',
        textAlign: 'center',
        padding: '20px',
        borderRadius: '8px',
        border: '2px dashed #dc3545'
      }}>
        <div>
          <h3>❌ Mapbox Error</h3>
          <p>{mapError}</p>
          <p>Check your API key and internet connection</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          zIndex: 1000
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e3f2fd',
            borderTop: '4px solid #2196f3',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '16px'
          }}></div>
          <p style={{ margin: 0, color: '#666', fontSize: '16px' }}>Loading Mapbox...</p>
        </div>
      )}
      
      {mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          color: '#333',
          fontFamily: 'monospace',
          zIndex: 1000
        }}>
          Lng: {lng} | Lat: {lat} | Zoom: {zoom}
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};

export default ProperMapboxMap;