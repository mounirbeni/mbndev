const router = require('express').Router();
const {
  createProject,
  getMyProjects,
  getProject,
  getAllProjects,
  updateProject,
  deleteProject,
  uploadFile,
  checkProjectUploadAuth,
  downloadProjectFile,
  getUploadMode,
  createUploadToken,
  registerUploadedFile,
  getStats,
  generateShareToken,
  revokeShareTokens,
  getProjectByShareToken,
} = require('../controllers/projectController');
const { protect, authorize, protectViaHeaderOrQueryToken } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { createProjectRules } = require('../middleware/validate');

// Public: view project by share token (no auth required — must be before /:id)
router.get('/share/:token', getProjectByShareToken);

// Client routes
router.post('/', protect, authorize('client', 'admin'), createProjectRules, createProject);
router.get('/mine', protect, authorize('client'), getMyProjects);

// Admin routes
router.get('/', protect, authorize('admin'), getAllProjects);
router.get('/stats', protect, authorize('admin'), getStats);
router.get('/upload-mode', protect, getUploadMode);

// Shared
router.get('/:id', protect, getProject);
router.put('/:id', protect, authorize('admin'), updateProject);
router.delete('/:id', protect, authorize('admin'), deleteProject);
router.post('/:id/upload', protect, checkProjectUploadAuth, upload.single('file'), uploadFile);
// Large files: the browser uploads straight to Vercel Blob with a token from
// here, then registers the finished file (see projectController).
router.post('/:id/upload-token', protect, checkProjectUploadAuth, createUploadToken);
router.post('/:id/files', protect, checkProjectUploadAuth, registerUploadedFile);
// A plain <a href> download link can't send an Authorization header, so
// this accepts a ?token= query param too — see protectViaHeaderOrQueryToken.
router.get('/:id/files/:fileId', protectViaHeaderOrQueryToken, downloadProjectFile);

// Admin: generate shareable link for a project
router.post('/:id/share', protect, authorize('admin'), generateShareToken);
// Admin: revoke every previously issued share link for a project
router.post('/:id/share/revoke', protect, authorize('admin'), revokeShareTokens);

module.exports = router;
