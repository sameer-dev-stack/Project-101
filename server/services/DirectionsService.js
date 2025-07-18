// Directions service for route calculation and path generation
class DirectionsService {
  constructor() {
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.cacheExpiry = 30 * 60 * 1000; // 30 minutes
  }

  // Get route between two points
  async getRoute(origin, destination) {
    const cacheKey = `${origin.lat},${origin.lng}_${destination.lat},${destination.lng}`;
    
    // Check cache first
    const cached = this.getCachedRoute(cacheKey);
    if (cached) {
      console.log('Using cached route');
      return cached;
    }

    try {
      // For this simulation, we'll generate a synthetic realistic route
      // In production, this would use Google Directions API
      const route = await this.generateSyntheticRoute(origin, destination);
      
      // Cache the result
      this.cacheRoute(cacheKey, route);
      
      return route;
    } catch (error) {
      console.error('Error generating route:', error);
      return null;
    }
  }

  // Generate a synthetic route that looks realistic
  async generateSyntheticRoute(origin, destination) {
    const points = [];
    
    // Calculate basic route parameters
    const totalDistance = this.calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    const bearing = this.calculateBearing(origin.lat, origin.lng, destination.lat, destination.lng);
    
    // Determine number of points based on distance
    const pointsCount = Math.max(10, Math.min(50, Math.floor(totalDistance / 100))); // 1 point per ~100m
    
    // Generate intermediate points with some realistic curvature
    for (let i = 0; i <= pointsCount; i++) {
      const progress = i / pointsCount;
      
      // Basic linear interpolation
      let lat = origin.lat + (destination.lat - origin.lat) * progress;
      let lng = origin.lng + (destination.lng - origin.lng) * progress;
      
      // Add some realistic variation to simulate road paths
      if (i > 0 && i < pointsCount) {
        // Add slight random variations to simulate real roads
        const variation = 0.0005; // Small variation to look like real roads
        const randomOffset = (Math.random() - 0.5) * variation;
        
        // Apply variation perpendicular to the main bearing
        const perpendicularBearing = bearing + 90;
        const offsetLat = randomOffset * Math.cos(perpendicularBearing * Math.PI / 180);
        const offsetLng = randomOffset * Math.sin(perpendicularBearing * Math.PI / 180);
        
        lat += offsetLat;
        lng += offsetLng;
        
        // Add some curves for longer routes
        if (totalDistance > 1000) {
          const curveAmount = Math.sin(progress * Math.PI * 2) * 0.0002;
          lat += curveAmount * Math.cos((bearing + 90) * Math.PI / 180);
          lng += curveAmount * Math.sin((bearing + 90) * Math.PI / 180);
        }
      }
      
      points.push({ lat, lng });
    }

    // Simulate API delay
    await this.sleep(100 + Math.random() * 200);
    
    console.log(`Generated synthetic route with ${points.length} points over ${totalDistance.toFixed(0)}m`);
    return points;
  }

  // Get route for demonstration with predefined paths
  async getDemoRoute(routeType, origin, destination) {
    // This could provide specific demo routes for testing
    switch (routeType) {
      case 'short':
        return this.generateShortRoute(origin, destination);
      case 'medium':
        return this.generateMediumRoute(origin, destination);
      case 'long':
        return this.generateLongRoute(origin, destination);
      default:
        return this.generateSyntheticRoute(origin, destination);
    }
  }

  // Generate a short route (under 1km)
  generateShortRoute(origin, destination) {
    const points = [];
    const segments = 8;
    
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      const lat = origin.lat + (destination.lat - origin.lat) * progress;
      const lng = origin.lng + (destination.lng - origin.lng) * progress;
      points.push({ lat, lng });
    }
    
    return points;
  }

  // Generate a medium route (1-5km)
  generateMediumRoute(origin, destination) {
    const points = [];
    const segments = 15;
    
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      let lat = origin.lat + (destination.lat - origin.lat) * progress;
      let lng = origin.lng + (destination.lng - origin.lng) * progress;
      
      // Add some curves for realism
      if (i > 0 && i < segments) {
        const curveAmount = Math.sin(progress * Math.PI * 3) * 0.0003;
        lat += curveAmount;
        lng += curveAmount * 0.5;
      }
      
      points.push({ lat, lng });
    }
    
    return points;
  }

  // Generate a long route (5km+)
  generateLongRoute(origin, destination) {
    const points = [];
    const segments = 25;
    
    for (let i = 0; i <= segments; i++) {
      const progress = i / segments;
      let lat = origin.lat + (destination.lat - origin.lat) * progress;
      let lng = origin.lng + (destination.lng - origin.lng) * progress;
      
      // Add more complex curves for longer routes
      if (i > 0 && i < segments) {
        const curve1 = Math.sin(progress * Math.PI * 4) * 0.0004;
        const curve2 = Math.cos(progress * Math.PI * 6) * 0.0002;
        lat += curve1;
        lng += curve2;
      }
      
      points.push({ lat, lng });
    }
    
    return points;
  }

  // Cache management
  getCachedRoute(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.route;
    }
    
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    
    return null;
  }

  cacheRoute(key, route) {
    // Remove oldest entries if cache is full
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    this.cache.set(key, {
      route: route,
      timestamp: Date.now()
    });
  }

  // Clear cache
  clearCache() {
    this.cache.clear();
    console.log('Route cache cleared');
  }

  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) * 
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate bearing between two points
  calculateBearing(lat1, lng1, lat2, lng2) {
    const dLng = this.toRadians(lng2 - lng1);
    const lat1Rad = this.toRadians(lat1);
    const lat2Rad = this.toRadians(lat2);
    
    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);
    
    const bearing = this.toDegrees(Math.atan2(y, x));
    return (bearing + 360) % 360; // Normalize to 0-360
  }

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Convert radians to degrees
  toDegrees(radians) {
    return radians * (180 / Math.PI);
  }

  // Utility sleep function
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Get cache statistics
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      expiryMs: this.cacheExpiry
    };
  }

  // Validate coordinates
  isValidCoordinate(lat, lng) {
    return (
      typeof lat === 'number' && 
      typeof lng === 'number' &&
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }

  // Estimate travel time based on distance
  estimateTravelTime(distance) {
    const averageSpeed = 30; // km/h average speed in city
    const timeHours = distance / 1000 / averageSpeed;
    return Math.ceil(timeHours * 60); // Return minutes
  }
}

export default DirectionsService;