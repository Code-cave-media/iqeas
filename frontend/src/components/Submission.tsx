import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ShowFile from "@/components/ShowFile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronDown, ChevronUp } from "lucide-react";

const STAGES = ["IDC", "IFR", "IFA", "AFC"];
const STAGE_COLORS = {
  approved: "bg-green-100 text-green-700 border-green-300",
  inProgress: "bg-orange-100 text-orange-700 border-orange-300",
  disabled: "bg-gray-100 text-gray-400 border-gray-200",
};

// Mock deliverables and tasks for demonstration
const mockDeliverables = [
  { id: "d1", name: "P&ID Drawing", stage: "IDC" },
  { id: "d2", name: "Layout Plan", stage: "IDC" },
  { id: "d3", name: "Cable Schedule", stage: "IFR" },
];
const mockTasks = [
  { id: "t1", deliverableId: "d1", title: "Draft P&ID", status: "completed" },
  {
    id: "t2",
    deliverableId: "d2",
    title: "Review Layout",
    status: "completed",
  },
  {
    id: "t3",
    deliverableId: "d3",
    title: "Draft Cable Schedule",
    status: "todo",
  },
];

// System files available for selection
const SYSTEM_FILES = [
  { id: "sys1", label: "P&ID Drawing", file: "pid.pdf" },
  { id: "sys2", label: "Layout Plan", file: "layout.pdf" },
];

function getStageStatus(timeline) {
  if (timeline.some((item) => item.action === "approved")) return "approved";
  if (timeline.some((item) => item.action === "submitted")) return "inProgress";
  return "disabled";
}

const initialTimelines = {
  IDC: [
    { action: "in-progress", note: null, uploaded_files: [] },
    {
      action: "submitted",
      note: "Submitted for review",
      uploaded_files: [
        { label: "IFR Drawing", url: "https://example.com/ifrdrawing.pdf" },
        { label: "IFR Spec", url: "https://example.com/ifrspec.pdf" },
      ],
    },
    {
      action: "rejected",
      note: "Please update the drawing as per comments.",
      uploaded_files: [
        { label: "Review Comments", url: "https://example.com/comments.pdf" },
      ],
    },
    {
      action: "reopened",
      note: "Updated as per comments.",
      uploaded_files: [
        { label: "Revised Drawing", url: "https://example.com/revised.pdf" },
      ],
    },
    {
      action: "submitted",
      note: "Resubmitted for approval.",
      uploaded_files: [
        { label: "Final Drawing", url: "https://example.com/final.pdf" },
      ],
    },
    {
      action: "approved",
      note: "Approved. Ready for next stage.",
      uploaded_files: [],
    },
  ],
  IFR: [
    { action: "in-progress", note: null, uploaded_files: [] },
    {
      action: "submitted",
      note: "Submitted for review",
      uploaded_files: [
        { label: "IFR Drawing", url: "https://example.com/ifrdrawing.pdf" },
        { label: "IFR Spec", url: "https://example.com/ifrspec.pdf" },
      ],
    },
    {
      action: "rejected",
      note: "Please update the drawing as per comments.",
      uploaded_files: [
        { label: "Review Comments", url: "https://example.com/comments.pdf" },
      ],
    },
  ],
  IFA: [{ action: "disabled", note: null, uploaded_files: [] }],
  AFC: [{ action: "disabled", note: null, uploaded_files: [] }],
};

type UploadFile = { file: File; label: string; tempUrl: string };

const statusBadge = (status: string) => {
  if (status === "completed")
    return "bg-green-100 text-green-700 border-green-300";
  if (status === "todo" || status === "in-progress")
    return "bg-orange-100 text-orange-700 border-orange-300";
  return "bg-gray-100 text-gray-500 border-gray-200";
};

