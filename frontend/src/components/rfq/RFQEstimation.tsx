/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { UploadCloud, FileText, X } from "lucide-react";

import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

interface FileWithLabel {
  file: File;
  label: string;
}

export default function RFQEstimationTable() {
  const { project_id } = useParams<{ project_id: string }>();
  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  /* ---------------- STATES ---------------- */
  const [table, setTable] = useState<any[]>([]);
  const [estimation, setEstimation] = useState<any>(null); // from table endpoint
  const [approved, setApproved] = useState<boolean>(false); // from approval endpoint
  const [loading, setLoading] = useState<boolean>(false);

  // project details for email
  const [project, setProject] = useState<any | null>(null);

  // modal + upload states (same idea as RFQPO)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filesWithLabel, setFilesWithLabel] = useState<FileWithLabel[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(
    "Please find attached the quotation for your project."
  );

  const inputRef = useRef<HTMLInputElement | null>(null);

  /* ---------------- FETCH ESTIMATION TABLE ---------------- */
  useEffect(() => {
    if (!project_id) return;

    const fetchTable = async () => {
      try {
        setLoading(true);

        const resp = await makeApiCall(
          "get",
          API_ENDPOINT.UPDATES_GET_ESTIMATION_TABLE(project_id),
          {},
          "application/json",
          authToken,
          "getEstimationTable"
        );

        if (resp.status !== 200) {
          toast.error("Failed to fetch estimation table");
          return;
        }

        const payload = resp.data?.data ?? resp.data;

        setTable(Array.isArray(payload?.table) ? payload.table : []);
        setEstimation(payload?.estimation ?? null);
      } catch (error) {
        toast.error("Something went wrong while fetching table");
      } finally {
        setLoading(false);
      }
    };

    fetchTable();
  }, [project_id, makeApiCall, authToken]);

  /* ---------------- FETCH APPROVAL STATUS ---------------- */
  useEffect(() => {
    if (!project_id) return;

    const fetchApprovalStatus = async () => {
      try {
        const response = await makeApiCall(
          "get",
          API_ENDPOINT.GET_ESTIMATION_PROJECTS_BY_PROJECT_ID(project_id),
          {},
          "application/json",
          authToken,
          "getEstimationApproval"
        );

        if (response.status === 200 && Array.isArray(response.data)) {
          setApproved(Boolean(response.data[0]?.approved));
        }
      } catch (error) {
        toast.error("Failed to fetch approval status");
      }
    };

    fetchApprovalStatus();
  }, [project_id, makeApiCall, authToken]);

  /* ---------------- FETCH PROJECT (FOR EMAIL FIELDS) ---------------- */
  useEffect(() => {
    if (!project_id) return;

    const fetchProject = async () => {
      try {
        const res = await makeApiCall(
          "get",
          API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
          {},
          "application/json",
          authToken,
          "getProjectById"
        );

        if (res.status === 200) {
          // Adjust depending on your API shape (res.data vs res.data.data)
          setProject(res.data?.data ?? res.data);
        } else {
          toast.error("Failed to load project");
        }
      } catch {
        toast.error("Failed to load project");
      }
    };

    fetchProject();
  }, [project_id, makeApiCall, authToken]);

  /* ---------------- LOADING ---------------- */
  if (loading) {
    return <div className="p-6">Loading estimation table...</div>;
  }

  /* ---------------- HELPERS ---------------- */
  const showHoursAndAmount = table.some(
    (row) => Number(row.hours) > 0 && Number(row.amount) > 0
  );

  const columnCount = showHoursAndAmount ? 7 : 5;

  /* ---------------- FILE HANDLERS (from RFQPO) ---------------- */
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const newFileList: FileWithLabel[] = Array.from(newFiles).map((file) => ({
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

  const removeFile = (index: number) => {
    setFilesWithLabel((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, newLabel: string) => {
    setFilesWithLabel((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: newLabel } : item))
    );
  };

  // Upload files to UPLOAD_FILE and return the *first* file_path for email
  const uploadFilesAndGetPath = async (): Promise<string | null> => {
    for (const { file, label } of filesWithLabel) {
      if (!label.trim()) {
        toast.error(`Please provide a label for ${file.name}`);
        return null;
      }

      const formData = new FormData();
      formData.append("label", label);
      formData.append("file", file);

      try {
        const response = await makeApiCall(
          "post",
          API_ENDPOINT.UPLOAD_FILE,
          formData,
          "application/form-data",
          authToken,
          "uploadFile"
        );

        if (response?.status === 201 || response?.status === 200) {
          // Adjust to actual shape: e.g., response.data.file_path or response.data.path
          const filePath =
            response.data?.file

          if (!filePath) {
            toast.error("Upload succeeded but no file_path returned");
            return null;
          }

          toast.success(`Uploaded: ${file.name}`);
          return filePath;
        } else {
          toast.error(
            `Upload failed: ${file.name} - ${
              (response as any)?.detail || "Unknown error"
            }`
          );
          return null;
        }
      } catch (err: any) {
        toast.error(`Failed to upload ${file.name}`);
        return null;
      }
    }

    toast.error("No files to upload");
    return null;
  };


  /* ---------------- SEND QUOTATION EMAIL ---------------- */
  const handleSendQuotation = async () => {
    if (!project_id) {
      toast.error("Project ID is missing");
      return;
    }

    if (!project) {
      toast.error("Project data not loaded");
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

    const filePath = await uploadFilesAndGetPath();
    if (!filePath) {
      setSubmitting(false);
      return;
    }

    // Map project fields to required backend fields
    const to_email = project.contact_person_email;
    const client_name =
      project.client_name
    const project_name =
      project.name

    if (!to_email || !client_name || !project_name || !message || !filePath) {
      toast.error("Missing required fields to send quotation");
      setSubmitting(false);
      return;
    }

    const payload = {
      to_email,
      client_name,
      project_name,
      message,
      file_path:
        "https://jegdjcrxqqxzcmboiblb.supabase.co/storage/v1/object/public/course_video/synapse-part-1.mp4",
    };

    try {
      const response = await makeApiCall(
        "post",
        API_ENDPOINT.SENT_QUOTAION_TO_CLIENT,
        payload,
        "application/json",
        authToken,
        "sendQuotationEmailToClient"
      );

      if (response?.status === 200 || response?.status === 201) {
        toast.success("Quotation email sent to client");
        setFilesWithLabel([]);
        setIsModalOpen(false);
      } else {
        toast.error(
          response?.data?.message ||
            (response as any)?.detail ||
            "Failed to send quotation"
        );
      }
    } catch (err) {
      toast.error("Failed to send quotation");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="p-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Estimation Table</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-2">SNo</th>
                <th className="p-2">Drawing No</th>
                <th className="p-2">Title</th>
                <th className="p-2">Deliverables</th>
                <th className="p-2">Discipline</th>
                {showHoursAndAmount && <th className="p-2">Hours</th>}
                {showHoursAndAmount && <th className="p-2">Amount</th>}
              </tr>
            </thead>

            <tbody>
              {table.length === 0 && (
                <tr>
                  <td
                    colSpan={columnCount}
                    className="p-4 text-center text-gray-500"
                  >
                    No estimation data found
                  </td>
                </tr>
              )}

              {table.map((row, index) => (
                <tr key={row.id ?? index} className="border-t">
                  <td className="p-2">{row.sno}</td>
                  <td className="p-2">{row.drawing_no}</td>
                  <td className="p-2">{row.title}</td>
                  <td className="p-2">{row.deliverables}</td>
                  <td className="p-2">{row.discipline}</td>

                  {showHoursAndAmount && (
                    <>
                      <td className="p-2">{row.hours}</td>
                      <td className="p-2">₹ {row.amount}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ACTIONS */}
        <div className="flex justify-end pt-4">
          <Button disabled={!approved} onClick={() => setIsModalOpen(true)}>
            Send to Client
          </Button>
        </div>
      </div>

      {/* --------- MODAL FOR DRAG & DROP UPLOAD + MESSAGE --------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 relative">
            <button
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              onClick={() => setIsModalOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-semibold mb-4">
              Send Quotation to Client
            </h3>

            {/* Optional message textarea */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Message to client
              </label>
              <textarea
                className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            {/* Drag & Drop Area (RFQPO style) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={`w-full cursor-pointer border-2 border-dashed rounded-xl p-8 transition flex flex-col items-center justify-center ${
                dragActive
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <UploadCloud className="h-10 w-10 text-gray-500 mb-3" />
              <p className="font-medium">
                Drag & drop files here or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Supported: PDF, DOC, DOCX, XLS, PNG, JPG
              </p>
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
            </div>

            {/* Uploaded Files List */}
            {filesWithLabel.length > 0 && (
              <div className="mt-6 space-y-2 max-h-56 overflow-y-auto">
                <h4 className="text-sm font-semibold mb-2">Files to Upload</h4>
                {filesWithLabel.map(({ file, label }, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between gap-3 border rounded-lg px-3 py-2"
                  >
                    <div className="flex items-center gap-2 flex-1">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <div className="flex flex-col w-full">
                        <Input
                          value={label}
                          onChange={(e) => updateLabel(index, e.target.value)}
                          placeholder="Enter file label (required)"
                          className="text-sm"
                        />
                        <span className="text-xs text-gray-500">
                          {file.name} • {(file.size / 1024 / 1024).toFixed(2)}{" "}
                          MB
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Footer buttons */}
            <div className="mt-6 flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button onClick={handleSendQuotation} disabled={submitting}>
                {submitting ? "Sending..." : "Upload & Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
