import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import mapboxgl from 'mapbox-gl';
import { useMapAnimations } from '../hooks/useMapAnimations';
import { TRIP_STATES } from '../shared/websocket-events.js';
import 'mapbox-gl/dist/mapbox-gl.css';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

console.log('MapboxMapComponent - Token check:', {
  token: MAPBOX_ACCESS_TOKEN ? 'Available' : 'Missing',
  length: MAPBOX_ACCESS_TOKEN?.length
});

const MapboxMapComponent = forwardRef(({
  userLocation,
  nearbyCabs,
  pickupLocation,
  dropLocation,
  driverLocation,
  currentPath,
  tripState
}, ref) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef({
    cabs: new Map(),
    driver: null,
    pickup: null,
    drop: null,
    user: null
  });
  const sourcesRef = useRef(new Set());

  // Animation hooks
  const {
    animateMarkerMovement,
    calculateBearing,
    clearAnimations
  } = useMapAnimations();

  // Set Mapbox access token
  useEffect(() => {
    if (MAPBOX_ACCESS_TOKEN) {
      mapboxgl.accessToken = MAPBOX_ACCESS_TOKEN;
    } else {
      console.error('Mapbox access token is required');
    }
  }, []);

  // Expose map methods to parent component
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    panTo: (location) => {
      if (mapRef.current && location) {
        mapRef.current.easeTo({
          center: [location.lng, location.lat],
          duration: 1000
        });
      }
    },
    fitBounds: (bounds) => {
      if (mapRef.current && bounds) {
        mapRef.current.fitBounds(bounds, { padding: 50 });
      }
    }
  }));

  // Initialize map
  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const defaultCenter = userLocation ? [userLocation.lng, userLocation.lat] : [77.2090, 28.6139];

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/streets-v12',
      center: defaultCenter,
      zoom: 14,
      pitch: 0,
      bearing: 0
    });

    // Wait for map to load before adding controls and markers
    map.on('load', () => {
      console.log('Mapbox map loaded successfully');
      
      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Add geolocate control
      map.addControl(
        new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true,
          showUserHeading: true
        }),
        'top-right'
      );

      // Add user location marker if available
      if (userLocation) {
        createUserLocationMarker(userLocation);
      }
    });

    // Handle map errors
    map.on('error', (error) => {
      console.error('Mapbox map error:', error);
    });

    mapRef.current = map;

    return () => {
      if (map) {
        map.remove();
      }
    };
  }, [userLocation]);

  // Create user location marker
  const createUserLocationMarker = (location) => {
    if (!mapRef.current) return;

    if (markersRef.current.user) {
      markersRef.current.user.remove();
    }

    const userMarker = new mapboxgl.Marker({
      color: '#4285F4',
      scale: 0.8
    })
      .setLngLat([location.lng, location.lat])
      .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Location</h3>'))
      .addTo(mapRef.current);

    markersRef.current.user = userMarker;
  };

  // Update nearby cabs
  useEffect(() => {
    if (!mapRef.current || !nearbyCabs) {
      return;
    }

    // Wait for map to be loaded before adding markers
    if (!mapRef.current.loaded()) {
      mapRef.current.on('load', () => {
        updateNearbyCabs();
      });
      return;
    }

    updateNearbyCabs();

    function updateNearbyCabs() {
      try {
        // Remove old cab markers
        markersRef.current.cabs.forEach(marker => {
          marker.remove();
        });
        markersRef.current.cabs.clear();

        // Add new cab markers
        nearbyCabs.forEach(cab => {
          const cabElement = createCabMarkerElement(cab.heading);
          
          const cabMarker = new mapboxgl.Marker({
            element: cabElement,
            anchor: 'center'
          })
            .setLngLat([cab.lng, cab.lat])
            .setPopup(new mapboxgl.Popup().setHTML(`<h3>Cab ${cab.id}</h3>`))
            .addTo(mapRef.current);

          markersRef.current.cabs.set(cab.id, cabMarker);
        });
      } catch (error) {
        console.error('Error updating nearby cabs:', error);
      }
    }
  }, [nearbyCabs]);

  // Update pickup location marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markersRef.current.pickup) {
      markersRef.current.pickup.remove();
      markersRef.current.pickup = null;
    }

    if (pickupLocation) {
      try {
        const pickupElement = createLocationMarkerElement('#34A853', 'P');
        
        const pickupMarker = new mapboxgl.Marker({
          element: pickupElement,
          anchor: 'bottom'
        })
          .setLngLat([pickupLocation.lng, pickupLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Pickup Location</h3>'))
          .addTo(mapRef.current);

        markersRef.current.pickup = pickupMarker;
      } catch (error) {
        console.error('Error adding pickup marker:', error);
      }
    }
  }, [pickupLocation]);

  // Update drop location marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (markersRef.current.drop) {
      markersRef.current.drop.remove();
      markersRef.current.drop = null;
    }

    if (dropLocation) {
      try {
        const dropElement = createLocationMarkerElement('#EA4335', 'D');
        
        const dropMarker = new mapboxgl.Marker({
          element: dropElement,
          anchor: 'bottom'
        })
          .setLngLat([dropLocation.lng, dropLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Drop Location</h3>'))
          .addTo(mapRef.current);

        markersRef.current.drop = dropMarker;
      } catch (error) {
        console.error('Error adding drop marker:', error);
      }
    }
  }, [dropLocation]);

  // Update driver location with smooth animation
  useEffect(() => {
    if (!mapRef.current || !driverLocation) {
      return;
    }

    try {
      if (!markersRef.current.driver) {
        // Create new driver marker
        const driverElement = createDriverMarkerElement();
        
        const driverMarker = new mapboxgl.Marker({
          element: driverElement,
          anchor: 'center'
        })
          .setLngLat([driverLocation.lng, driverLocation.lat])
          .setPopup(new mapboxgl.Popup().setHTML('<h3>Your Driver</h3>'))
          .addTo(mapRef.current);

        markersRef.current.driver = driverMarker;
      } else {
        // Animate existing driver marker to new position
        const currentLngLat = markersRef.current.driver.getLngLat();
        if (currentLngLat) {
          const bearing = calculateBearing(
            currentLngLat.lat,
            currentLngLat.lng,
            driverLocation.lat,
            driverLocation.lng
          );

          // Update driver icon with correct rotation
          const driverElement = createDriverMarkerElement(bearing);
          markersRef.current.driver.getElement().replaceWith(driverElement);

          // Animate movement
          animateDriverMovement(markersRef.current.driver, driverLocation);
        }
      }
    } catch (error) {
      console.error('Error updating driver location:', error);
    }
  }, [driverLocation, calculateBearing]);

  // Update path visualization
  useEffect(() => {
    if (!mapRef.current) return;

    try {
      // Clear existing route sources and layers
      sourcesRef.current.forEach(sourceId => {
        try {
          if (mapRef.current.getLayer(sourceId)) {
            mapRef.current.removeLayer(sourceId);
          }
          if (mapRef.current.getSource(sourceId)) {
            mapRef.current.removeSource(sourceId);
          }
        } catch (error) {
          console.error('Error removing layer/source:', error);
        }
      });
      sourcesRef.current.clear();

      if (currentPath && currentPath.path && currentPath.path.length > 1) {
        const sourceId = `route-${Date.now()}`;
        const pathColor = currentPath.color || '#4285F4';
        
        // Convert path to GeoJSON format
        const coordinates = currentPath.path.map(point => [point.lng, point.lat]);
        
        const routeGeoJSON = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        };

        // Add source
        mapRef.current.addSource(sourceId, {
          type: 'geojson',
          data: routeGeoJSON
        });

        // Add layer
        mapRef.current.addLayer({
          id: sourceId,
          type: 'line',
          source: sourceId,
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': pathColor,
            'line-width': 4,
            'line-opacity': 0.8
          }
        });

        sourcesRef.current.add(sourceId);

        // Animate line drawing
        animateRouteDrawing(sourceId, coordinates);
      }
    } catch (error) {
      console.error('Error updating path visualization:', error);
    }
  }, [currentPath]);

  // Auto-fit map bounds when locations change
  useEffect(() => {
    if (!mapRef.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    let hasLocations = false;

    // Add user location
    if (userLocation) {
      bounds.extend([userLocation.lng, userLocation.lat]);
      hasLocations = true;
    }

    // Add pickup location
    if (pickupLocation) {
      bounds.extend([pickupLocation.lng, pickupLocation.lat]);
      hasLocations = true;
    }

    // Add drop location
    if (dropLocation) {
      bounds.extend([dropLocation.lng, dropLocation.lat]);
      hasLocations = true;
    }

    // Add driver location during trip
    if (driverLocation && tripState !== TRIP_STATES.IDLE) {
      bounds.extend([driverLocation.lng, driverLocation.lat]);
      hasLocations = true;
    }

    // Fit bounds if we have multiple locations
    if (hasLocations && !bounds.isEmpty()) {
      mapRef.current.fitBounds(bounds, {
        padding: {
          top: 100,
          right: 50,
          bottom: 300,
          left: 50
        },
        duration: 1000
      });
    }
  }, [userLocation, pickupLocation, dropLocation, driverLocation, tripState]);

  // Create cab marker element
  const createCabMarkerElement = (heading = 0) => {
    const element = document.createElement('div');
    element.className = 'cab-marker';
    element.style.transform = `rotate(${heading}deg)`;
    element.innerHTML = '🚗';
    return element;
  };

  // Create driver marker element
  const createDriverMarkerElement = (heading = 0) => {
    const element = document.createElement('div');
    element.className = 'driver-marker';
    element.style.transform = `rotate(${heading}deg)`;
    element.innerHTML = '🚖';
    return element;
  };

  // Create location pin marker element
  const createLocationMarkerElement = (color, label) => {
    const element = document.createElement('div');
    element.className = 'location-marker';
    element.style.backgroundColor = color;
    element.innerHTML = label;
    return element;
  };

  // Animate driver movement
  const animateDriverMovement = (marker, targetLocation) => {
    const startLngLat = marker.getLngLat();
    const endLngLat = [targetLocation.lng, targetLocation.lat];
    
    const duration = 3000; // 3 seconds
    const startTime = Date.now();
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const currentLng = startLngLat.lng + (endLngLat[0] - startLngLat.lng) * easeProgress;
      const currentLat = startLngLat.lat + (endLngLat[1] - startLngLat.lat) * easeProgress;
      
      marker.setLngLat([currentLng, currentLat]);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  };

  // Animate route drawing
  const animateRouteDrawing = (sourceId, coordinates) => {
    let step = 0;
    const totalSteps = coordinates.length;
    
    const animate = () => {
      if (step >= totalSteps || !mapRef.current.getSource(sourceId)) return;
      
      const currentCoordinates = coordinates.slice(0, step + 1);
      
      mapRef.current.getSource(sourceId).setData({
        type: 'Feature',
        properties: {},
        geometry: {
          type: 'LineString',
          coordinates: currentCoordinates
        }
      });
      
      step++;
      
      if (step < totalSteps) {
        setTimeout(animate, 50); // 50ms between points
      }
    };
    
    animate();
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimations();
      
      // Clear all markers
      Object.values(markersRef.current).forEach(marker => {
        if (marker && marker.remove) {
          marker.remove();
        }
      });

      // Clear sources
      sourcesRef.current.forEach(sourceId => {
        if (mapRef.current && mapRef.current.getSource(sourceId)) {
          if (mapRef.current.getLayer(sourceId)) {
            mapRef.current.removeLayer(sourceId);
          }
          mapRef.current.removeSource(sourceId);
        }
      });
    };
  }, [clearAnimations]);

  return (
    <div 
      ref={mapContainerRef}
      className="map-container"
      style={{ 
        width: '100%', 
        height: '100vh',
        position: 'relative'
      }}
      aria-label="Interactive map showing your location, nearby cabs, and trip route"
    />
  );
});

MapboxMapComponent.displayName = 'MapboxMapComponent';

export default MapboxMapComponent;