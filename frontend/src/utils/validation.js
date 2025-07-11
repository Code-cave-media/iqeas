// src/lib/validation.js

export function validateProjectForm(form) {
  const requiredFields = [
    "name",
    "clientName",
    "clientCompany",
    "location",
    "projectType",
    "received_date",
    "contactPerson",
    "contactPhone",
    "contactEmail",
    "priority",
  ];
  const missing = [];
  for (const field of requiredFields) {
    if (
      !form[field] ||
      (typeof form[field] === "string" && form[field].trim() === "")
    ) {
      missing.push(field);
    }
  }
  return missing;
}
