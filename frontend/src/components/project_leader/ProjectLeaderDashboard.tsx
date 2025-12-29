/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { Download, FileText, Eye, X } from "lucide-react";
import Loading from "@/components/atomic/Loading";

export default function ProjectLeaderDashboard() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeliverable, setSelectedDeliverable] = useState<any | null>(
    null
  );

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

  useEffect(() => {
    fetchProjects(1);
  }, [user?.id]);

  const openFileModal = (deliverable: any) => {
    setSelectedDeliverable(deliverable);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedDeliverable(null);
  };

  if (loading && projects.length === 0) return <Loading />;

  return (
    <section className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Project Leader Dashboard
          </h1>
          <p className="text-lg text-gray-600 mt-1">
            Review deliverables in checking ({page} of {totalPages})
          </p>
        </div>
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
            <button
              onClick={() => fetchProjects(page)}
              className="mt-2 text-sm text-red-600 hover:underline"
            >
              Retry
            </button>
          </div>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((deliverable) => (
          <div
            key={deliverable.id}
            className="group bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl hover:border-gray-300 transition-all duration-200 overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {deliverable.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {deliverable.project.name} · S.No {deliverable.sno}
                  </p>
                </div>
              </div>
              <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-medium rounded-full">
                {deliverable.status}
              </span>
            </div>

            {/* Details */}
            <div className="space-y-3 mb-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Drawing No</p>
                  <p className="font-medium text-gray-900">
                    {deliverable.drawing_no}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Discipline</p>
                  <p className="font-medium text-gray-900">
                    {deliverable.discipline}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Stage</p>
                  <p className="font-medium text-gray-900">
                    {deliverable.stage}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Hours</p>
                  <p className="font-medium text-indigo-600">
                    {deliverable.hours}h
                  </p>
                </div>
              </div>
            </div>

            {/* Files Count */}
            <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <p className="text-sm font-medium text-blue-900">
                    {deliverable.workers_uploaded_files?.length || 0} file
                    {deliverable.workers_uploaded_files?.length !== 1
                      ? "s"
                      : ""}
                  </p>
                </div>
                <button
                  onClick={() => openFileModal(deliverable)}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:underline transition-colors"
                >
                  View Files
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button className="flex-1 bg-indigo-600 text-white py-2 px-4 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md">
                Approve
              </button>
              <button className="flex-1 bg-gray-100 text-gray-900 py-2 px-4 rounded-xl text-sm font-semibold hover:bg-gray-200 transition-all">
                Rework
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Projects */}
      {projects.length === 0 && !loading && (
        <div className="text-center py-20">
          <svg
            className="w-16 h-16 text-gray-400 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No deliverables to review
          </h3>
          <p className="text-gray-500 mb-6">
            All items are approved or no pending checking items.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page <span className="font-semibold">{page}</span> of{" "}
            <span className="font-semibold">{totalPages}</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => fetchProjects(page - 1)}
              disabled={page === 1}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Previous
            </button>
            <button
              onClick={() => fetchProjects(page + 1)}
              disabled={page >= totalPages}
              className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* FILES MODAL */}
      {isModalOpen && selectedDeliverable && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gray-50">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Files for {selectedDeliverable.title}
                </h3>
                <p className="text-sm text-gray-500">
                  {selectedDeliverable.project.name} ·{" "}
                  {selectedDeliverable.drawing_no}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-lg transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Files List */}
            <div className="p-6 max-h-96 overflow-y-auto">
              {selectedDeliverable.workers_uploaded_files?.length > 0 ? (
                <div className="space-y-3">
                  {selectedDeliverable.workers_uploaded_files.map(
                    (wuf: any, index: number) => (
                      <div
                        key={wuf.id}
                        className="group flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:border-gray-300 hover:shadow-md transition-all bg-white"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              File #{wuf.file.id}
                            </p>
                            <p className="text-sm text-gray-500 truncate max-w-xs">
                              {wuf.file.file}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              Uploaded:{" "}
                              {new Date(
                                wuf.file.created_at
                              ).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                          <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
                            href={`/files/${wuf.file.file}`} // Adjust download URL
                            download
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-all"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    )
                  )}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-8">
                  No files uploaded
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t bg-gray-50">
              <button
                className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-all shadow-sm hover:shadow-md"
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
