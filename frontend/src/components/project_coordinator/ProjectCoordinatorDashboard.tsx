/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Search, Grid, List, Users, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "./ProjectCard";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Loading from "../atomic/Loading";
import { Project } from "@/types/apiTypes";
import { useNavigate } from "react-router-dom";

export default function ProjectCoordinatorDashboard() {
  const navigate = useNavigate();
  const { fetching, isFetched, makeApiCall } = useAPICall();
  const { authToken, user } = useAuth();

  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cards, setCards] = useState({
    total_projects: 0,
    completed_works: 0,
    pending_works: 0,
  });

  /* =========================
      FETCH COORDINATOR PROJECTS
     ========================= */
  useEffect(() => {
    if (!user?.id) return;

    const fetchProjects = async () => {
      const url = API_ENDPOINT.GET_PROJECTS_FOR_COORDINATOR(user.id, page, 20);

      const response = await makeApiCall(
        "get",
        url,
        {},
        "application/json",
        authToken,
        "getCoordinatorProjects"
      );

      if (response.status === 200) {
        const resData = response.data;

        const data: any[] = Array.isArray(resData?.data)
          ? resData.data
          : Array.isArray(resData)
          ? resData
          : [];

        const pagination = resData?.pagination || {
          totalPages: 1,
          total: data.length,
        };

        setProjects(data as any);
        setTotalPages(pagination?.totalPages || 1);

        setCards({
          total_projects: pagination?.total ?? data.length,
          completed_works: data.filter((p: any) => p.status === "completed")
            .length,
          pending_works: data.filter((p: any) => p.status !== "completed")
            .length,
        });
      } else {
        toast.error("Failed to fetch coordinator projects");
      }
    };

    fetchProjects();
  }, [page, searchTerm, user?.id, authToken, makeApiCall]);

  /* =========================
      UI
     ========================= */
  return (
    <div className="p-6 relative">
      {/* Header & Quick Stats */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Coordinator Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and track assigned projects
          </p>
        </div>

        {/* Right side: Quick Stats + Search + Layout */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Stats */}
          <MiniSummaryCard
            icon={<Users className="text-blue-700" size={16} />}
            value={cards.total_projects}
            label="Total"
            bg="bg-blue-50"
          />
          <MiniSummaryCard
            icon={<CheckCircle2 className="text-emerald-700" size={16} />}
            value={cards.completed_works}
            label="Completed"
            bg="bg-emerald-50"
          />
          <MiniSummaryCard
            icon={<Clock className="text-yellow-700" size={16} />}
            value={cards.pending_works}
            label="Pending"
            bg="bg-yellow-50"
          />

          {/* Search & Layout toggle */}
          <div className="flex items-center gap-2 ml-2">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setSearchTerm(searchInput);
                }}
                className="py-4 rounded-full text-xs w-56 pl-10"
              />
            </div>

            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects */}
      {fetching || !isFetched ? (
        <Loading full={false} />
      ) : projects.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
              : "space-y-4"
          }
        >
          {projects.map((project: any) => (
            <ProjectCard
              key={project.id}
              project={{
                ...project,
                clientName: project.client_name,
                createdDate: project.created_at,
                status: project.status || "",
                poNumber: project.po_number,
              }}
              viewMode={viewMode}
              onSelect={() => navigate(`/coordinator/project/${project.id}`)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {!fetching && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            Previous
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              size="sm"
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

/* =========================
   HELPER COMPONENTS
   ========================= */

function MiniSummaryCard({
  icon,
  value,
  label,
  bg,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
}) {
  return (
    <div className={`flex items-center gap-2 rounded-full px-2 py-1 ${bg}`}>
      <div className="p-1 rounded-full bg-white">{icon}</div>
      <div className="text-xs text-slate-700 font-semibold">
        {value} {label}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-slate-400">
      <p className="text-lg font-medium">No projects found</p>
      <p className="text-sm">Try adjusting your search</p>
    </div>
  );
}
