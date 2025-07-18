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

  // Check for soft-deleted user
  const existingUser = await pool.query(
    `SELECT id FROM users WHERE email = $1 AND is_deleted = true LIMIT 1`,
    [email]
  );

  if (existingUser.rows.length > 0) {
    // Update soft-deleted user with new data
    const userId = existingUser.rows[0].id;

    const result = await pool.query(
      `UPDATE users SET
        phoneNumber = $1,
        name = $2,
        role = $3,
        password = $4,
        active = $5,
        is_deleted = false,
        user_id = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING id, email, phoneNumber, name, role, active`,
      [phoneNumber, name, role, hashedPassword, active, uniqueId, userId]
    );

    return {
      user: result.rows[0],
      password,
    };
  }

  // Insert as new user
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
  { name, email, phoneNumber, active, role, is_deleted = false }
) {
  const result = await pool.query(
    `UPDATE users SET
      name = COALESCE($1, name),
      email = COALESCE($2, email),
      phoneNumber = COALESCE($3, phoneNumber),
      active = COALESCE($4, active),
      role = COALESCE($5, role),
      is_deleted = $6,
      updated_at = NOW()
    WHERE id = $7
    RETURNING id, email, phoneNumber, name, role, active, is_deleted`,
    [name, email, phoneNumber, active, role, is_deleted, id]
  );
  if (result.rows.length === 0) {
    throw new Error("User not found");
  }
  return result.rows[0];
}

export async function DeleteUser(id) {
  await pool.query(
    `
    UPDATE users SET is_deleted=true where id=$1
    `,
    [id]
  );
  return None;
}
export async function getAllUsers() {
  const result = await pool.query(
    `SELECT id, email, name, role, phonenumber, active, created_at FROM users where is_deleted = false ORDER BY created_at DESC`
  );
  return result.rows;
}

export async function getUsersByRole(role) {
  const result = await pool.query(
    `SELECT id, email, name, role, phonenumber, active, created_at FROM users WHERE role = $1 AND is_deleted = false ORDER BY created_at DESC`,
    [role]
  );
  return result.rows;
}
