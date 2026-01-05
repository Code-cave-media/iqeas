/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Search,
  Grid,
  List,
  Users,
  CheckCircle2,
  Clock,
  ArchiveRestore,
} from "lucide-react";
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

export default function ProjectCoordinatorArchives() {
  const navigate = useNavigate();
  const { fetching, makeApiCall } = useAPICall();
  const { authToken, user } = useAuth();

  const [archivedProjects, setArchivedProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cards, setCards] = useState({
    total_archived: 0,
    completed: 0,
    pending: 0,
  });

useEffect(() => {
  if (!user?.id || !authToken) return;

  const fetchArchives = async () => {
    const url = API_ENDPOINT.GET_PC_ARCHIVES;

    const response = await makeApiCall(
      "get",
      url,
      {},
      "application/json",
      authToken,
      "getPCArchives"
    );

    console.log("API Response:", response);
    console.log("Response Data:", response.data);

    if (response.status === 200) {
      const resData = response.data;

      let projects: Project[] = [];

      // Handle both cases: data is array OR single object inside "data"
      if (resData?.data) {
        if (Array.isArray(resData.data)) {
          projects = resData.data as Project[];
        } else if (typeof resData.data === "object") {
          projects = [resData.data as Project];
        }
      }
      // Fallback: if response.data is directly an array
      else if (Array.isArray(resData)) {
        projects = resData as Project[];
      }
      // Fallback: if response.data is directly a single object
      else if (resData && typeof resData === "object" && resData.id) {
        projects = [resData as Project];
      }

      console.log("Final projects array:", projects);

      setArchivedProjects(projects);

      const completedCount = projects.filter(
        (p) => p.status === "completed"
      ).length;
      const pendingCount = projects.length - completedCount;

      setCards({
        total_archived: projects.length,
        completed: completedCount,
        pending: pendingCount,
      });
    } else {
      toast.error("Failed to load archived projects");
      setArchivedProjects([]);
      setCards({ total_archived: 0, completed: 0, pending: 0 });
    }
  };

  fetchArchives();
}, [user?.id, authToken, makeApiCall]);

  const handleUnarchive = async (projectId: number) => {
    

    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(projectId),
      { is_pc_archived: false },
      "application/json",
      authToken,
      `unarchive-${projectId}`
    );

    if (response.status === 200) {
      toast.success("Project restored successfully");
      setArchivedProjects((prev) =>
        prev.filter((p: any) => p.id !== projectId)
      );

      setCards((prev) => ({
        total_archived: prev.total_archived - 1,
        completed:
          prev.completed -
          (archivedProjects.find((p: any) => p.id === projectId)?.status ===
          "completed"
            ? 1
            : 0),
        pending:
          prev.pending -
          (archivedProjects.find((p: any) => p.id === projectId)?.status !==
          "completed"
            ? 1
            : 0),
      }));
    } else {
      toast.error("Failed to restore project");
    }
  };

return (
  <div className="p-6 relative">
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <ArchiveRestore size={32} className="text-slate-600" />
          Archived Projects
        </h1>
        <p className="text-slate-600 mt-1">
          View and restore projects you have previously archived
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <MiniSummaryCard
          icon={<Users className="text-slate-700" size={16} />}
          value={cards.total_archived}
          label="Total Archived"
          bg="bg-slate-50"
        />
        <MiniSummaryCard
          icon={<CheckCircle2 className="text-emerald-700" size={16} />}
          value={cards.completed}
          label="Completed"
          bg="bg-emerald-50"
        />
        <MiniSummaryCard
          icon={<Clock className="text-yellow-700" size={16} />}
          value={cards.pending}
          label="Pending"
          bg="bg-yellow-50"
        />

        <div className="flex items-center gap-2 ml-2">
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

    {fetching ? (
      <Loading full={false} />
    ) : archivedProjects.length === 0 ? (
      <EmptyState />
    ) : (
      <div
        className={
          viewMode === "grid"
            ? "grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]"
            : "space-y-4"
        }
      >
        {archivedProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={{
              id: project.id,
              name: project.name,
              clientName: project.client_name,
              status: project.status,
              poNumber: project.po_number,
              estimation_sent_to_pm: project.sent_to_pm,
              isArchived: true,
            }}
            viewMode={viewMode}
            onSelect={() => navigate(`/coordinator/project/${project.id}`)}
            onArchive={handleUnarchive}
          />
        ))}
      </div>
    )}
  </div>
);
}

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
    <div className="text-center py-16 text-slate-500">
      <ArchiveRestore size={64} className="mx-auto mb-4 text-slate-300" />
      <p className="text-lg font-medium">No archived projects</p>
      <p className="text-sm mt-1">Projects you archive will appear here</p>
    </div>
  );
}
