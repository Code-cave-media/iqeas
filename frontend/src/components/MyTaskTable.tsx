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

interface MyTaskTableProps {
  tasks: Task[];
  onStart: (id: string) => void;
  onPause: (id: string) => void;
  onComplete: (
    id: string,
    files: { file: File; label: string; tempUrl: string }[],
    notes: string
  ) => void;
  onViewProjectDetails: (deliverableId: string) => void;
  onViewTaskDetails: (task: Task) => void;
}

const MyTaskTable: React.FC<MyTaskTableProps> = ({
  tasks,
  onStart,
  onPause,
  onComplete,
  onViewProjectDetails,
  onViewTaskDetails,
}) => {
  const [completeModal, setCompleteModal] = useState<{
    open: boolean;
    taskId: string | null;
  }>({ open: false, taskId: null });
  const [completeFiles, setCompleteFiles] = useState<
    { file: File; label: string; tempUrl: string }[]
  >([]);
  const [completeNotes, setCompleteNotes] = useState("");

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Project</TableHead>
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
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => onViewProjectDetails(task.deliverableId)}
                  >
                    View Details
                  </Button>
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
                  {task.status === "todo" && (
                    <Button size="sm" onClick={() => onStart(task.id)}>
                      Start
                    </Button>
                  )}
                  {task.status === "in-progress" && (
                    <>
                      <Button size="sm" onClick={() => onPause(task.id)}>
                        Pause
                      </Button>{" "}
                      <Button
                        size="sm"
                        onClick={() => {
                          setCompleteModal({ open: true, taskId: task.id });
                          setCompleteFiles([]);
                          setCompleteNotes("");
                        }}
                      >
                        Complete
                      </Button>
                    </>
                  )}
                  {task.status === "paused" && (
                    <Button size="sm" onClick={() => onStart(task.id)}>
                      Resume
                    </Button>
                  )}
                </TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onViewTaskDetails(task)}
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
              <Button
                onClick={() => {
                  if (completeModal.taskId) {
                    onComplete(
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
    </>
  );
};

export default MyTaskTable;
