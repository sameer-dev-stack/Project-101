# INITIAL.md - Simple Functional Ridesharing App

## FEATURE:
Build a comprehensive ridesharing app exactly like Uber/Lyft with all the advanced features:

**Core Functionality (based on the Android repo):**
- Fetch and show nearby cabs on Google Map with real-time updates
- Set pickup and drop location with autocomplete
- Book a cab with real-time driver matching
- Show driver current location with live tracking
- Display pickup path on map with smooth animations
- Cab arrival simulation and notifications ("Driver is arriving", "Driver arrived")
- Complete trip flow with ongoing trip UI
- Trip end functionality with summary
- Car movement animations like Uber (smooth marker transitions)
- Take next ride functionality

**Advanced Features:**
- Real-time WebSocket communication for all updates
- Animated car markers that move smoothly on the map
- Path visualization with polylines and animations
- Different trip states: booking → pickup → in-progress → completed
- Live location tracking during pickup and trip
- Direction API integration for route calculation
- Cab availability simulation and management
- Real-time cab location updates on map

**Technical Requirements:**
- Web-based application (mobile-responsive, could be PWA)
- WebSocket-based real-time communication (like the Android version)
- Mapbox GL JS integration (Maps, Directions, Geocoding)
- Smooth animations and transitions
- MVP or similar clean architecture pattern
- Real-time location simulation system
- State management for different trip phases
- Error handling for network/API failures

**UI/UX Requirements:**
- Google Maps as the primary interface
- Animated car markers moving on the map
- Real-time status updates and notifications
- Pickup/drop location selection with search
- Trip progress indicators
- Clean, Uber-like interface design
- Smooth animations for all interactions

## EXAMPLES:
Reference these patterns from the examples/ folder:
- `websocket_simulation.js` - WebSocket client/server setup exactly like the Android repo
- `map_animations.js` - Car marker animations and smooth movement on map
- `trip_states.js` - State management for booking → pickup → trip → end flow
- `location_tracking.js` - Real-time location updates and path visualization
- `direction_api.js` - Google Directions API integration for route calculation
- `cab_simulation.js` - Nearby cabs simulation and real-time updates
- `pickup_drop_ui.js` - Location selection with Google Places autocomplete
- `trip_flow_ui.js` - Complete trip UI with status updates

## DOCUMENTATION:
Include references to:
- Mapbox GL JS API documentation for interactive maps
- Mapbox Directions API for route calculation  
- Mapbox Geocoding API for location search and autocomplete
- The WebSocket event structure from the Android repo (nearByCabs, requestCab, location, tripStart, etc.)
- Animation libraries and CSS transitions for smooth movement
- PWA documentation for mobile app-like experience
- State management patterns for complex UI flows

## OTHER CONSIDERATIONS:
**Critical Features to Implement (from Android repo):**
- WebSocket event handling exactly like the Android version:
  - `nearByCabs` - Request and receive nearby cab locations
  - `requestCab` - Book a cab with pickup/drop coordinates
  - `cabBooked` - Confirmation of successful booking
  - `pickUpPath` - Route from driver to pickup location with animation
  - `location` - Real-time driver location during pickup and trip
  - `cabIsArriving` and `cabArrived` - Pickup status updates
  - `tripStart` - Trip begins after pickup
  - `tripPath` - Route from pickup to destination with animation
  - `tripEnd` - Trip completion
  - Error events: `directionApiFailed`, `routesNotAvailable`

**Animation Requirements:**
- Smooth car marker movement on map (like Uber's car animation)
- Animated polyline drawing for pickup and trip paths
- Marker transitions and rotations based on direction
- Loading states and smooth UI transitions
- Real-time path updates as driver moves

**State Management:**
- Handle different trip states: idle → booking → pickup → in-progress → completed
- Manage WebSocket connection states and reconnection
- Track current trip progress and driver location
- Handle edge cases: connection loss, API failures, driver cancellations

**Common AI Assistant Pitfalls to Avoid:**
- Don't skip the WebSocket simulation - it's critical for the real-time experience
- Ensure smooth animations - choppy movement breaks the illusion
- Handle WebSocket disconnections and reconnections gracefully
- Implement proper error handling for API failures (directions, places)
- Don't forget marker rotation based on movement direction
- Simulate realistic cab locations and movement patterns
- Include proper loading states for all async operations

**Specific Technical Requirements:**
- Use Google Maps JavaScript API with markers, polylines, and animations
- Implement WebSocket client that matches the Android repo's event structure
- Create smooth marker animation system for moving cars
- Build path visualization with animated polyline drawing
- Add location autocomplete using Google Places API
- Implement realistic cab simulation with multiple nearby drivers
- Include proper error handling and retry mechanisms
- Create mobile-responsive map interface

**Success Criteria:**
- Can see nearby cabs moving on the map in real-time
- Can select pickup and drop locations with autocomplete
- Can book a cab and see confirmation
- Can watch driver approach with animated path and car movement
- Receives proper notifications: "Driver is arriving", "Driver arrived"
- Trip starts and shows animated path to destination
- Real-time location tracking during entire trip
- Trip ends with proper completion flow
- All animations are smooth and realistic (Uber-quality)
- WebSocket communication handles all events correctly
- Works seamlessly on mobile devices

**Advanced Features (if time permits):**
- Multiple cab types simulation
- ETA calculations and display
- Trip cost estimation
- Driver rating and feedback system
- Trip history and details
- Offline state handling
- Push notifications for status updates