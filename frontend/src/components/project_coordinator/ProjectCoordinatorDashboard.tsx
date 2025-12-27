/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import {
  Search,
  Grid,
  List,
  Folder,
  Users,
  CheckCircle2,
  Clock,
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

        // Normalise response shape
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
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Coordinator Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and track assigned projects
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <SummaryCard
          icon={<Users className="text-blue-700" size={24} />}
          value={cards.total_projects}
          label="Total Projects"
          bg="bg-blue-50"
        />
        <SummaryCard
          icon={<CheckCircle2 className="text-emerald-700" size={24} />}
          value={cards.completed_works}
          label="Completed Projects"
          bg="bg-emerald-50"
        />
        <SummaryCard
          icon={<Clock className="text-yellow-700" size={24} />}
          value={cards.pending_works}
          label="Pending Projects"
          bg="bg-yellow-50"
        />
      </div>

      {/* Search & View Toggle */}
      <div className="bg-white rounded-lg border border-slate-200 mb-6 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search projects"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setPage(1);
                  setSearchTerm(searchInput);
                }
              }}
              className="pl-10"
            />
          </div>

          <div className="flex border rounded-lg">
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
                progress: project.progress,
                status: project.status || "",
                poNumber: project.po_number,
                purchaseOrderId: project.purchase_order_id,
                uploadedFiles: project.uploaded_files || [],
              }}
              viewMode={viewMode}
              userRole=""
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

function SummaryCard({
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
    <div className={`flex items-center gap-3 rounded-lg p-3 ${bg}`}>
      <div className="p-2 rounded-full bg-white">{icon}</div>
      <div>
        <div className="text-lg font-bold">{value}</div>
        <div className="text-xs">{label}</div>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12 text-slate-400">
      <Folder size={48} className="mx-auto mb-4" />
      <p className="text-lg font-medium">No projects found</p>
      <p className="text-sm">Try adjusting your search</p>
    </div>
  );
}
