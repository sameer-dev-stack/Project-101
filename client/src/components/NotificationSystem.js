import React, { useEffect, useState } from 'react';

function NotificationSystem({ notifications, onRemove }) {
  return (
    <div className="notification-system">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}

function Notification({ notification, onRemove }) {
  const [isVisible, setIsVisible] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  useEffect(() => {
    // Show notification after mount
    const showTimer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    // Auto-remove after 5 seconds
    const removeTimer = setTimeout(() => {
      handleRemove();
    }, 5000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  const handleRemove = () => {
    setIsRemoving(true);
    setTimeout(() => {
      onRemove(notification.id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  const getTypeClass = () => {
    return `notification-${notification.type}`;
  };

  return (
    <div 
      className={`notification ${getTypeClass()} ${isVisible ? 'show' : ''} ${isRemoving ? 'removing' : ''}`}
      onClick={handleRemove}
      role="alert"
      aria-live="polite"
    >
      <div className="notification-content">
        <div className="notification-header">
          <span className="notification-icon">{getIcon()}</span>
          <span className="notification-title">{notification.title}</span>
          <button 
            className="notification-close"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
        {notification.message && (
          <div className="notification-message">{notification.message}</div>
        )}
      </div>
      
      <div className="notification-progress">
        <div className="progress-bar"></div>
      </div>
    </div>
  );
}

export default NotificationSystem;

// CSS styles (would typically be in a separate CSS file)
const styles = `
.notification-system {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 350px;
  pointer-events: none;
}

.notification {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  padding: 0;
  transform: translateX(100%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  pointer-events: auto;
  overflow: hidden;
  position: relative;
  min-height: 60px;
}

.notification.show {
  transform: translateX(0);
}

.notification.removing {
  transform: translateX(100%);
  opacity: 0;
}

.notification-content {
  padding: 16px;
  position: relative;
}

.notification-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 4px;
}

.notification-icon {
  font-size: 16px;
  line-height: 1;
}

.notification-title {
  font-weight: 600;
  color: #333;
  flex: 1;
  font-size: 14px;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  color: #666;
  font-size: 12px;
  line-height: 1;
  transition: background-color 0.2s;
}

.notification-close:hover {
  background-color: #f0f0f0;
}

.notification-message {
  color: #666;
  font-size: 13px;
  line-height: 1.4;
  margin-top: 4px;
}

.notification-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.1);
}

.progress-bar {
  height: 100%;
  background: currentColor;
  animation: progress 5s linear forwards;
  transform: translateX(-100%);
}

@keyframes progress {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(0);
  }
}

/* Type-specific styles */
.notification-success {
  border-left: 4px solid #2e7d32;
}

.notification-success .progress-bar {
  background: #2e7d32;
}

.notification-warning {
  border-left: 4px solid #f57c00;
}

.notification-warning .progress-bar {
  background: #f57c00;
}

.notification-error {
  border-left: 4px solid #c62828;
}

.notification-error .progress-bar {
  background: #c62828;
}

.notification-info {
  border-left: 4px solid #4285F4;
}

.notification-info .progress-bar {
  background: #4285F4;
}

/* Mobile responsiveness */
@media (max-width: 768px) {
  .notification-system {
    top: 12px;
    right: 12px;
    left: 12px;
    max-width: none;
  }
  
  .notification {
    max-width: none;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  .notification {
    border: 2px solid #000;
  }
}

/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .notification {
    transition: none;
  }
  
  .progress-bar {
    animation: none;
    transform: translateX(0);
  }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}