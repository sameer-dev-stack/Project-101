import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TRIP_STATES } from '../shared/websocket-events.js';
import LocationPermissionHelp from './LocationPermissionHelp';

const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN;

// Comprehensive Dhaka areas with accurate coordinates
const DHAKA_AREAS = [
  // Major Areas
  { name: 'Dhanmondi', lat: 23.7340, lng: 90.3864 },
  { name: 'Gulshan', lat: 23.7909, lng: 90.4043 },
  { name: 'Banani', lat: 23.7944, lng: 90.4077 },
  { name: 'Uttara', lat: 23.8732, lng: 90.3938 },
  { name: 'Mirpur', lat: 23.8206, lng: 90.3742 },
  { name: 'Mohammadpur', lat: 23.7563, lng: 90.3782 },
  { name: 'Tejgaon', lat: 23.7752, lng: 90.3647 },
  { name: 'Wari', lat: 23.7272, lng: 90.4108 },
  { name: 'Motijheel', lat: 23.7335, lng: 90.4172 },
  { name: 'Old Dhaka', lat: 23.7279, lng: 90.4117 },
  { name: 'Ramna', lat: 23.7598, lng: 90.3782 },
  { name: 'Cantonment', lat: 23.7813, lng: 90.3912 },
  { name: 'Baridhara', lat: 23.7944, lng: 90.3886 },
  { name: 'Bashundhara', lat: 23.8067, lng: 90.4156 },
  
  // Dhanmondi Sub-areas
  { name: 'Dhanmondi 32', lat: 23.7449, lng: 90.3753 },
  { name: 'Dhanmondi 27', lat: 23.7286, lng: 90.3851 },
  { name: 'Dhanmondi 15', lat: 23.7395, lng: 90.3912 },
  { name: 'Dhanmondi 8', lat: 23.7313, lng: 90.3745 },
  { name: 'Dhanmondi 2', lat: 23.7298, lng: 90.3823 },
  { name: 'Dhanmondi 4', lat: 23.7356, lng: 90.3834 },
  { name: 'Dhanmondi 6', lat: 23.7387, lng: 90.3798 },
  { name: 'Dhanmondi 9', lat: 23.7423, lng: 90.3812 },
  { name: 'Dhanmondi 12', lat: 23.7445, lng: 90.3867 },
  { name: 'Dhanmondi 14', lat: 23.7412, lng: 90.3889 },
  
  // Gulshan & Banani Sub-areas
  { name: 'Gulshan 1', lat: 23.7909, lng: 90.4043 },
  { name: 'Gulshan 2', lat: 23.7925, lng: 90.4077 },
  { name: 'Gulshan Circle', lat: 23.7853, lng: 90.4159 },
  { name: 'Banani DOHS', lat: 23.8066, lng: 90.3991 },
  { name: 'Baridhara DOHS', lat: 23.8066, lng: 90.3991 },
  
  // Uttara Sectors
  { name: 'Uttara Sector 3', lat: 23.8732, lng: 90.3938 },
  { name: 'Uttara Sector 4', lat: 23.8775, lng: 90.4023 },
  { name: 'Uttara Sector 7', lat: 23.8838, lng: 90.3967 },
  { name: 'Uttara Sector 10', lat: 23.8659, lng: 90.3889 },
  { name: 'Uttara Sector 12', lat: 23.8551, lng: 90.3901 },
  { name: 'Uttara Sector 13', lat: 23.8634, lng: 90.3967 },
  { name: 'Uttara Sector 14', lat: 23.8712, lng: 90.3823 },
  { name: 'Uttara Sector 15', lat: 23.8798, lng: 90.3845 },
  
  // Mirpur Areas
  { name: 'Mirpur 1', lat: 23.8206, lng: 90.3742 },
  { name: 'Mirpur 2', lat: 23.8290, lng: 90.3665 },
  { name: 'Mirpur 6', lat: 23.8068, lng: 90.3689 },
  { name: 'Mirpur 10', lat: 23.8158, lng: 90.3554 },
  { name: 'Mirpur 11', lat: 23.8342, lng: 90.3789 },
  { name: 'Mirpur 12', lat: 23.8124, lng: 90.3612 },
  { name: 'Mirpur 13', lat: 23.8267, lng: 90.3634 },
  { name: 'Mirpur 14', lat: 23.8389, lng: 90.3723 },
  { name: 'Mirpur DOHS', lat: 23.8234, lng: 90.3678 },
  { name: 'Pallabi', lat: 23.8298, lng: 90.3598 },
  
  // Commercial Areas
  { name: 'New Market', lat: 23.7412, lng: 90.3945 },
  { name: 'Elephant Road', lat: 23.7734, lng: 90.3867 },
  { name: 'Green Road', lat: 23.7525, lng: 90.3845 },
  { name: 'Panthapath', lat: 23.7567, lng: 90.3723 },
  { name: 'Farmgate', lat: 23.7834, lng: 90.3598 },
  { name: 'Kawran Bazar', lat: 23.7756, lng: 90.3513 },
  { name: 'Karwan Bazar', lat: 23.7698, lng: 90.3889 },
  { name: 'Malibagh', lat: 23.7408, lng: 90.4167 },
  { name: 'Rampura', lat: 23.7456, lng: 90.4289 },
  { name: 'Badda', lat: 23.7734, lng: 90.4234 },
  
  // University Areas
  { name: 'Dhaka University', lat: 23.7285, lng: 90.3914 },
  { name: 'BUET', lat: 23.7263, lng: 90.3925 },
  { name: 'Jahangirnagar University Area', lat: 23.7612, lng: 90.3711 },
  { name: 'Nilkhet', lat: 23.7298, lng: 90.3967 },
  { name: 'Shahbagh', lat: 23.7389, lng: 90.3945 },
  { name: 'TSC', lat: 23.7312, lng: 90.3934 },
  { name: 'Curzon Hall', lat: 23.7298, lng: 90.3889 },
  
  // Residential Areas
  { name: 'Lalmatia', lat: 23.7447, lng: 90.3723 },
  { name: 'Kalabagan', lat: 23.7644, lng: 90.3896 },
  { name: 'Azimpur', lat: 23.7341, lng: 90.3820 },
  { name: 'Lalbagh', lat: 23.7156, lng: 90.3889 },
  { name: 'Chawk Bazaar', lat: 23.7196, lng: 90.4076 },
  { name: 'Sadarghat', lat: 23.7104, lng: 90.4074 },
  { name: 'Gendaria', lat: 23.7345, lng: 90.4203 },
  { name: 'Shantinagar', lat: 23.7189, lng: 90.4156 },
  { name: 'Hatirjheel', lat: 23.7623, lng: 90.4234 },
  { name: 'Mugda', lat: 23.7556, lng: 90.4289 },
  { name: 'Khilgaon', lat: 23.7489, lng: 90.4134 },
  { name: 'Jatrabari', lat: 23.7689, lng: 90.4356 },
  
  // Industrial Areas
  { name: 'Tejgaon Industrial', lat: 23.7689, lng: 90.3745 },
  { name: 'Savar Road', lat: 23.7834, lng: 90.3289 },
  { name: 'Gazipur Road', lat: 23.8234, lng: 90.4123 },
  { name: 'Tongi', lat: 23.8967, lng: 90.4023 },
  { name: 'Ashulia', lat: 23.8134, lng: 90.3345 },
  { name: 'Dhamrai', lat: 23.7556, lng: 90.3456 },
  { name: 'Keraniganj', lat: 23.7023, lng: 90.3945 },
  { name: 'Hazaribagh', lat: 23.7134, lng: 90.3789 },
  
  // Airport & Northern Areas
  { name: 'Airport Area', lat: 23.8952, lng: 90.4023 },
  { name: 'Dakshinkhan', lat: 23.8956, lng: 90.4023 },
  { name: 'Uttarkhan', lat: 23.8745, lng: 90.4156 },
  { name: 'Turag', lat: 23.8867, lng: 90.3745 },
  { name: 'Abdullahpur', lat: 23.8834, lng: 90.3956 },
  
  // Eastern Areas
  { name: 'Sayedabad', lat: 23.7812, lng: 90.4423 },
  { name: 'Demra', lat: 23.7623, lng: 90.4467 },
  { name: 'Matuail', lat: 23.7445, lng: 90.4412 },
  { name: 'Signboard', lat: 23.7567, lng: 90.4334 },
  { name: 'Rayerbazar', lat: 23.7489, lng: 90.3634 },
  
  // Southern Areas
  { name: 'Dakshin Khan', lat: 23.6945, lng: 90.3867 },
  { name: 'Postogola', lat: 23.7234, lng: 90.4234 },
  { name: 'Gandaria', lat: 23.7123, lng: 90.4089 },
  { name: 'Kamrangirchar', lat: 23.7067, lng: 90.3945 },
  
  // Important Landmarks
  { name: 'Shahjalal International Airport', lat: 23.8952, lng: 90.4023 },
  { name: 'Hazrat Shahjalal International Airport', lat: 23.8952, lng: 90.4023 },
  { name: 'Dhaka Medical College', lat: 23.7267, lng: 90.3889 },
  { name: 'Birdem', lat: 23.7445, lng: 90.3912 },
  { name: 'Square Hospital', lat: 23.7512, lng: 90.3834 },
  { name: 'Apollo Hospital', lat: 23.8089, lng: 90.4178 },
  { name: 'Bangabandhu Stadium', lat: 23.7423, lng: 90.3789 },
  { name: 'Sher-e-Bangla Stadium', lat: 23.7634, lng: 90.3656 },
  { name: 'Liberation War Museum', lat: 23.7389, lng: 90.3798 },
  { name: 'National Museum', lat: 23.7389, lng: 90.3823 },
  { name: 'Lalbagh Fort', lat: 23.7234, lng: 90.3867 },
  { name: 'Ahsan Manzil', lat: 23.7089, lng: 90.4067 },
  { name: 'Baitul Mukarram', lat: 23.7267, lng: 90.4156 },
  { name: 'Star Mosque', lat: 23.7123, lng: 90.4089 },
  { name: 'Dhakeshwari Temple', lat: 23.7234, lng: 90.3945 },
  { name: 'Armenian Church', lat: 23.7089, lng: 90.4123 }
];

