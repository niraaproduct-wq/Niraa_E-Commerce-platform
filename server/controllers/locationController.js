const logger = require('../utils/logger');
// Location Controller - Handles geolocation and address services
// In production, integrate with Google Maps API or similar service

// @desc    Detect user's current location from coordinates
// @route   POST /api/locations/detect
// @access  Public
const detectLocation = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }
    
    // Validate coordinates
    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ 
        message: 'Invalid coordinates' 
      });
    }
    
    res.status(200).json({
      message: 'Location detected',
      coordinates: {
        latitude,
        longitude
      },
      note: 'In production, use Google Maps Geocoding API to get address details'
    });
    
  } catch (error) {
    logger.error('Detect Location Error:', error);
    res.status(500).json({ 
      message: 'Failed to detect location', 
      error: error.message 
    });
  }
};

// @desc    Reverse geocode - Get address from coordinates
// @route   POST /api/locations/reverse
// @access  Public
const reverseGeocode = async (req, res) => {
  try {
    const { latitude, longitude } = req.body;
    
    if (!latitude || !longitude) {
      return res.status(400).json({ 
        message: 'Latitude and longitude are required' 
      });
    }

    // High Accuracy: Google Maps API (Optional)
    const googleApiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (googleApiKey) {
      try {
        const googleRes = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleApiKey}`
        );
        const googleData = await googleRes.json();
        
        if (googleData.status === 'OK' && googleData.results.length > 0) {
          const result = googleData.results[0];
          const getComponent = (type) => {
            const comp = result.address_components.find(c => c.types.includes(type));
            return comp ? comp.long_name : '';
          };

          return res.status(200).json({
            message: 'Address retrieved successfully (Google)',
            address: {
              street: [getComponent('sublocality_level_1'), getComponent('route')].filter(Boolean).join(', ') || result.formatted_address.split(',')[0],
              city: getComponent('locality') || getComponent('administrative_area_level_2') || 'Dharmapuri',
              state: getComponent('administrative_area_level_1') || '',
              zipCode: getComponent('postal_code') || '',
              country: getComponent('country') || 'India',
              latitude,
              longitude,
              displayName: result.formatted_address
            },
            source: 'google'
          });
        }
      } catch (err) {
        logger.error('Google Maps Geocode Error, falling back to OSM:', err);
      }
    }

    // Fallback: Nominatim (OSM)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          'User-Agent': 'Niraa-Website/1.0',
          'Accept-Language': 'en-IN,en;q=0.9'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Location service returned ${response.status}`);
    }

    const data = await response.json();
    
    if (!data || !data.address) {
      return res.status(404).json({
        message: 'Address not found for these coordinates'
      });
    }

    // Intelligent Indian Address Parsing
    // Nominatim returns very specific fields. We need to group them logically.
    
    // 1. Street / Area (Specific location)
    // Combine road, suburb, village, neighbourhood
    const streetParts = [
      data.address.house_number || '',
      data.address.road || '',
      data.address.neighbourhood || '',
      data.address.suburb || '',
      data.address.village || ''
    ].filter(Boolean);
    
    const street = streetParts.length > 0 ? streetParts.join(', ') : data.display_name.split(',')[0];

    // 2. City / Town (The main administrative area)
    // For many users in India, the "village" is Beragapalli but the "city" is Dharmapuri.
    // Dharmapuri might be in 'county', 'district', or 'state_district'.
    const city = data.address.city || 
                 data.address.town || 
                 data.address.municipality ||
                 data.address.district ||
                 data.address.county ||
                 data.address.state_district ||
                 'Dharmapuri';

    const addressDetails = {
      street: street,
      city: city,
      state: data.address.state || '',
      zipCode: data.address.postcode || '',
      country: data.address.country || 'India',
      latitude,
      longitude,
      displayName: data.display_name
    };
    
    res.status(200).json({
      message: 'Address retrieved successfully',
      address: addressDetails,
      source: 'osm'
    });
    
  } catch (error) {
    logger.error('Reverse Geocode Error:', error);
    res.status(500).json({ 
      message: 'Failed to reverse geocode', 
      error: error.message 
    });
  }
};

// @desc    Get address suggestions/autocomplete
// @route   GET /api/locations/autocomplete
// @access  Public
const getAddressSuggestions = async (req, res) => {
  try {
    const { input } = req.query;
    
    if (!input || input.length < 2) {
      return res.status(400).json({ 
        message: 'Input must be at least 2 characters' 
      });
    }
    
    // TODO: Integrate with Google Places Autocomplete API
    // For now, return mock suggestions
    const mockSuggestions = [
      {
        id: '1',
        description: '123 ' + input + ' Street, Bangalore, Karnataka',
        placeId: 'place_1',
        mainText: '123 ' + input + ' Street',
        secondaryText: 'Bangalore, Karnataka'
      },
      {
        id: '2',
        description: '456 ' + input + ' Road, Bangalore, Karnataka',
        placeId: 'place_2',
        mainText: '456 ' + input + ' Road',
        secondaryText: 'Bangalore, Karnataka'
      }
    ];
    
    res.status(200).json({
      message: 'Suggestions retrieved',
      suggestions: mockSuggestions,
      note: 'Mock data - integrate with Google Places API in production'
    });
    
  } catch (error) {
    logger.error('Get Address Suggestions Error:', error);
    res.status(500).json({ 
      message: 'Failed to get suggestions', 
      error: error.message 
    });
  }
};

// @desc    Validate address format
// @route   POST /api/locations/validate
// @access  Public
const validateAddress = async (req, res) => {
  try {
    const { address, city, state, zipCode } = req.body;
    
    if (!address || !city || !state) {
      return res.status(400).json({ 
        message: 'Address, city, and state are required' 
      });
    }
    
    // Basic validation
    const isValid = {
      address: address.length > 5,
      city: city.length > 2,
      state: state.length > 2,
      zipCode: !zipCode || /^\d{6}$/.test(zipCode) // Indian zip codes are 6 digits
    };
    
    const allValid = Object.values(isValid).every(v => v);
    
    res.status(200).json({
      message: allValid ? 'Address is valid' : 'Address validation failed',
      isValid: allValid,
      validationDetails: isValid
    });
    
  } catch (error) {
    logger.error('Validate Address Error:', error);
    res.status(500).json({ 
      message: 'Failed to validate address', 
      error: error.message 
    });
  }
};

module.exports = {
  detectLocation,
  reverseGeocode,
  getAddressSuggestions,
  validateAddress
};