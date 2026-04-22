const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  detectLocation,
  reverseGeocode,
  getAddressSuggestions,
  validateAddress
} = require('../controllers/locationController');

// Public routes
router.post('/detect', detectLocation);
router.post('/reverse', reverseGeocode);
router.get('/autocomplete', getAddressSuggestions);
router.post('/validate', validateAddress);

module.exports = router;