// Cab simulation service for realistic nearby cab behavior
class CabSimulator {
  constructor() {
    this.cabs = [];
    this.lastUpdateTime = Date.now();
    this.initializeCabs();
    
    // Update cab positions periodically
    setInterval(() => {
      this.updateCabPositions();
    }, 3000); // Update every 3 seconds
  }

  // Initialize nearby cabs with realistic positions
  initializeCabs() {
    // Comprehensive Dhaka, Bangladesh locations covering all major areas
    const baseLocations = [
      // Central Dhaka
      { lat: 23.8103, lng: 90.4125, area: 'Dhaka City Center' },
      { lat: 23.7279, lng: 90.4117, area: 'Old Dhaka' },
      { lat: 23.7104, lng: 90.4074, area: 'Sadarghat' },
      { lat: 23.7196, lng: 90.4076, area: 'Chawk Bazaar' },
      { lat: 23.7341, lng: 90.3820, area: 'Azimpur' },
      
      // Dhanmondi & Nearby
      { lat: 23.7340, lng: 90.3864, area: 'Dhanmondi' },
      { lat: 23.7449, lng: 90.3753, area: 'Dhanmondi 32' },
      { lat: 23.7286, lng: 90.3851, area: 'Dhanmondi 27' },
      { lat: 23.7395, lng: 90.3912, area: 'Dhanmondi 15' },
      { lat: 23.7313, lng: 90.3745, area: 'Dhanmondi 8' },
      
      // Gulshan & Banani
      { lat: 23.7909, lng: 90.4043, area: 'Gulshan 1' },
      { lat: 23.7925, lng: 90.4077, area: 'Gulshan 2' },
      { lat: 23.7853, lng: 90.4159, area: 'Gulshan Circle' },
      { lat: 23.8481, lng: 90.3977, area: 'Banani' },
      { lat: 23.7944, lng: 90.3886, area: 'Baridhara' },
      { lat: 23.8066, lng: 90.3991, area: 'Baridhara DOHS' },
      
      // Uttara & Northern Areas
      { lat: 23.8732, lng: 90.3938, area: 'Uttara Sector 3' },
      { lat: 23.8838, lng: 90.3967, area: 'Uttara Sector 7' },
      { lat: 23.8659, lng: 90.3889, area: 'Uttara Sector 10' },
      { lat: 23.8551, lng: 90.3901, area: 'Uttara Sector 12' },
      { lat: 23.8775, lng: 90.4023, area: 'Uttara Sector 4' },
      { lat: 23.8952, lng: 90.3856, area: 'Airport Area' },
      
      // Mirpur & Western Areas
      { lat: 23.8206, lng: 90.3742, area: 'Mirpur 1' },
      { lat: 23.8290, lng: 90.3665, area: 'Mirpur 2' },
      { lat: 23.8158, lng: 90.3554, area: 'Mirpur 10' },
      { lat: 23.8068, lng: 90.3689, area: 'Mirpur 6' },
      { lat: 23.8342, lng: 90.3789, area: 'Mirpur 11' },
      { lat: 23.8124, lng: 90.3612, area: 'Mirpur 12' },
      
      // Mohammadpur & Surrounding
      { lat: 23.7563, lng: 90.3782, area: 'Mohammadpur' },
      { lat: 23.7608, lng: 90.3689, area: 'Mohammadpur Housing' },
      { lat: 23.7447, lng: 90.3723, area: 'Lalmatia' },
      { lat: 23.7644, lng: 90.3896, area: 'Kalabagan' },
      { lat: 23.7525, lng: 90.3845, area: 'Green Road' },
      
      // Tejgaon & Industrial Area
      { lat: 23.7752, lng: 90.3647, area: 'Tejgaon' },
      { lat: 23.7689, lng: 90.3745, area: 'Tejgaon Industrial' },
      { lat: 23.7834, lng: 90.3598, area: 'Farmgate' },
      { lat: 23.7756, lng: 90.3513, area: 'Kawran Bazar' },
      { lat: 23.7698, lng: 90.3889, area: 'Karwan Bazar' },
      
      // Wari & Eastern Areas
      { lat: 23.7272, lng: 90.4108, area: 'Wari' },
      { lat: 23.7345, lng: 90.4203, area: 'Gendaria' },
      { lat: 23.7189, lng: 90.4156, area: 'Shantinagar' },
      { lat: 23.7408, lng: 90.4167, area: 'Malibagh' },
      { lat: 23.7456, lng: 90.4289, area: 'Rampura' },
      { lat: 23.7623, lng: 90.4234, area: 'Hatirjheel' },
      
      // Motijheel & Commercial Area
      { lat: 23.7335, lng: 90.4172, area: 'Motijheel' },
      { lat: 23.7298, lng: 90.4143, area: 'Dilkusha' },
      { lat: 23.7367, lng: 90.4089, area: 'Paltan' },
      { lat: 23.7254, lng: 90.4089, area: 'Bijoynagar' },
      
      // Ramna & Cantonment
      { lat: 23.7598, lng: 90.3782, area: 'Ramna' },
      { lat: 23.7813, lng: 90.3912, area: 'Cantonment' },
      { lat: 23.7734, lng: 90.3867, area: 'Elephant Road' },
      { lat: 23.7889, lng: 90.3756, area: 'Sher-e-Bangla Nagar' },
      
      // Dhanmondi Extended Areas
      { lat: 23.7412, lng: 90.3945, area: 'New Market' },
      { lat: 23.7298, lng: 90.3967, area: 'Nilkhet' },
      { lat: 23.7267, lng: 90.3945, area: 'Chankharpul' },
      { lat: 23.7156, lng: 90.3889, area: 'Lalbagh' },
      
      // University Areas
      { lat: 23.7285, lng: 90.3914, area: 'Dhaka University' },
      { lat: 23.7612, lng: 90.3711, area: 'Jahangirnagar University Area' },
      { lat: 23.8134, lng: 90.4267, area: 'BUET Area' },
      
      // Residential Areas
      { lat: 23.7823, lng: 90.4089, area: 'Bashundhara' },
      { lat: 23.8067, lng: 90.4156, area: 'Bashundhara R/A' },
      { lat: 23.7734, lng: 90.4234, area: 'Badda' },
      { lat: 23.7556, lng: 90.4289, area: 'Mugda' },
      { lat: 23.7489, lng: 90.4134, area: 'Khilgaon' },
      
      // Southern Areas
      { lat: 23.7023, lng: 90.3945, area: 'Keraniganj' },
      { lat: 23.6945, lng: 90.3867, area: 'Dakshin Khan' },
      { lat: 23.7134, lng: 90.3789, area: 'Hazaribagh' },
      
      // Northern Extended Areas
      { lat: 23.8956, lng: 90.4023, area: 'Dakshinkhan' },
      { lat: 23.8867, lng: 90.3745, area: 'Turag' },
      { lat: 23.8745, lng: 90.4156, area: 'Uttarkhan' },
      
      // Eastern Extended Areas
      { lat: 23.7689, lng: 90.4356, area: 'Jatrabari' },
      { lat: 23.7812, lng: 90.4423, area: 'Sayedabad' },
      { lat: 23.7623, lng: 90.4467, area: 'Demra' },
      
      // Western Extended Areas
      { lat: 23.7834, lng: 90.3289, area: 'Savar Road' },
      { lat: 23.7556, lng: 90.3456, area: 'Dhamrai Road' },
      { lat: 23.8134, lng: 90.3345, area: 'Ashulia Area' }
    ];

    this.cabs = baseLocations.map((location, index) => ({
      id: `cab_${index + 1}`,
      lat: location.lat + (Math.random() - 0.5) * 0.01, // Add some randomness (smaller range)
      lng: location.lng + (Math.random() - 0.5) * 0.01,
      heading: Math.random() * 360, // Random initial heading
      speed: 0.5 + Math.random() * 1.5, // Speed in km/h
      isAvailable: Math.random() > 0.2, // 80% availability
      lastUpdate: Date.now(),
      movementPattern: this.getRandomMovementPattern(),
      area: location.area // Include area information
    }));

    console.log(`Initialized ${this.cabs.length} cabs for simulation`);
  }

