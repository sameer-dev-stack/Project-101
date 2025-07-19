import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;
mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;

const MapboxMap = ({ 
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
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef({
    cabs: new Map(),
    pickup: null,
    drop: null,
    driver: null,
    user: null
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    console.log('Initializing Mapbox with token:', MAPBOX_ACCESS_TOKEN ? 'Available' : 'Missing');

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: userLocation ? [userLocation.lng, userLocation.lat] : [-74.0060, 40.7128],
      zoom: 13,
      pitch: 0,
      bearing: 0
    });

    map.on('load', () => {
      setMapLoaded(true);
      console.log('Mapbox map loaded successfully');
    });

    map.on('error', (e) => {
      console.error('Mapbox error:', e);
    });

    // Handle map clicks for location selection
    map.on('click', (e) => {
      const { lng, lat } = e.lngLat;
      
      if (tripState === 'idle') {
        if (!pickupLocation) {
          onPickupSelect({ lat, lng });
        } else if (!dropLocation) {
          onDropSelect({ lat, lng });
        }
      }
    });

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'top-right');

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user location marker
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !userLocation) return;

    // Remove existing user marker
    if (markersRef.current.user) {
      markersRef.current.user.remove();
    }

    // Create custom user marker element
    const userMarkerEl = document.createElement('div');
    userMarkerEl.innerHTML = '📍';
    userMarkerEl.style.fontSize = '24px';
    userMarkerEl.style.cursor = 'pointer';

    // Create user marker
    const userMarker = new mapboxgl.Marker(userMarkerEl)
      .setLngLat([userLocation.lng, userLocation.lat])
      .setPopup(new mapboxgl.Popup().setText('Your Location'))
      .addTo(mapRef.current);

    markersRef.current.user = userMarker;

    // Fly to user location
    mapRef.current.flyTo({
      center: [userLocation.lng, userLocation.lat],
      zoom: 13,
      duration: 1000
    });
  }, [mapLoaded, userLocation]);

  // Update nearby cabs
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Clear existing cab markers
    markersRef.current.cabs.forEach(marker => marker.remove());
    markersRef.current.cabs.clear();

    // Add new cab markers
    nearbyCabs.forEach((cab, index) => {
      const cabMarkerEl = document.createElement('div');
      cabMarkerEl.innerHTML = '🚗';
      cabMarkerEl.style.fontSize = '20px';
      cabMarkerEl.style.cursor = 'pointer';

      const cabMarker = new mapboxgl.Marker(cabMarkerEl)
        .setLngLat([cab.lng, cab.lat])
        .setPopup(new mapboxgl.Popup().setText('Available Cab'))
        .addTo(mapRef.current);

      markersRef.current.cabs.set(index, cabMarker);
    });
  }, [mapLoaded, nearbyCabs]);

  // Update pickup location marker
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove existing pickup marker
    if (markersRef.current.pickup) {
      markersRef.current.pickup.remove();
    }

    if (pickupLocation) {
      const pickupMarkerEl = document.createElement('div');
      pickupMarkerEl.innerHTML = '🟡';
      pickupMarkerEl.style.fontSize = '20px';
      pickupMarkerEl.style.cursor = 'pointer';

      const pickupMarker = new mapboxgl.Marker(pickupMarkerEl)
        .setLngLat([pickupLocation.lng, pickupLocation.lat])
        .setPopup(new mapboxgl.Popup().setText('Pickup Location'))
        .addTo(mapRef.current);

      markersRef.current.pickup = pickupMarker;
    }
  }, [mapLoaded, pickupLocation]);

  // Update drop location marker
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove existing drop marker
    if (markersRef.current.drop) {
      markersRef.current.drop.remove();
    }

    if (dropLocation) {
      const dropMarkerEl = document.createElement('div');
      dropMarkerEl.innerHTML = '🔴';
      dropMarkerEl.style.fontSize = '20px';
      dropMarkerEl.style.cursor = 'pointer';

      const dropMarker = new mapboxgl.Marker(dropMarkerEl)
        .setLngLat([dropLocation.lng, dropLocation.lat])
        .setPopup(new mapboxgl.Popup().setText('Drop Location'))
        .addTo(mapRef.current);

      markersRef.current.drop = dropMarker;

      // Fit bounds to show both pickup and drop
      if (pickupLocation) {
        const bounds = new mapboxgl.LngLatBounds();
        bounds.extend([pickupLocation.lng, pickupLocation.lat]);
        bounds.extend([dropLocation.lng, dropLocation.lat]);
        
        mapRef.current.fitBounds(bounds, { 
          padding: 50,
          duration: 1000
        });
      }
    }
  }, [mapLoaded, dropLocation, pickupLocation]);

  // Update driver location
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    // Remove existing driver marker
    if (markersRef.current.driver) {
      markersRef.current.driver.remove();
    }

    if (driverLocation) {
      const driverMarkerEl = document.createElement('div');
      driverMarkerEl.innerHTML = '🚕';
      driverMarkerEl.style.fontSize = '24px';
      driverMarkerEl.style.cursor = 'pointer';

      const driverMarker = new mapboxgl.Marker(driverMarkerEl)
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .setPopup(new mapboxgl.Popup().setText('Your Driver'))
        .addTo(mapRef.current);

      markersRef.current.driver = driverMarker;
    }
  }, [mapLoaded, driverLocation]);

  // Update route path
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !currentPath) return;

    const map = mapRef.current;
    const sourceId = 'route';
    const layerId = 'route-line';

    // Remove existing route
    if (map.getLayer(layerId)) {
      map.removeLayer(layerId);
    }
    if (map.getSource(sourceId)) {
      map.removeSource(sourceId);
    }

    // Add new route
    if (currentPath.path && currentPath.path.length > 0) {
      const coordinates = currentPath.path.map(point => [point.lng, point.lat]);

      map.addSource(sourceId, {
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

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
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

      // Fit bounds to show the route
      const bounds = new mapboxgl.LngLatBounds();
      coordinates.forEach(coord => bounds.extend(coord));
      map.fitBounds(bounds, { 
        padding: 50,
        duration: 1000
      });
    }
  }, [mapLoaded, currentPath]);

  if (!MAPBOX_ACCESS_TOKEN) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f8f9fa',
        color: '#666',
        fontSize: '16px',
        textAlign: 'center',
        padding: '20px'
      }}>
        <div>
          <h3>Mapbox Token Required</h3>
          <p>Please add your Mapbox access token to the .env file</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        ref={mapContainerRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          overflow: 'hidden'
        }} 
      />
      {!mapLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'rgba(255,255,255,0.9)',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e9ecef',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 10px'
          }}></div>
          <p>Loading Mapbox...</p>
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

export default MapboxMap;