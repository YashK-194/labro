// utils/calculateDistance.js

/**
 * Calculates the distance between two geographical points using the Haversine formula
 * @param {Object} point1 - First point with latitude and longitude properties
 * @param {Object} point2 - Second point with latitude and longitude properties
 * @returns {number|null} Distance in kilometers, rounded to 1 decimal place, or null if coordinates are invalid
 */
const calculateDistance = (point1, point2) => {
    // Validate input points
    if (!point1?.latitude || !point1?.longitude || !point2?.latitude || !point2?.longitude) {
      return null;
    }
  
    // Convert coordinates to numbers to ensure proper calculation
    const lat1 = Number(point1.latitude);
    const lon1 = Number(point1.longitude);
    const lat2 = Number(point2.latitude);
    const lon2 = Number(point2.longitude);
  
    // Validate converted numbers
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) {
      return null;
    }
  
    // Convert latitude and longitude from degrees to radians
    const toRadian = angle => (Math.PI / 180) * angle;
    const phi1 = toRadian(lat1);
    const phi2 = toRadian(lat2);
    const deltaPhi = toRadian(lat2 - lat1);
    const deltaLambda = toRadian(lon2 - lon1);
  
    // Earth's radius in kilometers
    const R = 6371;
  
    // Haversine formula
    const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
             Math.cos(phi1) * Math.cos(phi2) *
             Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    // Calculate and round to 1 decimal place
    return Math.round(R * c * 10) / 10;
  };
  
  export default calculateDistance;
  
  // Example usage:
  /*
  const userLocation = {
    latitude: 12.9716,
    longitude: 77.5946
  };
  
  const serviceLocation = {
    latitude: 13.0827,
    longitude: 77.5050
  };
  
  const distance = calculateDistance(userLocation, serviceLocation);
  console.log(`Distance: ${distance} km`);
  */