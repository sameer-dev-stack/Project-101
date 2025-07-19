# Product Requirements: Advanced Ridesharing App

## PROJECT OVERVIEW
Build a comprehensive web-based ridesharing application exactly like Uber/Lyft with all advanced features. The app must provide real-time cab tracking, smooth animations, and professional user experience matching production ridesharing apps.

## CORE FUNCTIONALITY REQUIREMENTS

### 1. Real-Time Cab Discovery
- **Fetch and display nearby cabs on Google Map with real-time updates**
- **WebSocket event:** `nearByCabs` - Request and receive nearby cab locations
- **Implementation:** Use Google Maps JavaScript API with custom markers
- **Update frequency:** Every 2-3 seconds for nearby cab locations
- **Visual requirements:** Custom cab markers with smooth movement animations

### 2. Location Selection System
- **Set pickup and drop location with autocomplete**
- **Google Places API integration** for location search and autocomplete
- **UI Components:** Search inputs with dropdown suggestions
- **Validation:** Ensure valid coordinates and address verification
- **Error handling:** Handle API failures and invalid locations gracefully

### 3. Cab Booking Flow
- **Book a cab with real-time driver matching**
- **WebSocket events:** 
  - `requestCab` - Book with pickup/drop coordinates
  - `cabBooked` - Confirmation of successful booking
- **State management:** Handle booking → confirmation → driver assignment
- **UI feedback:** Loading states and booking confirmations

### 4. Driver Tracking System
- **Show driver current location with live tracking**
- **WebSocket event:** `location` - Real-time driver location updates
- **Animation requirements:** Smooth marker movement using requestAnimationFrame
- **Path visualization:** Animated polylines showing driver route
- **Rotation:** Calculate bearing for proper car marker orientation

### 5. Pickup Phase
- **Display pickup path on map with smooth animations**
- **WebSocket events:**
  - `pickUpPath` - Route from driver to pickup location
  - `cabIsArriving` - Driver approaching notification
  - `cabArrived` - Driver arrival confirmation
- **Path animation:** Animated polyline drawing point by point
- **Color coding:** Use #FF6B35 for pickup path visualization

### 6. Trip Management
- **Complete trip flow with ongoing trip UI**
- **WebSocket events:**
  - `tripStart` - Trip begins after pickup
  - `tripPath` - Route from pickup to destination
  - `tripEnd` - Trip completion
- **Path visualization:** Use #4285F4 for trip path polylines
- **Real-time updates:** Continuous location tracking during trip

### 7. Trip Completion
- **Trip end functionality with summary**
- **State transition:** in-progress → completed
- **UI components:** Trip summary, duration, route overview
- **Next action:** "Take next ride" functionality

## TECHNICAL SPECIFICATIONS

### WebSocket Architecture (CRITICAL)
**Event Structure Must Match Android Implementation:**

```javascript
// Client → Server Events
{
  "type": "nearByCabs",
  "lat": 28.438147,
  "lng": 77.0994446
}

{
  "type": "requestCab",
  "pickUpLat": 28.4369353,
  "pickUpLng": 77.1125599,
  "dropLat": -25.274398,
  "dropLng": 133.775136
}

// Server → Client Events
{
  "type": "nearByCabs",
  "locations": [{"lat": 28.439147, "lng": 77.0944446}]
}

{
  "type": "cabBooked"
}

{
  "type": "pickUpPath",
  "path": [{"lat": 28.43578, "lng": 77.10198}]
}

{
  "type": "location",
  "lat": 28.43578,
  "lng": 77.10198
}

{
  "type": "cabIsArriving"
}

{
  "type": "cabArrived"
}

{
  "type": "tripStart"
}

{
  "type": "tripPath",
  "path": [{"lat": 28.438370, "lng": 77.09944}]
}

{
  "type": "tripEnd"
}

// Error Events
{
  "type": "directionApiFailed"
}

{
  "type": "routesNotAvailable"
}
```

