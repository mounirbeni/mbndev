const router = require('express').Router();
const {
  createProject,
  getMyProjects,
  getProject,
  getAllProjects,
  updateProject,
  uploadFile,
  getStats,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Client routes
router.post('/', protect, authorize('client', 'admin'), createProject);
router.get('/mine', protect, authorize('client'), getMyProjects);

// Admin routes
router.get('/', protect, authorize('admin'), getAllProjects);
router.get('/stats', protect, authorize('admin'), getStats);

// Shared
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.post('/:id/upload', protect, upload.single('file'), uploadFile);

module.exports = router;
