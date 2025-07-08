import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ detail: "Access Denied: No token provided" });
  }

  try {
    const decode = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decode;
    next();
  } catch (e) {
    return res.status(403).json({ detail: "Access Denied: Invalid token" });
  }
};

export const authorizeRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.include(req.user.roles)) {
      return res.status(403).json({
        detail: "Access Denied: You do not have the required role",
      });
    }
  };
};
