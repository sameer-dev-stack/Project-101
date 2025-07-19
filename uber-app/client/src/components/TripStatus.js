import React, { useState } from 'react';
import { Car, Clock, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import PaymentMethods from './PaymentMethods';

const TripStatus = ({ 
  tripState, 
  tripData, 
  connectionStatus, 
  isConnected, 
  onBookCab, 
  onNextRide, 
  pickupLocation, 
  dropLocation 
}) => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const getStatusInfo = () => {
    switch (tripState) {
      case 'idle':
        return {
          icon: <Car size={24} />,
          title: '🚗 রাইড বুক করুন | Ready to Book',
          subtitle: 'লোকেশন ও পেমেন্ট পদ্ধতি নির্বাচন করুন | Select locations and payment method',
          action: '🚗 রাইড বুক করুন | Book Cab',
          actionDisabled: !pickupLocation || !dropLocation || !selectedPayment || !isConnected,
          onAction: () => onBookCab(selectedPayment)
        };
      case 'booking':
        return {
          icon: <Clock size={24} />,
          title: '🔍 ক্যাব খোঁজা হচ্ছে | Booking Cab...',
          subtitle: 'কাছাকাছি ড্রাইভার খোঁজা হচ্ছে | Finding a driver nearby',
          showSpinner: true
        };
      case 'pickup':
        return {
          icon: <Car size={24} />,
          title: '🚗 ড্রাইভার আসছেন | Driver On The Way',
          subtitle: 'আপনার ড্রাইভার পিকআপের জন্য আসছেন | Your driver is coming to pick you up',
          showSpinner: true
        };
      case 'in_progress':
        return {
          icon: <MapPin size={24} />,
          title: '🛣️ যাত্রা চলমান | Trip In Progress',
          subtitle: 'আপনার যাত্রা উপভোগ করুন! | Enjoy your ride!',
          showSpinner: true
        };
      case 'completed':
        return {
          icon: <CheckCircle size={24} />,
          title: '✅ যাত্রা সম্পন্ন | Trip Completed',
          subtitle: 'আমাদের সাথে যাত্রার জন্য ধন্যবাদ! | Thank you for riding with us!',
          action: '🚗 আরেকটি রাইড বুক করুন | Book Another Ride',
          onAction: onNextRide
        };
      default:
        return {
          icon: <Car size={24} />,
          title: 'Ready',
          subtitle: 'Book your ride'
        };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className="trip-status">
      <div className="status-header">
        <div className="status-icon">
          {statusInfo.showSpinner ? (
            <div className="loading-spinner"></div>
          ) : (
            statusInfo.icon
          )}
        </div>
        <div className="status-text">
          <h3>{statusInfo.title}</h3>
          <p>{statusInfo.subtitle}</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="connection-indicator">
        <div className={`connection-dot ${isConnected ? 'connected' : 'disconnected'}`}></div>
        <span className="connection-text">{connectionStatus}</span>
      </div>

      {/* Trip Details */}
      {(pickupLocation || dropLocation) && (
        <div className="trip-details">
          {pickupLocation && (
            <div className="trip-location">
              <MapPin size={16} className="location-icon pickup" />
              <span>📍 পিকআপ নির্বাচিত | Pickup selected</span>
            </div>
          )}
          {dropLocation && (
            <div className="trip-location">
              <MapPin size={16} className="location-icon drop" />
              <span>🎯 গন্তব্য নির্বাচিত | Destination selected</span>
            </div>
          )}
        </div>
      )}

      {/* Payment Selection - Only show during idle state */}
      {tripState === 'idle' && (
        <div className="payment-section">
          <h4>💳 পেমেন্ট পদ্ধতি | Payment Method</h4>
          <PaymentMethods 
            onPaymentSelect={setSelectedPayment}
            selectedPayment={selectedPayment}
          />
        </div>
      )}

      {/* Action Button */}
      {statusInfo.action && (
        <button
          className={`status-action-btn ${statusInfo.actionDisabled ? 'disabled' : ''}`}
          onClick={statusInfo.onAction}
          disabled={statusInfo.actionDisabled}
        >
          {statusInfo.action}
        </button>
      )}

      {/* Error State */}
      {!isConnected && (
        <div className="error-message">
          <AlertCircle size={16} />
          <span>Connection lost. Trying to reconnect...</span>
        </div>
      )}
    </div>
  );
};

export default TripStatus;