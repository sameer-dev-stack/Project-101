import React, { useState } from 'react';
import { MapPin, Target } from 'lucide-react';

const LocationSearch = ({ 
  onPickupSelect, 
  onDropSelect, 
  pickupLocation, 
  dropLocation, 
  disabled 
}) => {
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');

  // Simplified location search (you can integrate with a real geocoding service)
  const searchLocations = (query) => {
    // Mock locations for demo
    const mockLocations = [
      { name: 'Times Square, New York', lat: 40.7580, lng: -73.9855 },
      { name: 'Central Park, New York', lat: 40.7829, lng: -73.9654 },
      { name: 'Brooklyn Bridge, New York', lat: 40.7061, lng: -73.9969 },
      { name: 'Empire State Building, New York', lat: 40.7484, lng: -73.9857 },
      { name: 'Statue of Liberty, New York', lat: 40.6892, lng: -74.0445 }
    ];

    return mockLocations.filter(location => 
      location.name.toLowerCase().includes(query.toLowerCase())
    );
  };

  const handlePickupSelect = (location) => {
    setPickupText(location.name);
    onPickupSelect({ lat: location.lat, lng: location.lng });
  };

  const handleDropSelect = (location) => {
    setDropText(location.name);
    onDropSelect({ lat: location.lat, lng: location.lng });
  };

  return (
    <div className="location-search">
      <div className="search-container">
        {/* Pickup Input */}
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <MapPin className="search-icon pickup" size={16} />
            <input
              type="text"
              placeholder="Pickup location"
              value={pickupText}
              onChange={(e) => setPickupText(e.target.value)}
              disabled={disabled}
              className="search-input"
            />
          </div>
        </div>

        {/* Drop Input */}
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <Target className="search-icon drop" size={16} />
            <input
              type="text"
              placeholder="Where to?"
              value={dropText}
              onChange={(e) => setDropText(e.target.value)}
              disabled={disabled}
              className="search-input"
            />
          </div>
        </div>

        {/* Quick location buttons */}
        <div className="quick-locations">
          <button 
            className="quick-location-btn"
            onClick={() => handlePickupSelect({ name: 'Times Square', lat: 40.7580, lng: -73.9855 })}
            disabled={disabled}
          >
            Times Square
          </button>
          <button 
            className="quick-location-btn"
            onClick={() => handleDropSelect({ name: 'Central Park', lat: 40.7829, lng: -73.9654 })}
            disabled={disabled}
          >
            Central Park
          </button>
          <button 
            className="quick-location-btn"
            onClick={() => handleDropSelect({ name: 'Brooklyn Bridge', lat: 40.7061, lng: -73.9969 })}
            disabled={disabled}
          >
            Brooklyn Bridge
          </button>
        </div>
      </div>

      {/* Selected locations display */}
      {(pickupLocation || dropLocation) && (
        <div className="selected-locations">
          {pickupLocation && (
            <div className="selected-location pickup">
              <MapPin size={14} />
              <span>Pickup: {pickupText || 'Selected location'}</span>
            </div>
          )}
          {dropLocation && (
            <div className="selected-location drop">
              <Target size={14} />
              <span>Drop: {dropText || 'Selected location'}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;