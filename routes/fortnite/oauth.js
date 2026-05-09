const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const User = require('../../models/User');

router.post('/token', async (req, res) => {
  try {
    const { grant_type, username, password, exchange_code, refresh_token } = req.body;

    if (grant_type === 'password') {
      const user = await User.findOne({ email: username });

      if (!user) {
        return res.status(400).json({
          errorCode: 'errors.com.epicgames.account.invalid_account_credentials',
          errorMessage: 'Invalid account credentials',
          messageVars: [],
          numericErrorCode: 18031,
          originatingService: 'com.epicgames.account.public',
          intent: 'prod'
        });
      }

      if (user.banned) {
        return res.status(403).json({
          errorCode: 'errors.com.epicgames.account.account_not_active',
          errorMessage: 'Account is banned',
          messageVars: [],
          numericErrorCode: 18033,
          originatingService: 'com.epicgames.account.public',
          intent: 'prod'
        });
      }

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) {
        return res.status(400).json({
          errorCode: 'errors.com.epicgames.account.invalid_account_credentials',
          errorMessage: 'Invalid account credentials',
          messageVars: [],
          numericErrorCode: 18031,
          originatingService: 'com.epicgames.account.public',
          intent: 'prod'
        });
      }

      user.lastLogin = new Date();
      await user.save();

      const accessToken = jwt.sign(
        { accountId: user.accountId, email: user.email },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '8h' }
      );

      const refreshToken = jwt.sign(
        { accountId: user.accountId, type: 'refresh' },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '24h' }
      );

      return res.json({
        access_token: `eg1~${accessToken}`,
        expires_in: 28800,
        expires_at: new Date(Date.now() + 28800000).toISOString(),
        token_type: 'bearer',
        refresh_token: `eg1~${refreshToken}`,
        refresh_expires: 86400,
        refresh_expires_at: new Date(Date.now() + 86400000).toISOString(),
        account_id: user.accountId,
        client_id: 'ec684b8c687f479fadea3cb2ad83f5c6',
        internal_client: true,
        client_service: 'fortnite',
        displayName: user.displayName,
        app: 'fortnite',
        in_app_id: user.accountId,
        device_id: 'default'
      });
    }

    if (grant_type === 'exchange_code') {
      return res.status(400).json({
        errorCode: 'errors.com.epicgames.account.invalid_exchange_code',
        errorMessage: 'Invalid exchange code',
        messageVars: [],
        numericErrorCode: 18057,
        originatingService: 'com.epicgames.account.public',
        intent: 'prod'
      });
    }

    if (grant_type === 'refresh_token') {
      try {
        const decoded = jwt.verify(
          refresh_token.replace('eg1~', ''),
          process.env.JWT_SECRET || 'default_secret'
        );

        const user = await User.findOne({ accountId: decoded.accountId });

        if (!user) {
          return res.status(400).json({
            errorCode: 'errors.com.epicgames.account.invalid_refresh_token',
            errorMessage: 'Invalid refresh token',
            messageVars: [],
            numericErrorCode: 18036,
            originatingService: 'com.epicgames.account.public',
            intent: 'prod'
          });
        }

        const accessToken = jwt.sign(
          { accountId: user.accountId, email: user.email },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: '8h' }
        );

        const newRefreshToken = jwt.sign(
          { accountId: user.accountId, type: 'refresh' },
          process.env.JWT_SECRET || 'default_secret',
          { expiresIn: '24h' }
        );

        return res.json({
          access_token: `eg1~${accessToken}`,
          expires_in: 28800,
          expires_at: new Date(Date.now() + 28800000).toISOString(),
          token_type: 'bearer',
          refresh_token: `eg1~${newRefreshToken}`,
          refresh_expires: 86400,
          refresh_expires_at: new Date(Date.now() + 86400000).toISOString(),
          account_id: user.accountId,
          client_id: 'ec684b8c687f479fadea3cb2ad83f5c6',
          internal_client: true,
          client_service: 'fortnite',
          displayName: user.displayName,
          app: 'fortnite',
          in_app_id: user.accountId,
          device_id: 'default'
        });
      } catch (error) {
        return res.status(400).json({
          errorCode: 'errors.com.epicgames.account.invalid_refresh_token',
          errorMessage: 'Invalid refresh token',
          messageVars: [],
          numericErrorCode: 18036,
          originatingService: 'com.epicgames.account.public',
          intent: 'prod'
        });
      }
    }

    if (grant_type === 'client_credentials') {
      const clientToken = jwt.sign(
        { client: true },
        process.env.JWT_SECRET || 'default_secret',
        { expiresIn: '4h' }
      );

      return res.json({
        access_token: `eg1~${clientToken}`,
        expires_in: 14400,
        expires_at: new Date(Date.now() + 14400000).toISOString(),
        token_type: 'bearer',
        client_id: 'ec684b8c687f479fadea3cb2ad83f5c6',
        internal_client: true,
        client_service: 'fortnite'
      });
    }

    res.status(400).json({
      errorCode: 'errors.com.epicgames.common.oauth.unsupported_grant_type',
      errorMessage: `Unsupported grant type: ${grant_type}`,
      messageVars: [grant_type],
      numericErrorCode: 1016,
      originatingService: 'com.epicgames.account.public',
      intent: 'prod'
    });
  } catch (error) {
    console.error('OAuth token error:', error);
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

router.delete('/sessions/kill/:token', (req, res) => {
  res.status(204).end();
});

router.delete('/sessions/kill', (req, res) => {
  res.status(204).end();
});

router.get('/verify', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '').replace('eg1~', '');

    if (!token) {
      return res.status(401).json({
        errorCode: 'errors.com.epicgames.common.authentication.authentication_failed',
        errorMessage: 'Authentication failed',
        messageVars: [],
        numericErrorCode: 1032,
        originatingService: 'com.epicgames.account.public',
        intent: 'prod'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    const user = await User.findOne({ accountId: decoded.accountId });

    if (!user) {
      return res.status(401).json({
        errorCode: 'errors.com.epicgames.common.authentication.token_verification_failed',
        errorMessage: 'Token verification failed',
        messageVars: [],
        numericErrorCode: 1014,
        originatingService: 'com.epicgames.account.public',
        intent: 'prod'
      });
    }

    res.json({
      token: `eg1~${token}`,
      session_id: uuidv4().replace(/-/g, ''),
      token_type: 'bearer',
      client_id: 'ec684b8c687f479fadea3cb2ad83f5c6',
      internal_client: true,
      client_service: 'fortnite',
      account_id: user.accountId,
      expires_in: 28800,
      expires_at: new Date(Date.now() + 28800000).toISOString(),
      auth_method: 'exchange_code',
      displayName: user.displayName,
      app: 'fortnite',
      in_app_id: user.accountId
    });
  } catch (error) {
    res.status(401).json({
      errorCode: 'errors.com.epicgames.common.authentication.token_verification_failed',
      errorMessage: 'Token verification failed',
      messageVars: [],
      numericErrorCode: 1014,
      originatingService: 'com.epicgames.account.public',
      intent: 'prod'
    });
  }
});

module.exports = router;
