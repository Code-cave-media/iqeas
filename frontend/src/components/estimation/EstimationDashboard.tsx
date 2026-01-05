import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { IEstimationProject } from "@/types/apiTypes";
import {
  Plus,
  Search,
  Grid,
  List,
  Users,
  Clock,
  User,
  Building2,
  MapPin,
  Calendar,
  Gauge,
  ArrowRight,
  ArrowLeftRight,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";

export default function EstimationDashboard() {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<IEstimationProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [totalPages, setTotalPages] = useState(1);
  const [cards, setCards] = useState({
    total: 0,
    in_progress: 0,
  });

  useEffect(() => {
    const getProjects = async () => {
      setLoading(true);

      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ALL_ESTIMATION_PROJECTS(searchTerm, page, 20),
        {},
        "application/json",
        authToken,
        "getProjects"
      );

      if (response?.status === 200) {
        setProjects(response.data.projects || []);
        setTotalPages(response.data.total_pages || 1);
        setCards({
          total: response.data.cards?.total || 0,
          in_progress: response.data.cards?.in_progress || 0,
        });
      } else {
        toast.error("Failed to fetch projects");
      }

      setLoading(false);
    };

    getProjects();
  }, [searchTerm, page, authToken, makeApiCall]);

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  const handleSendToAdmin = async (
    e: React.MouseEvent,
    project: IEstimationProject
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(project.id),
      { estimation_status: "sent_to_admin" },
      "application/json",
      authToken,
      `sendToAdmin-${project.id}`
    );

    if (response?.status === 200) {
      toast.success("Sent to admin successfully");
      setProjects((prev) =>
        prev.map((p) =>
          p.id === project.id ? { ...p, estimation_status: "sent_to_admin" } : p
        )
      );
    } else {
      toast.error("Failed to send to admin");
    }
  };

  const getStatusBadge = (project: IEstimationProject) => {
    if (
      project.estimation_status === "back_to_you" &&
      project.estimation?.approved === false
    ) {
      return (
        <div className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-medium text-orange-800">
          <ArrowLeftRight size={14} />
          Back to You
        </div>
      );
    }

    if (project.estimation?.approved === true) {
      return <BadgeCheck className="text-green-600" size={20} />;
    }

    return <AlertCircle className="text-yellow-500" size={20} />;
  };

  const canSendToAdmin = (project: IEstimationProject) =>
    ["created", "edited"].includes(project.estimation_status);

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header with inline controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            Estimation Dashboard
          </h1>
          <p className="text-slate-600">
            Overview of ongoing estimations and deliverables
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Quick Status Pills */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <Users size={16} className="text-blue-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.total} Total
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5">
              <Clock size={16} className="text-yellow-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.in_progress} In Progress
              </span>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setSearchTerm(searchInput), setPage(1))
              }
              className="pl-9 pr-4 py-2 w-64"
            />
          </div>

          {/* View Toggle */}
          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none border-l border-slate-200"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Projects Grid / List */}
      {loading ? (
        <div className="text-center py-16 text-slate-500">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No estimation projects found</p>
          <p className="text-sm mt-1">Try adjusting your search</p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-8 flex-1">
                  <div className="w-32">
                    <p className="font-mono text-sm font-semibold text-slate-700">
                      {project.project_id}
                    </p>
                    <p className="font-medium text-slate-900 mt-1 truncate">
                      {project.name}
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-slate-700">
                      {project.client_name} • {project.client_company || "N/A"}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {project.location}
                    </p>
                  </div>
                  <div className="text-sm text-slate-600">
                    Received:{" "}
                    {project.received_date
                      ? new Date(project.received_date).toLocaleDateString()
                      : "-"}
                  </div>
                </div>

                <div className="flex items-center gap-4 pl-4">
                  <div className="text-right">
                    <div className="flex items-center justify-center gap-2">
                      <p className="text-sm text-slate-600">Progress:</p>
                      <p className="text-sm font-medium text-indigo-800">
                        {project.progress}%
                      </p>
                    </div>
                  </div>

                  <div>{getStatusBadge(project)}</div>

                  {canSendToAdmin(project) && (
                    <Button
                      size="sm"
                      onClick={(e) => handleSendToAdmin(e, project)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Send to Admin
                    </Button>
                  )}

                  <a href={`/estimation/${project.id}/details`}>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight size={14} className="mr-1" />
                      View
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <CardTitle className="text-lg font-mono text-slate-700">
                      {project.project_id}
                    </CardTitle>
                    <h3 className="font-semibold text-slate-800 mt-2 line-clamp-2">
                      {project.name}
                    </h3>
                  </div>
                  <div>{getStatusBadge(project)}</div>
                </div>

                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <User size={14} /> {project.client_name}
                  </p>
                  {project.client_company && (
                    <p className="flex items-center gap-2">
                      <Building2 size={14} /> {project.client_company}
                    </p>
                  )}
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {project.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} />
                    {project.received_date
                      ? new Date(project.received_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                <div className="mt-5">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600">Progress</span>
                    <span className="font-bold text-slate-800">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {canSendToAdmin(project) && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => handleSendToAdmin(e, project)}
                      className="flex-1"
                    >
                      Send to Admin
                    </Button>
                  )}
                  <a
                    href={`/estimation/${project.id}/details`}
                    className="flex-1"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <ArrowRight size={14} className="mr-1" />
                      View Deliverables
                    </Button>
                  </a>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex justify-center mt-10 gap-2">
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
        </div>
      )}
    </div>
  );
}
