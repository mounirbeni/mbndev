// Vercel serverless function entry point for the Express backend.
// ncc (Vercel's bundler) follows this require() and bundles backend/src/ +
// backend/node_modules/ automatically, even though they sit outside the
// frontend Root Directory.
module.exports = require('../../backend/src/server.js');
