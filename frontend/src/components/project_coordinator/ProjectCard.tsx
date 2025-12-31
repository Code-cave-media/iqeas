import { Button } from "@/components/ui/button";
import { Verified, AlertCircleIcon } from "lucide-react";

/* ================= TYPES ================= */

export type Project = {
  id: number;
  name: string;
  clientName?: string;
  status?: string;
  poNumber?: string;
  estimation_sent_to_pm?: boolean;
};

type Props = {
  project: Project;
  viewMode: "grid" | "list";
  onSelect: () => void;
};

/* ================= COMPONENT ================= */

export function ProjectCard({ project, viewMode, onSelect }: Props) {
  return (
    <div
      className={`
        rounded-xl border border-slate-200 bg-white
        p-6 transition-all cursor-pointer
        hover:shadow-md hover:border-slate-300
        ${viewMode === "list" ? "flex flex-col gap-5" : "space-y-5"}
      `}
    >
      {/* ===== HEADER ===== */}
      <header className="space-y-1 flex justify-between">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 leading-tight">
            {project.name}
          </h2>

          {project.clientName && (
            <p className="text-sm text-slate-600">{project.clientName}</p>
          )}
        </div>

        {project.estimation_sent_to_pm ? (
          <div>
            <Verified className="text-green-500" />
          </div>
        ) : (
          <div>
            <AlertCircleIcon className="text-red-500" />
          </div>
        )}
      </header>

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
        <a href={`/project-coordinator/${project.id}/details`}>
          <Button className="w-full text-sm" onClick={onSelect}>
            View
          </Button>
        </a>
      </div>
    </div>
  );
}
