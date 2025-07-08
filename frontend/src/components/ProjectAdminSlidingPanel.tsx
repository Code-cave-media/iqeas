import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar,
  MapPin,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
// Step components (to be implemented)

import AdminDeliveryStage from "./AdminDeliveryStage";
import AdminPMStage from "./AdminPMStage";
import AdminEstimationStage from "./AdminEstimationStage";
import AdminRFQStage from "./AdminRFQStage";

const stepList = [
  { key: "rfq", label: "RFQ Submission" },
  { key: "estimation", label: "Estimation Submission" },
  { key: "pm", label: "PM Submission" },
  { key: "delivery", label: "Project Delivery" },
];

const getStepStatus = (project, stepIdx) => {
  // All steps completed for sample data
  return "completed";
};

const statusColor = {
  completed: "bg-green-100 text-green-700 border-green-200",
  "in-progress": "bg-orange-100 text-orange-700 border-orange-200",
  "not-started": "bg-gray-100 text-gray-500 border-gray-200",
};

export default function ProjectAdminSlidingPanel({ selectedProject, onClose }) {
  const [openStep, setOpenStep] = useState("estimation"); // default open in-progress

  return (
    <div className="fixed top-0 left-64 right-0 bottom-0 z-50 h-full w-[calc(100vw-16rem)] flex overflow-y-scroll max-h-screen">
      <div
        className="absolute inset-0 bg-black bg-opacity-20"
        onClick={onClose}
      />
      <div className="relative w-full h-full bg-white p-6 flex flex-col">
        <div className="space-y-4">
          {stepList.map((step, idx) => {
            const status = getStepStatus(selectedProject, idx);
            const isOpen = openStep === step.key || status === "in-progress";
            return (
              <div key={step.key} className="border rounded-lg">
                <button
                  className={`w-full flex items-center justify-between px-6 py-3 font-semibold text-lg focus:outline-none ${statusColor[status]}`}
                  onClick={() => setOpenStep(isOpen ? null : step.key)}
                >
                  <span>{step.label}</span>
                  <span className="flex items-center gap-2">
                    {status === "completed" && (
                      <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
                    )}
                    {status === "in-progress" && (
                      <span className="w-3 h-3 rounded-full bg-orange-500 inline-block" />
                    )}
                    {status === "not-started" && (
                      <span className="w-3 h-3 rounded-full bg-gray-400 inline-block" />
                    )}
                    {isOpen ? <ChevronUp /> : <ChevronDown />}
                  </span>
                </button>
                {isOpen && (
                  <div className="p-6">
                    {/* Step content will be rendered here by step component */}
                    {step.key === "rfq" && (
                      <AdminRFQStage project={selectedProject} />
                    )}
                    {step.key === "estimation" && (
                      <AdminEstimationStage project={selectedProject} />
                    )}
                    {step.key === "pm" && (
                      <AdminPMStage selectedProject={selectedProject} />
                    )}
                    {step.key === "delivery" && (
                      <AdminDeliveryStage project={selectedProject} />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button
          className="mt-6 border rounded px-6 py-2 self-end w-full pt-10"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
