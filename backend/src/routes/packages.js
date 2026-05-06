const router = require('express').Router();
const { getPackages, createPackage, updatePackage, deletePackage } = require('../controllers/packageController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getPackages); // public
router.post('/', protect, authorize('admin'), createPackage);
router.put('/:id', protect, authorize('admin'), updatePackage);
router.delete('/:id', protect, authorize('admin'), deletePackage);

module.exports = router;
