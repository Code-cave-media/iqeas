import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const jwtSecret = process.env.JWT_SECRET;

export const generateJwtToken = (payload) => {
  return jwt.sign(payload, jwtSecret, { expiresIn: "1h" });
};

export const verifyJwtToken = (token) => {
  return jwt.verify(token, jwtSecret);
};
