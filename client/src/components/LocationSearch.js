import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TRIP_STATES } from '../shared/websocket-events.js';

function LocationSearch({
  google,
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
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);
  const geocoderRef = useRef(null);
  const debounceTimeoutRef = useRef(null);

  // Initialize Google Places services
  useEffect(() => {
    if (!google) return;

    try {
      autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
      geocoderRef.current = new google.maps.Geocoder();
      
      // Create a dummy map for PlacesService (required by Google API)
      const dummyMap = new google.maps.Map(document.createElement('div'));
      placesServiceRef.current = new google.maps.places.PlacesService(dummyMap);
      
      console.log('Google Places services initialized');
    } catch (error) {
      console.error('Failed to initialize Google Places services:', error);
    }
  }, [google]);

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

  // Reverse geocoding to get address from coordinates
  const reverseGeocode = useCallback((location, callback) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode(
      { location: location },
      (results, status) => {
        if (status === 'OK' && results[0]) {
          callback(results[0].formatted_address);
        } else {
          console.error('Reverse geocoding failed:', status);
          callback(`${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
        }
      }
    );
  }, []);

  // Debounced autocomplete search
  const searchPlaces = useCallback((query, isPickup) => {
    if (!autocompleteServiceRef.current || query.length < 2) {
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

    debounceTimeoutRef.current = setTimeout(() => {
      if (isPickup) {
        setIsLoadingPickup(true);
      } else {
        setIsLoadingDrop(true);
      }

      const request = {
        input: query,
        componentRestrictions: { country: 'in' }, // Restrict to India for this demo
        types: ['establishment', 'geocode']
      };

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (predictions, status) => {
          if (isPickup) {
            setIsLoadingPickup(false);
          } else {
            setIsLoadingDrop(false);
          }

          if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
            const suggestions = predictions.slice(0, 5).map(prediction => ({
              placeId: prediction.place_id,
              description: prediction.description,
              mainText: prediction.structured_formatting.main_text,
              secondaryText: prediction.structured_formatting.secondary_text
            }));

            if (isPickup) {
              setPickupSuggestions(suggestions);
              setShowPickupSuggestions(true);
            } else {
              setDropSuggestions(suggestions);
              setShowDropSuggestions(true);
            }
          } else {
            console.error('Autocomplete failed:', status);
            if (isPickup) {
              setPickupSuggestions([]);
              setShowPickupSuggestions(false);
            } else {
              setDropSuggestions([]);
              setShowDropSuggestions(false);
            }
          }
        }
      );
    }, 300); // 300ms debounce
  }, [google]);

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

  // Get place details from place ID
  const getPlaceDetails = useCallback((placeId, callback) => {
    if (!placesServiceRef.current) {
      console.error('Places service not initialized');
      return;
    }

    const request = {
      placeId: placeId,
      fields: ['geometry', 'formatted_address', 'name']
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && place.geometry) {
        const location = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng()
        };
        callback(location, place.formatted_address || place.name);
      } else {
        console.error('Place details request failed:', status);
      }
    });
  }, [google]);

  // Handle pickup suggestion selection
  const handlePickupSelect = useCallback((suggestion) => {
    setPickupValue(suggestion.description);
    setShowPickupSuggestions(false);
    setPickupSuggestions([]);

    getPlaceDetails(suggestion.placeId, (location, address) => {
      onPickupSelect(location);
      setPickupValue(address);
    });
  }, [getPlaceDetails, onPickupSelect]);

  // Handle drop suggestion selection
  const handleDropSelect = useCallback((suggestion) => {
    setDropValue(suggestion.description);
    setShowDropSuggestions(false);
    setDropSuggestions([]);

    getPlaceDetails(suggestion.placeId, (location, address) => {
      onDropSelect(location);
      setDropValue(address);
    });
  }, [getPlaceDetails, onDropSelect]);

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

  // Handle current location for pickup
  const handleCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by this browser.');
      return;
    }

    setIsLoadingPickup(true);
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
        console.error('Error getting current location:', error);
        setIsLoadingPickup(false);
        alert('Unable to get your current location. Please enter manually.');
      }
    );
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
      {/* Pickup Location Input */}
      <div className="search-group">
        <div className="search-input-container">
          <input
            ref={pickupInputRef}
            type="text"
            className="search-input"
            placeholder="Enter pickup location"
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
                key={suggestion.placeId}
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
                <div className="suggestion-main">{suggestion.mainText}</div>
                <div className="suggestion-secondary">{suggestion.secondaryText}</div>
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
            placeholder="Enter destination"
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
                key={suggestion.placeId}
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
                <div className="suggestion-main">{suggestion.mainText}</div>
                <div className="suggestion-secondary">{suggestion.secondaryText}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
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

export default LocationSearch;