import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, Users, Upload, MessageCircle, Send } from "lucide-react";

const STAGES = ["IDC", "IFR", "IFA", "AFC"];

const mockDeliverables = [
  {
    id: "D-1",
    name: "Piping Layout - Zone 1",
    stages: [
      {
        name: "IDC",
        assignedTo: "Anand",
        plannedStart: "2024-07-01",
        plannedEnd: "2024-07-05",
        actualHours: 12,
        drafts: [
          { version: "v1.0", file: "Piping_Layout_Zone1_IDC_v1.pdf", status: "Draft", comments: ["Initial draft uploaded."] }
        ],
        status: "Draft",
        reviewerComments: "Looks good, minor changes needed.",
        submittedToDocs: false,
        history: ["Draft uploaded 2024-07-01"]
      },
      { name: "IFR" },
      { name: "IFA" },
      { name: "AFC" }
    ]
  }
];

export const ProjectExecutionFlow = ({ section, user }: { section: string; user: any }) => {
  const [selectedStage, setSelectedStage] = useState<{
    deliverableId: string;
    stageName: string;
  } | null>(null);

  const deliverables = mockDeliverables;

  const openStagePanel = (deliverableId: string, stageName: string) => {
    setSelectedStage({ deliverableId, stageName });
  };

  const closeStagePanel = () => setSelectedStage(null);

  if (section === "deliverables") {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Deliverables</h1>
        <div className="bg-white rounded-lg shadow p-4">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-3 text-left">Deliverable</th>
                {STAGES.map(stage => (
                  <th key={stage} className="py-2 px-3 text-center">{stage}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {deliverables.map(deliv => (
                <tr key={deliv.id} className="border-b hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium">{deliv.name}</td>
                  {STAGES.map(stage => {
                    const stageData = deliv.stages.find(s => s.name === stage);
                    return (
                      <td key={stage} className="py-2 px-3 text-center">
                        {stageData ? (
                          <Button size="sm" variant="outline" onClick={() => openStagePanel(deliv.id, stage)}>
                            {stageData.status || "–"} {stageData.drafts ? `(${stageData.drafts.length})` : ""}
                          </Button>
                        ) : (
                          <span className="text-slate-400">–</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Stage Panel */}
        {selectedStage && (
          <StagePanel
            deliverable={deliverables.find(d => d.id === selectedStage.deliverableId)!}
            stage={selectedStage.stageName}
            onClose={closeStagePanel}
          />
        )}
      </div>
    );
  }
  // Placeholder for other sections
  return (
    <div className="p-6 text-slate-500">{section.charAt(0).toUpperCase() + section.slice(1)} section coming soon.</div>
  );
};

function StagePanel({ deliverable, stage, onClose }: { deliverable: any; stage: string; onClose: () => void }) {
  const stageData = deliverable.stages.find((s: any) => s.name === stage);
  if (!stageData) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600" onClick={onClose}>&times;</button>
        <h2 className="text-xl font-bold mb-2">{deliverable.name} – {stage}</h2>
        <div className="mb-4 flex gap-4">
          <div>
            <div className="text-xs text-slate-500">Assigned To</div>
            <div className="font-medium">{stageData.assignedTo || <span className="text-slate-400">–</span>}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Planned Start</div>
            <div>{stageData.plannedStart || <span className="text-slate-400">–</span>}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Planned End</div>
            <div>{stageData.plannedEnd || <span className="text-slate-400">–</span>}</div>
          </div>
          <div>
            <div className="text-xs text-slate-500">Actual Hours</div>
            <div>{stageData.actualHours ?? <span className="text-slate-400">–</span>}</div>
          </div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Drafts</div>
          {stageData.drafts && stageData.drafts.length > 0 ? (
            <ul className="space-y-1">
              {stageData.drafts.map((draft: any, i: number) => (
                <li key={i} className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <span>{draft.file}</span>
                  <Badge variant="secondary">{draft.version}</Badge>
                  <span className="text-xs text-slate-500">{draft.status}</span>
                </li>
              ))}
            </ul>
          ) : <div className="text-slate-400">No drafts uploaded.</div>}
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">Reviewer Comments</div>
          <div className="bg-slate-50 rounded p-2 min-h-[40px]">{stageData.reviewerComments || <span className="text-slate-400">No comments.</span>}</div>
        </div>
        <div className="mb-4">
          <div className="text-xs text-slate-500 mb-1">History</div>
          <ul className="text-xs text-slate-600 list-disc ml-5">
            {stageData.history?.map((h: string, i: number) => <li key={i}>{h}</li>)}
          </ul>
        </div>
        <div className="flex gap-2 mt-4">
          <Button variant="default" className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
            <Upload size={16} /> Upload Draft
          </Button>
          <Button variant="outline" className="flex items-center gap-2">
            <MessageCircle size={16} /> Add Comment
          </Button>
          <Button variant="secondary" className="flex items-center gap-2">
            <Send size={16} /> Submit to Docs
          </Button>
        </div>
      </div>
    </div>
  );
} 