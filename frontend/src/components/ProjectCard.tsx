import {
  Verified,
  AlertCircleIcon,
  Trash2,
  MapPin,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useState } from "react";

type Props = {
  project: {
    id: number;
    name: string;
    projectCode: string;
    clientName: string;
    location?: string;
    projectType?: string;
    status?: string;
    priority?: "high" | "medium" | "low";
    progress?: number;
    estimationSentToPM?: boolean;
    isArchived?: boolean;
    receivedDate?: string;
  };
  viewMode: "grid" | "list";
  onDelete?: (projectId: number) => void;
  isAdmin?: boolean;
};

export function ProjectCard({
  project,
  viewMode,
  onDelete,
  isAdmin = false,
}: Props) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  const priorityColors = {
    high: "destructive",
    medium: "secondary",
    low: "outline",
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
    setConfirmName("");
  };

  const confirmDelete = () => {
    if (
      confirmName.trim().toLowerCase() === project.name.trim().toLowerCase()
    ) {
      onDelete?.(project.id);
      setDeleteDialogOpen(false);
    }
  };

  return (
    <>
      <div
        className={`
          relative rounded-2xl border border-slate-200 bg-white p-6
          transition-all duration-300 hover:shadow-xl hover:border-slate-300
          ${viewMode === "list" ? "flex flex-col" : "space-y-6"}
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-md  text-slate-900">{project.name}</h3>

            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-600">
              <span className="font-mono font-semibold text-indigo-700">
                {project.projectCode}
              </span>
              <span>•</span>
              <span className="truncate">{project.clientName}</span>
            </div>

            {(project.location || project.receivedDate) && (
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500">
                {project.location && (
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    <span>{project.location}</span>
                  </div>
                )}
                {project.receivedDate && (
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>
                      {new Date(project.receivedDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Status Icon + Delete Button (Always Visible) */}
          <div className="flex items-center gap-3">
            {/* Estimation Status */}
            <div className="flex-shrink-0">
              {project.estimationSentToPM ? (
                <div className="p-2.5 rounded-full bg-green-50">
                  <Verified className="text-green-600" size={24} />
                </div>
              ) : (
                <div className="p-2.5 rounded-full bg-red-50">
                  <AlertCircleIcon className="text-red-600" size={24} />
                </div>
              )}
            </div>

            {/* Delete Button - Always Visible for Admin */}
            {isAdmin && onDelete && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleDeleteClick}
              >
                <Trash2 size={16} className="mr-2" />
              </Button>
            )}
          </div>
        </div>

        {/* Tags & Badges */}
        <div className="flex flex-wrap gap-2">
          {project.status && (
            <Badge variant="secondary" className="capitalize">
              {project.status}
            </Badge>
          )}

          {project.projectType && (
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              {project.projectType}
            </Badge>
          )}

          {project.priority && (
            <Badge
              variant={priorityColors[project.priority]}
              className="capitalize"
            >
              {project.priority} Priority
            </Badge>
          )}

          {project.isArchived && (
            <Badge variant="secondary" className="bg-slate-100">
              Archived
            </Badge>
          )}
        </div>

        {/* Progress Bar */}
        {/* {project.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600 font-medium">Progress</span>
              <span className="font-bold text-slate-800">
                {project.progress}%
              </span>
            </div>
            <Progress value={project.progress} className="h-3" />
          </div>
        )} */}
      </div>

      {/* Delete Confirmation Dialog */}
      {isAdmin && onDelete && (
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent
            className="sm:max-w-md p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle className="text-red-600 text-2xl">
                Permanently Delete Project?
              </DialogTitle>
              <DialogDescription className="pt-3">
                This action <strong>cannot be undone</strong>. The project and
                all its data will be permanently deleted.
                <br />
                <br />
                To confirm, type the project name{" "}
                <strong>"{project.name}"</strong> below:
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 px-4">
              <Input
                placeholder="Type project name to confirm"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                disabled={confirmName.trim() !== project.name.trim()}
                onClick={confirmDelete}
              >
                Delete Permanently
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
