import React, { useState } from "react";
import type { Task } from "./TaskAssignmentPage";
import MyTaskTable from "./MyTaskTable";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShowFile from "@/components/ShowFile";

// Dummy data for demonstration
const PROJECTS = [
  { id: "p1", name: "Pipeline Expansion" },
  { id: "p2", name: "Compressor Upgrade" },
];
const DUMMY_TASKS: Task[] = [
  {
    id: "t1",
    title: "Draft P&ID",
    description: "Draft the P&ID drawing for Zone 1.",
    priority: "high",
    assignedType: "individual",
    assignedTo: "me",
    dueDate: new Date(),
    notes: "",
    totalHours: 8,
    timeline: [
      {
        action: "assigned",
        files: [],
        notes: "",
        time: Date.now() - 1000 * 60 * 60 * 24,
      },
    ],
    status: "todo",
    deliverableId: "d1",
  },
  {
    id: "t2",
    title: "Review Layout",
    description: "Review the layout plan for Zone 2.",
    priority: "medium",
    assignedType: "individual",
    assignedTo: "me",
    dueDate: new Date(),
    notes: "",
    totalHours: 4,
    timeline: [
      {
        action: "assigned",
        files: [],
        notes: "",
        time: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        action: "completed",
        files: [],
        notes: "Done",
        time: Date.now() - 1000 * 60 * 60,
      },
    ],
    status: "completed",
    deliverableId: "d2",
  },
];

// Dummy teams and individuals for assigned to display
const TEAMS = [
  { id: "team1", name: "Design Team" },
  { id: "team2", name: "Drafting Team" },
];
const INDIVIDUALS = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>(DUMMY_TASKS);
  const [filter, setFilter] = useState("pending");
  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    projectId: string | null;
  }>({ open: false, projectId: null });
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    task: Task | null;
  }>({ open: false, task: null });

  // Filtering logic
  const filteredTasks = tasks.filter((t) =>
    filter === "pending" ? t.status !== "completed" : t.status === "completed"
  );

  // Task actions
  const handleStart = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
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
  };
  const handlePause = (id: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
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
  };
  const handleComplete = (
    id: string,
    files: { file: File; label: string; tempUrl: string }[],
    notes: string
  ) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: "completed",
              timeline: [
                ...t.timeline,
                {
                  action: "completed",
                  files: files.map((f, i) => ({
                    id: `up${i + 1}`,
                    label: f.label,
                    file: f.file.name,
                  })),
                  notes,
                  time: Date.now(),
                },
              ],
            }
          : t
      )
    );
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">My Tasks</h2>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <MyTaskTable
        tasks={filteredTasks}
        onStart={handleStart}
        onPause={handlePause}
        onComplete={handleComplete}
        onViewProjectDetails={(deliverableId) =>
          setProjectModal({ open: true, projectId: deliverableId })
        }
        onViewTaskDetails={(task) => setDetailsModal({ open: true, task })}
      />
      {/* Project Details Modal */}
      <Dialog
        open={projectModal.open}
        onOpenChange={() => setProjectModal({ open: false, projectId: null })}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Project Details</DialogTitle>
          </DialogHeader>
          {projectModal.projectId && (
            <div>
              <div className="font-bold text-lg mb-2">
                Project/Deliverable: {projectModal.projectId}
              </div>
              {/* Add more project info here, or map deliverableId to project if needed */}
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Task Details Modal (copied from TaskAssignmentPage timelineModal) */}
      <Dialog
        open={detailsModal.open}
        onOpenChange={() => setDetailsModal({ open: false, task: null })}
      >
        <DialogContent className="max-w-xl p-4 overflow-hidden">
          <DialogHeader>
            <DialogTitle>Task Details</DialogTitle>
          </DialogHeader>
          {detailsModal.task && (
            <div className="bg-white rounded-lg shadow divide-y divide-slate-100 max-h-[80vh] overflow-y-auto">
              {/* Task Info */}
              <div className="p-6 flex flex-col gap-2">
                <div className="text-xl font-bold text-blue-900 mb-1">
                  {detailsModal.task.title}
                </div>
                <div className="text-sm text-slate-600">
                  {detailsModal.task.description}
                </div>
                <div className="flex flex-wrap gap-4 mt-2">
                  <div>
                    <span className="font-semibold text-slate-700">
                      Priority:
                    </span>{" "}
                    <span
                      className={
                        detailsModal.task.priority === "high"
                          ? "text-red-600"
                          : detailsModal.task.priority === "medium"
                          ? "text-yellow-600"
                          : "text-green-600"
                      }
                    >
                      {detailsModal.task.priority.charAt(0).toUpperCase() +
                        detailsModal.task.priority.slice(1)}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Assigned To:
                    </span>{" "}
                    {detailsModal.task.assignedType === "team"
                      ? TEAMS.find((t) => t.id === detailsModal.task.assignedTo)
                          ?.name
                      : INDIVIDUALS.find(
                          (i) => i.id === detailsModal.task.assignedTo
                        )?.name}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Due Date:
                    </span>{" "}
                    {detailsModal.task.dueDate?.toLocaleDateString?.()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Hours:</span>{" "}
                    {detailsModal.task.totalHours}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-700">Notes:</span>{" "}
                  {detailsModal.task.notes}
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
                    {detailsModal.task.timeline.length > 0 ? (
                      <>
                        <div
                          className="absolute left-2 top-0 bottom-0 w-1 bg-blue-50 rounded"
                          style={{ zIndex: 0 }}
                        />
                        {detailsModal.task.timeline.map((tl, idx) => {
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
                                            url={
                                              f.file ? `/uploads/${f.file}` : ""
                                            }
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
    </div>
  );
};

export default MyTasks;
