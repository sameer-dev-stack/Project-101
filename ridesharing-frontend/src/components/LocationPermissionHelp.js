import React, { useState } from 'react';

function LocationPermissionHelp() {
  const [isVisible, setIsVisible] = useState(false);

  const toggleHelp = () => {
    setIsVisible(!isVisible);
  };

  return (
    <div className="location-help">
      <button 
        type="button" 
        className="help-button"
        onClick={toggleHelp}
        title="Location permission help"
      >
        ❓
      </button>
      
      {isVisible && (
        <div className="help-modal">
          <div className="help-content">
            <div className="help-header">
              <h3>How to Enable Location Access</h3>
              <button 
                type="button" 
                className="close-button"
                onClick={toggleHelp}
              >
                ✕
              </button>
            </div>
            
            <div className="help-body">
              <div className="help-section">
                <h4>🌐 For Chrome/Edge:</h4>
                <ol>
                  <li>Click the location icon (🔒) in the address bar</li>
                  <li>Select "Allow" for location access</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="help-section">
                <h4>🦊 For Firefox:</h4>
                <ol>
                  <li>Click the shield icon in the address bar</li>
                  <li>Click "Allow Location Access"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="help-section">
                <h4>🍎 For Safari:</h4>
                <ol>
                  <li>Go to Safari → Settings → Websites</li>
                  <li>Click "Location" in the left sidebar</li>
                  <li>Set this website to "Allow"</li>
                  <li>Refresh the page</li>
                </ol>
              </div>
              
              <div className="help-section">
                <h4>📱 For Mobile:</h4>
                <ol>
                  <li>When prompted, tap "Allow"</li>
                  <li>If blocked, go to browser settings</li>
                  <li>Find "Site Settings" or "Permissions"</li>
                  <li>Enable location for this site</li>
                </ol>
              </div>
              
              <div className="help-note">
                <strong>Note:</strong> Location access works on HTTPS websites and localhost. If you're having trouble, you can manually enter your location in the search boxes.
              </div>
            </div>
          </div>
        </div>
      )}
      
      <style jsx>{`
        .location-help {
          position: relative;
          display: inline-block;
        }
        
        .help-button {
          background: #4285F4;
          color: white;
          border: none;
          border-radius: 50%;
          width: 24px;
          height: 24px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-left: 8px;
        }
        
        .help-button:hover {
          background: #3367D6;
        }
        
        .help-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: 20px;
        }
        
        .help-content {
          background: white;
          border-radius: 12px;
          max-width: 500px;
          width: 100%;
          max-height: 80vh;
          overflow-y: auto;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        
        .help-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 20px 0;
          border-bottom: 1px solid #eee;
          margin-bottom: 20px;
        }
        
        .help-header h3 {
          margin: 0;
          color: #333;
        }
        
        .close-button {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #666;
          padding: 4px;
          border-radius: 4px;
        }
        
        .close-button:hover {
          background: #f0f0f0;
        }
        
        .help-body {
          padding: 0 20px 20px;
        }
        
        .help-section {
          margin-bottom: 20px;
        }
        
        .help-section h4 {
          margin: 0 0 10px;
          color: #4285F4;
        }
        
        .help-section ol {
          margin: 0;
          padding-left: 20px;
        }
        
        .help-section li {
          margin-bottom: 5px;
          line-height: 1.4;
        }
        
        .help-note {
          background: #f8f9fa;
          padding: 12px;
          border-radius: 8px;
          border-left: 4px solid #4285F4;
          margin-top: 20px;
        }
        
        .help-note strong {
          color: #4285F4;
        }
        
        @media (max-width: 600px) {
          .help-modal {
            padding: 10px;
          }
          
          .help-content {
            max-height: 90vh;
          }
          
          .help-header {
            padding: 15px 15px 0;
          }
          
          .help-body {
            padding: 0 15px 15px;
          }
        }
      `}</style>
    </div>
  );
}

export default LocationPermissionHelp;