import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Deliverables } from "./Deliverables";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Users, Clock, AlertCircle } from "lucide-react";
import TaskAssignmentPage from "./TaskAssignmentPage";
import Submission from "./Submission";
import ShowFile from "./ShowFile";

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
  estimationDetails: {
    costEstimate: string;
    costBreakdownFile: { label: string; url: string } | null;
    estimationPDF: { label: string; url: string } | null;
    deadline: string;
    approvalDate?: string;
    remarks: string;
    uploadedFiles: { label: string; url: string }[];
  };
}

type PanelTab = "deliverable" | "task" | "documentation";

interface ProjectSlidingPanelProps {
  selectedProject: Project;
}

const ProjectSlidingPanel: React.FC<ProjectSlidingPanelProps> = ({
  selectedProject,
}) => {
  const [panelTab, setPanelTab] = useState<PanelTab>("deliverable");
  return (
    <div className="relative w-full h-full bg-white flex flex-col">
      {/* Tab Buttons */}
      <div className="flex mb-6">
        <button
          className={`flex-1 ${
            panelTab == "deliverable"
              ? "border-b-2 border-blue-600 text-blue-600 "
              : "bg-slate-100 text-slate-700"
          } bg-slate-100 pb-1 py-2`}
          onClick={() => setPanelTab("deliverable")}
        >
          Deliverables
        </button>
        <button
          className={`flex-1 ${
            panelTab == "task"
              ? "border-b-2 border-blue-600 text-blue-600 "
              : "bg-slate-100 text-slate-700"
          } bg-slate-100 py-2`}
          onClick={() => setPanelTab("task")}
        >
          Task
        </button>
        <button
          className={`flex-1 ${
            panelTab == "documentation"
              ? "border-b-2 border-blue-600 text-blue-600 "
              : "bg-slate-100 text-slate-700"
          } bg-slate-100 py-2 `}
          onClick={() => setPanelTab("documentation")}
        >
          Submission
        </button>
      </div>
      {/* Tab Content */}
      <div className="flex-1 flex items-center justify-center text-xl  font-semibold w-full">
        {panelTab === "deliverable" && (
          <div className="w-full h-full overflow-auto">
            <Deliverables projectId={selectedProject.id} isAdmin={true} />
          </div>
        )}
        {panelTab === "task" && (
          <div className="w-full h-full overflow-auto">
            <TaskAssignmentPage projectId={selectedProject.id} isAdmin />
          </div>
        )}
        {panelTab === "documentation" && (
          <Submission projectId={selectedProject.id} />
        )}
      </div>
    </div>
  );
};

export default ProjectSlidingPanel;
