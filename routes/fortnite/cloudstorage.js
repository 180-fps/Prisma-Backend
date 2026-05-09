const express = require('express');
const router = express.Router();

const defaultHotfixes = `[
  {
    "name": "FortPlaylistAthena",
    "bEnabled": true
  }
]`;

router.get('/system', (req, res) => {
  res.json([
    {
      uniqueFilename: 'DefaultGame.ini',
      filename: 'DefaultGame.ini',
      hash: '603E6907398C7E74E25C0AE8EC3A03FFAC7C9BB4',
      hash256: '973124FFC4A03E66D6A4458E587D5D6146F71FC57F359C8D516E0B12A50AB0D9',
      length: defaultHotfixes.length,
      contentType: 'application/octet-stream',
      uploaded: '2021-12-02T00:00:00.000Z',
      storageType: 'S3',
      storageIds: {},
      doNotCache: false
    }
  ]);
});

router.get('/system/DefaultGame.ini', (req, res) => {
  res.setHeader('Content-Type', 'application/octet-stream');
  res.send(defaultHotfixes);
});

router.get('/system/config', (req, res) => {
  res.json([]);
});

router.get('/user/:accountId', (req, res) => {
  res.json([]);
});

router.get('/user/:accountId/:fileName', (req, res) => {
  res.status(404).json({
    errorCode: 'errors.com.epicgames.cloudstorage.file_not_found',
    errorMessage: 'File not found',
    messageVars: [],
    numericErrorCode: 1004,
    originatingService: 'com.epicgames.cloudstorage',
    intent: 'prod'
  });
});

router.put('/user/:accountId/:fileName', (req, res) => {
  res.status(204).end();
});

module.exports = router;
