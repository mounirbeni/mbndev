const router = require('express').Router();
const {
  createProject,
  getMyProjects,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  uploadFile,
  getStats,
  generateShareToken,
  getProjectByShareToken,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public: view project by share token (no auth required — must be before /:id)
router.get('/share/:token', getProjectByShareToken);

// Client routes
router.post('/', protect, authorize('client', 'admin'), createProject);
router.get('/mine', protect, authorize('client'), getMyProjects);

// Admin routes
router.get('/', protect, authorize('admin'), getAllProjects);
router.get('/stats', protect, authorize('admin'), getStats);

// Shared
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);
router.post('/:id/upload', protect, upload.single('file'), uploadFile);

// Admin: generate shareable link for a project
router.post('/:id/share', protect, authorize('admin'), generateShareToken);

module.exports = router;
