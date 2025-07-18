import { useRef, useCallback } from 'react';

export function useMapAnimations() {
  const animationsRef = useRef(new Set());

  // Easing function for smooth animations
  const easeInOutCubic = useCallback((t) => {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
  }, []);

  // Calculate bearing between two points
  const calculateBearing = useCallback((lat1, lng1, lat2, lng2) => {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }, []);

  // Animate marker movement between two positions (for Mapbox markers)
  const animateMarkerMovement = useCallback((marker, targetPosition, duration = 3000) => {
    if (!marker || !targetPosition) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const startPosition = marker.getLngLat();
      if (!startPosition) {
        marker.setLngLat([targetPosition.lng, targetPosition.lat]);
        resolve();
        return;
      }

      const startLng = startPosition.lng;
      const startLat = startPosition.lat;
      const endLng = targetPosition.lng;
      const endLat = targetPosition.lat;

      // Check if movement is needed
      const distance = Math.sqrt(
        Math.pow(endLat - startLat, 2) + Math.pow(endLng - startLng, 2)
      );
      
      if (distance < 0.00001) { // Very small movement, skip animation
        marker.setLngLat([targetPosition.lng, targetPosition.lat]);
        resolve();
        return;
      }

      let startTime = null;
      const animationId = Symbol('markerAnimation');
      
      const animate = (currentTime) => {
        if (!startTime) startTime = currentTime;
        
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easeInOutCubic(progress);

        // Interpolate position
        const currentLng = startLng + (endLng - startLng) * easedProgress;
        const currentLat = startLat + (endLat - startLat) * easedProgress;

        marker.setLngLat([currentLng, currentLat]);

        if (progress < 1) {
          const frameId = requestAnimationFrame(animate);
          animationsRef.current.add(() => cancelAnimationFrame(frameId));
        } else {
          // Ensure final position is exact
          marker.setLngLat([targetPosition.lng, targetPosition.lat]);
          animationsRef.current.delete(animationId);
          resolve();
        }
      };

      const frameId = requestAnimationFrame(animate);
      animationsRef.current.add(() => cancelAnimationFrame(frameId));
    });
  }, [easeInOutCubic]);

  // Animate polyline drawing point by point (for Mapbox sources)
  const animatePolylineDraw = useCallback((source, path, intervalMs = 50) => {
    if (!source || !path || path.length === 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let currentIndex = 0;
      const animationId = Symbol('polylineAnimation');
      
      const drawNextPoint = () => {
        if (currentIndex >= path.length) {
          animationsRef.current.delete(animationId);
          resolve();
          return;
        }

        // Add current point to polyline
        const currentPath = path.slice(0, currentIndex + 1);
        const coordinates = currentPath.map(point => [point.lng, point.lat]);
        
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: coordinates
          }
        });
        
        currentIndex++;
        
        const timeoutId = setTimeout(drawNextPoint, intervalMs);
        animationsRef.current.add(() => clearTimeout(timeoutId));
      };

      drawNextPoint();
    });
  }, []);

  // Animate marker along a path (for Mapbox markers)
  const animateMarkerAlongPath = useCallback((marker, path, duration = 5000) => {
    if (!marker || !path || path.length < 2) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      let currentPathIndex = 0;
      let segmentStartTime = null;
      const animationId = Symbol('pathAnimation');
      
      // Calculate total path distance for speed adjustment
      let totalDistance = 0;
      for (let i = 1; i < path.length; i++) {
        const prevPoint = path[i - 1];
        const currentPoint = path[i];
        totalDistance += Math.sqrt(
          Math.pow(currentPoint.lat - prevPoint.lat, 2) + 
          Math.pow(currentPoint.lng - prevPoint.lng, 2)
        );
      }

      const animate = (currentTime) => {
        if (!segmentStartTime) segmentStartTime = currentTime;
        
        const elapsed = currentTime - segmentStartTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Calculate which segment we should be on
        const targetIndex = Math.floor(progress * (path.length - 1));
        
        if (targetIndex >= path.length - 1) {
          // Animation complete
          marker.setLngLat([path[path.length - 1].lng, path[path.length - 1].lat]);
          animationsRef.current.delete(animationId);
          resolve();
          return;
        }

        if (targetIndex > currentPathIndex) {
          currentPathIndex = targetIndex;
        }

        // Interpolate within current segment
        const segmentProgress = (progress * (path.length - 1)) - currentPathIndex;
        const clampedSegmentProgress = Math.max(0, Math.min(1, segmentProgress));
        
        const startPoint = path[currentPathIndex];
        const endPoint = path[currentPathIndex + 1] || startPoint;
        
        const currentLng = startPoint.lng + (endPoint.lng - startPoint.lng) * clampedSegmentProgress;
        const currentLat = startPoint.lat + (endPoint.lat - startPoint.lat) * clampedSegmentProgress;

        marker.setLngLat([currentLng, currentLat]);

        const frameId = requestAnimationFrame(animate);
        animationsRef.current.add(() => cancelAnimationFrame(frameId));
      };

      const frameId = requestAnimationFrame(animate);
      animationsRef.current.add(() => cancelAnimationFrame(frameId));
    });
  }, []);

  // Animate marker bounce effect (for Mapbox markers)
  const animateMarkerBounce = useCallback((marker, bounces = 3, bounceHeight = 20) => {
    if (!marker) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      const originalElement = marker.getElement();
      const originalTransform = originalElement.style.transform;
      let currentBounce = 0;
      const animationId = Symbol('bounceAnimation');
      
      const bounce = () => {
        if (currentBounce >= bounces) {
          // Reset to original position
          originalElement.style.transform = originalTransform;
          animationsRef.current.delete(animationId);
          resolve();
          return;
        }

        const bounceAnimationDuration = 300; // 300ms per bounce
        let startTime = null;
        
        const animateBounce = (currentTime) => {
          if (!startTime) startTime = currentTime;
          
          const elapsed = currentTime - startTime;
          const progress = elapsed / bounceAnimationDuration;
          
          if (progress >= 1) {
            currentBounce++;
            const timeoutId = setTimeout(bounce, 100); // Small delay between bounces
            animationsRef.current.add(() => clearTimeout(timeoutId));
            return;
          }

          // Calculate bounce offset
          const bounceProgress = Math.sin(progress * Math.PI);
          const yOffset = bounceHeight * bounceProgress;
          
          // Apply transform to element
          originalElement.style.transform = `${originalTransform} translateY(-${yOffset}px)`;

          const frameId = requestAnimationFrame(animateBounce);
          animationsRef.current.add(() => cancelAnimationFrame(frameId));
        };

        const frameId = requestAnimationFrame(animateBounce);
        animationsRef.current.add(() => cancelAnimationFrame(frameId));
      };

      bounce();
    });
  }, []);

  // Clear all active animations
  const clearAnimations = useCallback(() => {
    animationsRef.current.forEach(cleanup => {
      if (typeof cleanup === 'function') {
        cleanup();
      }
    });
    animationsRef.current.clear();
  }, []);

  // Calculate distance between two points
  const calculateDistance = useCallback((lat1, lng1, lat2, lng2) => {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Get optimal animation duration based on distance
  const getOptimalDuration = useCallback((startPos, endPos, baseSpeed = 30) => {
    if (!startPos || !endPos) return 2000; // Default 2 seconds
    
    const distance = calculateDistance(
      startPos.lat, startPos.lng,
      endPos.lat, endPos.lng
    );
    
    // Calculate duration based on distance (30 km/h average speed)
    const durationMs = (distance / baseSpeed) * 3.6; // Convert to milliseconds
    return Math.max(1000, Math.min(5000, durationMs)); // Between 1-5 seconds
  }, [calculateDistance]);

  return {
    animateMarkerMovement,
    animatePolylineDraw,
    animateMarkerAlongPath,
    animateMarkerBounce,
    calculateBearing,
    calculateDistance,
    getOptimalDuration,
    clearAnimations
  };
}