const Submission = ({ projectId }) => {
  const [timelines, setTimelines] = useState(initialTimelines);
  const [currentStage, setCurrentStage] = useState("IDC");
  const [pmNote, setPmNote] = useState("");
  const [pmFiles, setPmFiles] = useState<UploadFile[]>([]);
  const [showPmDialog, setShowPmDialog] = useState(false);
  const [openDeliverable, setOpenDeliverable] = useState<string | null>(null);
  const [reopenTaskId, setReopenTaskId] = useState<string | null>(null);
  const [reopenNote, setReopenNote] = useState("");
  const [reopenFiles, setReopenFiles] = useState<UploadFile[]>([]);
  const [reopenSystemFiles, setReopenSystemFiles] = useState<string[]>([]);

  // Determine which stage is enabled
  const enabledStage =
    STAGES.find(
      (stage, idx) =>
        (idx === 0 && getStageStatus(timelines[stage]) !== "approved") ||
        (idx > 0 &&
          getStageStatus(timelines[STAGES[idx - 1]]) === "approved" &&
          getStageStatus(timelines[stage]) !== "approved")
    ) || "IDC";

  // PM submits to documentation team
  const handlePmSubmit = () => {
    setTimelines((prev) => ({
      ...prev,
      [currentStage]: [
        ...prev[currentStage],
        {
          action: "submitted",
          note: pmNote,
          uploaded_files: pmFiles.map((f) => ({
            label: f.label,
            url: f.tempUrl,
          })),
        },
      ],
    }));
    setPmNote("");
    setPmFiles([]);
    setShowPmDialog(false);
  };

  // PM reopens after rejection (for task)
  const handleTaskReopen = (taskId: string) => {
    // Implement task reopen logic here (mock for now)
    alert(`Task ${taskId} reopened!`);
  };

  // File input handlers
  const handleFileInput =
    (setter: React.Dispatch<React.SetStateAction<UploadFile[]>>) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setter((prev) => [
        ...prev,
        ...files
          .filter((file): file is File => file instanceof File)
          .map((file) => ({
            file,
            label: file.name,
            tempUrl: URL.createObjectURL(file),
          })),
      ]);
      e.target.value = "";
    };
  const handleFileLabel = (setter, idx) => (e) => {
    setter((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f))
    );
  };
  const removeFile = (setter, idx) => () => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleReopenFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReopenFiles((prev) => [
      ...prev,
      ...files
        .filter((file): file is File => file instanceof File)
        .map((file) => ({
          file,
          label: file.name,
          tempUrl: URL.createObjectURL(file),
        })),
    ]);
    e.target.value = "";
  };
  const handleReopenFileLabel =
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setReopenFiles((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f))
      );
    };
  const removeReopenFile = (idx: number) => () => {
    setReopenFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleReopenSubmit = () => {
    // Mock: show alert and close modal
    alert(
      `Task ${reopenTaskId} reopened with note: ${reopenNote}\nSystem files: ${reopenSystemFiles.join(
        ", "
      )}`
    );
    setReopenTaskId(null);
    setReopenNote("");
    setReopenFiles([]);
    setReopenSystemFiles([]);
  };

  return (
    <div className="w-full  mx-auto p-4 z-50">
      <div className="flex gap-4 mb-8">
        {STAGES.map((stage, idx) => {
          const status =
            getStageStatus(timelines[stage]) === "approved"
              ? "approved"
              : enabledStage === stage
              ? "inProgress"
              : "disabled";
          return (
            <div
              key={stage}
              className={`flex-1 flex flex-col items-center p-2 rounded-lg border-2 transition cursor-pointer select-none ${
                STAGE_COLORS[status]
              } ${
                currentStage === stage
                  ? "ring-2 ring-blue-400"
                  : "hover:ring-2 hover:ring-blue-200"
              }`}
              onClick={() => status !== "disabled" && setCurrentStage(stage)}
              style={{ opacity: status === "disabled" ? 0.6 : 1 }}
            >
              <div className="font-bold text-lg mb-1">{stage}</div>
              <div className="text-xs capitalize">
                {status.replace(/([A-Z])/g, " $1").toLowerCase()}
              </div>
            </div>
          );
        })}
      </div>
      {/* Stage Timeline and PM Submission */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="flex-1">
          <h3 className="font-semibold text-blue-900 mb-2 text-lg">
            {currentStage} Timeline
          </h3>
          <div className="bg-slate-50 rounded-lg p-4 border">
            <div className="relative pl-6">
              <div
                className="absolute left-2 top-0 bottom-0 w-1 bg-blue-50 rounded"
                style={{ zIndex: 0 }}
              />
              {timelines[currentStage].map((item, idx) => {
                let color = "",
                  icon = null;
                if (item.action === "in-progress") {
                  color = "bg-orange-100 text-orange-700 border-orange-300";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-orange-500 rounded-full" />
                  );
                } else if (item.action === "submitted") {
                  color = "bg-blue-100 text-blue-700 border-blue-300";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-blue-500 rounded-full" />
                  );
                } else if (item.action === "rejected") {
                  color = "bg-red-100 text-red-700 border-red-300";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />
                  );
                } else if (item.action === "reopened") {
                  color = "bg-yellow-100 text-yellow-700 border-yellow-300";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />
                  );
                } else if (item.action === "approved") {
                  color = "bg-green-100 text-green-700 border-green-300";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
                  );
                } else {
                  color = "bg-gray-100 text-gray-400 border-gray-200";
                  icon = (
                    <span className="inline-block w-3 h-3 bg-gray-400 rounded-full" />
                  );
                }
                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-3 mb-4 relative z-10`}
                  >
                    <span
                      className={`inline-flex items-center justify-center w-7 h-7 rounded-full border-2 border-white shadow ${color}`}
                    >
                      {icon}
                    </span>
                    <div className="flex-1">
                      <div className="font-semibold text-base capitalize">
                        {item.action.replace("-", " ")}
                      </div>
                      {item.note && (
                        <div className="mb-1 text-sm">Note: {item.note}</div>
                      )}
                      {item.uploaded_files &&
                        item.uploaded_files.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {item.uploaded_files.map((f, i) => (
                              <ShowFile
                                key={i}
                                label={f.label}
                                url={f.url}
                                size="small"
                              />
                            ))}
                          </div>
                        )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex-1">
          {/* PM Actions */}
          {enabledStage === currentStage &&
            getStageStatus(timelines[currentStage]) !== "approved" && (
              <div className="mb-6">
                <Button className="mt-3" onClick={() => setShowPmDialog(true)}>
                  Submit to Documentation Team
                </Button>
                <Dialog open={showPmDialog} onOpenChange={setShowPmDialog}>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>Submit to Documentation Team</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Note
                        </label>
                        <Textarea
                          placeholder="Add a note (optional)"
                          value={pmNote}
                          onChange={(e) => setPmNote(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Upload Files
                        </label>
                        <Input
                          type="file"
                          multiple
                          onChange={handleFileInput(setPmFiles)}
                        />
                        {pmFiles.map((f, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 mt-1"
                          >
                            <Input
                              type="text"
                              value={f.label}
                              onChange={handleFileLabel(setPmFiles, idx)}
                              className={f.label.trim() ? "" : "border-red-400"}
                            />
                            <span className="text-xs">
                              {f.file && f.file.name}
                            </span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={removeFile(setPmFiles, idx)}
                            >
                              &times;
                            </Button>
                          </div>
                        ))}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">
                          Existing Files from Tasks
                        </label>
                        <div className="flex flex-wrap gap-2">
                          {/* TODO: Replace with real files from completed tasks for this stage's deliverables */}
                          <ShowFile
                            label="Sample Task File.pdf"
                            url="https://example.com/sample.pdf"
                            size="small"
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2 mt-4">
                        <Button
                          variant="outline"
                          onClick={() => setShowPmDialog(false)}
                        >
                          Cancel
                        </Button>
                        <Button onClick={handlePmSubmit}>Submit</Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
        </div>
      </div>
      {/* Deliverables and Tasks for Stage - Accordion style */}
      <div className="mt-8">
        <h4 className="font-semibold mb-2">Deliverables for {currentStage}</h4>
        <div className="bg-slate-50 rounded-lg p-4 border">
          {mockDeliverables.filter((d) => d.stage === currentStage).length ===
          0 ? (
            <div className="text-slate-400">
              No deliverables for this stage.
            </div>
          ) : (
            mockDeliverables
              .filter((d) => d.stage === currentStage)
              .map((d) => {
                const isOpen = openDeliverable === d.id;
                const lastTimeline =
                  timelines[currentStage][timelines[currentStage].length - 1];
                const canReopen =
                  lastTimeline && lastTimeline.action === "rejected";
                return (
                  <div key={d.id} className="mb-4 border rounded-lg">
                    <div
                      className="flex items-center justify-between px-4 py-2 cursor-pointer select-none bg-white hover:bg-blue-50 rounded-lg"
                      onClick={() => setOpenDeliverable(isOpen ? null : d.id)}
                    >
                      <div className="font-semibold text-blue-800">
                        {d.name}
                      </div>
                      <span className="ml-2">
                        {isOpen ? (
                          <ChevronUp size={20} />
                        ) : (
                          <ChevronDown size={20} />
                        )}
                      </span>
                    </div>
                    {isOpen && (
                      <div className="ml-4 mt-2 mb-2 flex flex-col gap-3">
                        {mockTasks
                          .filter((t) => t.deliverableId === d.id)
                          .map((t) => (
                            <div
                              key={t.id}
                              className="flex items-center justify-between bg-slate-100 rounded-lg px-4 py-2 shadow-sm border"
                            >
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-slate-800 text-base">
                                  {t.title}
                                </span>
                                <span
                                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded border ${statusBadge(
                                    t.status
                                  )}`}
                                >
                                  {t.status.charAt(0).toUpperCase() +
                                    t.status.slice(1)}
                                </span>
                              </div>
                              {canReopen && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setReopenTaskId(t.id)}
                                >
                                  Reopen
                                </Button>
                              )}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                );
              })
          )}
        </div>
      </div>
      {/* Reopen Task Modal */}
      <Dialog
        open={!!reopenTaskId}
        onOpenChange={(open) => {
          if (!open) setReopenTaskId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Reopen Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Note</label>
              <Textarea
                placeholder="Add a note (required)"
                value={reopenNote}
                onChange={(e) => setReopenNote(e.target.value)}
              />
            </div>
            <div>
              <div className="block text-sm font-medium mb-1">
                Select system files:
              </div>
              {SYSTEM_FILES.map((sf) => (
                <label key={sf.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={reopenSystemFiles.includes(sf.id)}
                    onChange={(e) => {
                      setReopenSystemFiles((prev) =>
                        e.target.checked
                          ? [...prev, sf.id]
                          : prev.filter((id) => id !== sf.id)
                      );
                    }}
                  />
                  <ShowFile label={sf.label} url={""} size="small" />
                </label>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Upload Files
              </label>
              <Input type="file" multiple onChange={handleReopenFileInput} />
              {reopenFiles.map((f, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-1">
                  <Input
                    type="text"
                    value={f.label}
                    onChange={handleReopenFileLabel(idx)}
                    className={f.label.trim() ? "" : "border-red-400"}
                  />
                  <span className="text-xs">{f.file && f.file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={removeReopenFile(idx)}
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setReopenTaskId(null)}>
                Cancel
              </Button>
              <Button onClick={handleReopenSubmit}>Reopen Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Submission;
