const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.replace('Bearer ', '').replace('eg1~', '');

  if (!token) {
    return res.status(401).json({
      errorCode: 'errors.com.epicgames.common.authentication.authentication_failed',
      errorMessage: 'Authentication failed',
      messageVars: [],
      numericErrorCode: 1032,
      originatingService: 'com.epicgames.common',
      intent: 'prod'
    });
  }

  jwt.verify(token, process.env.JWT_SECRET || 'default_secret', (err, user) => {
    if (err) {
      return res.status(403).json({
        errorCode: 'errors.com.epicgames.common.authentication.token_verification_failed',
        errorMessage: 'Token verification failed',
        messageVars: [],
        numericErrorCode: 1014,
        originatingService: 'com.epicgames.common',
        intent: 'prod'
      });
    }

    req.user = user;
    next();
  });
}

module.exports = { authenticateToken };
