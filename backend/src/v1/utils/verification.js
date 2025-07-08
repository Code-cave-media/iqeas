export const allowRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        detail: "Access Denied: You do not have the required role",
      });
    }
    next();
  };
};
