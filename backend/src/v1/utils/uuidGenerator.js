import crypto from "crypto";

export const uuidGenerator = () => {
  const uuid = crypto.randomUUID(); // Generates a cryptographically strong UUIDv4
  console.log(uuid);
  return uuid;
};
