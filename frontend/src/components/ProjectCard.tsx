import {
  Calendar,
  MapPin,
  Users,
  Clock,
  AlertCircle,
  DollarSign,
} from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Project } from "@/types/apiTypes";

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  viewMode: "grid" | "list";
  userRole?: string;
}

const getPriorityColor = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return "text-red-600 capitalize";
    case "medium":
      return "text-yellow-600 capitalize";
    case "low":
      return "text-green-600 capitalize";
    default:
      return "text-gray-600 capitalize";
  }
};

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "draft":
      return "bg-gray-200 text-gray-800 border-gray-300 hover:bg-gray-300 capitalize";
    case "estimating":
      return "bg-amber-100 text-amber-800 border-amber-200 hover:bg-amber-200 capitalize";
    case "working":
      return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200 capitalize";
    case "completed":
      return "bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 capitalize";
    case "delivered":
      return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200 capitalize";
    default:
      return "bg-slate-200 text-slate-700 border-slate-300 hover:bg-slate-300 capitalize";
  }
};

export const ProjectCard = ({
  project,
  onSelect,
  viewMode,
}: ProjectCardProps) => {
  const isOverdue =
    project.estimation &&
    new Date(project.estimation.deadline) < new Date() &&
    project.status.toLowerCase() !== "completed";

  const isCompleted = ["delivered"].includes(project.status.toLowerCase());

  const createdDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : "N/A";

  const deadlineDate = project.estimation?.deadline
    ? new Date(project.estimation.deadline).toLocaleDateString()
    : "N/A";

  // LIST VIEW
  if (viewMode === "list") {
    return (
      <Card
        className={`hover:shadow-md transition-shadow ${
          isCompleted ? "bg-green-50" : "bg-gray-50"
        }`}
      >
        <CardContent className="p-4 flex flex-col sm:flex-row justify-between gap-4">
          <div className="flex flex-col flex-1 gap-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-slate-800">
                {project.project_id}
              </h3>
              <Badge className={`${getStatusColor(project.status)} w-fit`}>
                {project.status || "N/A"}
              </Badge>
              {isOverdue && <AlertCircle size={16} className="text-red-500" />}
            </div>
            <h2 className="text-lg font-semibold text-slate-800">
              {project.name}
            </h2>
            <p className="text-sm text-slate-600">
              {project.client_name || "N/A"} - {project.client_company || "N/A"}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
              {project.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={12} /> {project.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar size={12} /> {createdDate}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-2 sm:gap-4">
            {project.estimation && (
              <div className="flex items-center gap-1 text-sm">
                <DollarSign size={14} /> {project.estimation.cost || "N/A"}
              </div>
            )}
            <span
              className={`text-sm font-medium ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority || "N/A"}
            </span>
            <Badge variant="outline" className="text-xs">
              {project.project_type || "N/A"}
            </Badge>
          </div>
        </CardContent>

        <div className="px-4 pb-4">
          <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
            <span>Progress</span>
            <span className="text-xs">{project.progress ?? 0}%</span>
          </div>
          <Progress
            value={project.progress ?? 0}
            className="h-2 bg-slate-100"
          />
        </div>

        <div className="px-4 pb-4">
          <Button className="w-full bg-black text-white" onClick={onSelect}>
            Manage Project
          </Button>
        </div>
      </Card>
    );
  }

  // GRID VIEW
  return (
    <Card
      className={`hover:shadow-lg transition-shadow group h-full flex flex-col ${
        isCompleted ? "bg-green-50" : "bg-gray-50"
      }`}
    >
      <CardHeader className="flex flex-col pb-2 gap-2">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-slate-800">{project.project_id}</h3>
          <Badge className={getStatusColor(project.status)}>
            {project.status || "N/A"}
          </Badge>
        </div>
        <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
          {project.name}
        </h2>
        <p className="text-sm text-slate-600">
          {project.client_name || "N/A"} - {project.client_company || "N/A"}
        </p>
      </CardHeader>

      <CardContent className="flex flex-col gap-2">
        <div className="flex justify-between items-center text-sm text-slate-600">
          <div className="flex items-center gap-1">
            <MapPin size={14} /> {project.location || "N/A"}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} /> {createdDate}
          </div>
        </div>

        {project.estimation && (
          <div className="flex justify-between items-center text-sm text-slate-600 mt-1">
            <div className="flex items-center gap-1">
              <DollarSign size={14} /> {project.estimation.cost || "N/A"}
            </div>
            <div className="flex items-center gap-1">
              <Clock size={14} /> {deadlineDate}
            </div>
          </div>
        )}

        <div className="flex justify-between items-center mt-2">
          <span
            className={`text-sm font-medium ${getPriorityColor(
              project.priority
            )}`}
          >
            {project.priority || "N/A"} Priority
          </span>
          <Badge variant="outline" className="text-xs">
            {project.project_type || "N/A"}
          </Badge>
        </div>

        <div className="mt-2">
          <div className="flex justify-between items-center mb-1 text-sm text-slate-600">
            <span>Progress</span>
            <span className="text-xs">{project.progress ?? 0}%</span>
          </div>
          <Progress
            value={project.progress ?? 0}
            className="h-2 bg-slate-100"
          />
        </div>

        <div className="mt-4">
          <Button className="w-full bg-black text-white" onClick={onSelect}>
            Manage Project
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
