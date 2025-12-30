/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import {
  Download,
  FileText,
  Eye,
  X,
  CheckCircle,
  RotateCcw,
  Plus,
} from "lucide-react";
import Loading from "@/components/atomic/Loading";

export default function ProjectLeaderDashboard() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any | null>(
    null
  );

  // Rework note state
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState("");

  /* ---------- FETCH PAGINATED PROJECTS ---------- */
  const fetchProjects = async (pageNum: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await makeApiCall(
        "get",
        `${API_ENDPOINT.GET_Leaders_projects}?page=${pageNum}&limit=10`,
        {},
        "application/json",
        authToken
      );

      if (res?.data) {
        setProjects(res.data || []);
        setPage(res.data.page || 1);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err: any) {
      console.error("Failed to fetch projects:", err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ---------- APPROVAL & REWORK ---------- */
  const handleApprove = async (
    estimation_deliverable_id: string,
    worker_id
  ) => {
    setActionLoading((prev) => ({
      ...prev,
      [estimation_deliverable_id]: true,
    }));

    try {
      await makeApiCall(
        "patch",
        API_ENDPOINT.APPROVE_ESTIMATION_DELIVERABLE(
          estimation_deliverable_id,
          worker_id
        ),
        {},
        "application/json",
        authToken
      );
      fetchProjects(page);
    } catch (err: any) {
      setError(`Failed to approve: ${err.message || "Please try again."}`);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [estimation_deliverable_id]: false,
      }));
    }
  };

  const handleRework = async (estimation_deliverable_id: string, worker_id) => {
    setActionLoading((prev) => ({
      ...prev,
      [estimation_deliverable_id]: true,
    }));

    try {
      await makeApiCall(
        "patch",
        API_ENDPOINT.REWORK_ESTIMATION_DELIVERABLE(
          estimation_deliverable_id,
          worker_id
        ),
        {},
        "application/json",
        authToken
      );
      fetchProjects(page);
    } catch (err: any) {
      setError(
        `Failed to send for rework: ${err.message || "Please try again."}`
      );
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [estimation_deliverable_id]: false,
      }));
    }
  };

  /* ---------- ADD REWORK NOTE ---------- */
  const handleAddNote = async (deliverable: any) => {
    if (!noteText.trim()) return;

    setActionLoading((prev) => ({
      ...prev,
      [deliverable.id]: true,
    }));

    try {
      await makeApiCall(
        "patch",
        API_ENDPOINT.ADD_REWORK_NOTE(deliverable.id, deliverable.worker_id),
        { note: noteText },
        "application/json",
        authToken
      );
      fetchProjects(page);
      setActiveNoteId(null);
      setNoteText("");
    } catch (err: any) {
      setError(`Failed to add note: ${err.message || "Please try again."}`);
    } finally {
      setActionLoading((prev) => ({
        ...prev,
        [deliverable.id]: false,
      }));
    }
  };

  const openFileModal = (deliverable: any) => {
    setSelectedDeliverable(deliverable);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDeliverable(null);
  };

  useEffect(() => {
    fetchProjects(1);
  }, [user?.id]);

  if (loading && projects.length === 0) return <Loading />;

  return (
    <section className="p-6 space-y-6 max-w-7xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Leader Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Review deliverables in checking ({page} of {totalPages})
          </p>
        </div>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => fetchProjects(page)}
              className="mt-1 text-sm text-red-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </header>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((deliverable) => {
          const isLoading = actionLoading[deliverable.id];
          const isNoteActive = activeNoteId === deliverable.id;

          return (
            <div
              key={deliverable.id}
              className="border border-gray-200 rounded-lg p-6 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-gray-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-medium text-gray-900 text-lg leading-tight truncate">
                      {deliverable.title}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {deliverable.project.name} · S.No {deliverable.sno}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-1 bg-yellow-50 text-yellow-800 text-xs font-medium rounded">
                  {deliverable.status}
                </span>
              </div>

              {/* Files Count */}
              <div className="mb-4 p-3 border border-gray-100 rounded-md bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900">
                      {deliverable.workers_uploaded_files?.length || 0} file
                      {deliverable.workers_uploaded_files?.length !== 1
                        ? "s"
                        : ""}
                    </span>
                  </div>
                  <button
                    onClick={() => openFileModal(deliverable)}
                    className="text-sm text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1 hover:underline transition-colors"
                    disabled={isLoading}
                  >
                    View Files
                  </button>
                </div>
              </div>

              {/* Add Rework Note */}
              <div className="mb-4">
                {isNoteActive ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-yellow-200"
                      placeholder="Type your rework note..."
                      rows={3}
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => handleAddNote(deliverable)}
                        disabled={isLoading}
                        className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md text-sm font-medium transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setActiveNoteId(null)}
                        className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md text-sm font-medium transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveNoteId(deliverable.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" /> Add Rework Note
                  </button>
                )}
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() =>
                    handleApprove(
                      deliverable.id.toString(),
                      deliverable.worker_id
                    )
                  }
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                    isLoading
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Approve
                    </>
                  )}
                </button>

                <button
                  onClick={() =>
                    handleRework(
                      deliverable.id.toString(),
                      deliverable.worker_id
                    )
                  }
                  disabled={isLoading}
                  className={`flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium border transition-colors ${
                    isLoading
                      ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                      : "bg-white border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-900"
                  }`}
                >
                  {isLoading ? (
                    <span>Processing...</span>
                  ) : (
                    <>
                      <RotateCcw className="w-4 h-4" />
                      Rework
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILES MODAL */}
      {isModalOpen && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/50"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Files for {selectedDeliverable.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDeliverable.project.name} ·{" "}
                  {selectedDeliverable.drawing_no}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Files List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedDeliverable.workers_uploaded_files?.length > 0 ? (
                <div className="space-y-2">
                  {selectedDeliverable.workers_uploaded_files.map(
                    (wuf: any) => (
                      <div
                        key={wuf.id}
                        className="flex items-center justify-between p-4 border border-gray-200 rounded-md hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4 text-gray-500" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 text-sm">
                              File #{wuf.file.id}
                            </p>
                            <p className="text-sm text-gray-500 truncate">
                              {wuf.file.file}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                              {new Date(
                                wuf.file.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/files/${wuf.file.file}`}
                            download
                            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-12">
                  No files uploaded
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-100 bg-gray-50">
              <button
                className="flex-1 py-2 px-4 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                onClick={closeModal}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
