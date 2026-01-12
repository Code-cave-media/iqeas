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

/* ========================= TYPES ========================= */


type ProjectFilter = "ALL" | "COMPLETED" | "ARCHIVED";


/* ========================= COMPONENT ========================= */
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
  const [activeFilter, setActiveFilter] = useState<ProjectFilter>("ALL");

  const [cards, setCards] = useState({
    total_projects: 0,
    completed_works: 0,
    archived_works: 0,
  });

  /* ========================= FETCH PROJECTS ========================= */
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
        setTotalPages(pagination.totalPages || 1);

        setCards({
          total_projects: data.length,
          completed_works: data.filter(
            (p: any) => p.estimation_sent_to_pm === true
          ).length,
          archived_works: data.filter((p: any) => p.is_pc_archived === true)
            .length,
        });
      } else {
        toast.error("Failed to fetch projects");
      }
    };

    fetchProjects();
  }, [page, searchTerm, user?.id, authToken, makeApiCall]);

  /* ========================= FILTERED PROJECTS ========================= */
  const filteredProjects = projects.filter((project: any) => {
    // Search
    if (
      searchTerm &&
      !project.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }

    if (activeFilter === "COMPLETED") {
      return project.estimation_sent_to_pm === true && !project.is_pc_archived;
    }

    if (activeFilter === "ARCHIVED") {
      return project.is_pc_archived === true;
    }

    // ALL (non-archived)
    return !project.is_pc_archived;
  });

  /* ========================= ARCHIVE HANDLER ========================= */
  const handleArchive = async (projectId: number) => {
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(projectId),
      { is_pc_archived: true },
      "application/json",
      authToken,
      `archive-${projectId}`
    );

    if (response.status === 200) {
      toast.success("Project archived successfully");

      setProjects((prev: any) =>
        prev.map((p: any) =>
          p.id === projectId ? { ...p, is_pc_archived: true } : p
        )
      );

      setCards((prev) => ({
        ...prev,
        archived_works: prev.archived_works + 1,
      }));
    } else {
      toast.error("Failed to archive project");
    }
  };

  /* ========================= RENDER ========================= */
  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Coordinator Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and track assigned projects
          </p>
        </div>

        {/* Summary + Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <MiniSummaryCard
            icon={<Users size={16} className="text-blue-700" />}
            value={cards.total_projects}
            label="Total"
            bg="bg-blue-50"
            active={activeFilter === "ALL"}
            onClick={() => setActiveFilter("ALL")}
          />

          <MiniSummaryCard
            icon={<CheckCircle2 size={16} className="text-emerald-700" />}
            value={cards.completed_works}
            label="Completed"
            bg="bg-emerald-50"
            active={activeFilter === "COMPLETED"}
            onClick={() => setActiveFilter("COMPLETED")}
          />

          <MiniSummaryCard
            icon={<Clock size={16} className="text-yellow-700" />}
            value={cards.archived_works}
            label="Archived"
            bg="bg-yellow-50"
            active={activeFilter === "ARCHIVED"}
            onClick={() => setActiveFilter("ARCHIVED")}
          />

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
                onKeyDown={(e) =>
                  e.key === "Enter" && setSearchTerm(searchInput)
                }
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
      ) : filteredProjects.length === 0 ? (
        <EmptyState />
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
              : "space-y-4"
          }
        >
          {filteredProjects.map((project: any) => (
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
              onSelect={() =>
                navigate(`/project-coordinator/${project.id}/details`)
              }
              onArchive={handleArchive}
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

/* ========================= HELPER COMPONENTS ========================= */
function MiniSummaryCard({
  icon,
  value,
  label,
  bg,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  bg: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-2 rounded-full px-3 py-1 cursor-pointer
        transition-all ${bg}
        ${active ? "ring-2 ring-slate-400 scale-[1.03]" : "hover:scale-[1.02]"}
      `}
    >
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
      <p className="text-sm">Try adjusting your filters or search</p>
    </div>
  );
}
