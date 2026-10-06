const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/localGrowthController');

router.get('/public/:token', c.publicReport); // shared report, no sign-in

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/settings', c.saveSettings);
router.post('/search', c.search);
router.get('/reports', c.listReports);
router.post('/reports', c.createReport);
router.get('/reports/:id', c.getReport);
router.delete('/reports/:id', c.deleteReport);

module.exports = router;
