# CLAUDE.md - Advanced Ridesharing App Project Rules

## PROJECT AWARENESS
- This is an advanced ridesharing app like Uber/Lyft with sophisticated real-time features
- Based on proven Android implementation with WebSocket architecture
- Focus on smooth animations, real-time updates, and professional user experience
- Prioritize working real-time features over complex backend architecture
- Always check the examples/ folder for existing patterns before implementing
- Read INITIAL.md for complete feature requirements and WebSocket event structure

## CODE STRUCTURE
- **File Organization:**
  - `/client` - Frontend React/HTML/CSS/JS with Google Maps integration
  - `/server` - Backend Node.js/Express with WebSocket server
  - `/shared` - Shared utilities and WebSocket event definitions
  - `/tests` - Unit and integration tests
  - `/docs` - API documentation and setup guides
  - `/assets` - Map icons, car markers, and UI assets

- **File Size Limits:**
  - Keep individual files under 400 lines for complex features
  - Split large components into smaller, focused modules
  - Use clear, descriptive file names that indicate functionality

- **Module Organization:**
  - Separate concerns: map logic, WebSocket handling, state management, UI
  - Clear imports/exports with consistent naming
  - Avoid circular dependencies
  - Group related functionality in service classes

## TECHNOLOGY STACK
- **Frontend:** React with modern hooks, Google Maps JavaScript API, CSS3/SCSS
- **Backend:** Node.js with Express.js framework and WebSocket support
- **Real-time:** Native WebSocket or Socket.io for bidirectional communication
- **Maps:** Google Maps API (Maps, Directions, Places, Geocoding)
- **Database:** PostgreSQL or MongoDB for user/ride data (minimal for MVP)
- **State Management:** React Context/Reducer or simple state machines
- **Testing:** Jest for unit tests, Playwright/Cypress for E2E testing
- **Animation:** CSS3 transitions, requestAnimationFrame for smooth movement

## WEBSOCKET ARCHITECTURE (CRITICAL)
- **Event Structure:** Must match Android repo exactly:
  ```javascript
  // Client → Server
  { "type": "nearByCabs", "lat": 28.438147, "lng": 77.0994446 }
  { "type": "requestCab", "pickUpLat": 28.4369353, "pickUpLng": 77.1125599, "dropLat": -25.274398, "dropLng": 133.775136 }
  
  // Server → Client  
  { "type": "nearByCabs", "locations": [{"lat": 28.439147, "lng": 77.0944446}] }
  { "type": "cabBooked" }
  { "type": "pickUpPath", "path": [{"lat": 28.43578, "lng": 77.10198}] }
  { "type": "location", "lat": 28.43578, "lng": 77.10198 }
  { "type": "cabIsArriving" }
  { "type": "cabArrived" }
  { "type": "tripStart" }
  { "type": "tripPath", "path": [{"lat": 28.438370, "lng": 77.09944}] }
  { "type": "tripEnd" }
  ```

- **Connection Management:**
  - Implement automatic reconnection with exponential backoff
  - Handle connection state changes gracefully
  - Queue messages when disconnected, send when reconnected
  - Provide clear connection status indicators to user

## ANIMATION REQUIREMENTS (CRITICAL)
- **Car Movement:**
  - Use requestAnimationFrame for 60fps smooth animation
  - Implement easing functions (easeInOutCubic) for natural movement
  - Calculate bearing for proper car rotation based on movement direction
  - Never teleport markers - always animate position changes
  - Animation duration should be proportional to distance (2-4 seconds typical)

