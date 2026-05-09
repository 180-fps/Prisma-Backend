const express = require('express');
const router = express.Router();

router.get('/service/bulk/status', (req, res) => {
  res.json([
    {
      serviceInstanceId: 'fortnite',
      status: 'UP',
      message: 'Fortnite is online',
      maintenanceUri: null,
      overrideCatalogIds: [],
      allowedActions: ['PLAY', 'DOWNLOAD'],
      banned: false,
      launcherInfoDTO: {
        appName: 'Fortnite',
        catalogItemId: '4fe75bbc5a674f4f9b356b5c90567da5',
        namespace: 'fn'
      }
    }
  ]);
});

router.get('/service/Fortnite/status', (req, res) => {
  res.json({
    serviceInstanceId: 'fortnite',
    status: 'UP',
    message: 'Fortnite is online',
    maintenanceUri: null,
    overrideCatalogIds: [],
    allowedActions: ['PLAY', 'DOWNLOAD'],
    banned: false,
    launcherInfoDTO: {
      appName: 'Fortnite',
      catalogItemId: '4fe75bbc5a674f4f9b356b5c90567da5',
      namespace: 'fn'
    }
  });
});

module.exports = router;
