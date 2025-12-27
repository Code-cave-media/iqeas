// src/components/project/ProjectDataCard.tsx
import { FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

type Project = {
  project_id: string;
  client_name?: string;
  name?: string;
  location?: string;
  status: string;
  progress?: number | string;
};

type Props = {
  project: Project;
};

export const ProjectDataCard: React.FC<Props> = ({ project }) => {
  return (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-400">
        <div className="flex items-center gap-3">
          <FileText className="text-white" size={28} />
          <span className="text-lg font-bold text-white">Project Data</span>
        </div>
        <span className="text-xs font-semibold text-white bg-blue-800 px-2 py-1 rounded capitalize">
          {project.project_id}
        </span>
      </div>
      <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 border-b">
        <div>
          <p className="text-xs text-slate-500">Client</p>
          <p className="text-sm font-medium text-slate-800">
            {project.client_name || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Project Name</p>
          <p className="text-sm font-medium text-slate-800">
            {project.name || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Location</p>
          <p className="text-sm font-medium text-slate-800">
            {project.location || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-medium capitalize text-slate-800">
            {project.status || "-"}
          </p>
        </div>
      </div>
      <div className="px-6 py-4 flex items-center gap-3">
        <Progress
          value={
            project.status === "draft" ? 50 : Number(project.progress) || 100
          }
          className="h-2 bg-gray-200 flex-1"
        />
        <span className="text-xs font-mono text-slate-600">
          {project.status === "draft" ? 50 : Number(project.progress) || 100}%
        </span>
      </div>
    </div>
  );
};