console.log('MapboxLocationSearch - Token check:', {
  token: MAPBOX_ACCESS_TOKEN ? 'Available' : 'Missing',
  length: MAPBOX_ACCESS_TOKEN?.length
});

function MapboxLocationSearch({
  onPickupSelect,
  onDropSelect,
  pickupLocation,
  dropLocation,
  disabled = false
}) {
  const [pickupValue, setPickupValue] = useState('');
  const [dropValue, setDropValue] = useState('');
  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false);
  const [showDropSuggestions, setShowDropSuggestions] = useState(false);
  const [isLoadingPickup, setIsLoadingPickup] = useState(false);
  const [isLoadingDrop, setIsLoadingDrop] = useState(false);

  const pickupInputRef = useRef(null);
  const dropInputRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Update input values when locations change externally
  useEffect(() => {
    if (pickupLocation && !pickupValue) {
      reverseGeocode(pickupLocation, (address) => {
        setPickupValue(address);
      });
    }
  }, [pickupLocation, pickupValue]);

  useEffect(() => {
    if (dropLocation && !dropValue) {
      reverseGeocode(dropLocation, (address) => {
        setDropValue(address);
      });
    }
  }, [dropLocation, dropValue]);

  // Reverse geocoding using Mapbox API
  const reverseGeocode = useCallback(async (location, callback) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${location.lng},${location.lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=1`
      );
      const data = await response.json();
      
      if (data.features && data.features.length > 0) {
        callback(data.features[0].place_name);
      } else {
        callback(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      callback(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
    }
  }, []);

  // Forward geocoding using Mapbox API with local area suggestions
  const searchPlaces = useCallback(async (query, isPickup) => {
    if (!MAPBOX_ACCESS_TOKEN || query.length < 1) {
      if (isPickup) {
        setPickupSuggestions([]);
        setShowPickupSuggestions(false);
      } else {
        setDropSuggestions([]);
        setShowDropSuggestions(false);
      }
      return;
    }

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(async () => {
      if (isPickup) {
        setIsLoadingPickup(true);
      } else {
        setIsLoadingDrop(true);
      }

      try {
        // First, get local area suggestions
        const localSuggestions = DHAKA_AREAS
          .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 4)
          .map(area => ({
            id: `local_${area.name}`,
            place_name: `${area.name}, Dhaka, Bangladesh`,
            text: area.name,
            context: [{ text: 'Dhaka, Bangladesh' }],
            center: [area.lng, area.lat], // Use actual coordinates
            geometry: { type: 'Point', coordinates: [area.lng, area.lat] },
            isLocal: true
          }));

        // Then get Mapbox suggestions
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&limit=6&country=BD&types=place,postcode,locality,neighborhood,address,poi&proximity=90.4125,23.8103&bbox=90.2,23.6,90.6,23.9`
        );
        const data = await response.json();

        let mapboxSuggestions = [];
        if (data.features && data.features.length > 0) {
          mapboxSuggestions = data.features.map(feature => ({
            id: feature.id,
            place_name: feature.place_name,
            text: feature.text,
            context: feature.context,
            center: feature.center,
            geometry: feature.geometry,
            isLocal: false
          }));
        }

        // Combine suggestions (local first, then Mapbox)
        const allSuggestions = [...localSuggestions, ...mapboxSuggestions]
          .filter((suggestion, index, self) => 
            index === self.findIndex(s => s.text.toLowerCase() === suggestion.text.toLowerCase())
          )
          .slice(0, 8);

        if (isPickup) {
          setPickupSuggestions(allSuggestions);
          setShowPickupSuggestions(allSuggestions.length > 0);
        } else {
          setDropSuggestions(allSuggestions);
          setShowDropSuggestions(allSuggestions.length > 0);
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
        
        // Fallback to local suggestions only
        const localSuggestions = DHAKA_AREAS
          .filter(area => area.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5)
          .map(area => ({
            id: `local_${area.name}`,
            place_name: `${area.name}, Dhaka, Bangladesh`,
            text: area.name,
            context: [{ text: 'Dhaka, Bangladesh' }],
            center: [area.lng, area.lat],
            geometry: { type: 'Point', coordinates: [area.lng, area.lat] },
            isLocal: true
          }));

        if (isPickup) {
          setPickupSuggestions(localSuggestions);
          setShowPickupSuggestions(localSuggestions.length > 0);
        } else {
          setDropSuggestions(localSuggestions);
          setShowDropSuggestions(localSuggestions.length > 0);
        }
      } finally {
        if (isPickup) {
          setIsLoadingPickup(false);
        } else {
          setIsLoadingDrop(false);
        }
      }
    }, 200); // Reduced debounce for faster response
  }, []);

  // Handle pickup input change
  const handlePickupChange = useCallback((e) => {
    const value = e.target.value;
    setPickupValue(value);
    searchPlaces(value, true);
  }, [searchPlaces]);

  // Handle drop input change
  const handleDropChange = useCallback((e) => {
    const value = e.target.value;
    setDropValue(value);
    searchPlaces(value, false);
  }, [searchPlaces]);

  // Handle pickup suggestion selection
  const handlePickupSelect = useCallback((suggestion) => {
    setPickupValue(suggestion.place_name);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);

    const location = {
      lat: suggestion.center[1],
      lng: suggestion.center[0]
    };

    onPickupSelect(location);
  }, [onPickupSelect]);

  // Handle drop suggestion selection
  const handleDropSelect = useCallback((suggestion) => {
    setDropValue(suggestion.place_name);
    setShowDropSuggestions(false);
    setDropSuggestions([]);

    const location = {
      lat: suggestion.center[1],
      lng: suggestion.center[0]
    };

    onDropSelect(location);
  }, [onDropSelect]);

  // Handle input focus
  const handlePickupFocus = useCallback(() => {
    if (pickupSuggestions.length > 0) {
      setShowPickupSuggestions(true);
    }
  }, [pickupSuggestions]);

  const handleDropFocus = useCallback(() => {
    if (dropSuggestions.length > 0) {
      setShowDropSuggestions(true);
    }
  }, [dropSuggestions]);

  // Handle input blur (with delay to allow click on suggestions)
  const handlePickupBlur = useCallback(() => {
    setTimeout(() => setShowPickupSuggestions(false), 200);
  }, []);

  const handleDropBlur = useCallback(() => {
    setTimeout(() => setShowDropSuggestions(false), 200);
  }, []);

  // Handle current location for pickup with improved error handling
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    // Check if we're on HTTPS or localhost
    const isSecureContext = window.isSecureContext || window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    
    if (!isSecureContext) {
      alert('Location services require HTTPS or localhost. Please enter your location manually.');
      return;
    }

    setIsLoadingPickup(true);
    
    // Try with multiple options
    const getCurrentLocationWithRetry = (attempt = 1) => {
      const options = {
        enableHighAccuracy: attempt === 1,
        timeout: attempt === 1 ? 10000 : 20000,
        maximumAge: attempt === 1 ? 30000 : 120000
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          
          onPickupSelect(location);
          reverseGeocode(location, (address) => {
            setPickupValue(address);
            setIsLoadingPickup(false);
          });
        },
        (error) => {
          console.error(`Location error (attempt ${attempt}):`, error);
          
          let errorMessage = 'Could not get your location. ';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += 'Please allow location access in your browser settings.';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += 'Location information is unavailable.';
              break;
            case error.TIMEOUT:
              errorMessage += 'Location request timed out.';
              break;
            default:
              errorMessage += 'Unknown error occurred.';
              break;
          }
          
          // Retry once with different settings
          if (attempt === 1) {
            console.log('Retrying location request...');
            setTimeout(() => getCurrentLocationWithRetry(2), 1000);
          } else {
            setIsLoadingPickup(false);
            alert(errorMessage + ' Please enter your location manually.');
          }
        },
        options
      );
    };

    getCurrentLocationWithRetry();
  }, [onPickupSelect, reverseGeocode]);

  // Clear inputs
  const clearPickup = useCallback(() => {
    setPickupValue('');
    setPickupSuggestions([]);
    setShowPickupSuggestions(false);
    onPickupSelect(null);
  }, [onPickupSelect]);

  const clearDrop = useCallback(() => {
    setDropValue('');
    setDropSuggestions([]);
    setShowDropSuggestions(false);
    onDropSelect(null);
  }, [onDropSelect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="location-search">
      {/* Instructions */}
      {!disabled && (
        <div className="search-instructions">
          <p>
            <strong>🚗 Book Your Ride:</strong> Use the green/red buttons on the map, search below, or click anywhere on the map
          </p>
        </div>
      )}
      
      {/* Pickup Location Input */}
      <div className="search-group">
        <div className="search-input-container">
          <input
            ref={pickupInputRef}
            type="text"
            className="search-input"
            placeholder="📍 Enter pickup location or click on map"
            value={pickupValue}
            onChange={handlePickupChange}
            onFocus={handlePickupFocus}
            onBlur={handlePickupBlur}
            disabled={disabled}
            aria-label="Pickup location"
          />
          
          <div className="input-actions">
            {isLoadingPickup && <div className="loading-spinner"></div>}
            
            {!disabled && (
              <>
                <button
                  type="button"
                  className="btn-icon current-location"
                  onClick={handleCurrentLocation}
                  title="Use current location"
                  aria-label="Use current location"
                >
                  📍
                </button>
                
                <LocationPermissionHelp />
                
                {pickupValue && (
                  <button
                    type="button"
                    className="btn-icon clear-input"
                    onClick={clearPickup}
                    title="Clear pickup location"
                    aria-label="Clear pickup location"
                  >
                    ✕
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* Pickup Suggestions Dropdown */}
        {showPickupSuggestions && pickupSuggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {pickupSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="autocomplete-item"
                onClick={() => handlePickupSelect(suggestion)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePickupSelect(suggestion);
                  }
                }}
              >
                <div className="suggestion-main">{suggestion.text}</div>
                <div className="suggestion-secondary">{suggestion.place_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Drop Location Input */}
      <div className="search-group" style={{ marginTop: '12px' }}>
        <div className="search-input-container">
          <input
            ref={dropInputRef}
            type="text"
            className="search-input"
            placeholder="🎯 Enter destination or click on map"
            value={dropValue}
            onChange={handleDropChange}
            onFocus={handleDropFocus}
            onBlur={handleDropBlur}
            disabled={disabled}
            aria-label="Destination"
          />
          
          <div className="input-actions">
            {isLoadingDrop && <div className="loading-spinner"></div>}
            
            {!disabled && dropValue && (
              <button
                type="button"
                className="btn-icon clear-input"
                onClick={clearDrop}
                title="Clear destination"
                aria-label="Clear destination"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Drop Suggestions Dropdown */}
        {showDropSuggestions && dropSuggestions.length > 0 && (
          <div className="autocomplete-dropdown">
            {dropSuggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="autocomplete-item"
                onClick={() => handleDropSelect(suggestion)}
                role="button"
                tabIndex={0}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleDropSelect(suggestion);
                  }
                }}
              >
                <div className="suggestion-main">{suggestion.text}</div>
                <div className="suggestion-secondary">{suggestion.place_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .search-instructions {
          margin-bottom: 16px;
          padding: 12px 16px;
          background: linear-gradient(135deg, #e8f4fd 0%, #f0f8ff 100%);
          border-radius: 8px;
          border-left: 4px solid #4285F4;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
        }
        
        .search-instructions p {
          margin: 0;
          font-size: 13px;
          color: #1a73e8;
          line-height: 1.4;
          font-weight: 500;
        }
        
        .search-group {
          position: relative;
        }

        .search-input-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-actions {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .btn-icon {
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          transition: background-color 0.2s;
        }

        .btn-icon:hover {
          background-color: #f0f0f0;
        }

        .suggestion-main {
          font-weight: 500;
          color: #333;
        }

        .suggestion-secondary {
          font-size: 12px;
          color: #666;
          margin-top: 2px;
        }

        .search-input:disabled {
          background-color: #f5f5f5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}

export default MapboxLocationSearch;