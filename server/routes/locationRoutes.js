const express = require('express');
const router = express.Router();
const {
  detectLocation,
  reverseGeocode,
  getAddressSuggestions,
  validateAddress
} = require('../controllers/locationController');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');

router.post('/detect',       validate(schemas.locations.detect),   detectLocation);
router.post('/reverse',      validate(schemas.locations.reverse),  reverseGeocode);
router.get('/autocomplete',  getAddressSuggestions);
router.post('/validate',     validate(schemas.locations.validate), validateAddress);

module.exports = router;