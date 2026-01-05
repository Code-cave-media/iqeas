import { Button } from "@/components/ui/button";
import {
  Verified,
  AlertCircleIcon,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

/* ================= TYPES ================= */

export type Project = {
  id: number;
  name: string;
  clientName?: string;
  status?: string;
  poNumber?: string;
  estimation_sent_to_pm?: boolean;
  isArchived?: boolean;
};

type Props = {
  project: Project;
  viewMode: "grid" | "list";
  onSelect: () => void;
  onArchive?: (projectId: number) => void;
};

/* ================= COMPONENT ================= */

export function ProjectCard({ project, viewMode, onSelect, onArchive }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const isArchived = !!project.isArchived;

  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDialogOpen(true);
  };

  const confirmAction = () => {
    if (onArchive) {
      onArchive(project.id);
    }
    setDialogOpen(false);
  };

  const actionText = isArchived ? "restore" : "archive";
  const dialogTitle = isArchived ? "Restore Project?" : "Archive Project?";
  const dialogDescription = isArchived
    ? "This project will return to your active dashboard."
    : "This project will be moved to your archived projects list.";

  return (
    <>
      <div
        onClick={onSelect}
        className={`
          rounded-xl border border-slate-200 bg-white
          p-6 transition-all cursor-pointer
          hover:shadow-md hover:border-slate-300
          ${viewMode === "list" ? "flex flex-col gap-5" : "space-y-5"}
        `}
      >
        {/* ===== HEADER ===== */}
        <header className="space-y-1 flex justify-between items-start">
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-slate-900 leading-tight">
              {project.name}
            </h2>

            {project.clientName && (
              <p className="text-sm text-slate-600">{project.clientName}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Status Icon */}
            {project.estimation_sent_to_pm ? (
              <Verified className="text-green-600 flex-shrink-0" size={22} />
            ) : (
              <AlertCircleIcon
                className="text-red-600 flex-shrink-0"
                size={22}
              />
            )}

            {/* Archive / Restore Button */}
            <Button
              size="sm"
              variant="ghost"
              className={`
                h-9 w-9 p-0 flex items-center justify-center
                ${
                  isArchived
                    ? "text-slate-500 hover:text-green-600 hover:bg-green-50"
                    : "text-slate-500 hover:text-red-600 hover:bg-red-50"
                }
              `}
              onClick={handleActionClick}
              title={isArchived ? "Restore project" : "Archive project"}
            >
              {isArchived ? (
                <ArchiveRestore size={18} />
              ) : (
                <Archive size={18} />
              )}
            </Button>
          </div>
        </header>

        {/* ===== TAGS ===== */}
        <div className="flex flex-wrap gap-2 text-xs font-medium">
          {project.status && (
            <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-700 capitalize">
              {project.status}
            </span>
          )}

          {project.poNumber && (
            <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700">
              PO • {project.poNumber}
            </span>
          )}
        </div>

        {/* ===== VIEW BUTTON ===== */}
        <div className="pt-4 border-t">
          <Button className="w-full text-sm" onClick={onSelect}>
            View Details
          </Button>
        </div>
      </div>

      {/* Confirmation Dialog (shadcn/ui Dialog) */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md p-8">
          <DialogHeader>
            <DialogTitle className="pb-1">{dialogTitle}</DialogTitle>
            <DialogDescription className="pb-4">{dialogDescription}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-start">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant={isArchived ? "default" : "destructive"}
              onClick={confirmAction}
            >
              {isArchived ? "Restore" : "Archive"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
