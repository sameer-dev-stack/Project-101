import React, { useMemo } from 'react';
import { TRIP_STATES } from '../shared/websocket-events.js';

function TripStatus({
  tripState,
  tripData,
  connectionStatus,
  isConnected,
  onBookCab,
  onNextRide,
  pickupLocation,
  dropLocation
}) {
  
  // Determine if booking is possible
  const canBook = useMemo(() => {
    return (
      tripState === TRIP_STATES.IDLE &&
      pickupLocation &&
      dropLocation &&
      isConnected
    );
  }, [tripState, pickupLocation, dropLocation, isConnected]);

  // Get connection status display
  const connectionStatusDisplay = useMemo(() => {
    const statusMap = {
      connected: { text: 'Connected', className: 'connected' },
      connecting: { text: 'Connecting...', className: 'connecting' },
      disconnected: { text: 'Disconnected', className: 'disconnected' },
      reconnecting: { text: 'Reconnecting...', className: 'connecting' }
    };
    
    return statusMap[connectionStatus] || statusMap.disconnected;
  }, [connectionStatus]);

  // Get trip progress steps
  const progressSteps = useMemo(() => {
    const steps = [
      { key: 'booking', label: 'Booking Cab', state: TRIP_STATES.BOOKING },
      { key: 'pickup', label: 'Driver Coming', state: TRIP_STATES.PICKUP },
      { key: 'trip', label: 'In Trip', state: TRIP_STATES.IN_PROGRESS },
      { key: 'complete', label: 'Completed', state: TRIP_STATES.COMPLETED }
    ];

    const stateOrder = [
      TRIP_STATES.IDLE,
      TRIP_STATES.BOOKING,
      TRIP_STATES.PICKUP,
      TRIP_STATES.IN_PROGRESS,
      TRIP_STATES.COMPLETED
    ];

    const currentIndex = stateOrder.indexOf(tripState);

    return steps.map((step, index) => {
      const stepIndex = stateOrder.indexOf(step.state);
      let status = 'pending';
      
      if (currentIndex > stepIndex) {
        status = 'completed';
      } else if (currentIndex === stepIndex) {
        status = 'active';
      }

      return { ...step, status };
    });
  }, [tripState]);

  // Get current status message
  const getStatusMessage = () => {
    switch (tripState) {
      case TRIP_STATES.IDLE:
        if (!isConnected) {
          return 'Connecting to service...';
        }
        if (!pickupLocation) {
          return 'Select pickup location to start';
        }
        if (!dropLocation) {
          return 'Select destination to continue';
        }
        return 'Ready to book your ride';

      case TRIP_STATES.BOOKING:
        return 'Booking your cab...';

      case TRIP_STATES.PICKUP:
        return 'Driver is on the way to pick you up';

      case TRIP_STATES.IN_PROGRESS:
        return 'Enjoy your ride!';

      case TRIP_STATES.COMPLETED:
        return 'Trip completed successfully';

      default:
        return 'Unknown status';
    }
  };

  // Get trip duration display
  const getTripDurationDisplay = () => {
    if (!tripData.startTime) return null;
    
    const endTime = tripData.endTime || new Date();
    const durationMs = endTime.getTime() - tripData.startTime.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    const seconds = Math.floor((durationMs % (1000 * 60)) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  // Get action button configuration
  const getActionButton = () => {
    switch (tripState) {
      case TRIP_STATES.IDLE:
        return {
          text: 'Book Cab',
          onClick: onBookCab,
          disabled: !canBook,
          className: 'btn-primary',
          loading: false
        };

      case TRIP_STATES.BOOKING:
        return {
          text: 'Booking...',
          onClick: () => {},
          disabled: true,
          className: 'btn-primary',
          loading: true
        };

      case TRIP_STATES.PICKUP:
      case TRIP_STATES.IN_PROGRESS:
        return null; // No action button during active trip

      case TRIP_STATES.COMPLETED:
        return {
          text: 'Book Next Ride',
          onClick: onNextRide,
          disabled: false,
          className: 'btn-primary',
          loading: false
        };

      default:
        return null;
    }
  };

  const actionButton = getActionButton();

  return (
    <div className="trip-status ui-panel">
      {/* Header */}
      <div className="status-header">
        <h2 className="status-title">
          {tripState === TRIP_STATES.IDLE ? 'Book a Ride' : 'Trip Status'}
        </h2>
        <div className={`connection-status ${connectionStatusDisplay.className}`}>
          {connectionStatusDisplay.text}
        </div>
      </div>

      {/* Status Message */}
      <div className="status-message">
        <p>{getStatusMessage()}</p>
      </div>

      {/* Trip Progress (show during active trip) */}
      {tripState !== TRIP_STATES.IDLE && (
        <div className="trip-progress">
          <div className="progress-header">
            <span className="progress-title">Progress</span>
            {tripData.startTime && (
              <span className="trip-duration">{getTripDurationDisplay()}</span>
            )}
          </div>
          
          <div className="progress-steps">
            {progressSteps.map((step) => (
              <div key={step.key} className={`progress-step ${step.status}`}>
                <div className="progress-dot"></div>
                <span className="progress-label">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trip Details (show when locations are selected) */}
      {(pickupLocation || dropLocation) && tripState === TRIP_STATES.IDLE && (
        <div className="trip-details">
          <div className="trip-details-header">
            <span>Trip Details</span>
          </div>
          
          <div className="location-summary">
            {pickupLocation && (
              <div className="location-item pickup">
                <div className="location-icon">📍</div>
                <div className="location-text">
                  <div className="location-label">Pickup</div>
                  <div className="location-address">
                    {pickupLocation.address || `${pickupLocation.lat.toFixed(4)}, ${pickupLocation.lng.toFixed(4)}`}
                  </div>
                </div>
              </div>
            )}
            
            {dropLocation && (
              <div className="location-item drop">
                <div className="location-icon">🎯</div>
                <div className="location-text">
                  <div className="location-label">Destination</div>
                  <div className="location-address">
                    {dropLocation.address || `${dropLocation.lat.toFixed(4)}, ${dropLocation.lng.toFixed(4)}`}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Trip Summary (show when completed) */}
      {tripState === TRIP_STATES.COMPLETED && tripData && (
        <div className="trip-summary">
          <div className="summary-header">
            <span>Trip Summary</span>
          </div>
          
          <div className="summary-stats">
            <div className="stat-item">
              <div className="stat-label">Duration</div>
              <div className="stat-value">{getTripDurationDisplay()}</div>
            </div>
            
            {tripData.startTime && (
              <div className="stat-item">
                <div className="stat-label">Completed</div>
                <div className="stat-value">
                  {tripData.endTime ? tripData.endTime.toLocaleTimeString() : 'Just now'}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      {actionButton && (
        <div className="action-section">
          <button
            className={`btn ${actionButton.className}`}
            onClick={actionButton.onClick}
            disabled={actionButton.disabled}
          >
            {actionButton.loading && <div className="loading-spinner"></div>}
            {actionButton.text}
          </button>
          
          {!canBook && tripState === TRIP_STATES.IDLE && (
            <div className="action-hint">
              {!isConnected && "Waiting for connection..."}
              {isConnected && !pickupLocation && "Select pickup location"}
              {isConnected && pickupLocation && !dropLocation && "Select destination"}
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .status-message {
          margin: 16px 0;
          padding: 12px;
          background: #f8f9fa;
          border-radius: 8px;
          border-left: 4px solid #4285F4;
        }

        .status-message p {
          margin: 0;
          color: #333;
          font-weight: 500;
        }

        .trip-progress {
          margin: 20px 0;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .progress-title {
          font-weight: 600;
          color: #333;
        }

        .trip-duration {
          font-size: 14px;
          color: #666;
          background: #f0f0f0;
          padding: 4px 8px;
          border-radius: 12px;
        }

        .progress-steps {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .trip-details, .trip-summary {
          margin: 20px 0;
          padding: 16px;
          background: #f8f9fa;
          border-radius: 8px;
        }

        .trip-details-header, .summary-header {
          font-weight: 600;
          color: #333;
          margin-bottom: 12px;
        }

        .location-summary {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .location-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }

        .location-icon {
          font-size: 16px;
          margin-top: 2px;
        }

        .location-text {
          flex: 1;
        }

        .location-label {
          font-size: 12px;
          color: #666;
          font-weight: 500;
          text-transform: uppercase;
          margin-bottom: 2px;
        }

        .location-address {
          font-size: 14px;
          color: #333;
          line-height: 1.4;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          font-size: 12px;
          color: #666;
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 600;
          color: #333;
        }

        .action-section {
          margin-top: 20px;
        }

        .action-hint {
          margin-top: 8px;
          font-size: 12px;
          color: #666;
          text-align: center;
        }

        @media (max-width: 768px) {
          .summary-stats {
            grid-template-columns: 1fr;
            gap: 12px;
          }
          
          .location-item {
            flex-direction: row;
            align-items: center;
          }
          
          .progress-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}

export default TripStatus;