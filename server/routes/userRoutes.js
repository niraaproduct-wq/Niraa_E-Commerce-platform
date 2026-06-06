const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const {
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress,
  getUserProfile,
  updateUserProfile
} = require('../controllers/userController');

// Protected routes - require authentication
router.get('/profile',                protect, getUserProfile);
router.put('/profile',                protect, validate(schemas.users.updateProfile),  updateUserProfile);
router.get('/addresses',              protect, getUserAddresses);
router.post('/addresses',             protect, validate(schemas.users.addAddress),     addUserAddress);
router.put('/addresses/:id',          protect, validate(schemas.users.updateAddress),  updateUserAddress);
router.delete('/addresses/:id',       protect, deleteUserAddress);
router.put('/addresses/:id/default',  protect, setDefaultAddress);

module.exports = router;