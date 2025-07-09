import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generatePassword } from "../utils/passwordGenerator.js";
import { uuidGenerator } from "../utils/uuidGenerator.js";

export async function createUser(email, phoneNumber, name, role, active = true) {
  const password = generatePassword(email, phoneNumber);
  const hashedPassword = await bcrypt.hash(password, 10);
  const uniqueId = uuidGenerator();

  const userResult = await pool.query(
    `INSERT INTO users (email, phoneNumber, name, role, password, active, user_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id, email, phoneNumber, name, role, active`,
    [ email, phoneNumber, name, role, hashedPassword, active, uniqueId]
  );

  return {
    user: userResult.rows[0],
    password,
  };
}
