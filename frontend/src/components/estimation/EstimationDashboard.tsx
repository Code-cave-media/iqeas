import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import type { IEstimationProject } from "@/types/apiTypes";
import {
  Blocks,
  List,
  MapPin,
  User,
  Calendar,
  BadgeCheck,
  AlertCircle,
  Gauge,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

export default function EstimationDashboard() {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<IEstimationProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [listView, setListView] = useState(false);
  const [projectIdMap, setProjectIdMap] = useState<Record<string, string>>({});

  /* ================= FETCH PROJECTS ================= */
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
        setProjects(response.data.projects);
      } else {
        toast.error("Failed to fetch projects");
      }

      setLoading(false);
    };

    getProjects();
  }, [searchTerm, page, authToken, makeApiCall]);

  /* ================= MAP INTERNAL IDS ================= */
  useEffect(() => {
    if (!projects.length) return;

    const fetchIds = async () => {
      const map: Record<string, string> = {};

      await Promise.all(
        projects.map(async (project) => {
          const response = await makeApiCall(
            "get",
            API_ENDPOINT.GET_ID_FROM_PROJECT_ID_NAME(project.project_id),
            {},
            "application/json",
            authToken,
            "getInternalId"
          );

          if (response?.status === 200 && response.data?.[0]) {
            map[project.project_id] = response.data[0].id;
          }
        })
      );

      setProjectIdMap(map);
    };

    fetchIds();
  }, [projects, authToken, makeApiCall]);

  /* ================= SEND TO ADMIN ================= */
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

  return (
    <section className="min-h-screen bg-gray-50 p-6">
      {/* HEADER */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Estimation Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Overview of estimations and projects
          </p>
        </div>

        <div className="flex items-center gap-2 rounded-lg border bg-white p-1">
          <button
            onClick={() => setListView(false)}
            className={`rounded-md p-2 ${!listView ? "bg-gray-100" : ""}`}
          >
            <Blocks size={18} />
          </button>
          <button
            onClick={() => setListView(true)}
            className={`rounded-md p-2 ${listView ? "bg-gray-100" : ""}`}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {/* SEARCH */}
      <div className="mb-6">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search projects..."
          className="w-full md:w-1/2 rounded-lg border px-4 py-2 text-sm"
        />
      </div>

      {/* CONTENT */}
      <div className="rounded-xl bg-white p-6 shadow-sm">
        {loading ? (
          <p className="text-sm text-gray-500">Fetching projects...</p>
        ) : listView ? (
          /* ================= LIST VIEW ================= */
          <ul className="divide-y">
            {projects.map((project) => {
              const canSendToAdmin = ["created", "edited"].includes(
                project.estimation_status
              );

              return (
                <li key={project.id} className="py-4 flex justify-between">
                  <div>
                    <div
                     
                      className="font-medium text-gray-900 hover:underline"
                    >
                      {project.name}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-2">
                      <User size={14} /> {project.client_name}
                      <MapPin size={14} /> {project.location}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-600 flex items-center gap-1">
                      <Gauge size={14} /> {project.progress}%
                    </span>

                    {canSendToAdmin && (
                      <button
                        onClick={(e) => handleSendToAdmin(e, project)}
                        className="rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700"
                      >
                        Send to Admin
                      </button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const canSendToAdmin = ["created", "edited"].includes(
                project.estimation_status
              );

              return (
                <div
                  key={project.id}
                  className="group rounded-xl border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 group-hover:underline">
                        {project.name}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {project.project_id}
                      </p>
                    </div>

                    {project.estimation_status === "approved" ? (
                      <BadgeCheck className="text-green-600" size={18} />
                    ) : (
                      <AlertCircle className="text-yellow-500" size={18} />
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-center gap-2">
                      <User size={14} /> {project.client_name}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} /> {project.location}
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar size={14} />
                      {new Date(project.received_date).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      Progress
                    </span>
                    <span className="text-xs font-semibold text-gray-900">
                      {project.progress}%
                    </span>
                  </div>

                  <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200">
                    <div
                      className="h-1.5 rounded-full bg-black"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                  <a
                    href={`/estimation/${
                      projectIdMap[project.project_id]
                    }/details`}
                  >
                    <button className="mt-4 w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700">
                      View Deliverables <ArrowRight className="w-4 h-4" />
                    </button>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
