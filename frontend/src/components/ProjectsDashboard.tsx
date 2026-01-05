import { useEffect, useState } from "react";
import {
  Search,
  Grid,
  List,
  Users,
  CheckCircle2,
  Clock,
  Folder,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProjectCard } from "@/components/ProjectCard";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Loading from "./atomic/Loading";
import { Project, ProjectListResponse } from "@/types/apiTypes";
import { useNavigate } from "react-router-dom";

export const ProjectsDashboard = () => {
  const navigate = useNavigate();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [projects, setProjects] = useState<Project[]>([]);
  const { fetching, isFetched, makeApiCall } = useAPICall();
  const { authToken, user } = useAuth();
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cards, setCards] = useState({
    total_projects: 0,
    completed_works: 0,
    pending_works: 0,
  });

  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const getProjects = async () => {
      const url = isAdmin
        ? API_ENDPOINT.GET_ALL_ADMIN_PROJECTS(searchTerm, page, 20)
        : API_ENDPOINT.GET_ALL_PM_PROJECTS(searchTerm, page, 20);

      const response = await makeApiCall(
        "get",
        url,
        {},
        "application/json",
        authToken,
        "getProjects"
      );

      if (response.status === 200) {
        const data = response.data as ProjectListResponse;
        setProjects(data.projects);
        setCards(data.cards);
        setTotalPages(data.total_pages);
      } else {
        toast.error("Failed to fetch projects");
      }
    };

    getProjects();
  }, [page, searchTerm, authToken, isAdmin, makeApiCall]);

  const handleSearch = () => {
    setPage(1);
    setSearchTerm(searchInput);
  };

  // Admin-only delete handler
  const handleDelete = async (projectId: number) => {
    const response = await makeApiCall(
      "delete",
      API_ENDPOINT.DELETE_PROJECT(projectId),
      {},
      "application/json",
      authToken,
      `deleteProject-${projectId}`
    );

    if (response.status === 200 || response.status === 204) {
      toast.success("Project deleted permanently");
      setProjects((prev) => prev.filter((p) => p.id !== projectId));

      const deletedProject = projects.find((p) => p.id === projectId);
      if (deletedProject) {
        setCards((prev) => ({
          total_projects: prev.total_projects - 1,
          completed_works:
            deletedProject.status === "completed"
              ? prev.completed_works - 1
              : prev.completed_works,
          pending_works:
            deletedProject.status !== "completed"
              ? prev.pending_works - 1
              : prev.pending_works,
        }));
      }
    } else {
      toast.error("Failed to delete project");
    }
  };

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Projects Dashboard
          </h1>
          <p className="text-slate-600">
            Manage and track all engineering projects
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <Users size={16} className="text-blue-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.total_projects} Total
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5">
              <CheckCircle2 size={16} className="text-emerald-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.completed_works} Completed
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5">
              <Clock size={16} className="text-yellow-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.pending_works} Pending
              </span>
            </div>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search by ID, company, name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="pl-9 pr-4 py-2 w-64"
            />
          </div>

          <div className="flex rounded-md border border-slate-200 overflow-hidden">
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

      {fetching || !isFetched ? (
        <Loading full={false} />
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <Folder size={64} className="mx-auto mb-4 text-slate-300" />
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
              : "space-y-4"
          }
        >
          {projects.map((project) => {
     const mappedProject: ProjectCardData = {
       id: project.id,
       name: project.name,
       projectCode: project.project_id,
       clientName: project.client_name,
       location: project.location,
       projectType: project.project_type,
       priority: project.priority,
       status: project.status,
       progress: Number(project.progress ?? 0),
       estimationSentToPM: project.estimation?.sent_to_pm ?? false,
       isArchived: project.is_pc_archived,
     };


            return (
              <div
                key={project.id}
                className="cursor-pointer"
                onClick={() =>
                  navigate(
                    isAdmin
                      ? `/admin/project/${project.id}`
                      : `/pm/project/${project.id}`
                  )
                }
              >
                <ProjectCard
                  project={mappedProject}
                  viewMode={viewMode}
                  onSelect={() => {}}
                  onDelete={isAdmin ? handleDelete : undefined}
                  isAdmin={isAdmin}
                />
              </div>
            );
          })}
        </div>
      )}

      {!fetching && totalPages > 1 && (
        <div className="flex justify-center mt-10 gap-2 flex-wrap">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
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
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProjectsDashboard;
