const express = require('express');
const router = express.Router();
const User = require('../../models/User');
const { authenticateToken } = require('../../middleware/auth');

router.get('/:accountId', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findOne({ accountId });

    if (!user) {
      return res.status(404).json({
        errorCode: 'errors.com.epicgames.account.account_not_found',
        errorMessage: 'Account not found',
        messageVars: [accountId],
        numericErrorCode: 18007,
        originatingService: 'com.epicgames.account.public',
        intent: 'prod'
      });
    }

    res.json({
      id: user.accountId,
      displayName: user.displayName,
      name: user.displayName,
      email: user.email,
      failedLoginAttempts: 0,
      lastLogin: user.lastLogin,
      numberOfDisplayNameChanges: 0,
      ageGroup: 'UNKNOWN',
      headless: false,
      country: 'US',
      lastName: user.displayName,
      phoneNumber: '',
      preferredLanguage: 'en',
      canUpdateDisplayName: true,
      tfaEnabled: false,
      emailVerified: true,
      minorVerified: false,
      minorExpected: false,
      minorStatus: 'UNKNOWN'
    });
  } catch (error) {
    console.error('Account lookup error:', error);
    res.status(500).json({
      errorCode: 'errors.com.epicgames.common.server_error',
      errorMessage: 'Internal server error',
      messageVars: [],
      numericErrorCode: 1000,
      originatingService: 'com.epicgames.account.public',
      intent: 'prod'
    });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const { accountId } = req.query;
    
    if (!accountId) {
      return res.json([]);
    }

    const accountIds = Array.isArray(accountId) ? accountId : [accountId];
    const users = await User.find({ accountId: { $in: accountIds } });

    const accounts = users.map(user => ({
      id: user.accountId,
      displayName: user.displayName,
      externalAuths: {}
    }));

    res.json(accounts);
  } catch (error) {
    console.error('Account query error:', error);
    res.status(500).json([]);
  }
});

router.get('/:accountId/externalAuths', authenticateToken, async (req, res) => {
  try {
    res.json([]);
  } catch (error) {
    console.error('External auths error:', error);
    res.status(500).json([]);
  }
});

module.exports = router;
