/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import ShowFile from "@/components/ShowFile";
import TaskTable from "./TaskTable";
import { Plus } from "lucide-react";

// Types
interface TimelineEntry {
  action:
    | "assigned"
    | "start"
    | "pause"
    | "completed"
    | "reopen"
    | "verified"
    | "pm-rejected";
  files: { id: string; label: string; file?: string }[];
  notes: string | null;
  time: number;
}
export interface Task {
  id: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignedType: "individual" | "team";
  assignedTo: string;
  dueDate: Date;
  notes: string;
  totalHours: number;
  timeline: TimelineEntry[];
  status: "todo" | "in-progress" | "paused" | "completed";
  deliverableId: string;
}
interface UploadFile {
  file: File;
  label: string;
  tempUrl: string;
  id?: string;
}
interface FormState {
  deliverableId: string;
  title: string;
  description: string;
  priority: "low" | "medium" | "high";
  assignedType: "individual" | "team";
  assignedTo: string;
  dueDate: Date;
  notes: string;
  systemFiles: string[];
  uploadFiles: UploadFile[];
  totalHours: number;
}

// Mock data for teams, individuals, and system files
const TEAMS = [
  { id: "team1", name: "Design Team" },
  { id: "team2", name: "Drafting Team" },
];
const INDIVIDUALS = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];
const SYSTEM_FILES = [
  { id: "sys1", label: "P&ID Drawing", file: "pid.pdf" },
  { id: "sys2", label: "Layout Plan", file: "layout.pdf" },
];
const PRIORITIES = ["low", "medium", "high"];
const STAGES = ["IDC", "IFR", "IFA", "AFC"];

// Add mock deliverables
const DELIVERABLES = [
  { id: "d1", label: "P&ID Drawing" },
  { id: "d2", label: "Layout Plan" },
  { id: "d3", label: "Cable Schedule" },
];

// Add a dummy completed task for demo
const DUMMY_COMPLETED_TASK: Task = {
  id: "dummy1",
  deliverableId: "d1",
  title: "Demo Completed Task",
  description: "This is a demo task for PM review.",
  priority: "high",
  assignedType: "individual",
  assignedTo: "1",
  dueDate: new Date(),
  notes: "Initial assignment.",
  totalHours: 4,
  status: "completed",
  timeline: [
    {
      action: "assigned",
      files: [],
      notes: "Assigned by PM.",
      time: Date.now() - 1000 * 60 * 60 * 24,
    },
    {
      action: "completed",
      files: [
        { id: "sys1", label: "P&ID Drawing", file: "pid.pdf" },
        { id: "up1", label: "Test Upload", file: "test.pdf" },
      ],
      notes: "Work done. Please review.",
      time: Date.now() - 1000 * 60 * 60,
    },
  ],
};

