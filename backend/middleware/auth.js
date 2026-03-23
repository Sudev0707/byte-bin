const { auth } = require('@clerk/clerk-sdk-node');

const authMiddleware = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid Authorization header' });
    }

    const token = authorization.split(' ')[1];

    // Verify token using Clerk SDK
    const session = await auth.verifyToken(token); // returns session info if valid

    req.userId = session.sub; // Clerk user ID
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;