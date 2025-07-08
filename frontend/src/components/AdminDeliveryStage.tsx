import React from "react";
import ShowFile from "@/components/ShowFile";

// Mock delivered files and note
const deliveredFiles = [
  { label: "Final Report.pdf", url: "/files/final-report.pdf" },
  {
    label: "Completion Certificate.pdf",
    url: "/files/completion-certificate.pdf",
  },
  { label: "As-Built Drawings.zip", url: "/files/as-built-drawings.zip" },
];
const deliveryNote =
  "All project deliverables have been submitted and approved. Please find the final documents attached.";

export default function AdminDeliveryStage({ project }) {
  return (
    <div className="bg-slate-50 rounded-xl p-6 border">
      <h3 className="text-lg font-semibold mb-4 text-blue-900">
        Delivered Files
      </h3>
      <div className="flex flex-wrap gap-3 mb-6">
        {deliveredFiles.map((file, idx) => (
          <ShowFile key={idx} label={file.label} url={file.url} />
        ))}
      </div>
      <div className="bg-white rounded-lg p-4 border text-slate-700">
        <span className="font-semibold">Note:</span> {deliveryNote}
      </div>
    </div>
  );
}
