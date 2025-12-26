/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useState } from "react";
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

  const [poData, setPoData] = useState<any | null>(null);
  const [loadingPo, setLoadingPo] = useState(false);

  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  /* ---------------- FETCH EXISTING PO ---------------- */
  const fetchPurchaseOrder = async () => {
    if (!project_id) return;

    try {
      setLoadingPo(true);

      const res = await makeApiCall(
        "get",
        API_ENDPOINT.GET_PURCHASE_ORDER(project_id),
        {},
        "application/json",
        authToken,
        "getPurchaseOrder"
      );

      if (res.status === 200) {
        const list = res.data?.data ?? res.data ?? [];
        const first = Array.isArray(list) && list.length > 0 ? list[0] : null;
        setPoData(first);
      } else {
        setPoData(null);
      }
    } catch {
      setPoData(null);
    } finally {
      setLoadingPo(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project_id]);

  /* ---------------- FILE HANDLERS ---------------- */
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const mapped = Array.from(newFiles).map((file) => ({
      file,
      label: file.name,
    }));

    setFilesWithLabel((prev) => [...prev, ...mapped]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFilesWithLabel((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, value: string) => {
    setFilesWithLabel((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: value } : item))
    );
  };

  /* ---------------- UPLOAD FILES ---------------- */
  const uploadFiles = async (): Promise<number[] | null> => {
    const uploadedIds: number[] = [];

    for (const { file, label } of filesWithLabel) {
      if (!label.trim()) {
        toast.error(`Label required for ${file.name}`);
        return null;
      }

      const formData = new FormData();
      formData.append("label", label);
      formData.append("file", file);

      try {
        const res = await makeApiCall(
          "post",
          API_ENDPOINT.UPLOAD_FILE,
          formData,
          "application/form-data",
          authToken,
          "uploadFile"
        );

        if (res?.status === 200 || res?.status === 201) {
          uploadedIds.push(res.data.id);
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      } catch {
        toast.error(`Upload error: ${file.name}`);
        return null;
      }
    }

    return uploadedIds;
  };

  /* ---------------- SUBMIT PO ---------------- */
  const submitPO = async () => {
    if (!project_id) {
      toast.error("Project ID missing");
      return;
    }

    if (filesWithLabel.length === 0) {
      toast.error("Upload at least one file");
      return;
    }

    setSubmitting(true);

    const uploadedIds = await uploadFiles();
    if (!uploadedIds) {
      setSubmitting(false);
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    const payload = {
      project_id: Number(project_id),
      po_number: `PO-${project_id}-${today.replace(/-/g, "")}`,
      received_date: today,
      uploaded_file_ids: uploadedIds,
    };

    try {
      const res = await makeApiCall(
        "post",
        API_ENDPOINT.UPDATE_UPLOAD_PO,
        payload,
        "application/json",
        authToken,
        "createPO"
      );

      if (res?.status === 200 || res?.status === 201) {
        toast.success("Purchase Order uploaded");
        setFilesWithLabel([]);
        await fetchPurchaseOrder();
      } else {
        toast.error("Failed to submit PO");
      }
    } catch {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-10">
        {/* Upload Card */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragActive(true);
          }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed transition
            ${
              dragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
            }
          `}
        >
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            <div className="mb-6 rounded-full bg-blue-100 p-6">
              <UploadCloud className="h-12 w-12 text-blue-600" />
            </div>

            <h2 className="text-xl font-semibold text-gray-800">
              Upload Purchase Order
            </h2>

            <p className="mt-2 text-sm text-gray-600">
              Drag & drop files or{" "}
              <span className="font-medium text-blue-600">browse</span>
            </p>

            <p className="mt-1 text-xs text-gray-500">
              PDF, DOC, XLS, PNG, JPG
            </p>
          </div>

          <input
            ref={inputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {/* Files List */}
        {filesWithLabel.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Files to Upload</h3>

            {filesWithLabel.map(({ file, label }, index) => (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border bg-white p-4 shadow-sm hover:shadow-md transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-50">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>

                <div className="flex-1 w-full space-y-1">
                  <Input
                    value={label}
                    onChange={(e) => updateLabel(index, e.target.value)}
                    placeholder="File label"
                    className="h-9"
                  />
                  <p className="text-xs text-gray-500 truncate">
                    {file.name} • {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFile(index)}
                  className="text-gray-400 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <Button
            onClick={submitPO}
            disabled={filesWithLabel.length === 0 || submitting}
            className="h-11 px-10 rounded-xl bg-blue-600 hover:bg-blue-700 shadow-md"
          >
            {submitting ? "Uploading..." : "Upload Purchase Order"}
          </Button>
        </div>

        {/* Current PO */}
        <div>
          <h3 className="mb-4 text-lg font-semibold">Current Purchase Order</h3>

          {loadingPo ? (
            <p className="text-sm text-gray-500">Loading...</p>
          ) : !poData ? (
            <p className="text-sm text-gray-500">No PO found.</p>
          ) : (
            <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-sm">
              <p>
                <span className="text-gray-500">PO Number</span>
                <br />
                <span className="font-medium">{poData.po_number}</span>
              </p>

              <p>
                <span className="text-gray-500">Status</span>
                <br />
                <span className="font-medium capitalize">{poData.status}</span>
              </p>

              <p>
                <span className="text-gray-500">Received Date</span>
                <br />
                {poData.received_date
                  ? new Date(poData.received_date).toLocaleString()
                  : "-"}
              </p>

              {Array.isArray(poData.uploaded_files) &&
                poData.uploaded_files.length > 0 && (
                  <div>
                    <p className="text-gray-500 mb-2">Files</p>
                    <ul className="space-y-2">
                      {poData.uploaded_files.map((f: any) => (
                        <li
                          key={f.id}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                        >
                          <span className="truncate">{f.label}</span>
                          <a
                            className="text-blue-600 text-sm font-medium"
                            target="_blank"
                            rel="noreferrer"
                          >
                            View
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
