/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, DragEvent, ChangeEvent } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Square, X } from "lucide-react";

import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { useWorkTimerSocket } from "@/hooks/useWorkTimerSocket";
import Loading from "@/components/atomic/Loading";

/* ---------- TIME HELPERS ---------- */
const toSeconds = (t: any) =>
  t ? t.hours * 3600 + t.minutes * 60 + t.seconds : 0;

const toClock = (s: number) => ({
  h: Math.floor(s / 3600),
  m: Math.floor((s % 3600) / 60),
  s: s % 60,
});

/* ---------- COLOR MAPS (TAILWIND SAFE) ---------- */
const BTN_COLORS: any = {
  green: "bg-green-500 hover:bg-green-600",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  red: "bg-red-500 hover:bg-red-600",
};

export default function WorkDetails() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const { project_id } = useParams();

  const [workData, setWorkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [seconds, setSeconds] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, string>>({});

  // ---------- CHECKING MODAL STATE ----------
  const [isCheckingModalOpen, setIsCheckingModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- FETCH WORK DATA ---------- */
  const fetchWork = async () => {
    setLoading(true);

    const res = await makeApiCall(
      "get",
      API_ENDPOINT.GET_WORKERS_WORK_DATA(user.id, project_id),
      {},
      "application/json",
      authToken
    );

    if (res?.data) {
      setWorkData(res.data);

      const sec: any = {};
      const stat: any = {};

      res.data.forEach((w: any) => {
        sec[w.id] = toSeconds(w.consumed_time);
        stat[w.id] = "STOPPED";
      });

      setSeconds(sec);
      setStatus(stat);
    }

    setLoading(false);
  };

  // Updated socket hook with estimation_deliverable_id
  const { sendAction } = useWorkTimerSocket(
    user?.id,
    fetchWork,
    project_id // pass project_id if needed by hook
  );

  useEffect(() => {
    if (user?.id && project_id) fetchWork();
  }, [user?.id, project_id]);

  /* ---------- STOPWATCH ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((prev) => {
        const next = { ...prev };
        Object.keys(status).forEach((id) => {
          if (status[Number(id)] === "RUNNING") {
            next[Number(id)] += 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [status]);

  /* ---------- DRAG & DROP HANDLERS ---------- */
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles((prev) => [...prev, ...droppedFiles]);
  };

  const handleFileInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const resetModalState = () => {
    setFiles([]);
    setError(null);
    setSelectedWork(null);
    setIsCheckingModalOpen(false);
    setIsDragging(false);
  };

  /* ---------- CHECKING UPLOAD FLOW ----------
   * 1. UPLOAD_FILE for each file (multipart)
   * 2. UPLOAD_WORKER_FILE(project_id, worker_id) with file IDs
   * 3. UPDATE_CHECKING_WORKERS_PROJECT(estimation_deliverable_id) PATCH
   * 4. STOP timer with estimation_deliverable_id via websocket
   */
const handleConfirmChecking = async () => {
  if (!selectedWork || !project_id || !user?.id) return;
  if (!files.length) {
    setError("Please attach at least one file.");
    return;
  }

  try {
    setUploading(true);
    setError(null);

    // Step 1: Upload files to UPLOAD_FILE, collect uploaded_file_id(s)
    const uploadedFileIds: string[] = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const uploadRes = await makeApiCall(
        "post",
        API_ENDPOINT.UPLOAD_FILE,
        formData,
        "multipart/form-data",
        authToken
      );

      // Backend likely returns: { uploaded_file_id: "123" } or { id: "123" }
      const fileId =
        uploadRes.data.uploaded_file_id ||
        uploadRes.data.id ||
        uploadRes.data.file_id ||
        uploadRes.data.path;

      console.log(
        "File upload response:",
        uploadRes.data,
        "→ extracted ID:",
        fileId
      );

      if (fileId) {
        uploadedFileIds.push(fileId);
      } else {
        console.warn("No file ID found in response for:", file.name);
      }
    }

    if (!uploadedFileIds.length) {
      throw new Error(
        "No files were successfully uploaded - check console for response structure"
      );
    }

    console.log("Sending to UPLOAD_WORKER_FILE:", {
      uploaded_file_id: uploadedFileIds,
    });

    // Step 2: Associate files with worker/project (expects uploaded_file_ids array)
    await makeApiCall(
      "post",
      API_ENDPOINT.UPLOAD_WORKER_FILE(project_id, user.id),
      { uploaded_file_id: uploadedFileIds }, // ← Exact backend field name!
      "application/json",
      authToken
    );

    // Step 3: Mark as 'checking' (backend checks workers_uploaded_files exists)
    await makeApiCall(
      "patch",
      API_ENDPOINT.UPDATE_CHECKING_WORKERS_PROJECT(
        selectedWork.id,
        user.id
      ),
      {},
      "application/json",
      authToken
    );

    sendAction("STOP", {
      worker_id: user.id,
      estimation_deliverable_id: selectedWork.estimation_deliverable_id,
    });

    setStatus((prev) => ({ ...prev, [selectedWork.id]: "STOPPED" }));
    setSeconds((prev) => ({ ...prev, [selectedWork.id]: 0 }));

    resetModalState();
    fetchWork();
  } catch (err: any) {
    console.error("Checking failed:", err);
    setError(
      `Failed to submit for checking: ${err.message || "Please try again."}`
    );
  } finally {
    setUploading(false);
  }
};


  if (loading) return <Loading />;

  return (
    <section className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">My Assigned Work</h2>

      {workData.map((w) => {
        const t = toClock(seconds[w.id] || 0);
        const running = status[w.id] === "RUNNING";

        return (
          <div
            key={w.id}
            className="rounded-xl border bg-white p-5 shadow-sm space-y-4"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{w.title}</h3>
                <p className="text-sm text-gray-500">
                  S.No {w.sno} · {w.discipline} · {w.stage} · Rev {w.revision}
                </p>
              </div>

              <span
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full
                ${
                  running
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    running ? "bg-red-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                {running ? "Recording" : "Stopped"}
              </span>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Drawing No</p>
                <p className="font-medium">{w.drawing_no}</p>
              </div>

              <div>
                <p className="text-gray-500">Deliverables</p>
                <p className="font-medium">{w.deliverables}</p>
              </div>

              <div>
                {w.status === "Checking" ? (
                  <span className="text-green-500">{w.status}</span>
                ) : (
                  <span className="text-teal-900 p-1 bg-amber-300 rounded-full">{w.status}</span>
                )}
              </div>
            </div>

            {/* TIME */}
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-gray-600">
                Assigned: <b>{w.hours}h</b>
              </span>

              <div className="font-mono text-lg font-semibold text-indigo-600">
                {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:
                {String(t.s).padStart(2, "0")}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <ActionBtn
                icon={Play}
                text="Start"
                color="green"
                disabled={running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "RUNNING" }));
                  sendAction("START", {
                    worker_id: user.id,
                    estimation_deliverable_id: w.id,
                  });
                }}
              />

              <ActionBtn
                icon={Pause}
                text="Pause"
                color="yellow"
                disabled={!running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "PAUSED" }));
                  sendAction("PAUSE", {
                    worker_id: user.id,
                    estimation_deliverable_id: w.id,
                  });
                }}
              />

              <ActionBtn
                icon={Square}
                text="Checking"
                color="red"
                onClick={() => {
                  setSelectedWork(w);
                  setIsCheckingModalOpen(true);
                }}
              />
            </div>
          </div>
        );
      })}

      {/* ---------- CHECKING MODAL ---------- */}
      {isCheckingModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={resetModalState}
          />
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-2xl border animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">
                Submit for Checking
              </h3>
              <button
                onClick={resetModalState}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all"
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-4">
                Attach files for{" "}
                <span className="font-medium">{selectedWork?.title}</span>
              </p>

              {/* Drag & Drop Area */}
              <div
                className={`relative group border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer ${
                  isDragging
                    ? "border-indigo-500 bg-indigo-50 shadow-lg ring-2 ring-indigo-500/50"
                    : "border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => {
                  const input = document.getElementById(
                    "file-input-checking"
                  ) as HTMLInputElement;
                  input?.click();
                }}
              >
                <div className="pointer-events-none">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg
                      className="w-8 h-8 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                      />
                    </svg>
                  </div>
                  <p className="text-lg font-semibold text-gray-900 mb-1">
                    {isDragging ? "Drop files here" : "Drag & drop files"}
                  </p>
                  <p className="text-sm text-gray-500 mb-2">
                    or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports multiple files (PDF, DOC, images, etc.)
                  </p>
                </div>
                <input
                  id="file-input-checking"
                  type="file"
                  multiple
                  accept="*/*"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
              </div>

              {/* Files List */}
              {files.length > 0 && (
                <div className="mt-6 max-h-48 overflow-y-auto border border-gray-200 rounded-xl bg-gray-50">
                  <div className="p-3 border-b bg-white sticky top-0">
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                      <span>
                        {files.length} file{files.length !== 1 ? "s" : ""}{" "}
                        selected
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-gray-200">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 hover:bg-white"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg
                              className="w-4 h-4 text-white"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {(file.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all"
                          onClick={() => handleRemoveFile(index)}
                          disabled={uploading}
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-6 border-t bg-gray-50 rounded-b-2xl">
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all disabled:opacity-50"
                onClick={resetModalState}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shadow-lg rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleConfirmChecking}
                disabled={uploading || !files.length}
              >
                {uploading ? (
                  <span className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 animate-spin"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  "Submit for Checking"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---------- ACTION BUTTON ---------- */
const ActionBtn = ({ icon: Icon, text, color, ...props }: any) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2 py-2 rounded-lg text-white text-sm font-medium transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0
      disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none
      ${BTN_COLORS[color]}`}
  >
    <Icon size={16} />
    {text}
  </button>
);
