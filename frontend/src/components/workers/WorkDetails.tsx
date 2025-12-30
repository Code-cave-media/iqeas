/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, DragEvent } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Square } from "lucide-react";

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

/* ---------- STATUS BADGES ---------- */
const STATUS_BADGE: Record<string, string> = {
  under_progress: "bg-blue-100 text-blue-700",
  rework: "bg-orange-100 text-orange-700",
  checking: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
};

/* ---------- BUTTON COLORS ---------- */
const BTN_COLORS: any = {
  green: "bg-green-600 hover:bg-green-700",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  red: "bg-red-600 hover:bg-red-700",
};

/* ---------- STATUS BADGE COMPONENT ---------- */
const StatusBadge = ({ status }: { status: string }) => (
  <span
    className={`px-2 py-0.5 rounded-md text-xs font-medium capitalize
      ${STATUS_BADGE[status] || "bg-gray-100 text-gray-600"}`}
  >
    {status.replace("_", " ")}
  </span>
);

/* ================================================== */
/* ================= WORK DETAILS =================== */
/* ================================================== */

export default function WorkDetails() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const { project_id } = useParams();

  const [workData, setWorkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [seconds, setSeconds] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, "RUNNING" | "STOPPED">>(
    {}
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedWork, setSelectedWork] = useState<any | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- FETCH WORK ---------- */
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

  /* ---------- WEBSOCKET ---------- */
  const { sendAction, isReady } = useWorkTimerSocket(user?.id, fetchWork);

  useEffect(() => {
    if (user?.id && project_id) fetchWork();
  }, [user?.id, project_id]);

  /* ---------- STOPWATCH ---------- */
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((prev) => {
        const next = { ...prev };
        Object.keys(status).forEach((id) => {
          if (status[Number(id)] === "RUNNING") next[Number(id)] += 1;
        });
        return next;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [status]);

  /* ---------- FILE UPLOAD HANDLER ---------- */
  const handleConfirmUpload = async () => {
    if (!selectedWork || !files.length)
      return setError("Select at least 1 file");

    setUploading(true);
    setError(null);

    try {
      const uploadedFileIds: string[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("label", file.name);

        const res = await makeApiCall(
          "post",
          API_ENDPOINT.UPLOAD_FILE,
          formData,
          "multipart/form-data",
          authToken
        );

        uploadedFileIds.push(res.data.id);
      }

      // Attach uploaded files to deliverable
      await makeApiCall(
        "post",
        API_ENDPOINT.UPLOAD_WORKER_FILE(project_id!, user.id),
        { uploaded_file_id: uploadedFileIds },
        "application/json",
        authToken
      );

      // Mark deliverable as checking
      await makeApiCall(
        "patch",
        API_ENDPOINT.UPDATE_CHECKING_WORKERS_PROJECT(selectedWork.id, user.id),
        {},
        "application/json",
        authToken
      );

      // Update UI
      fetchWork();
      setModalOpen(false);
      setFiles([]);
    } catch (err: any) {
      setError(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  /* ---------- DRAG & DROP ---------- */
  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  if (loading) return <Loading />;

  return (
    <section className="p-4 space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">My Assigned Work</h2>

      {workData.map((w) => {
        const t = toClock(seconds[w.id] || 0);
        const running = status[w.id] === "RUNNING";
        const canStart = w.status === "under progress" || w.status === "rework";

        return (
          <div key={w.id} className="rounded-xl border bg-white p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">{w.title}</h3>
                <p className="text-sm text-gray-500">
                  {w.discipline} • {w.deliverables}
                </p>
                <p className="text-xs text-gray-400">
                  Drawing: {w.drawing_no} | Stage: {w.stage} | Rev: {w.revision}
                </p>
              </div>
              <StatusBadge status={w.status} />
            </div>

            <div className="font-mono text-lg text-gray-800">
              ⏱ {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:
              {String(t.s).padStart(2, "0")}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <ActionBtn
                icon={Play}
                text="Start"
                color="green"
                disabled={!canStart || running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "RUNNING" }));
                  sendAction("START", { estimation_deliverable_id: w.id });
                }}
              />
              <ActionBtn
                icon={Pause}
                text="Pause"
                color="yellow"
                disabled={!running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "STOPPED" }));
                  sendAction("PAUSE", { estimation_deliverable_id: w.id });
                }}
              />
              <ActionBtn
                icon={Square}
                text="Checking"
                color="red"
                disabled={!canStart}
                onClick={() => {
                  setSelectedWork(w);
                  setModalOpen(true);
                }}
              />
            </div>
          </div>
        );
      })}

      {/* ---------- UPLOAD MODAL ---------- */}
      {modalOpen && selectedWork && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 space-y-4">
            <h3 className="text-lg font-semibold">Upload Files</h3>

            <div
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer
                ${dragging ? "border-blue-400 bg-blue-50" : "border-gray-300"}`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              {files.length ? (
                <ul className="text-left text-sm space-y-1">
                  {files.map((f) => (
                    <li key={f.name}>{f.name}</li>
                  ))}
                </ul>
              ) : (
                <p>Drag & drop files here, or click to select</p>
              )}
              <input
                type="file"
                multiple
                className="hidden"
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded-lg bg-gray-300 hover:bg-gray-400"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
                onClick={handleConfirmUpload}
                disabled={uploading}
              >
                {uploading ? "Uploading..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

const ActionBtn = ({ icon: Icon, text, color, ...props }: any) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2 py-2 rounded-lg
      text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed
      ${BTN_COLORS[color]}`}
  >
    <Icon size={16} />
    {text}
  </button>
);
