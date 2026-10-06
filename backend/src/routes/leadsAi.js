const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const c = require('../controllers/leadsAiController');

router.get('/admin/accounts', protect, authorize('admin'), c.adminListAccounts);
router.put('/admin/access', protect, authorize('admin'), c.adminSetAccess);

router.use(protect, c.requireAccess);
router.get('/me', c.me);
router.put('/keys', c.saveKeys);
router.post('/search', c.search);
router.post('/analyze', c.analyze);
router.post('/message', c.message);
router.get('/prospects', c.listProspects);
router.get('/prospects/export', c.exportProspects);
router.post('/prospects', c.saveProspect);
router.put('/prospects/:id', c.updateProspect);
router.delete('/prospects/:id', c.deleteProspect);

module.exports = router;
