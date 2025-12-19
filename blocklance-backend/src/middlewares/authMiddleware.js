// Middleware: verifies backend JWT and attaches MongoDB user to req.user
import { verifyToken } from '../utils/jwt.js';
import { User } from '../modules/users/user.model.js';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select('-__v');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = user;
    // eslint-disable-next-line no-console
    console.log(`✅ Authenticated request from ${user._id.toString()}`);
    return next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Auth middleware error:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

export default authMiddleware;
