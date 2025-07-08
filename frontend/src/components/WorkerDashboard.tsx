import { useState } from "react";
import {
  Wrench,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ShowFile from "./ShowFile";

// Demo/mock data
const initialWorkerTasks = [
  {
    id: "TSK-001",
    projectId: "PRJ-2024-001",
    clientName: "Saudi Aramco",
    taskTitle: "Site Survey - Pipeline Route",
    assignedBy: "Ahmed Al-Rashid",
    dueDate: "2024-02-10",
    priority: "High",
    status: "todo", // changed to match MyTaskTable logic
    estimatedHours: 16,
    loggedHours: 8,
    description:
      "Conduct detailed survey of proposed pipeline route including terrain mapping",
    timeline: [
      {
        action: "assigned",
        files: [],
        notes: "",
        time: Date.now() - 1000 * 60 * 60 * 24,
      },
    ],
  },
  {
    id: "TSK-002",
    projectId: "PRJ-2024-002",
    clientName: "ADNOC",
    taskTitle: "Equipment Inspection Report",
    assignedBy: "Sarah Mohammed",
    dueDate: "2024-02-15",
    priority: "Medium",
    status: "paused",
    estimatedHours: 8,
    loggedHours: 0,
    description: "Inspect and document current equipment status at facility",
    timeline: [
      {
        action: "assigned",
        files: [],
        notes: "",
        time: Date.now() - 1000 * 60 * 60 * 24,
      },
      {
        action: "pause",
        files: [],
        notes: "Paused for site access",
        time: Date.now() - 1000 * 60 * 30,
      },
    ],
  },
];

// Dummy teams and individuals for assigned to display (for details modal)
const TEAMS = [
  { id: "team1", name: "Design Team" },
  { id: "team2", name: "Drafting Team" },
];
const INDIVIDUALS = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];

export const WorkerDashboard = () => {
  const [tasks, setTasks] = useState(initialWorkerTasks);
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Complete modal state
  const [completeModal, setCompleteModal] = useState<{
    open: boolean;
    taskId: string | null;
  }>({ open: false, taskId: null });
  const [completeFiles, setCompleteFiles] = useState<
    { file: File; label: string; tempUrl: string }[]
  >([]);
  const [completeNotes, setCompleteNotes] = useState("");

  // Details modal state
  const [detailsModal, setDetailsModal] = useState<{
    open: boolean;
    task: (typeof initialWorkerTasks)[0] | null;
  }>({ open: false, task: null });

  // Project modal state
  const [projectModal, setProjectModal] = useState<{
    open: boolean;
    projectId: string | null;
  }>({ open: false, projectId: null });

  // Action handlers
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

  // Filter and search logic
  const filteredTasks = tasks.filter((t) => {
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "pending"
        ? t.status !== "completed"
        : t.status === "completed";
    const matchesSearch =
      t.taskTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Worker Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Track your assigned tasks and project work
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wrench size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {tasks.filter((t) => t.status !== "completed").length}
            </p>
            <p className="text-sm text-slate-600">Active Tasks</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">
              {tasks.filter((t) => t.status === "completed").length}
            </p>
            <p className="text-sm text-slate-600">Completed</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">124</p>
            <p className="text-sm text-slate-600">Hours This Month</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-slate-600">Due Today</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div className="flex gap-2 items-center">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-64"
          />
        </div>
      </div>

      {/* Tasks & Assignments Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-blue-800 text-xl font-bold tracking-tight">
            Tasks & Assignments
          </h2>
          <span className="text-slate-500 text-sm">
            (Only your assigned tasks are shown)
          </span>
        </div>
        <hr className="mb-4 border-blue-100" />
        <div className="overflow-x-auto rounded-xl">
          <Table>
            <TableHeader>
              <TableRow className="bg-blue-50 text-blue-900">
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Task
                </TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Project
                </TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Assigned By
                </TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Due Date
                </TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Priority
                </TableHead>
                <TableHead className="px-4 py-3 text-left font-semibold">
                  Status
                </TableHead>
                <TableHead className="px-4 py-3 text-center font-semibold">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center text-slate-400 py-6"
                  >
                    No tasks assigned.
                  </TableCell>
                </TableRow>
              ) : (
                filteredTasks.map((task, idx) => (
                  <TableRow
                    key={task.id}
                    className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}
                  >
                    <TableCell className="px-4 py-3 font-medium text-slate-800">
                      {task.taskTitle}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {task.projectId} - {task.clientName}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {task.assignedBy}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      {new Date(task.dueDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant={
                          task.priority === "High"
                            ? "destructive"
                            : task.priority === "Medium"
                            ? "default"
                            : "outline"
                        }
                      >
                        {task.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <Badge
                        variant={
                          task.status === "in-progress"
                            ? "default"
                            : task.status === "paused"
                            ? "secondary"
                            : task.status === "completed"
                            ? "outline"
                            : "secondary"
                        }
                      >
                        {task.status.charAt(0).toUpperCase() +
                          task.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setDetailsModal({ open: true, task })}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() =>
                            setProjectModal({
                              open: true,
                              projectId: task.projectId,
                            })
                          }
                        >
                          View Project
                        </Button>
                        {task.status === "todo" && (
                          <Button
                            size="sm"
                            onClick={() => handleStart(task.id)}
                          >
                            Start
                          </Button>
                        )}
                        {task.status === "in-progress" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handlePause(task.id)}
                            >
                              Pause
                            </Button>{" "}
                            <Button
                              size="sm"
                              onClick={() => {
                                setCompleteModal({
                                  open: true,
                                  taskId: task.id,
                                });
                                setCompleteFiles([]);
                                setCompleteNotes("");
                              }}
                            >
                              Complete
                            </Button>
                          </>
                        )}
                        {task.status === "paused" && (
                          <Button
                            size="sm"
                            onClick={() => handleStart(task.id)}
                          >
                            Resume
                          </Button>
                        )}
                        {task.status === "completed" && (
                          <span className="text-green-600 font-semibold">
                            Done
                          </span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* Complete Task Modal */}
      {completeModal.open && (
        <Dialog
          open={true}
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
                <Button
                  onClick={() => {
                    if (completeModal.taskId) {
                      handleComplete(
                        completeModal.taskId,
                        completeFiles,
                        completeNotes
                      );
                    }
                    setCompleteModal({ open: false, taskId: null });
                    setCompleteFiles([]);
                    setCompleteNotes("");
                  }}
                >
                  Save & Complete
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Project Details Modal */}
      {projectModal.open && (
        <Dialog
          open={true}
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
      )}

      {/* Task Details Modal (rich UI) */}
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
                  {detailsModal.task.taskTitle}
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
                        detailsModal.task.priority === "High"
                          ? "text-red-600"
                          : detailsModal.task.priority === "Medium"
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
                    {/* For demo, show N/A or "Me" */}
                    Me
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">
                      Due Date:
                    </span>{" "}
                    {new Date(detailsModal.task.dueDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-semibold text-slate-700">Hours:</span>{" "}
                    {detailsModal.task.estimatedHours}
                  </div>
                </div>
                <div className="mt-2">
                  <span className="font-semibold text-slate-700">Notes:</span>{" "}
                  {/* For demo, show N/A */}
                  N/A
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