function TaskAssignmentPage({
  projectId,
  isAdmin = false,
}: {
  projectId: string;
  isAdmin?: boolean;
}) {
  // State for tasks, modal, and form
  const [tasks, setTasks] = useState<Task[]>([DUMMY_COMPLETED_TASK]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>({
    deliverableId: "",
    title: "",
    description: "",
    priority: "medium",
    assignedType: "individual",
    assignedTo: "",
    dueDate: new Date(),
    notes: "",
    systemFiles: [],
    uploadFiles: [],
    totalHours: 1,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [timelineModal, setTimelineModal] = useState<{
    open: boolean;
    task: Task | null;
  }>({ open: false, task: null });
  const [completeModal, setCompleteModal] = useState<{
    open: boolean;
    taskId: string | null;
  }>({ open: false, taskId: null });
  const [completeFiles, setCompleteFiles] = useState<UploadFile[]>([]);
  const [completeNotes, setCompleteNotes] = useState("");
  const [stageFilter, setStageFilter] = useState<string>(STAGES[0]);
  // PM Review Modal state
  const [reviewModal, setReviewModal] = useState<{
    open: boolean;
    task: Task | null;
  }>({ open: false, task: null });
  const [reviewNote, setReviewNote] = useState("");
  const [reviewFiles, setReviewFiles] = useState<UploadFile[]>([]);
  const [reviewSystemFiles, setReviewSystemFiles] = useState<string[]>([]);

  // --- File upload logic ---
  async function uploadFilesAndGetIds(
    files: UploadFile[]
  ): Promise<{ id: string; label: string }[]> {
    // Replace with actual API upload logic
    // Returns [{id, label}]
    return files.map((f, i) => ({ id: `up${i + 1}`, label: f.label }));
  }

  // --- Task creation ---
  async function handleCreateTask() {
    // Validate
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title required";
    if (!form.priority) errors.priority = "Priority required";
    if (!form.assignedTo) errors.assignedTo = "Assignee required";
    if (!form.dueDate) errors.dueDate = "Due date required";
    if (form.uploadFiles.some((f) => !f.label.trim()))
      errors.uploadFiles = "Label required for all uploaded files";
    if (!form.deliverableId) errors.deliverableId = "Deliverable required";
    setFormErrors(errors);
    if (Object.keys(errors).length) return;
    // Upload files first
    const uploaded = await uploadFilesAndGetIds(form.uploadFiles);
    // Compose timeline
    const timeline: TimelineEntry[] = [
      {
        action: "assigned",
        files: [
          ...form.systemFiles.map((id) => {
            const f = SYSTEM_FILES.find((f) => f.id === id);
            return f
              ? { id: f.id, label: f.label, file: f.file }
              : { id: id, label: "", file: undefined };
          }),
          ...uploaded.map((f, i) => ({
            id: f.id,
            label: f.label,
            file: form.uploadFiles[i].file.name,
          })),
        ],
        notes: form.notes,
        time: Date.now(),
      },
    ];
    // Compose task
    const newTask: Task = {
      deliverableId: form.deliverableId,
      id: Math.random().toString(36).slice(2),
      title: form.title,
      description: form.description,
      priority: form.priority,
      assignedType: form.assignedType,
      assignedTo: form.assignedTo,
      dueDate: form.dueDate,
      notes: form.notes,
      totalHours: form.totalHours,
      timeline,
      status: "todo",
    };
    setTasks((prev) => [...prev, newTask]);
    setShowModal(false);
    setForm({
      deliverableId: "",
      title: "",
      description: "",
      priority: "medium",
      assignedType: "individual",
      assignedTo: "",
      dueDate: new Date(),
      notes: "",
      systemFiles: [],
      uploadFiles: [],
      totalHours: 1,
    });
    setFormErrors({});
  }

  // --- Task actions ---
  function handleStart(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "in-progress",
              timeline: [
                ...t.timeline,
                { action: "start", files: [], notes: null, time: Date.now() },
              ],
            }
          : t
      )
    );
  }
  function handlePause(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "paused",
              timeline: [
                ...t.timeline,
                { action: "pause", files: [], notes: null, time: Date.now() },
              ],
            }
          : t
      )
    );
  }
  function handleComplete(taskId: string) {
    setCompleteModal({ open: true, taskId });
    setCompleteFiles([]);
    setCompleteNotes("");
  }
  async function handleCompleteSave() {
    // Upload files first
    const uploaded = await uploadFilesAndGetIds(completeFiles.map((uf) => uf));
    setTasks((prev) =>
      prev.map((t) =>
        t.id === completeModal.taskId
          ? {
              ...t,
              status: "completed",
              timeline: [
                ...t.timeline,
                {
                  action: "completed",
                  files: uploaded.map((f, i) => ({
                    id: f.id,
                    label: f.label,
                    file: completeFiles[i].file.name,
                  })),
                  notes: completeNotes,
                  time: Date.now(),
                },
              ],
            }
          : t
      )
    );
    setCompleteModal({ open: false, taskId: null });
    setCompleteFiles([]);
    setCompleteNotes("");
  }
  function handleReopen(taskId: string) {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: "todo",
              timeline: [
                ...t.timeline,
                { action: "reopen", files: [], notes: null, time: Date.now() },
              ],
            }
          : t
      )
    );
  }

  // PM Review handlers
  const openReviewModal = (task: Task) => {
    setReviewModal({ open: true, task });
    setReviewNote("");
    setReviewFiles([]);
    setReviewSystemFiles([]);
  };
  const handleReviewFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setReviewFiles((prev) => [
      ...prev,
      ...files.map((file) => ({
        file,
        label: file.name,
        tempUrl: URL.createObjectURL(file),
      })),
    ]);
    e.target.value = "";
  };
  const handleReviewFileLabel =
    (idx: number) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setReviewFiles((prev) =>
        prev.map((f, i) => (i === idx ? { ...f, label: e.target.value } : f))
      );
    };
  const removeReviewFile = (idx: number) => () => {
    setReviewFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handleReviewSystemFile = (id: string, checked: boolean) => {
    setReviewSystemFiles((prev) =>
      checked ? [...prev, id] : prev.filter((fid) => fid !== id)
    );
  };
  const handleReviewAction = (action: "verified" | "pm-rejected") => {
    if (!reviewModal.task) return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === reviewModal.task!.id
          ? {
              ...t,
              timeline: [
                ...t.timeline,
                {
                  action,
                  files: [
                    ...reviewSystemFiles.map((id) => {
                      const f = SYSTEM_FILES.find((f) => f.id === id);
                      return f
                        ? { id: f.id, label: f.label, file: f.file }
                        : { id, label: "", file: undefined };
                    }),
                    ...reviewFiles.map((f, i) => ({
                      id: `up${i + 1}`,
                      label: f.label,
                      file: f.file.name,
                    })),
                  ],
                  notes: reviewNote,
                  time: Date.now(),
                },
              ],
            }
          : t
      )
    );
    setReviewModal({ open: false, task: null });
    setReviewNote("");
    setReviewFiles([]);
    setReviewSystemFiles([]);
  };

  // --- Render ---
  return (
    <div className="p-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Tasks</h2>
        {!isAdmin && (
          <Button onClick={() => setShowModal(true)}>
            <Plus size={20} /> Create Task
          </Button>
        )}
      </div>
      {/* Stage Filter */}
      <div className="mb-4 pl-1">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Tasks Table */}
      <TaskTable
        tasks={tasks}
        onStart={isAdmin ? undefined : handleStart}
        onPause={isAdmin ? undefined : handlePause}
        onComplete={isAdmin ? undefined : handleComplete}
        onReopen={isAdmin ? undefined : handleReopen}
        onViewDetails={(task) => setTimelineModal({ open: true, task })}
        isWorker={false}
      />

      {/* Create Task Modal */}
      {!isAdmin && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="max-w-4xl" overlayClassName="!bg-black/20">
            <DialogHeader>
              <DialogTitle>Create Task</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-y-4 max-h-[80vh] overflow-y-auto pr-2 px-2 pt-2">
              <label className="text-sm font-medium">Deliverable</label>
              <Select
                value={form.deliverableId}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, deliverableId: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Deliverable" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERABLES.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.deliverableId && (
                <div className="text-xs text-red-500">
                  {formErrors.deliverableId}
                </div>
              )}
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) =>
                  setForm((f) => ({ ...f, title: e.target.value }))
                }
              />
              {formErrors.title && (
                <div className="text-xs text-red-500">{formErrors.title}</div>
              )}
              <Textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) =>
                  setForm((f) => ({ ...f, description: e.target.value }))
                }
              />
              <label className="text-sm font-medium ">Priority</label>
              <Select
                value={form.priority}
                onValueChange={(v) =>
                  setForm((f) => ({ ...f, priority: v as any }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <label className="text-sm font-medium">Assigned To</label>
              <div className="flex gap-2">
                <Button
                  variant={
                    form.assignedType === "individual" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      assignedType: "individual",
                      assignedTo: "",
                    }))
                  }
                >
                  Individual
                </Button>
                <Button
                  variant={form.assignedType === "team" ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      assignedType: "team",
                      assignedTo: "",
                    }))
                  }
                >
                  Team
                </Button>
              </div>
              {form.assignedType === "individual" ? (
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, assignedTo: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Individual" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIVIDUALS.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={form.assignedTo}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, assignedTo: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Team" />
                  </SelectTrigger>
                  <SelectContent>
                    {TEAMS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {formErrors.assignedTo && (
                <div className="text-xs text-red-500">
                  {formErrors.assignedTo}
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Calendar
                  mode="single"
                  selected={form.dueDate}
                  onSelect={(date) => setForm((f) => ({ ...f, dueDate: date }))}
                  className="rounded-md border"
                />
                {formErrors.dueDate && (
                  <div className="text-xs text-red-500">
                    {formErrors.dueDate}
                  </div>
                )}
              </div>
              <Textarea
                placeholder="Notes"
                value={form.notes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, notes: e.target.value }))
                }
              />
              {/* System Files */}
              <div>
                <div className="text-xs mb-1">Select system files:</div>
                {SYSTEM_FILES.map((sf) => (
                  <label key={sf.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.systemFiles.includes(sf.id)}
                      onChange={(e) => {
                        setForm((f) => ({
                          ...f,
                          systemFiles: e.target.checked
                            ? [...f.systemFiles, sf.id]
                            : f.systemFiles.filter((id) => id !== sf.id),
                        }));
                      }}
                    />
                    <ShowFile label={sf.label} url={""} size="small" />
                  </label>
                ))}
              </div>
              {/* Upload Files */}
              <div>
                <div className="text-xs mb-1">
                  Upload files (label required):
                </div>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setForm((f) => ({
                      ...f,
                      uploadFiles: [
                        ...f.uploadFiles,
                        ...files.map((file) => ({
                          file,
                          label: "",
                          tempUrl: URL.createObjectURL(file),
                        })),
                      ],
                    }));
                    e.target.value = "";
                  }}
                />
                {form.uploadFiles.map((uf, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-1">
                    <Input
                      type="text"
                      placeholder="Label"
                      value={uf.label}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          uploadFiles: f.uploadFiles.map((u, i) =>
                            i === idx ? { ...u, label: e.target.value } : u
                          ),
                        }))
                      }
                      className={uf.label.trim() ? "" : "border-red-400"}
                    />
                    <span className="text-xs">{uf.file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          uploadFiles: f.uploadFiles.filter(
                            (_, i) => i !== idx
                          ),
                        }))
                      }
                    >
                      &times;
                    </Button>
                  </div>
                ))}
                {/* Show uploaded files with ShowFile */}
                {form.uploadFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {form.uploadFiles.map((uf, idx) => (
                      <ShowFile
                        key={idx}
                        label={uf.label || uf.file.name}
                        url={uf.tempUrl}
                        size="small"
                      />
                    ))}
                  </div>
                )}
              </div>
              <label className="text-sm font-medium">Hours</label>
              <Input
                type="number"
                min={1}
                value={form.totalHours}
                onChange={(e) =>
                  setForm((f) => ({ ...f, totalHours: Number(e.target.value) }))
                }
                placeholder="Total Hours"
              />
              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask}>Create Task</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Complete Modal */}
      {!isAdmin && (
        <Dialog
          open={completeModal.open}
          onOpenChange={() => setCompleteModal({ open: false, taskId: null })}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Complete Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <Textarea
                placeholder="Notes"
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
              />
              <Input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setCompleteFiles((prev) => [
                    ...prev,
                    ...files.map((file) => ({
                      file,
                      label: "",
                      tempUrl: URL.createObjectURL(file),
                    })),
                  ]);
                  e.target.value = "";
                }}
              />
              {completeFiles.map((uf, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-1">
                  <Input
                    type="text"
                    placeholder="Label"
                    value={uf.label}
                    onChange={(e) =>
                      setCompleteFiles((prev) =>
                        prev.map((u, i) =>
                          i === idx ? { ...u, label: e.target.value } : u
                        )
                      )
                    }
                    className={uf.label.trim() ? "" : "border-red-400"}
                  />
                  <span className="text-xs">{uf.file.name}</span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      setCompleteFiles((prev) =>
                        prev.filter((_, i) => i !== idx)
                      )
                    }
                  >
                    &times;
                  </Button>
                </div>
              ))}
              <div className="flex gap-2 justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setCompleteModal({ open: false, taskId: null })
                  }
                >
                  Cancel
                </Button>
                <Button onClick={handleCompleteSave}>Save & Complete</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Timeline/Details Modal */}
      <Dialog
        open={timelineModal.open}
        onOpenChange={() => setTimelineModal({ open: false, task: null })}
      >
        <DialogContent className="max-w-xl p-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {timelineModal.task && (
            <div className="bg-white rounded-lg shadow divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
              {/* Task Info */}
              <div className="p-6 flex flex-col gap-2">
                <div className="text-xl font-bold text-blue-900 mb-1">
                  {timelineModal.task.title}
                </div>
                <div className="text-sm text-slate-600">
                  {timelineModal.task.description}
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div>
                    <span className="font-semibold text-slate-700">
                      Priority:
                    </span>{" "}
                    <span
                      className={
                        timelineModal.task.priority === "high"
                          ? "text-red-600"
                          : timelineModal.task.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {timelineModal.task.priority.charAt(0).toUpperCase() +
                        timelineModal.task.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Assigned To:
                    </span>{" "}
                    {timelineModal.task.assignedType === "team"
                      ? TEAMS.find(
                          (t) => t.id === timelineModal.task.assignedTo
                        )?.name
                      : INDIVIDUALS.find(
                          (i) => i.id === timelineModal.task.assignedTo
                        )?.name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Due Date:
                    </span>{" "}
                    {timelineModal.task.dueDate?.toLocaleDateString?.()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Hours:</span>{" "}
                    {timelineModal.task.totalHours}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-700">Notes:</span>{" "}
                  {timelineModal.task.notes}
                </div>
              </div>
              {/* Timeline Section */}
              <div className="p-6 bg-slate-50 rounded-lg border-t border-slate-200">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700">
                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M12 8v4l3 3"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-lg font-bold text-blue-900">
                    Timeline
                  </span>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="relative pl-6">
                    {timelineModal.task.timeline.length > 0 ? (
                      <>
                        <div
                          className="absolute left-2 top-0 bottom-0 w-1 bg-blue-50 rounded"
                          style={{ zIndex: 0 }}
                        />
                        {timelineModal.task.timeline.map((tl, idx) => {
                          let color = "",
                            label = "",
                            icon = null;
                          if (tl.action === "assigned") {
                            color = "bg-blue-100 text-blue-700 border-blue-300";
                            label = "Assigned";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full" />
                            );
                          } else if (tl.action === "start") {
                            color =
                              "bg-green-100 text-green-700 border-green-300";
                            label = "Started";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-green-500 rounded-full" />
                            );
                          } else if (tl.action === "pause") {
                            color =
                              "bg-yellow-100 text-yellow-700 border-yellow-300";
                            label = "Paused";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-yellow-400 rounded-full" />
                            );
                          } else if (tl.action === "completed") {
                            color =
                              "bg-purple-100 text-purple-700 border-purple-300";
                            label = "Completed";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-purple-500 rounded-full" />
                            );
                          } else if (tl.action === "reopen") {
                            color = "bg-red-100 text-red-700 border-red-300";
                            label = "Reopened (Doc Team)";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-red-500 rounded-full" />
                            );
                          } else if (tl.action === "pm-rejected") {
                            color = "bg-pink-100 text-pink-700 border-pink-300";
                            label = "Rejected (PM)";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-pink-500 rounded-full" />
                            );
                          } else if (tl.action === "verified") {
                            color =
                              "bg-emerald-100 text-emerald-700 border-emerald-300";
                            label = "Verified";
                            icon = (
                              <span className="inline-block w-3 h-3 bg-emerald-500 rounded-full" />
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
                                <div className="font-semibold text-base">
                                  {label}
                                </div>
                                <div className="text-xs text-slate-500 mb-1">
                                  {new Date(tl.time).toLocaleString()}
                                </div>
                                {tl.notes && (
                                  <div className="mb-1">
                                    <span className="font-semibold text-slate-700">
                                      Notes:
                                    </span>{" "}
                                    {tl.notes}
                                  </div>
                                )}
                                {tl.files && tl.files.length > 0 && (
                                  <div className="mb-1">
                                    <span className="font-semibold text-slate-700">
                                      Files:
                                    </span>
                                    <ul className="list-disc ml-6">
                                      {tl.files.map((f, i) => (
                                        <li key={i} className="text-xs">
                                          <ShowFile
                                            label={
                                              f.label +
                                              (f.file ? ` (${f.file})` : "")
                                            }
                                            url={""}
                                            size="small"
                                          />
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </>
                    ) : (
                      <div className="text-xs text-slate-400">
                        No timeline entries.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* PM Review Modal */}
      {!isAdmin && (
        <Dialog
          open={reviewModal.open}
          onOpenChange={(open) => {
            if (!open) setReviewModal({ open: false, task: null });
          }}
        >
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Review Task</DialogTitle>
            </DialogHeader>
            {reviewModal.task && (
              <div className="space-y-4">
                <div>
                  <div className="font-semibold mb-1">Completed Files</div>
                  <ul className="space-y-2">
                    {reviewModal.task.timeline
                      .filter((tl) => tl.action === "completed")
                      .flatMap((tl) => tl.files)
                      .map((f, idx) => (
                        <li key={idx}>
                          <ShowFile
                            label={f.label}
                            url={f.file || ""}
                            size="small"
                          />
                        </li>
                      ))}
                  </ul>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Optional Note
                  </label>
                  <Textarea
                    placeholder="Add a note (optional)"
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Upload Files
                  </label>
                  <Input
                    type="file"
                    multiple
                    onChange={handleReviewFileInput}
                  />
                  {reviewFiles.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2 mt-1">
                      <Input
                        type="text"
                        value={f.label}
                        onChange={handleReviewFileLabel(idx)}
                        className={f.label.trim() ? "" : "border-red-400"}
                      />
                      <span className="text-xs">{f.file && f.file.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={removeReviewFile(idx)}
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="block text-sm font-medium mb-1">
                    Select system files:
                  </div>
                  {SYSTEM_FILES.map((sf) => (
                    <label key={sf.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={reviewSystemFiles.includes(sf.id)}
                        onChange={(e) =>
                          handleReviewSystemFile(sf.id, e.target.checked)
                        }
                      />
                      <ShowFile label={sf.label} url={sf.file} size="small" />
                    </label>
                  ))}
                </div>
                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    variant="destructive"
                    onClick={() => handleReviewAction("pm-rejected")}
                  >
                    Reject
                  </Button>
                  <Button onClick={() => handleReviewAction("verified")}>
                    Verify
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default TaskAssignmentPage;
