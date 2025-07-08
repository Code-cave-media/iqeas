import React from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, MapPin, Clock, AlertCircle } from "lucide-react";
import ShowFile from "./ShowFile";

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

export default function AdminRFQStage({ project }) {
  const isOverdue =
    new Date(project.estimatedCompletion) < new Date() &&
    project.status !== "Finalized";
  return (
    <div className="bg-white border-b p-0 w-full">
      <div className="bg-blue-50 px-8 py-5 border-b">
        <h2 className="text-2xl font-bold text-blue-900 mb-1">
          Data Collection
        </h2>
        <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600">
          <span className="font-semibold text-slate-800">{project.id}</span>
          <span>{project.clientName}</span>
          <Badge className={getStatusColor(project.status)}>
            {project.status}
          </Badge>
          {isOverdue && <AlertCircle size={16} className="text-red-500 ml-2" />}
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Client Name
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.clientName || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Client Company
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.clientCompany || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Location
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.location}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Project Type
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.projectType || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Priority
            </div>
            <div
              className={`bg-slate-100 rounded px-3 py-2 font-semibold ${getPriorityColor(
                project.priority
              )}`}
            >
              {project.priority}
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Received Date
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.createdDate
                ? new Date(project.createdDate).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Deadline
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-rose-700 font-semibold">
              {project.estimatedCompletion
                ? new Date(project.estimatedCompletion).toLocaleDateString()
                : "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Contact Person
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.contactPerson || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Phone
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.phone || "-"}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Email
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {project.email || "-"}
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 pb-8">
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">Notes</div>
          <div className="bg-slate-50 rounded px-3 py-2 border text-slate-700 text-sm min-h-[40px]">
            {project.notes || "-"}
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Progress
          </div>
          <div className="flex items-center gap-4">
            <Progress value={project.progress} className="w-32" />
            <span className="text-sm font-medium">{project.progress}%</span>
          </div>
        </div>
        {project.uploadedFiles && project.uploadedFiles.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Uploaded Files
            </div>
            <div className="flex flex-col gap-2">
              {project.uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <ShowFile label={file.label} url={file.url} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
