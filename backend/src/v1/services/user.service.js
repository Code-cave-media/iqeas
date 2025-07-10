import pool from "../config/db.js";
import bcrypt from "bcryptjs";
import { generatePassword } from "../utils/passwordGenerator.js";
import { uuidGenerator } from "../utils/uuidGenerator.js";

export async function createUser(
  email,
  phoneNumber,
  name,
  role,
  active = true
) {
  const password = generatePassword(email, phoneNumber);
  const hashedPassword = await bcrypt.hash(password, 10);
  const uniqueId = uuidGenerator();

  const userResult = await pool.query(
    `INSERT INTO users (email, phoneNumber, name, role, password, active, user_id) 
     VALUES ($1, $2, $3, $4, $5, $6, $7) 
     RETURNING id, email, phoneNumber, name, role, active`,
    [email, phoneNumber, name, role, hashedPassword, active, uniqueId]
  );

  return {
    user: userResult.rows[0],
    password,
  };
}

export async function updateUserActiveStatus(id, isActive) {
  const result = await pool.query(
    `UPDATE users SET active = $1, updated_at = NOW() WHERE id = $2 RETURNING id, email, name, role, active`,
    [isActive, id]
  );

  if (result.rows.length === 0) {
    throw new Error("User not found");
  }

  return result.rows[0];
}

export async function updateUserData(
  id,
  { name, email, phoneNumber, active, role }
) {
  const result = await pool.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phoneNumber = COALESCE($3, phoneNumber),
      active = COALESCE($4, active),
      role = COALESCE($5, role),
      updated_at = NOW()
    WHERE id = $6
    RETURNING id, email, phoneNumber, name, role, active`,
    [name, email, phoneNumber, active, role, id]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  return result.rows[0];
}

export async function DeleteUser(id) {
  await pool.query(
    `
    UPDATE users SET deleted=true where id=$1
    `,
    [id]
  );
  return None;
}
export async function getAllUsers() {
  const result = await pool.query(
    `SELECT id, email, name, role, phonenumber, active, created_at FROM users ORDER BY created_at DESC`
  );
  return result.rows;
}
