const { clerkClient } = require('@clerk/backend');
const jwt = require('jsonwebtoken');

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authorization.split(' ')[1];
    
    // Verify JWT token using Clerk's method
    const claims = await clerkClient.verifyToken(token);
    
    // Attach userId to req
    req.userId = claims.sub;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;

