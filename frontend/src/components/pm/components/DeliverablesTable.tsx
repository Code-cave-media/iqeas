// src/components/project/DeliverablesTable.tsx
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

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
type Leader = { id: number; name: string };

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
    const { projectId } = useParams<{ projectId: string }>();
  
  const { makeApiCall, fetching, fetchType } = useAPICall();
  const { authToken } = useAuth();
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);
  const [savingLeader, setSavingLeader] = useState(false);
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
      const fetchProject = async () => {
        if (!projectId) return;
        const response = await makeApiCall(
          "get",
          API_ENDPOINT.GET_PROJECT_BY_ID(projectId),
          {},
          "application/json",
          authToken,
          "getProject"
        );
        if (response.status === 200) {
          setProject(response.data);
        }
      };
      fetchProject();
  }, [projectId, makeApiCall, authToken]);
  
  useEffect(() => {
    const fetchLeaders = async () => {
      setLoadingLeaders(true);
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_Leaders,
        {},
        "application/json",
        authToken,
        "getLeaders"
      );
      if (response?.status === 200 && Array.isArray(response.data)) {
        setLeaders(response.data.map((l: any) => ({ id: l.id, name: l.name })));
      } else {
        setLeaders([]);
        toast.error("Failed to load leaders");
      }
      setLoadingLeaders(false);
    };
    fetchLeaders();
  }, [makeApiCall, authToken]);

  // Set current leader from project data
  useEffect(() => {
    if (project?.estimation?.leader) {
      const leaderId =
        typeof project.estimation.leader === "object"
          ? project.estimation.leader.id
          : project.estimation.leader;
      setSelectedLeaderId(leaderId);
    }
  }, [project]);

    const handleSaveLeader = async () => {
      if (!project?.estimation?.id || selectedLeaderId === null) return;
      setSavingLeader(true);
      try {
        const resp = await makeApiCall(
          "patch",
          API_ENDPOINT.EDIT_ESTIMATION(project.estimation.id),
          { leader: selectedLeaderId },
          "application/json",
          authToken,
          "assignLeader"
        );
        if (resp?.status === 200) {
          setProject((prev: any) => ({
            ...prev,
            estimation: { ...prev.estimation, leader: selectedLeaderId },
          }));
          toast.success("Leader assigned successfully");
        } else throw new Error("Assign failed");
      } catch (e: any) {
        toast.error(e.message || "Failed to assign leader");
      } finally {
        setSavingLeader(false);
      }
    };

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

    const currentLeaderName =
      leaders.find((l) => l.id === selectedLeaderId)?.name || "Not assigned";

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
        <div className="mt-8 p-2 px-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1">
              <p className="text-sm text-slate-600">Current Leader:</p>
              <p className="text-md font-bold text-indigo-700">
                {currentLeaderName}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={selectedLeaderId ?? ""}
                onChange={(e) =>
                  setSelectedLeaderId(
                    e.target.value ? Number(e.target.value) : null
                  )
                }
                disabled={loadingLeaders || savingLeader}
                className="flex-1 sm:flex-initial min-w-[220px] border rounded-lg px-4 py-2 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Choose a leader...</option>
                {leaders.map((leader) => (
                  <option key={leader.id} value={leader.id}>
                    {leader.name}
                  </option>
                ))}
              </select>

              <Button
                onClick={handleSaveLeader}
                disabled={
                  !selectedLeaderId ||
                  savingLeader ||
                  selectedLeaderId ===
                    (project?.estimation?.leader?.id ||
                      project?.estimation?.leader)
                }
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                {savingLeader ? "Saving..." : "Assign"}
              </Button>
            </div>
          </div>

          {loadingLeaders && (
            <p className="text-sm text-slate-500 mt-3">Loading leaders...</p>
          )}
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
                  <div className="flex items-center gap-2">
                    {parent && (
                      <button
                        type="button"
                        className="transition text-emerald-600 hover:text-emerald-800"
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
                    type="number"
                    value={
                      item.hours !== null && item.hours !== undefined
                        ? Math.floor(item.hours * 0.9) // 10% reduced
                        : ""
                    }
                    onChange={(e) =>
                      onHoursChange(
                        item.id,
                        e.target.value === ""
                          ? null
                          : Math.floor(Number(e.target.value) / 0.9)
                      )
                    }
                    className="w-20 border rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                    placeholder="Hours"
                    step={1}
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
