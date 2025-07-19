import React, { useState } from 'react';
import { MapPin, Target, Clock } from 'lucide-react';

const DhakaLocationSearch = ({ 
  onPickupSelect, 
  onDropSelect, 
  pickupLocation, 
  dropLocation, 
  disabled 
}) => {
  const [pickupText, setPickupText] = useState('');
  const [dropText, setDropText] = useState('');

  // Popular locations in Dhaka
  const dhakaLocations = {
    popular: [
      { name: 'Shahbagh', lat: 23.7387, lng: 90.3950, emoji: '🌸' },
      { name: 'Dhanmondi', lat: 23.7461, lng: 90.3742, emoji: '🏢' },
      { name: 'Gulshan', lat: 23.7925, lng: 90.4078, emoji: '💼' },
      { name: 'Banani', lat: 23.7937, lng: 90.4037, emoji: '🏙️' },
      { name: 'Uttara', lat: 23.8759, lng: 90.3795, emoji: '🏘️' },
      { name: 'Old Dhaka', lat: 23.7104, lng: 90.4074, emoji: '🏛️' }
    ],
    transport: [
      { name: 'Hazrat Shahjalal Airport', lat: 23.8433, lng: 90.3978, emoji: '✈️' },
      { name: 'Kamalapur Railway', lat: 23.7322, lng: 90.4221, emoji: '🚂' },
      { name: 'Sadarghat Launch Terminal', lat: 23.7043, lng: 90.4198, emoji: '🚢' }
    ],
    shopping: [
      { name: 'New Market', lat: 23.7257, lng: 90.3854, emoji: '🛍️' },
      { name: 'Bashundhara City', lat: 23.7501, lng: 90.3885, emoji: '🏬' },
      { name: 'Jamuna Future Park', lat: 23.8429, lng: 90.3742, emoji: '🛒' }
    ],
    universities: [
      { name: 'Dhaka University', lat: 23.7279, lng: 90.3918, emoji: '🎓' },
      { name: 'BUET', lat: 23.7263, lng: 90.3925, emoji: '⚙️' },
      { name: 'NSU', lat: 23.8128, lng: 90.4084, emoji: '🏫' }
    ]
  };

  const handleLocationSelect = (location, isPickup) => {
    const locationData = { lat: location.lat, lng: location.lng, name: location.name };
    
    if (isPickup) {
      setPickupText(location.name);
      onPickupSelect(locationData);
    } else {
      setDropText(location.name);
      onDropSelect(locationData);
    }
  };

  return (
    <div className="dhaka-location-search">
      <div className="search-header">
        <h3>🇧🇩 রাইড বুক করুন | Book Your Ride</h3>
      </div>

      <div className="search-inputs">
        {/* Pickup Input */}
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <MapPin className="search-icon pickup" size={16} />
            <input
              type="text"
              placeholder="পিকআপ লোকেশন | Pickup location"
              value={pickupText}
              onChange={(e) => setPickupText(e.target.value)}
              disabled={disabled}
              className="search-input pickup"
            />
          </div>
        </div>

        {/* Drop Input */}
        <div className="search-input-group">
          <div className="search-input-wrapper">
            <Target className="search-icon drop" size={16} />
            <input
              type="text"
              placeholder="গন্তব্য | Where to?"
              value={dropText}
              onChange={(e) => setDropText(e.target.value)}
              disabled={disabled}
              className="search-input drop"
            />
          </div>
        </div>
      </div>

      {/* Popular Dhaka Locations */}
      <div className="location-categories">
        {/* Popular Places */}
        <div className="location-category">
          <h4>📍 জনপ্রিয় স্থান | Popular Places</h4>
          <div className="location-buttons">
            {dhakaLocations.popular.map((location, index) => (
              <div key={index} className="location-button-group">
                <button 
                  className="location-btn pickup-btn"
                  onClick={() => handleLocationSelect(location, true)}
                  disabled={disabled}
                  title={`Set as pickup: ${location.name}`}
                >
                  {location.emoji} {location.name}
                </button>
                <button 
                  className="location-btn drop-btn"
                  onClick={() => handleLocationSelect(location, false)}
                  disabled={disabled}
                  title={`Set as destination: ${location.name}`}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Transport Hubs */}
        <div className="location-category">
          <h4>🚄 যাতায়াত কেন্দ্র | Transport Hubs</h4>
          <div className="location-buttons">
            {dhakaLocations.transport.map((location, index) => (
              <div key={index} className="location-button-group">
                <button 
                  className="location-btn pickup-btn"
                  onClick={() => handleLocationSelect(location, true)}
                  disabled={disabled}
                >
                  {location.emoji} {location.name}
                </button>
                <button 
                  className="location-btn drop-btn"
                  onClick={() => handleLocationSelect(location, false)}
                  disabled={disabled}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Shopping Centers */}
        <div className="location-category">
          <h4>🛍️ শপিং সেন্টার | Shopping Centers</h4>
          <div className="location-buttons">
            {dhakaLocations.shopping.map((location, index) => (
              <div key={index} className="location-button-group">
                <button 
                  className="location-btn pickup-btn"
                  onClick={() => handleLocationSelect(location, true)}
                  disabled={disabled}
                >
                  {location.emoji} {location.name}
                </button>
                <button 
                  className="location-btn drop-btn"
                  onClick={() => handleLocationSelect(location, false)}
                  disabled={disabled}
                >
                  →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected locations display */}
      {(pickupLocation || dropLocation) && (
        <div className="selected-locations">
          {pickupLocation && (
            <div className="selected-location pickup">
              <MapPin size={14} />
              <span>পিকআপ: {pickupLocation.name || 'Selected location'}</span>
            </div>
          )}
          {dropLocation && (
            <div className="selected-location drop">
              <Target size={14} />
              <span>গন্তব্য: {dropLocation.name || 'Selected location'}</span>
            </div>
          )}
        </div>
      )}

      {/* Recent locations placeholder */}
      <div className="recent-locations">
        <h4><Clock size={16} /> সাম্প্রতিক স্থান | Recent Places</h4>
        <div className="recent-items">
          <div className="recent-item">
            <div className="recent-icon">🏠</div>
            <div className="recent-text">
              <div className="recent-name">বাড়ি | Home</div>
              <div className="recent-address">Add your home address</div>
            </div>
          </div>
          <div className="recent-item">
            <div className="recent-icon">💼</div>
            <div className="recent-text">
              <div className="recent-name">অফিস | Work</div>
              <div className="recent-address">Add your work address</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DhakaLocationSearch;