  // Get random movement pattern for realistic cab behavior
  getRandomMovementPattern() {
    const patterns = ['stationary', 'circular', 'linear', 'random'];
    return patterns[Math.floor(Math.random() * patterns.length)];
  }

  // Update cab positions based on their movement patterns
  updateCabPositions() {
    const currentTime = Date.now();
    const deltaTime = (currentTime - this.lastUpdateTime) / 1000; // seconds
    
    this.cabs.forEach(cab => {
      if (!cab.isAvailable) {
        // Randomly make unavailable cabs available again
        if (Math.random() < 0.1) { // 10% chance per update
          cab.isAvailable = true;
        }
        return;
      }

      // Update position based on movement pattern
      switch (cab.movementPattern) {
        case 'stationary':
          // Small random jitter to simulate parked/waiting cabs
          cab.lat += (Math.random() - 0.5) * 0.0001;
          cab.lng += (Math.random() - 0.5) * 0.0001;
          break;

        case 'circular':
          // Circular movement pattern
          cab.heading += 2; // 2 degrees per update
          if (cab.heading >= 360) cab.heading -= 360;
          
          const circularSpeed = cab.speed * deltaTime / 111320; // Convert to degrees
          cab.lat += Math.cos(cab.heading * Math.PI / 180) * circularSpeed;
          cab.lng += Math.sin(cab.heading * Math.PI / 180) * circularSpeed;
          break;

        case 'linear':
          // Linear movement in current heading
          const linearSpeed = cab.speed * deltaTime / 111320; // Convert to degrees
          cab.lat += Math.cos(cab.heading * Math.PI / 180) * linearSpeed;
          cab.lng += Math.sin(cab.heading * Math.PI / 180) * linearSpeed;
          
          // Randomly change direction occasionally
          if (Math.random() < 0.05) { // 5% chance per update
            cab.heading += (Math.random() - 0.5) * 90; // Turn up to 45 degrees
            if (cab.heading < 0) cab.heading += 360;
            if (cab.heading >= 360) cab.heading -= 360;
          }
          break;

        case 'random':
          // Random walk pattern
          cab.heading += (Math.random() - 0.5) * 30; // Random turn up to 15 degrees
          if (cab.heading < 0) cab.heading += 360;
          if (cab.heading >= 360) cab.heading -= 360;
          
          const randomSpeed = cab.speed * deltaTime / 111320;
          cab.lat += Math.cos(cab.heading * Math.PI / 180) * randomSpeed;
          cab.lng += Math.sin(cab.heading * Math.PI / 180) * randomSpeed;
          break;
      }

      // Ensure cabs stay within reasonable bounds (Dhaka area)
      cab.lat = Math.max(23.6, Math.min(23.9, cab.lat));
      cab.lng = Math.max(90.2, Math.min(90.6, cab.lng));

      cab.lastUpdate = currentTime;
    });

    this.lastUpdateTime = currentTime;
  }

