const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getAllUsers,
  getUserById,
  toggleBlockUser,
  deleteUser,
} = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// All admin routes are protected
router.use(protect, adminOnly);

router.get('/dashboard', getDashboard);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id/block', toggleBlockUser);
router.delete('/users/:id', deleteUser);

module.exports = router;
