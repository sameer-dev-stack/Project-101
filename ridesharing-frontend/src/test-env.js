// Simple test to verify environment variables are loading
console.log('=== Environment Variable Test ===');
console.log('REACT_APP_MAPBOX_ACCESS_TOKEN:', process.env.REACT_APP_MAPBOX_ACCESS_TOKEN);
console.log('TOKEN LENGTH:', process.env.REACT_APP_MAPBOX_ACCESS_TOKEN?.length);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('All REACT_APP_ variables:', Object.keys(process.env).filter(key => key.startsWith('REACT_APP_')));
console.log('=== End Test ===');

export default null;