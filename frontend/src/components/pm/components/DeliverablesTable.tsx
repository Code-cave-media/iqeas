// src/components/project/DeliverablesTable.tsx
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

type Worker = { id: number; name: string };
type RFQDeliverable = {
  id: number;
  sno?: number | string;
  drawing_no?: string;
  title?: string;
  discipline?: string;
  deliverables?: string;
  stage?: string;
  revision?: string | number;
  hours?: number | string | null;
  consumed_time?: any;
  work_person?: string | null;
  worker_id?: number | null;
  isNew?: boolean;
};

type Props = {
  deliverables: RFQDeliverable[];
  visibleRows: RFQDeliverable[];
  workers: Worker[];
  loadingWorkers: boolean;
  stageOptions: string[];
  revisionOptions: string[];
  revisionFilter: string;
  setRevisionFilter: (v: string) => void;
  expandedParents: Set<string>;
  onToggleParent: (parent: RFQDeliverable) => void;
  onFieldChange: (id: number, key: keyof RFQDeliverable, value: any) => void;
  onHoursChange: (id: number, value: string) => void;
  onAddSubRow: (parent: RFQDeliverable) => void;
  onDeleteRow: (id: number) => void;
  loadingRFQ: boolean;
};

const formatDuration = (t: any) => {
  if (!t) return "—";
  if (typeof t === "string" || typeof t === "number") return String(t);
  const h = Number(t.hours ?? 0);
  const m = Number(t.minutes ?? 0);
  const s = Number(t.seconds ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
};

export const DeliverablesTable: React.FC<Props> = ({
  visibleRows,
  workers,
  loadingWorkers,
  stageOptions,
  revisionOptions,
  revisionFilter,
  setRevisionFilter,
  expandedParents,
  onToggleParent,
  onFieldChange,
  onHoursChange,
  onAddSubRow,
  onDeleteRow,
  loadingRFQ,
}) => {
  const isParent = (item: RFQDeliverable) =>
    item.sno == null || !String(item.sno).includes(".");
  const isChild = (item: RFQDeliverable) =>
    item.sno != null && String(item.sno).includes(".");
  const getBaseSno = (sno?: number | string) =>
    sno ? String(sno).split(".")[0] : "";

  const hasChildren = (row: RFQDeliverable) =>
    visibleRows.some(
      (d) => d.sno && String(d.sno).startsWith(`${getBaseSno(row.sno)}.`)
    );

  if (loadingRFQ) {
    return (
      <div className="text-center py-8 text-slate-500">
        Loading deliverables...
      </div>
    );
  }

  if (visibleRows.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500">
        No RFQ deliverables found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-600">Revision:</span>
          <select
            value={revisionFilter}
            onChange={(e) => setRevisionFilter(e.target.value)}
            className="border rounded px-2 py-1 text-xs bg-white focus:border-indigo-500 focus:outline-none"
          >
            <option value="ALL">All</option>
            {revisionOptions.map((rev) => (
              <option key={rev} value={rev}>
                {rev}
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="w-full text-sm border rounded-lg overflow-hidden">
        <thead className="bg-slate-100 text-slate-700">
          <tr>
            <th className="px-4 py-3 text-left">Sno</th>
            <th className="px-4 py-3 text-left">Drawing No</th>
            <th className="px-4 py-3 text-left">Title</th>
            <th className="px-4 py-3 text-left">Deliverables</th>
            <th className="px-4 py-3 text-left">Discipline</th>
            <th className="px-4 py-3 text-left">Stages</th>
            <th className="px-4 py-3 text-left">Revision</th>
            <th className="px-4 py-3 text-left">Hours</th>
            <th className="px-4 py-3 text-left">Work Person</th>
            <th className="px-4 py-3 text-left">Consumed Time</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((item) => {
            const parent = isParent(item);
            const base = getBaseSno(item.sno);
            const hasChild = parent && hasChildren(item);
            const expanded = parent && base ? expandedParents.has(base) : false;

            return (
              <tr
                key={item.id}
                className={`border-t ${
                  item.isNew ? "bg-amber-50" : "bg-white"
                } hover:bg-slate-50`}
              >
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    {parent && hasChild && (
                      <button
                        onClick={() => onToggleParent(item)}
                        className="text-slate-600 hover:text-slate-900 mr-1"
                      >
                        {expanded ? (
                          <ChevronDown size={14} />
                        ) : (
                          <ChevronRight size={14} />
                        )}
                      </button>
                    )}
                    <span>{item.sno ?? "?"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 group">
                    {parent && (
                      <button
                        type="button"
                        className="opacity-0 group-hover:opacity-100 transition text-emerald-600 hover:text-emerald-800"
                        onClick={() => onAddSubRow(item)}
                      >
                        <Plus size={16} />
                      </button>
                    )}
                    <span className={isChild(item) ? "pl-4" : ""}>
                      {item.drawing_no || "—"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">{item.title || "—"}</td>
                <td className="px-4 py-3">{item.deliverables || "—"}</td>
                <td className="px-4 py-3">{item.discipline || "—"}</td>
                <td className="px-4 py-3">
                  <select
                    value={item.stage ?? ""}
                    onChange={(e) =>
                      onFieldChange(item.id, "stage", e.target.value)
                    }
                    className="w-28 border rounded px-2 py-1 text-xs bg-white focus:border-indigo-500 focus:outline-none"
                  >
                    <option value="">Select</option>
                    {stageOptions.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={item.revision ?? ""}
                    onChange={(e) =>
                      onFieldChange(item.id, "revision", e.target.value)
                    }
                    className="w-20 border rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    placeholder="Rev"
                  />
                </td>
                <td className="px-4 py-3">
                  <input
                    type="tel"
                    value={item.hours ?? ""}
                    onChange={(e) => onHoursChange(item.id, e.target.value)}
                    className="w-20 border rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    placeholder="Hours"
                  />
                </td>
                <td className="px-4 py-3">
                  <select
                    value={item.worker_id ?? ""}
                    onChange={(e) => {
                      const wid = e.target.value
                        ? Number(e.target.value)
                        : null;
                      const worker = workers.find((w) => w.id === wid);
                      onFieldChange(item.id, "worker_id", wid);
                      onFieldChange(
                        item.id,
                        "work_person",
                        worker?.name ?? null
                      );
                    }}
                    className="w-40 border rounded px-2 py-1 text-xs bg-white focus:border-indigo-500 focus:outline-none"
                    disabled={loadingWorkers}
                  >
                    <option value="">
                      {loadingWorkers ? "Loading..." : "Select worker"}
                    </option>
                    {workers.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3">
                  {formatDuration(item.consumed_time)}
                </td>
                <td className="px-4 py-3">
                  {item.isNew && (
                    <button
                      onClick={() => onDeleteRow(item.id)}
                      className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded"
                    >
                      ✕
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