### Animation Requirements (CRITICAL)
**Car Movement:**
- Use `requestAnimationFrame` for 60fps smooth animation
- Implement easing functions (`easeInOutCubic`) for natural movement
- Calculate bearing for proper car rotation based on movement direction
- Animation duration proportional to distance (2-4 seconds typical)
- Never teleport markers - always animate position changes

**Path Drawing:**
- Animate polyline drawing point by point
- Different colors: pickup path (#FF6B35), trip path (#4285F4)
- Clear previous paths when new ones start
- Smooth path transitions with proper timing

### State Management
**Trip States:** `idle → booking → pickup → in_progress → completed`
- **State validation:** Only allow valid transitions
- **Data persistence:** Maintain trip data throughout state changes
- **Error recovery:** Handle network failures gracefully
- **UI synchronization:** Keep UI in sync with current state

### Google Maps Integration
**API Requirements:**
- Google Maps JavaScript API for interactive maps
- Directions API for route calculation
- Geocoding API for address search
- Places API for autocomplete functionality

**Map Configuration:**
- Custom marker elements with CSS styling
- Proper coordinate system handling
- Efficient layer management for routes and markers
- Performance optimization for marker rendering

### Technology Stack
- **Frontend:** React with modern hooks, Google Maps JavaScript API
- **Backend:** Node.js with Express.js framework
- **Real-time:** WebSocket or Socket.io for bidirectional communication
- **Database:** PostgreSQL or MongoDB for user/ride data
- **State Management:** React Context/Reducer
- **Animation:** CSS3 transitions, requestAnimationFrame

## IMPLEMENTATION STEPS

### Phase 1: Foundation Setup
1. **Project Structure Creation**
   - Create `/client` folder for React frontend
   - Create `/server` folder for Node.js backend
   - Create `/shared` folder for WebSocket event definitions
   - Set up package.json with required dependencies

2. **Google Maps Integration**
   - Set up Google Maps API key (environment variable)
   - Create basic map component with marker support
   - Implement map initialization and event handlers

3. **WebSocket Infrastructure**
   - Set up WebSocket server with event handling
   - Create WebSocket client with automatic reconnection
   - Implement message queuing during disconnections

### Phase 2: Core Features
1. **Nearby Cabs System**
   - Implement `nearByCabs` WebSocket event handling
   - Create cab marker rendering system
   - Add real-time location updates for nearby cabs

2. **Location Selection**
   - Integrate Google Places API for autocomplete
   - Create pickup/drop location UI components
   - Implement location validation and error handling

3. **Booking System**
   - Create cab booking UI and flow
   - Implement `requestCab` and `cabBooked` events
   - Add booking confirmation and loading states

### Phase 3: Advanced Features
1. **Driver Tracking**
   - Implement real-time driver location updates
   - Create smooth marker animation system
   - Add bearing calculation for marker rotation

2. **Path Visualization**
   - Integrate Google Directions API
   - Create animated polyline drawing system
   - Implement pickup and trip path differentiation

3. **Trip Management**
   - Build complete trip state machine
   - Implement trip progress tracking
   - Create trip completion flow

### Phase 4: Polish and Testing
1. **Animation Optimization**
   - Ensure 60fps smooth animations
   - Implement proper easing functions
   - Add loading states and transitions

2. **Error Handling**
   - Implement comprehensive error boundaries
   - Add network failure recovery
   - Create user-friendly error messages

3. **Mobile Responsiveness**
   - Optimize for mobile devices
   - Implement touch-friendly controls
   - Add mobile-specific optimizations

## VALIDATION CHECKPOINTS

### Technical Validation
- [ ] WebSocket events match Android repo specification exactly
- [ ] Smooth 60fps animations for all car movements
- [ ] Real-time location tracking works without lag
- [ ] Google Maps integration handles errors gracefully
- [ ] All trip states transition properly with validation

### User Experience Validation
- [ ] Can see nearby cabs moving on map in real-time
- [ ] Can select pickup and drop locations with autocomplete
- [ ] Can book a cab and see confirmation
- [ ] Can watch driver approach with animated path and car movement
- [ ] Receives proper notifications: "Driver is arriving", "Driver arrived"
- [ ] Trip starts and shows animated path to destination
- [ ] Real-time location tracking during entire trip
- [ ] Trip ends with proper completion flow

### Performance Validation
- [ ] No animation frame drops during car movement
- [ ] WebSocket reconnection within 3 seconds of connection loss
- [ ] Location updates every 2-3 seconds during active trips
- [ ] Map renders properly on screens from 320px to 2560px width
- [ ] Application works with network interruptions

## ERROR HANDLING REQUIREMENTS

### Network Failures
- **WebSocket disconnection:** Implement automatic reconnection with exponential backoff
- **Connection status:** Provide clear indicators to user
- **Message queuing:** Queue messages when disconnected, send when reconnected
- **API failures:** Graceful handling of Google Maps API failures

### User Experience Errors
- **Clear error messages:** User-friendly messages with actionable suggestions
- **Loading states:** For all async operations
- **Retry mechanisms:** For failed operations
- **Graceful degradation:** When features unavailable

### Edge Cases
- **Driver cancellations:** Handle booking cancellations gracefully
- **Invalid locations:** Validate coordinates and addresses
- **API rate limits:** Implement proper rate limiting and fallbacks
- **GPS accuracy:** Handle location permission and accuracy issues

## TESTING REQUIREMENTS

### Unit Tests (75%+ coverage)
- Test all business logic functions
- Mock WebSocket connections and Google Maps API
- Test animation functions and timing
- Test state management and transitions

### Integration Tests
- Test complete trip flows end-to-end
- Test WebSocket message handling
- Test Google Maps integration
- Test error scenarios and recovery

### E2E Tests
- Complete user journey testing
- Test on different screen sizes and devices
- Test network failure scenarios
- Performance testing for smooth animations

## SUCCESS CRITERIA

### Core Functionality
- ✅ Real-time nearby cab visualization
- ✅ Smooth pickup and drop location selection
- ✅ Successful cab booking with confirmation
- ✅ Real-time driver tracking with smooth animations
- ✅ Complete trip flow from booking to completion

### Performance Standards
- ✅ 60fps smooth animations for all car movements
- ✅ Real-time updates every 2-3 seconds
- ✅ WebSocket reconnection within 3 seconds
- ✅ Mobile responsive design (320px to 2560px)
- ✅ Proper error handling and recovery

### User Experience
- ✅ Uber-quality smooth animations
- ✅ Clear status updates and notifications
- ✅ Intuitive interface with immediate feedback
- ✅ Professional visual design
- ✅ Seamless mobile experience

## COMMON PITFALLS TO AVOID

### Animation Issues
- ❌ Using setInterval instead of requestAnimationFrame
- ❌ Skipping intermediate positions in marker movement
- ❌ Forgetting to clean up animation frames
- ❌ Ignoring bearing calculation for car rotation

### WebSocket Problems
- ❌ Assuming connection is always available
- ❌ Sending messages without connection validation
- ❌ Ignoring message queuing during disconnections
- ❌ Forgetting connection cleanup

### State Management
- ❌ Allowing invalid state transitions
- ❌ Not persisting critical trip data
- ❌ Updating UI before state validation
- ❌ Ignoring error state handling

### Google Maps Issues
- ❌ Not handling API loading failures
- ❌ Creating unnecessary map instances
- ❌ Ignoring bounds and zoom management
- ❌ Skipping marker cleanup

## DEPLOYMENT CONSIDERATIONS

### Environment Configuration
- Google Maps API keys for different environments
- WebSocket URL configuration
- Build optimization for production
- Asset optimization and compression

### Monitoring and Analytics
- Basic application health checks
- WebSocket connection monitoring
- Performance metrics collection
- Error rate tracking

This PRP provides comprehensive guidance for building a production-quality ridesharing app with real-time features, smooth animations, and professional user experience matching industry standards.
