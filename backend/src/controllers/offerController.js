const { issueOffer } = require('../lib/offers');

// GET /api/offers — Issue a personal random offer (public)
exports.getOffer = (req, res) => {
  const offer = issueOffer();
  res.set('Cache-Control', 'no-store');
  res.json({ success: true, offer });
};
