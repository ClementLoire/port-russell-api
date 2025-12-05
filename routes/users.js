const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, userController.getAllUsers);
router.get('/:email', protect, userController.getUserByEmail);
router.post('/', protect, userController.createUser);
router.put('/:email', protect, userController.updateUser);
router.delete('/:email', protect, userController.deleteUser);

module.exports = router;