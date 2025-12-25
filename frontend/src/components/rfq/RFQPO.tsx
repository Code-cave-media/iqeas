/* eslint-disable @typescript-eslint/no-explicit-any */

import { useRef, useState } from "react";
import { UploadCloud, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

interface FileWithLabel {
  file: File;
  label: string;
}

export default function RFQPO() {
  const { project_id } = useParams<{ project_id: string }>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [filesWithLabel, setFilesWithLabel] = useState<FileWithLabel[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  // Handle file selection / drop
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const newFileList = Array.from(newFiles).map((file) => ({
      file,
      label: file.name,
    }));
    setFilesWithLabel((prev) => [...prev, ...newFileList]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  // Remove a file
  const removeFile = (index: number) => {
    setFilesWithLabel((prev) => prev.filter((_, i) => i !== index));
  };

  // Update label
  const updateLabel = (index: number, newLabel: string) => {
    setFilesWithLabel((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: newLabel } : item))
    );
  };

  // Upload files — matches RFCDashboard.tsx exactly
  const uploadFiles = async (): Promise<number[] | null> => {
    const uploadedIds: number[] = [];

    for (const { file, label } of filesWithLabel) {
      if (!label.trim()) {
        toast.error(`Please provide a label for ${file.name}`);
        return null;
      }

      const formData = new FormData();
      formData.append("label", label);
      formData.append("file", file);

      console.log("Preparing upload:", {
        label,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
      });

      try {
        const response = await makeApiCall(
          "post",
          API_ENDPOINT.UPLOAD_FILE,
          formData,
          "application/form-data",
          authToken,
          "uploadFile"
        );

        console.log("Upload response:", response);

        if (response?.status === 201 || response?.status === 200) {
          const fileId = response.data?.id;
          if (fileId) {
            uploadedIds.push(fileId);
            toast.success(`Uploaded: ${file.name}`);
          } else {
            toast.error(`No ID returned for ${file.name}`);
            return null;
          }
        } else {
          toast.error(
            `Upload failed: ${file.name} - ${
              response?.detail || "Unknown error"
            }`
          );
          return null;
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    }

    return uploadedIds;
  };

  // Submit PO — now includes required received_date
  const submitPO = async () => {
    if (!project_id) {
      toast.error("Project ID is missing");
      return;
    }

    if (filesWithLabel.length === 0) {
      toast.error("Please upload at least one file");
      return;
    }

    const missingLabel = filesWithLabel.find((f) => !f.label.trim());
    if (missingLabel) {
      toast.error(`Please provide a label for ${missingLabel.file.name}`);
      return;
    }

    setSubmitting(true);

    const uploadedIds = await uploadFiles();
    if (!uploadedIds) {
      setSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

    const payload = {
      project_id: Number(project_id),
      po_number: `PO-${project_id}-${today.replace(/-/g, "")}`, // e.g., PO-123-20251222
      received_date: today, // ← Required field to fix 500 error
      uploaded_file_ids: uploadedIds,
      // Optional fields (add if your backend requires them)
      // notes: "",
      // terms_and_conditions: "",
      // received_by_user_id: currentUserId, // if you have it
    };

    try {
      const response = await makeApiCall(
        "post",
        API_ENDPOINT.UPDATE_UPLOAD_PO,
        payload,
        "application/json",
        authToken,
        "createPO"
      );

      if (response?.status === 201 || response?.status === 200) {
        toast.success("Purchase Order uploaded successfully");
        setFilesWithLabel([]); // Clear files on success
      } else {
        toast.error(
          `Failed to create PO: ${response?.detail || "Unknown error"}`
        );
      }
    } catch (err) {
      toast.error("Failed to submit PO");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full">
      <div className="p-6">
        {/* Drag & Drop Area */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`w-full h-[60vh] cursor-pointer border-2 border-dashed rounded-xl p-12 transition flex flex-col items-center justify-center ${
            dragActive
              ? "border-blue-500 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          }`}
        >
          <UploadCloud className="mx-auto h-20 w-20 text-gray-400 mb-6" />
          <p className="text-lg font-medium text-gray-700 mb-2">
            Drag & drop files here or{" "}
            <span className="text-blue-600 font-semibold">click to upload</span>
          </p>
          <p className="text-sm text-gray-500 mb-4">
            Supported: PDF, DOC, DOCX, XLS, PNG, JPG
          </p>

          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Uploaded Files List */}
        {filesWithLabel.length > 0 && (
          <div className="mt-8 space-y-4">
            <h3 className="text-lg font-semibold">Files to Upload</h3>
            {filesWithLabel.map(({ file, label }, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-gray-50 gap-4"
              >
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-6 w-6 text-blue-600" />
                  <div className="flex-1 min-w-0">
                    <Input
                      value={label}
                      onChange={(e) => updateLabel(index, e.target.value)}
                      placeholder="Enter file label (required)"
                      className="text-sm"
                    />
                    <p className="text-xs text-gray-500 mt-1 truncate">
                      {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end mt-8">
          <Button
            onClick={submitPO}
            disabled={filesWithLabel.length === 0 || submitting}
            className="bg-blue-600 hover:bg-blue-700 px-8"
          >
            {submitting ? "Uploading..." : "Upload Purchase Order"}
          </Button>
        </div>
      </div>
    </section>
  );
}
