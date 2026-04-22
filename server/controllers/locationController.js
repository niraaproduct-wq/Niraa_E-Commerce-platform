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
    console.error('Detect Location Error:', error);
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
    
    // TODO: Integrate with Google Maps Geocoding API
    // For now, return mock response
    const mockAddress = {
      address: '123 Sample Street',
      city: 'Bangalore',
      state: 'Karnataka',
      zipCode: '560001',
      country: 'India',
      latitude,
      longitude
    };
    
    res.status(200).json({
      message: 'Address retrieved successfully',
      address: mockAddress,
      note: 'Mock data - integrate with Google Maps API in production'
    });
    
  } catch (error) {
    console.error('Reverse Geocode Error:', error);
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
    console.error('Get Address Suggestions Error:', error);
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
    console.error('Validate Address Error:', error);
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