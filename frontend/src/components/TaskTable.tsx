import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { Task } from "./TaskAssignmentPage";

// Mock data for teams and individuals (should be imported or passed as props in real use)
const TEAMS = [
  { id: "team1", name: "Design Team" },
  { id: "team2", name: "Drafting Team" },
];
const INDIVIDUALS = [
  { id: "1", name: "John Doe" },
  { id: "2", name: "Jane Smith" },
];

interface TaskTableProps {
  tasks: Task[];
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (
    id: string,
    files: { file: File; label: string; tempUrl: string }[],
    notes: string
  ) => void;
  onReopen: (
    id: string,
    files: { file: File; label: string; tempUrl: string }[],
    notes: string
  ) => void;
  onViewDetails: (task: Task) => void;
  isWorker: boolean;
}
const TaskTable: React.FC<TaskTableProps> = ({
  tasks,
  onStart,
  onPause,
  onComplete,
  onReopen,
  onViewDetails,
  isWorker,
}) => {
  // State for modals
  const [completeModal, setCompleteModal] = useState<{
    open: boolean;
    taskId: string | null;
  }>({ open: false, taskId: null });
  const [completeFiles, setCompleteFiles] = useState<
    { file: File; label: string; tempUrl: string }[]
  >([]);
  const [completeNotes, setCompleteNotes] = useState("");
  const [reopenModal, setReopenModal] = useState<{
    open: boolean;
    taskId: string | null;
  }>({ open: false, taskId: null });
  const [reopenFiles, setReopenFiles] = useState<
    { file: File; label: string; tempUrl: string }[]
  >([]);
  const [reopenNotes, setReopenNotes] = useState("");

  // Handlers for modals
  const openCompleteModal = (taskId: string) => {
    setCompleteModal({ open: true, taskId });
    setCompleteFiles([]);
    setCompleteNotes("");
  };
  const handleCompleteSave = () => {
    if (completeModal.taskId) {
      onComplete(completeModal.taskId, completeFiles, completeNotes);
    }
    setCompleteModal({ open: false, taskId: null });
    setCompleteFiles([]);
    setCompleteNotes("");
  };
  const openReopenModal = (taskId: string) => {
    setReopenModal({ open: true, taskId });
    setReopenFiles([]);
    setReopenNotes("");
  };
  const handleReopenSave = () => {
    if (reopenModal.taskId) {
      onReopen(reopenModal.taskId, reopenFiles, reopenNotes);
    }
    setReopenModal({ open: false, taskId: null });
    setReopenFiles([]);
    setReopenNotes("");
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Assigned To</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Last Action</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => {
            const lastTimeline =
              task.timeline && task.timeline.length > 0
                ? task.timeline[task.timeline.length - 1]
                : null;
            const lastAction = lastTimeline
              ? lastTimeline.action.charAt(0).toUpperCase() +
                lastTimeline.action.slice(1)
              : "-";
            return (
              <TableRow key={task.id}>
                <TableCell>{task.title}</TableCell>
                <TableCell>
                  {task.assignedType === "team"
                    ? TEAMS.find((t) => t.id === task.assignedTo)?.name
                    : INDIVIDUALS.find((i) => i.id === task.assignedTo)?.name}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      task.priority === "high"
                        ? "destructive"
                        : task.priority === "medium"
                        ? "default"
                        : "secondary"
                    }
                  >
                    {task.priority.charAt(0).toUpperCase() +
                      task.priority.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell>{lastAction}</TableCell>
                <TableCell>
                  {isWorker && task.status === "todo" && (
                    <Button size="sm" onClick={() => onStart(task.id)}>
                      Start
                    </Button>
                  )}
                  {isWorker && task.status === "in-progress" && (
                    <>
                      <Button size="sm" onClick={() => onPause(task.id)}>
                        Pause
                      </Button>{" "}
                      <Button
                        size="sm"
                        onClick={() => openCompleteModal(task.id)}
                      >
                        Complete
                      </Button>
                    </>
                  )}
                  {isWorker && task.status === "paused" && (
                    <Button size="sm" onClick={() => onStart(task.id)}>
                      Resume
                    </Button>
                  )}
                  {task.status === "completed" && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openReopenModal(task.id)}
                    >
                      Reopen
                    </Button>
                  )}
                  {!isWorker &&
                    !(
                      (task.status === "todo" && isWorker) ||
                      (task.status === "in-progress" && isWorker) ||
                      (task.status === "paused" && isWorker) ||
                      task.status === "completed"
                    ) && (
                      <span className="text-xs text-muted-foreground">
                        Not yet completed
                      </span>
                    )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewDetails(task)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {tasks.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No tasks
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Complete Task Modal */}
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
                    setCompleteFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  &times;
                </Button>
              </div>
            ))}
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setCompleteModal({ open: false, taskId: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleCompleteSave}>Save & Complete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reopen Task Modal */}
      <Dialog
        open={reopenModal.open}
        onOpenChange={() => setReopenModal({ open: false, taskId: null })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reopen Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Notes"
              value={reopenNotes}
              onChange={(e) => setReopenNotes(e.target.value)}
            />
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setReopenFiles((prev) => [
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
            {reopenFiles.map((uf, idx) => (
              <div key={idx} className="flex items-center gap-2 mt-1">
                <Input
                  type="text"
                  placeholder="Label"
                  value={uf.label}
                  onChange={(e) =>
                    setReopenFiles((prev) =>
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
                    setReopenFiles((prev) => prev.filter((_, i) => i !== idx))
                  }
                >
                  &times;
                </Button>
              </div>
            ))}
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() => setReopenModal({ open: false, taskId: null })}
              >
                Cancel
              </Button>
              <Button onClick={handleReopenSave}>Reopen Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskTable;
