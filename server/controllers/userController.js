const firebaseStorage = require('../utils/firebaseStorage');

// Helper: Sanitize user response
const sanitizeUser = (user) => {
  return {
    id: user.id,
    phone: user.phone,
    firstName: user.firstName,
    lastName: user.lastName,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    profileComplete: user.profileComplete,
    createdAt: user.createdAt
  };
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await firebaseStorage.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ user: sanitizeUser(user) });
  } catch (error) {
    console.error('Get User Profile Error:', error);
    res.status(500).json({ message: 'Failed to get user profile', error: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const { name, email, address } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (address) {
      updateData.address = address;
      updateData.profileComplete = true;
    }

    const user = await firebaseStorage.updateUser(req.user.id, updateData);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Update User Profile Error:', error);
    res.status(500).json({ message: 'Failed to update profile', error: error.message });
  }
};

// @desc    Get all user addresses
// @route   GET /api/users/addresses
// @access  Private
const getUserAddresses = async (req, res) => {
  try {
    const user = await firebaseStorage.findUserById(req.user.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const addresses = user.addresses || [];
    res.status(200).json({ addresses, count: addresses.length });
  } catch (error) {
    console.error('Get User Addresses Error:', error);
    res.status(500).json({ message: 'Failed to get addresses', error: error.message });
  }
};

// @desc    Add new user address
// @route   POST /api/users/addresses
// @access  Private
const addUserAddress = async (req, res) => {
  try {
    const { address, city, state, zipCode, country, latitude, longitude, type, isDefault } = req.body;

    if (!address || !city || !state) {
      return res.status(400).json({ message: 'Address, city, and state are required' });
    }

    const newAddress = {
      id: Date.now().toString(),
      address,
      city,
      state,
      zipCode: zipCode || '',
      country: country || 'India',
      latitude: latitude || null,
      longitude: longitude || null,
      type: type || 'home',
      isDefault: isDefault || false,
      createdAt: new Date().toISOString()
    };

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const updatedAddresses = [...(user.addresses || []), newAddress];
    await firebaseStorage.updateUser(req.user.id, { addresses: updatedAddresses });

    res.status(201).json({
      message: 'Address added successfully',
      address: newAddress
    });
  } catch (error) {
    console.error('Add User Address Error:', error);
    res.status(500).json({ message: 'Failed to add address', error: error.message });
  }
};

// @desc    Update user address
// @route   PUT /api/users/addresses/:id
// @access  Private
const updateUserAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { address, city, state, zipCode, country, latitude, longitude, type } = req.body;

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(a => a.id === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    if (address) addresses[addressIndex].address = address;
    if (city) addresses[addressIndex].city = city;
    if (state) addresses[addressIndex].state = state;
    if (zipCode) addresses[addressIndex].zipCode = zipCode;
    if (country) addresses[addressIndex].country = country;
    if (latitude) addresses[addressIndex].latitude = latitude;
    if (longitude) addresses[addressIndex].longitude = longitude;
    if (type) addresses[addressIndex].type = type;

    await firebaseStorage.updateUser(req.user.id, { addresses });

    res.status(200).json({
      message: 'Address updated successfully',
      address: addresses[addressIndex]
    });
  } catch (error) {
    console.error('Update User Address Error:', error);
    res.status(500).json({ message: 'Failed to update address', error: error.message });
  }
};

// @desc    Delete user address
// @route   DELETE /api/users/addresses/:id
// @access  Private
const deleteUserAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addresses = user.addresses || [];
    const addressIndex = addresses.findIndex(a => a.id === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    addresses.splice(addressIndex, 1);
    await firebaseStorage.updateUser(req.user.id, { addresses });

    res.status(200).json({ message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Delete User Address Error:', error);
    res.status(500).json({ message: 'Failed to delete address', error: error.message });
  }
};

// @desc    Set default address
// @route   PUT /api/users/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await firebaseStorage.findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const addresses = user.addresses || [];

    // Reset all, then set specified as default
    addresses.forEach(addr => (addr.isDefault = false));
    const addressIndex = addresses.findIndex(a => a.id === id);

    if (addressIndex === -1) {
      return res.status(404).json({ message: 'Address not found' });
    }

    addresses[addressIndex].isDefault = true;
    await firebaseStorage.updateUser(req.user.id, { addresses });

    res.status(200).json({
      message: 'Default address set successfully',
      address: addresses[addressIndex]
    });
  } catch (error) {
    console.error('Set Default Address Error:', error);
    res.status(500).json({ message: 'Failed to set default address', error: error.message });
  }
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  getUserAddresses,
  addUserAddress,
  updateUserAddress,
  deleteUserAddress,
  setDefaultAddress
};
