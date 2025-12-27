import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { AlertCircleIcon, Verified } from "lucide-react";

/* ================= TYPES ================= */

export type UploadedFile = {
  id: number;
  file: string;
  label: string;
  status: "draft" | "under_review" | "approved" | "rejected";
  created_at: string;
};

export type Project = {
  id: number;
  name: string;
  clientName?: string;
  createdDate?: string;
  progress?: number;
  status?: string;
  poNumber?: string;
  uploadedFiles?: UploadedFile[];
  estimation_sent_to_pm?: boolean;
  estimation_id?: boolean;
};

type Props = {
  project: Project;
  viewMode: "grid" | "list";
  userRole: string;
  onSelect: () => void;
};

/* ================= COMPONENT ================= */

export function ProjectCard({ project, viewMode, userRole, onSelect }: Props) {
  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sentToPM, setSentToPM] = useState<boolean>(
    project.estimation_sent_to_pm ?? false
  );

  const progress = Math.min(Math.max(project.progress ?? 0, 0), 100);

  /* ================= ACTIONS ================= */

  const handleApprove = async () => {
    try {
      setLoading(true);

      const res = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_ESTIMATION(project?.estimation_id),
        { sent_to_pm: true },
        "application/json",
        authToken
      );

      if (res?.status === 200) {
        toast.success("Estimation sent to PM");
        setSentToPM(true);
        setConfirmOpen(false);
      } else {
        toast.error("Approval failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFile = (file: UploadedFile) => {
    const base = import.meta.env.VITE_BACKEND_FILE_URL as string;
    window.open(`${base}/${file.file}`, "_blank");
  };

  /* ================= UI ================= */

  return (
    <>
      <div
        onClick={onSelect}
        className={`
          rounded-xl border border-slate-200 bg-white
          p-6 transition-all cursor-pointer
          hover:shadow-md hover:border-slate-300
          ${viewMode === "list" ? "flex flex-col gap-5" : "space-y-5"}
        `}
      >
        {/* ===== HEADER ===== */}
        <header className="space-y-1 flex justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {project.name}
            </h2>

            {project.clientName && (
              <p className="text-sm text-slate-600">{project.clientName}</p>
            )}
          </div>

          {project.estimation_sent_to_pm ? (
            <div>
              <Verified className="text-green-500" />
            </div>
          ) : (
            <div>
              <AlertCircleIcon className="text-red-500" />
            </div>
          )}
        </header>

        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {project.status && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
              {project.status}
            </span>
          )}

          {project.poNumber && (
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700">
              PO • {project.poNumber}
            </span>
          )}

          {sentToPM && (
            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700">
              Sent to PM
            </span>
          )}
        </div>

        {/* ===== PROGRESS ===== */}
        <div className="space-y-1">
          <div className="flex justify-between text-sm text-slate-600">
            <span>Progress</span>
            <span className="font-medium">{progress}%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* ===== FILES ===== */}
        {project.uploadedFiles?.length ? (
          <section className="border-t pt-4 space-y-2">
            <p className="text-sm font-semibold text-slate-800">
              Attached files
            </p>

            <ul className="space-y-2">
              {project.uploadedFiles.map((file) => (
                <li
                  key={file.id}
                  className="flex items-center justify-between"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {file.label}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewFile(file)}
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* ===== ACTION ===== */}
        {!sentToPM && (
          <div className="pt-4 border-t" onClick={(e) => e.stopPropagation()}>
            <Button
              className="w-full text-sm"
              onClick={() => setConfirmOpen(true)}
            >
              Confirm & Approve
            </Button>
          </div>
        )}
      </div>

      {/* ===== CONFIRM MODAL ===== */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold text-slate-900">
              Confirm Approval
            </h3>

            <p className="mt-2 text-sm text-slate-600">
              This will send the estimation to the Project Manager. Are you sure
              you want to continue?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button disabled={loading} onClick={handleApprove}>
                {loading ? "Approving..." : "Approve & Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
