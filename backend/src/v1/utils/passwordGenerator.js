import crypto from "crypto";

export const generatePassword = (email, phonenumber) => {
  const unique = crypto.randomBytes(4).toString("hex");

  const emailPart = email.slice(0, 3).toLowerCase();
  const phonenumberPart = phonenumber.toString().slice(-3);

  const password = `${emailPart}${unique}${phonenumberPart}`;
  return password;
};
