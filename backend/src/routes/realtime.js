const router = require('express').Router();
const { stream } = require('../controllers/realtimeController');

// SSE endpoint — auth via ?token=<jwt> query param (EventSource limitation)
router.get('/stream', stream);

module.exports = router;
