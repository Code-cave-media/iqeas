import { PutObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "./do-space-config.js";
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";
import pool from "../config/db.js";
export async function uploadFileToDO(file, role) {
  const buffer = file.buffer;
  const extension = mime.extension(file.mimetype) || "bin";
  const filename = `${uuidv4()}.${extension}`;

  const folder = (() => {
    switch (role) {
      case "rfq":
        return "rfq-folder";
      case "pm":
        return "pm-folder";
      case "estimation":
        return "estimation-folder";
      case "document":
        return "document-folder";
      default:
        return "others"; 
    }
  })();

  const key = `${folder}/${filename}`;

  const uploadParams = {
    Bucket: process.env.DO_SPACES_BUCKET,
    Key: key,
    Body: buffer,
    ACL: "public-read",
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  return `https://${process.env.DO_SPACES_BUCKET}.${process.env.DO_SPACES_REGION}.digitaloceanspaces.com/${key}`;
}


export async function deleteFile(id) {
  await pool.query(
    `
    DELETE FROM uploaded_files WHERE id = $1
    `,
    [id]
  );
}
