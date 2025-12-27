// src/components/project/WorkingTab.tsx
import { Clock, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeliverablesTable } from "./DeliverablesTable";

type Props = {
  project: any;
  stageOptions: string[];
  onOpenStageModal: () => void;
  onUpdateAll: () => void;
  savingUpdate: boolean;
  onApproveProject: () => void;
  approving: boolean;
  // table props...
  deliverables: any[];
  visibleRows: any[];
  workers: any[];
  loadingWorkers: boolean;
  revisionOptions: string[];
  revisionFilter: string;
  setRevisionFilter: (v: string) => void;
  expandedParents: Set<string>;
  onToggleParent: (parent: any) => void;
  onFieldChange: (id: number, key: string, value: any) => void;
  onHoursChange: (id: number, value: string) => void;
  onAddSubRow: (parent: any) => void;
  onDeleteRow: (id: number) => void;
  loadingRFQ: boolean;
};

export const WorkingTab: React.FC<Props> = ({
  project,
  stageOptions,
  onOpenStageModal,
  onUpdateAll,
  savingUpdate,
  onApproveProject,
  approving,
  ...tableProps
}) => {
  return (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-indigo-400">
        <div className="flex items-center gap-3">
          <Clock className="text-white" size={28} />
          <span className="text-lg font-bold text-white">Project Working</span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenStageModal}
            className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
            title="Manage stages"
          >
            <Settings2 size={18} />
            <span className="hidden sm:inline">Stages</span>
          </button>
          <Button
            onClick={onUpdateAll}
            disabled={savingUpdate}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {savingUpdate ? "Updating..." : "Update"}
          </Button>
          {!project.send_to_workers && (
            <Button
              onClick={onApproveProject}
              disabled={approving}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {approving ? "Approving..." : "Approve"}
            </Button>
          )}
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-lg font-semibold text-slate-800">
            RFQ Deliverables
          </span>
        </div>

        <DeliverablesTable
          stageOptions={stageOptions}
          workers={tableProps.workers}
          loadingWorkers={tableProps.loadingWorkers}
          revisionOptions={tableProps.revisionOptions}
          revisionFilter={tableProps.revisionFilter}
          setRevisionFilter={tableProps.setRevisionFilter}
          visibleRows={tableProps.visibleRows}
          expandedParents={tableProps.expandedParents}
          onToggleParent={tableProps.onToggleParent}
          onFieldChange={tableProps.onFieldChange}
          onHoursChange={tableProps.onHoursChange}
          onAddSubRow={tableProps.onAddSubRow}
          onDeleteRow={tableProps.onDeleteRow}
          loadingRFQ={tableProps.loadingRFQ}
          deliverables={tableProps.deliverables}
        />
      </div>
    </div>
  );
};