  // Get nearby cabs within specified radius
  getNearbyCabs(userLat, userLng, radiusMeters = 2000) {
    const nearbyCabs = this.cabs
      .filter(cab => cab.isAvailable)
      .map(cab => {
        const distance = this.calculateDistance(userLat, userLng, cab.lat, cab.lng);
        return {
          ...cab,
          distance: distance
        };
      })
      .filter(cab => cab.distance <= radiusMeters)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 8) // Limit to 8 nearby cabs
      .map(cab => ({
        lat: cab.lat,
        lng: cab.lng,
        id: cab.id,
        heading: cab.heading
      }));

    console.log(`Found ${nearbyCabs.length} nearby cabs within ${radiusMeters}m`);
    return nearbyCabs;
  }

  // Find the nearest available cab
  findNearestCab(userLat, userLng) {
    const availableCabs = this.cabs.filter(cab => cab.isAvailable);
    
    if (availableCabs.length === 0) {
      return null;
    }

    let nearestCab = null;
    let minDistance = Infinity;

    availableCabs.forEach(cab => {
      const distance = this.calculateDistance(userLat, userLng, cab.lat, cab.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearestCab = cab;
      }
    });

    if (nearestCab) {
      // Mark cab as unavailable (assigned to trip)
      nearestCab.isAvailable = false;
      
      console.log(`Assigned cab ${nearestCab.id} at distance ${minDistance.toFixed(0)}m`);
      
      return {
        lat: nearestCab.lat,
        lng: nearestCab.lng,
        id: nearestCab.id,
        heading: nearestCab.heading
      };
    }

    return null;
  }

  // Add a new cab at specific location (for testing)
  addCab(lat, lng, options = {}) {
    const newCab = {
      id: `cab_${this.cabs.length + 1}`,
      lat: lat,
      lng: lng,
      heading: options.heading || Math.random() * 360,
      speed: options.speed || 0.5 + Math.random() * 1.5,
      isAvailable: options.isAvailable !== undefined ? options.isAvailable : true,
      lastUpdate: Date.now(),
      movementPattern: options.movementPattern || this.getRandomMovementPattern()
    };

    this.cabs.push(newCab);
    console.log(`Added new cab ${newCab.id} at (${lat}, ${lng})`);
    return newCab.id;
  }

  // Remove a cab (for testing)
  removeCab(cabId) {
    const index = this.cabs.findIndex(cab => cab.id === cabId);
    if (index !== -1) {
      this.cabs.splice(index, 1);
      console.log(`Removed cab ${cabId}`);
      return true;
    }
    return false;
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

  // Convert degrees to radians
  toRadians(degrees) {
    return degrees * (Math.PI / 180);
  }

  // Get all cabs status (for debugging)
  getCabsStatus() {
    return {
      total: this.cabs.length,
      available: this.cabs.filter(cab => cab.isAvailable).length,
      unavailable: this.cabs.filter(cab => !cab.isAvailable).length,
      lastUpdate: new Date(this.lastUpdateTime).toISOString()
    };
  }

  // Reset all cabs to available (for testing)
  resetCabs() {
    this.cabs.forEach(cab => {
      cab.isAvailable = true;
    });
    console.log('Reset all cabs to available status');
  }
}

export default CabSimulator;