const express = require('express');
const router = express.Router();

router.get('/api/v1/events/Fortnite/download/:accountId', (req, res) => {
  res.json({
    player: null,
    events: [],
    templates: []
  });
});

module.exports = router;
