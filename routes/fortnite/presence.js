const express = require('express');
const router = express.Router();

router.get('/api/v1/_/:accountId/settings/subscriptions', (req, res) => {
  res.json([]);
});

router.get('/api/v1/_/:accountId/last-online', (req, res) => {
  res.json([]);
});

module.exports = router;
