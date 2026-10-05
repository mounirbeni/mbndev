const router = require('express').Router();
const { getOffer } = require('../controllers/offerController');

router.get('/', getOffer); // public

module.exports = router;
