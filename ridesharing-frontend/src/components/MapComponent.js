import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import { useMapAnimations } from '../hooks/useMapAnimations';
import { TRIP_STATES } from '../shared/websocket-events.js';

const MapComponent = forwardRef(({
  google,
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
  const polylinesRef = useRef({
    current: null
  });

  // Animation hooks
  const {
    animateMarkerMovement,
    animatePolylineDraw,
    calculateBearing,
    clearAnimations
  } = useMapAnimations();

  // Expose map methods to parent component
  useImperativeHandle(ref, () => ({
    getMap: () => mapRef.current,
    panTo: (location) => {
      if (mapRef.current && location) {
        mapRef.current.panTo(location);
      }
    },
    fitBounds: (bounds) => {
      if (mapRef.current && bounds) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }));

  // Initialize map
  useEffect(() => {
    if (!google || !mapContainerRef.current || mapRef.current) {
      return;
    }

    const defaultCenter = userLocation || { lat: 28.6139, lng: 77.2090 };

    const map = new google.maps.Map(mapContainerRef.current, {
      center: defaultCenter,
      zoom: 14,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        },
        {
          featureType: 'transit',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ],
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: false,
      fullscreenControl: true,
      gestureHandling: 'auto'
    });

    mapRef.current = map;

    // Add user location marker if available
    if (userLocation) {
      createUserLocationMarker(userLocation);
    }

  }, [google, userLocation]);

  // Create user location marker
  const createUserLocationMarker = (location) => {
    if (!mapRef.current || !google) return;

    if (markersRef.current.user) {
      markersRef.current.user.setMap(null);
    }

    const userMarker = new google.maps.Marker({
      position: location,
      map: mapRef.current,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: '#4285F4',
        fillOpacity: 0.8,
        strokeColor: 'white',
        strokeWeight: 3,
        scale: 8
      },
      title: 'Your Location',
      zIndex: 1000
    });

    // Add accuracy circle
    const accuracyCircle = new google.maps.Circle({
      center: location,
      radius: 100, // 100 meter accuracy
      fillColor: '#4285F4',
      fillOpacity: 0.1,
      strokeColor: '#4285F4',
      strokeWeight: 1,
      map: mapRef.current
    });

    markersRef.current.user = userMarker;
    markersRef.current.userAccuracy = accuracyCircle;
  };

  // Update nearby cabs
  useEffect(() => {
    if (!mapRef.current || !google || !nearbyCabs) {
      return;
    }

    // Remove old cab markers
    markersRef.current.cabs.forEach(marker => {
      marker.setMap(null);
    });
    markersRef.current.cabs.clear();

    // Add new cab markers
    nearbyCabs.forEach(cab => {
      const cabMarker = new google.maps.Marker({
        position: { lat: cab.lat, lng: cab.lng },
        map: mapRef.current,
        icon: createCabIcon(cab.heading),
        title: `Cab ${cab.id}`,
        zIndex: 500
      });

      markersRef.current.cabs.set(cab.id, cabMarker);
    });

  }, [nearbyCabs, google]);

  // Update pickup location marker
  useEffect(() => {
    if (!mapRef.current || !google) return;

    if (markersRef.current.pickup) {
      markersRef.current.pickup.setMap(null);
      markersRef.current.pickup = null;
    }

    if (pickupLocation) {
      const pickupMarker = new google.maps.Marker({
        position: pickupLocation,
        map: mapRef.current,
        icon: createLocationIcon('#34A853', 'P'),
        title: 'Pickup Location',
        zIndex: 800
      });

      markersRef.current.pickup = pickupMarker;
    }
  }, [pickupLocation, google]);

  // Update drop location marker
  useEffect(() => {
    if (!mapRef.current || !google) return;

    if (markersRef.current.drop) {
      markersRef.current.drop.setMap(null);
      markersRef.current.drop = null;
    }

    if (dropLocation) {
      const dropMarker = new google.maps.Marker({
        position: dropLocation,
        map: mapRef.current,
        icon: createLocationIcon('#EA4335', 'D'),
        title: 'Drop Location',
        zIndex: 800
      });

      markersRef.current.drop = dropMarker;
    }
  }, [dropLocation, google]);

  // Update driver location with smooth animation
  useEffect(() => {
    if (!mapRef.current || !google || !driverLocation) {
      return;
    }

    if (!markersRef.current.driver) {
      // Create new driver marker
      const driverMarker = new google.maps.Marker({
        position: driverLocation,
        map: mapRef.current,
        icon: createDriverIcon(),
        title: 'Your Driver',
        zIndex: 900
      });

      markersRef.current.driver = driverMarker;
    } else {
      // Animate existing driver marker to new position
      const currentPos = markersRef.current.driver.getPosition();
      if (currentPos) {
        const bearing = calculateBearing(
          currentPos.lat(),
          currentPos.lng(),
          driverLocation.lat,
          driverLocation.lng
        );

        // Update driver icon with correct rotation
        markersRef.current.driver.setIcon(createDriverIcon(bearing));

        // Animate movement
        animateMarkerMovement(
          markersRef.current.driver,
          driverLocation,
          3000 // 3 second animation
        );
      }
    }
  }, [driverLocation, google, animateMarkerMovement, calculateBearing]);

  // Update path visualization
  useEffect(() => {
    if (!mapRef.current || !google) return;

    // Clear existing polylines
    if (polylinesRef.current.current) {
      polylinesRef.current.current.setMap(null);
      polylinesRef.current.current = null;
    }

    if (currentPath && currentPath.path && currentPath.path.length > 1) {
      const pathColor = currentPath.color || '#4285F4';
      
      // Create polyline
      const polyline = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: pathColor,
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: mapRef.current,
        zIndex: 100
      });

      polylinesRef.current.current = polyline;

      // Animate polyline drawing
      animatePolylineDraw(polyline, currentPath.path, 50); // 50ms per point
    }
  }, [currentPath, google, animatePolylineDraw]);

  // Auto-fit map bounds when locations change
  useEffect(() => {
    if (!mapRef.current || !google) return;

    const bounds = new google.maps.LatLngBounds();
    let hasLocations = false;

    // Add user location
    if (userLocation) {
      bounds.extend(userLocation);
      hasLocations = true;
    }

    // Add pickup location
    if (pickupLocation) {
      bounds.extend(pickupLocation);
      hasLocations = true;
    }

    // Add drop location
    if (dropLocation) {
      bounds.extend(dropLocation);
      hasLocations = true;
    }

    // Add driver location during trip
    if (driverLocation && tripState !== TRIP_STATES.IDLE) {
      bounds.extend(driverLocation);
      hasLocations = true;
    }

    // Fit bounds if we have multiple locations
    if (hasLocations) {
      const currentBounds = mapRef.current.getBounds();
      if (!currentBounds || !currentBounds.equals(bounds)) {
        mapRef.current.fitBounds(bounds, {
          top: 100,
          right: 50,
          bottom: 300,
          left: 50
        });
      }
    }
  }, [userLocation, pickupLocation, dropLocation, driverLocation, tripState, google]);

  // Create cab icon with rotation
  const createCabIcon = (heading = 0) => {
    return {
      path: 'M0-20 L-8-8 L-8 8 L8 8 L8-8 Z',
      fillColor: '#4285F4',
      fillOpacity: 0.8,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 1,
      anchor: new google.maps.Point(0, 0),
      rotation: heading
    };
  };

  // Create driver icon with rotation
  const createDriverIcon = (heading = 0) => {
    return {
      path: 'M0-30 L-12-12 L-12 12 L12 12 L12-12 Z',
      fillColor: '#FF6B35',
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 3,
      scale: 1.2,
      anchor: new google.maps.Point(0, 0),
      rotation: heading
    };
  };

  // Create location pin icon
  const createLocationIcon = (color, label) => {
    return {
      path: 'M0-30 Q-15-30 -15-15 Q-15 0 0 15 Q15 0 15-15 Q15-30 0-30 Z',
      fillColor: color,
      fillOpacity: 1,
      strokeColor: 'white',
      strokeWeight: 2,
      scale: 1,
      anchor: new google.maps.Point(0, 15),
      labelOrigin: new google.maps.Point(0, -15)
    };
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearAnimations();
      
      // Clear all markers
      Object.values(markersRef.current).forEach(marker => {
        if (marker && marker.setMap) {
          marker.setMap(null);
        }
      });

      // Clear polylines
      if (polylinesRef.current.current) {
        polylinesRef.current.current.setMap(null);
      }
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

MapComponent.displayName = 'MapComponent';

export default MapComponent;