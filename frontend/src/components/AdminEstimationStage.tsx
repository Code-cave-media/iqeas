import React from "react";
import ShowFile from "@/components/ShowFile";
import { Badge } from "@/components/ui/badge";

// Mock estimation details (replace with real data as needed)
const estimationDetails = {
  projectId: "PRJ-2024-001",
  clientName: "Saudi Aramco",
  estimator: "Ahmed Al-Rashid",
  status: "Draft",
  clarificationLog: [],
  costEstimate: "2,500,000",
  costBreakdownFile: {
    label: "Cost Breakdown.xlsx",
    url: "/files/cost-breakdown.xlsx",
  },
  estimationPDF: { label: "Estimation.pdf", url: "/files/estimation.pdf" },
  deadline: "2024-02-28",
  approvalDate: "2024-02-20",
  forwardedTo: "PM Team 1",
  remarks: "Reviewed and approved by client.",
  updates: [],
  uploadedFiles: [
    { label: "BOQ", url: "/files/boq.pdf" },
    { label: "Layout", url: "/files/layout.pdf" },
  ],
};

export default function AdminEstimationStage({ project }) {
  return (
    <div className="bg-white border-b p-0 w-full">
      <div className="bg-blue-50 px-8 py-5 border-b">
        <h2 className="text-2xl font-bold text-blue-900 mb-1">
          Estimation Workflow
        </h2>
        <div className="flex flex-wrap gap-4 items-center text-sm text-slate-600">
          <span className="font-semibold text-slate-800">
            {estimationDetails.projectId}
          </span>
          <span className="">{estimationDetails.clientName}</span>
          <Badge className="bg-gray-100 text-gray-700 border-gray-200 ml-2">
            {estimationDetails.status}
          </Badge>
        </div>
      </div>
      <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Estimator Assigned
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {estimationDetails.estimator}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Cost Estimate (₹)
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-green-700 font-bold text-lg">
              {estimationDetails.costEstimate}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Cost Breakdown File
            </div>
            {estimationDetails.costBreakdownFile ? (
              <ShowFile
                label={estimationDetails.costBreakdownFile.label}
                url={estimationDetails.costBreakdownFile.url}
              />
            ) : (
              <span className="text-slate-400 ml-2">No file</span>
            )}
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Estimation PDF
            </div>
            {estimationDetails.estimationPDF ? (
              <ShowFile
                label={estimationDetails.estimationPDF.label}
                url={estimationDetails.estimationPDF.url}
              />
            ) : (
              <span className="text-slate-400 ml-2">No file</span>
            )}
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Deadline
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-rose-700 font-semibold">
              {estimationDetails.deadline}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Approval Date
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {estimationDetails.approvalDate}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Forwarded To
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {estimationDetails.forwardedTo}
            </div>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 mb-1">
              Remarks / Notes
            </div>
            <div className="bg-slate-100 rounded px-3 py-2 text-slate-800">
              {estimationDetails.remarks}
            </div>
          </div>
        </div>
      </div>
      <div className="px-8 pb-8">
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Client Clarification Log
          </div>
          <div className="bg-slate-50 rounded px-3 py-2 border text-slate-400 text-sm">
            No clarifications yet.
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Project Updates
          </div>
          <div className="bg-slate-50 rounded px-3 py-2 border text-slate-400 text-sm">
            No updates yet.
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs font-semibold text-slate-500 mb-1">
            Uploaded Additional Documents
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {estimationDetails.uploadedFiles &&
            estimationDetails.uploadedFiles.length > 0 ? (
              estimationDetails.uploadedFiles.map((file, idx) => (
                <ShowFile key={idx} label={file.label} url={file.url} />
              ))
            ) : (
              <span className="text-slate-400 ml-2">No files uploaded</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
