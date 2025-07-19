// Test script to verify complete trip flow
import io from 'socket.io-client';

const serverUrl = 'http://localhost:3003';
const testLocation = {
  pickup: { lat: 23.8103, lng: 90.4125 }, // Dhaka City Center
  drop: { lat: 23.7909, lng: 90.4043 }    // Gulshan
};

console.log('🚀 Starting trip flow test...');

const socket = io(serverUrl);

socket.on('connect', () => {
  console.log('✅ Connected to server');
  
  // Test 1: Request nearby cabs
  console.log('🔍 Requesting nearby cabs...');
  socket.emit('message', {
    type: 'nearByCabs',
    lat: testLocation.pickup.lat,
    lng: testLocation.pickup.lng
  });
});

socket.on('connected', (data) => {
  console.log('✅ Server connection confirmed:', data.message);
});

socket.on('nearByCabs', (data) => {
  console.log('✅ Received nearby cabs:', data.locations?.length || 0, 'cabs');
  
  // Test 2: Request a cab
  console.log('🚕 Requesting cab...');
  socket.emit('message', {
    type: 'requestCab',
    pickUpLat: testLocation.pickup.lat,
    pickUpLng: testLocation.pickup.lng,
    dropLat: testLocation.drop.lat,
    dropLng: testLocation.drop.lng
  });
});

socket.on('cabBooked', (data) => {
  console.log('✅ Cab booked successfully:', data.tripId);
});

socket.on('pickUpPath', (data) => {
  console.log('✅ Received pickup path:', data.path?.length || 0, 'points');
});

socket.on('location', (data) => {
  console.log('📍 Driver location update:', data.lat, data.lng);
});

socket.on('cabIsArriving', () => {
  console.log('✅ Driver is arriving!');
});

socket.on('cabArrived', () => {
  console.log('✅ Driver has arrived!');
});

socket.on('tripStart', () => {
  console.log('✅ Trip started!');
});

socket.on('tripPath', (data) => {
  console.log('✅ Received trip path:', data.path?.length || 0, 'points');
});

socket.on('tripEnd', () => {
  console.log('✅ Trip completed successfully!');
  console.log('🎉 All tests passed! Trip flow is working correctly.');
  process.exit(0);
});

socket.on('disconnect', () => {
  console.log('❌ Disconnected from server');
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection error:', error.message);
  process.exit(1);
});

// Timeout after 30 seconds
setTimeout(() => {
  console.log('⏰ Test timeout after 30 seconds');
  process.exit(1);
}, 30000);