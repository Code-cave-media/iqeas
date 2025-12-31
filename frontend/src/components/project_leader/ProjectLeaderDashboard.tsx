/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import Loading from "@/components/atomic/Loading";

export default function ProjectLeaderDashboard() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const navigate = useNavigate();

  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);

  /* ---------- FETCH PROJECTS ---------- */
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
      console.error(err);
      setError("Failed to load projects. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(1);
  }, [user?.id]);

  if (loading && projects.length === 0) return <Loading />;

  return (
    <section className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Project Leader Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Projects to review ({page} of {totalPages})
          </p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
      </header>

      {/* Project Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-all"
          >
            <h3 className="font-medium text-gray-900 mb-2 truncate">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Client: {project.client_name} · Status: {project.status}
            </p>
            <button
              onClick={() =>
                navigate(`/project-leader/${project.project_id}/details`)
              }
              className="w-full text-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              View Project
            </button>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => fetchProjects(i + 1)}
              className={`px-3 py-1 rounded-md text-sm ${
                page === i + 1
                  ? "bg-black text-white"
                  : "border hover:bg-gray-100"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