- **Path Drawing:**
  - Animate polyline drawing point by point for pickup and trip paths
  - Use different colors: pickup path (#FF6B35), trip path (#4285F4)
  - Clear previous paths when new ones start
  - Smooth path transitions with proper timing

- **UI Transitions:**
  - All state changes should have smooth CSS transitions
  - Loading states with proper spinners/skeletons
  - Fade effects for status updates and notifications
  - Micro-animations for button interactions

## STATE MANAGEMENT
- **Trip States:** idle → booking → pickup → in_progress → completed
- **State Validation:** Only allow valid state transitions
- **Data Persistence:** Maintain trip data throughout state changes
- **Error Recovery:** Handle network failures and return to appropriate state
- **UI Synchronization:** Keep UI in sync with current state always

## MAPBOX INTEGRATION (CRITICAL)
- **API Requirements:**
  - Mapbox GL JS for interactive map rendering
  - Directions API for route calculation and navigation
  - Geocoding API for address search and autocomplete
  - Static Images API for thumbnails (optional)

- **Map Configuration:**
  - Use modern map styles (streets-v12 or custom)
  - Custom marker elements with CSS styling
  - Proper coordinate system ([lng, lat] format)
  - Efficient layer management for routes and markers

- **Performance Optimization:**
  - Use clustering for many nearby cabs if needed
  - Implement proper event debouncing
  - Cache route results when possible
  - Optimize marker and layer rendering

## CODING STANDARDS
- **JavaScript Style:**
  - Use ES6+ features consistently (async/await, destructuring, arrow functions)
  - Prefer const/let over var
  - Use meaningful, descriptive variable names
  - Include comprehensive JSDoc comments for all functions

- **Error Handling:**
  - Always use try-catch blocks for async operations
  - Implement proper error boundaries in React
  - Return meaningful error messages with context
  - Log errors with sufficient detail for debugging
  - Handle Google Maps API failures gracefully

- **API Design:**
  - RESTful endpoints for non-real-time operations
  - WebSocket for all real-time communication
  - Consistent JSON response formats
  - Proper HTTP status codes and error responses
  - Input validation and sanitization on all endpoints

## REAL-TIME FEATURES (CRITICAL)
- **Location Updates:**
  - Update driver locations every 2-3 seconds during active trips
  - Use high-accuracy GPS when available
  - Implement location smoothing to reduce GPS jitter
  - Handle location permission requests properly

- **Status Updates:**
  - Immediate WebSocket events for all status changes
  - Clear, user-friendly status messages
  - Visual indicators for each trip phase
  - ETA calculations and updates

- **Simulation System:**
  - Realistic cab movement patterns
  - Multiple nearby cabs with different positions
  - Simulated driver behavior (accept/decline rides)
  - Realistic timing for pickup and trip phases

## TESTING REQUIREMENTS
- **Unit Tests:**
  - Test all business logic functions (state management, calculations)
  - Mock WebSocket connections and Google Maps API
  - Test animation functions and timing
  - Achieve 75%+ code coverage

- **Integration Tests:**
  - Test complete trip flows end-to-end
  - Test WebSocket message handling
  - Test Google Maps integration
  - Test error scenarios and recovery

- **E2E Tests:**
  - Complete user journey: location selection → booking → pickup → trip → completion
  - Test on different screen sizes and devices
  - Test network failure scenarios
  - Performance testing for smooth animations

## SECURITY CONSIDERATIONS
- **Input Validation:**
  - Validate all coordinates and location data
  - Sanitize user inputs for XSS prevention
  - Rate limiting on WebSocket connections
  - Validate WebSocket message formats

- **API Security:**
  - Secure Google Maps API key (environment variables)
  - CORS configuration for WebSocket connections
  - Input sanitization for all user data
  - Basic authentication for admin features

## PERFORMANCE OPTIMIZATION
- **Frontend:**
  - Lazy load components not immediately needed
  - Optimize Google Maps rendering and updates
  - Debounce location updates and map events
  - Efficient React rendering (memo, useMemo, useCallback)

- **Backend:**
  - Efficient WebSocket message broadcasting
  - Connection pooling for database operations
  - Caching for frequently accessed data
  - Proper memory management for location data

- **Real-time:**
  - Batch location updates when possible
  - Optimize polyline rendering for complex paths
  - Use efficient data structures for cab tracking
  - Minimize WebSocket message frequency

## MOBILE RESPONSIVENESS
- **Design Principles:**
  - Mobile-first responsive design
  - Touch-friendly interface elements
  - Full-screen map on mobile devices
  - Proper viewport configuration

- **Interaction Patterns:**
  - Swipe gestures for trip status updates
  - Touch-optimized controls and buttons
  - Proper keyboard handling on mobile
  - Native-like animations and transitions

## ERROR HANDLING AND RESILIENCE
- **Network Failures:**
  - Graceful WebSocket disconnection handling
  - Automatic reconnection with user feedback
  - Offline state detection and messaging
  - Google Maps API failure fallbacks

- **User Experience:**
  - Clear error messages with actionable suggestions
  - Loading states for all async operations
  - Retry mechanisms for failed operations
  - Graceful degradation when features unavailable

## DEBUGGING AND MONITORING
- **Logging:**
  - Comprehensive client-side logging for debugging
  - WebSocket message logging (with privacy considerations)
  - Performance metrics for animations
  - Error tracking and reporting

- **Development Tools:**
  - WebSocket connection monitoring
  - Map performance profiling
  - Animation frame rate monitoring
  - State change logging

## DEPLOYMENT READINESS
- **Environment Configuration:**
  - Environment-specific Google Maps API keys
  - WebSocket URL configuration
  - Build optimization for production
  - Asset optimization and compression

- **Monitoring:**
  - Basic application health checks
  - WebSocket connection monitoring
  - Performance metrics collection
  - Error rate tracking

## COMMON PITFALLS TO AVOID
- **Animation Issues:**
  - Don't use setInterval for animations (use requestAnimationFrame)
  - Don't skip intermediate positions in marker movement
  - Don't forget to clean up animation frames on component unmount
  - Don't ignore bearing calculation for car rotation

- **WebSocket Problems:**
  - Don't assume WebSocket connection is always available
  - Don't send messages without connection state validation
  - Don't ignore message queuing during disconnections
  - Don't forget to handle connection cleanup

- **State Management:**
  - Don't allow invalid state transitions
  - Don't forget to persist critical trip data
  - Don't update UI before state validation
  - Don't ignore error state handling

- **Google Maps Issues:**
  - Don't forget to handle API loading failures
  - Don't create unnecessary map instances
  - Don't ignore bounds and zoom management
  - Don't skip marker cleanup on component unmount

## SUCCESS CRITERIA VALIDATION
Before considering any feature complete, verify:
- [ ] Smooth 60fps animations for all car movements
- [ ] WebSocket events match Android repo specification exactly
- [ ] All trip states transition properly with validation
- [ ] Real-time location tracking works without lag
- [ ] Google Maps integration handles errors gracefully
- [ ] Mobile responsiveness works on actual devices
- [ ] ETA calculations update accurately
- [ ] Path animations draw smoothly without stuttering
- [ ] Connection loss/recovery works transparently
- [ ] All user interactions provide immediate feedback

## QUALITY GATES
- [ ] No animation frame drops during car movement
- [ ] WebSocket reconnection within 3 seconds of connection loss
- [ ] Location updates every 2-3 seconds during active trips
- [ ] Map renders properly on screens from 320px to 2560px width
- [ ] All async operations have proper loading states
- [ ] Error messages are user-friendly and actionable
- [ ] Application works offline with appropriate messaging
- [ ] Performance metrics meet mobile web standards