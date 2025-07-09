import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generatePassword } from "../utils/passwordGenerator.js";
import { uuidGenerator } from "../utils/uuidGenerator.js";

export async function createUser(email, phonenumber, name, role) {
  const password = generatePassword(email, phonenumber);
  const hashedPassword = await bcrypt.hash(password, 10);
  const uniqueId = uuidGenerator();

  const userResult = await pool.query(
    `INSERT INTO users (email, phonenumber, name, role, password, active, user_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id, email, phonenumber, name, role, active`,
    [ email, phonenumber, name, role, hashedPassword, true, uniqueId]
  );

  return {
    user: userResult.rows[0],
    password,
  };
}


export async function updateUserActiveStatus(userId, isActive) {
  const result = await pool.query(
    `UPDATE users SET active = $1, updated_at = NOW() WHERE user_id = $2 RETURNING id, email, name, role, active`,
    [isActive, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}
