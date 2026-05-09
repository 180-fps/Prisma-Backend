const express = require('express');
const router = express.Router();

router.get('/api/v1/version', (req, res) => {
  res.json({
    app: 'fortnite',
    serverDate: new Date().toISOString(),
    overridePropertiesVersion: 'unknown',
    cln: '15.00',
    build: '15.00',
    moduleName: 'Fortnite-Core',
    buildDate: '2021-01-01T00:00:00.000Z',
    version: '15.00',
    branch: 'Release-15.00',
    modules: {}
  });
});

router.get('/api/version', (req, res) => {
  res.json({
    version: '15.00'
  });
});

module.exports = router;
