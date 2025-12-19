export const roleCheck = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user || !req.user.role) {
        return res.status(403).json({ message: 'Unauthorized: No user info' });
      }
      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
      }
      return next();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('roleCheck error:', err);
      return res.status(500).json({ message: 'Server error in roleCheck' });
    }
  };
};
