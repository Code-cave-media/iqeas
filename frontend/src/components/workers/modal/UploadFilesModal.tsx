import React, { useCallback, useState } from "react";
import { X, Upload, File } from "lucide-react";
import { useDropzone } from "react-dropzone";

import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";

interface Props {
  open: boolean;
  onClose: () => void;
  deliverableId: number;
  projectId: string | undefined;
  onSuccess: () => void;
}

export default function UploadFilesModal({
  open,
  onClose,
  deliverableId,
  projectId,
  onSuccess,
}: Props) {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);

  /* ---------- DROPZONE ---------- */
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles((prev) => [...prev, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: true,
  });

  if (!open) return null;

  /* ---------- UPLOAD & CHECK-IN ---------- */
  const handleSubmit = async () => {
    if (!files.length) return;

    try {
      setUploading(true);

      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("project_id", projectId!);

      // 1️⃣ Upload files
      const uploadRes = await makeApiCall(
        "post",
        API_ENDPOINT.UPLOAD_FILE,
        formData,
        "application/json",
        authToken
      );

      const uploadedFileIds = uploadRes?.data?.uploaded_file_ids;

      if (!uploadedFileIds?.length) {
        throw new Error("File upload failed");
      }

      // 2️⃣ Check-in deliverable
      await makeApiCall(
        "post",
        API_ENDPOINT.CHECK_IN_DELIVERABLE(deliverableId),
        {},
        "application/json",
        authToken
      );

      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 space-y-5">
        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Upload Deliverable Files</h3>
          <button onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* DROP ZONE */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
            ${isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
        >
          <input {...getInputProps()} />
          <Upload className="mx-auto mb-3 text-gray-500" />
          <p className="text-sm text-gray-600">
            Drag & drop files here, or click to select
          </p>
        </div>

        {/* FILE LIST */}
        {files.length > 0 && (
          <ul className="space-y-2 max-h-40 overflow-auto">
            {files.map((f, i) => (
              <li
                key={i}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <File size={14} />
                {f.name}
              </li>
            ))}
          </ul>
        )}

        {/* ACTIONS */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm rounded-lg border"
          >
            Cancel
          </button>

          <button
            disabled={!files.length || uploading}
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg bg-blue-600 text-white
              disabled:opacity-50"
          >
            {uploading ? "Uploading..." : "Upload & Check In"}
          </button>
        </div>
      </div>
    </div>
  );
}
