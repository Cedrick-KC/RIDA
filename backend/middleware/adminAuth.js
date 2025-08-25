// middleware/adminAuth.js
module.exports = (req, res, next) => {
  // The auth middleware must run before this to populate req.user
  if (req.user && req.user.userType === 'admin') {
    next();
  } else {
    return res.status(403).json({ msg: 'Authorization denied: Not an admin' });
  }
};