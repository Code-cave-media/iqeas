import { Calendar, MapPin, Users, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

interface Project {
  id: string;
  clientName: string;
  location: string;
  createdDate: string;
  status: string;
  assignedTeams: string[];
  progress: number;
  priority: string;
  estimatedCompletion: string;
}

interface ProjectCardProps {
  project: Project;
  onSelect: () => void;
  viewMode: "grid" | "list";
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "Data Collection":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Under Estimation":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "In Progress":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "Finalized":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "High":
      return "text-red-600";
    case "Medium":
      return "text-yellow-600";
    case "Low":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export const ProjectCard = ({
  project,
  onSelect,
  viewMode,
}: ProjectCardProps) => {
  const isOverdue =
    new Date(project.estimatedCompletion) < new Date() &&
    project.status !== "Finalized";

  if (viewMode === "list") {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="font-semibold text-slate-800">{project.id}</h3>
                  <Badge className={getStatusColor(project.status)}>
                    {project.status}
                  </Badge>
                  {isOverdue && (
                    <AlertCircle size={16} className="text-red-500" />
                  )}
                </div>
                <p className="text-lg font-medium text-slate-700">
                  {project.clientName}
                </p>
                <div className="flex items-center text-sm text-slate-500 space-x-4 mt-1">
                  <span className="flex items-center">
                    <MapPin size={14} className="mr-1" />
                    {project.location}
                  </span>
                  <span className="flex items-center">
                    <Calendar size={14} className="mr-1" />
                    {new Date(project.createdDate).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Progress</p>
                <div className="flex items-center space-x-2">
                  <Progress value={project.progress} className="w-20" />
                  <span className="text-sm font-medium">
                    {project.progress}%
                  </span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Priority</p>
                <span
                  className={`text-sm font-medium ${getPriorityColor(
                    project.priority
                  )}`}
                >
                  {project.priority}
                </span>
              </div>
              <div className="text-center">
                <p className="text-sm text-slate-500 mb-1">Teams</p>
                <div className="flex flex-wrap gap-1">
                  {project.assignedTeams.slice(0, 2).map((team, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {team.split(" ")[0]}
                    </Badge>
                  ))}
                  {project.assignedTeams.length > 2 && (
                    <span className="text-xs text-slate-500">
                      +{project.assignedTeams.length - 2}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-black text-white w-full" onClick={onSelect}>
              Manage Project
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-slate-800">{project.id}</h3>
              {isOverdue && <AlertCircle size={16} className="text-red-500" />}
            </div>
            <h2 className="text-lg font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">
              {project.clientName}
            </h2>
          </div>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          <div className="flex items-center text-sm text-slate-600">
            <MapPin size={14} className="mr-2" />
            {project.location}
          </div>
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center">
              <Calendar size={14} className="mr-2" />
              {new Date(project.createdDate).toLocaleDateString()}
            </div>
            <span
              className={`font-medium ${getPriorityColor(project.priority)}`}
            >
              {project.priority} Priority
            </span>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Progress</span>
              <span className="text-sm font-medium text-slate-800">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
          <div>
            <div className="flex items-center text-sm text-slate-600 mb-2">
              <Users size={14} className="mr-2" />
              Assigned Teams
            </div>
            <div className="flex flex-wrap gap-1">
              {project.assignedTeams.map((team, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {team}
                </Badge>
              ))}
            </div>
          </div>
          <div className="flex items-center text-sm text-slate-600 pt-2 border-t">
            <Clock size={14} className="mr-2" />
            <span>
              Due: {new Date(project.estimatedCompletion).toLocaleDateString()}
            </span>
          </div>
          <div className="mt-6 flex justify-end">
            <Button className="bg-black text-white w-full" onClick={onSelect}>
              Manage Project
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
