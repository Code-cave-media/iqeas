/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/atomic/Loading";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

// Reusable Components
import { ProjectTabs } from "./components/ProjectTabs";
import { ProjectDataCard } from "./components/ProjectDataCard";
import { WorkingTab } from "./components/WorkingTab";
import { DeliveryTab } from "./components/DeliveryTab";

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

type DeliveryFile = { id: number; label: string; url: string };
type Worker = { id: number; name: string };
type Leader = { id: number; name: string };
type TabKey = "project" | "working" | "delivery";

const formatDuration = (t: any) => {
  if (!t) return "—";
  if (typeof t === "string" || typeof t === "number") return String(t);
  const hours = Number(t.hours ?? 0);
  const minutes = Number(t.minutes ?? 0);
  const seconds = Number(t.seconds ?? 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

const ProjectControlPm: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { makeApiCall, fetching, fetchType } = useAPICall();
  const { authToken } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [rfqDeliverables, setRfqDeliverables] = useState<RFQDeliverable[]>([]);
  const [loadingRFQ, setLoadingRFQ] = useState(false);
  const [savingUpdate, setSavingUpdate] = useState(false);

  const [files, setFiles] = useState<DeliveryFile[]>([]);
  const [enableDelivery, setEnableDelivery] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedDeliveryFiles, setSelectedDeliveryFiles] = useState<number[]>(
    []
  );

  // Stage manager
  const [stageOptions, setStageOptions] = useState<string[]>([
    "IDC",
    "IFR",
    "IFA",
    "IFC",
  ]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageInput, setStageInput] = useState("");
  const [stageInputList, setStageInputList] = useState<string[]>([]);

  // Workers
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  // Leaders (new feature)
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loadingLeaders, setLoadingLeaders] = useState(false);
  const [selectedLeaderId, setSelectedLeaderId] = useState<number | null>(null);
  const [savingLeader, setSavingLeader] = useState(false);

  // Approve project
  const [approving, setApproving] = useState(false);

  // Collapsible parents & filters
  const [expandedParents, setExpandedParents] = useState<Set<string>>(
    () => new Set()
  );
  const [revisionFilter, setRevisionFilter] = useState<string>("ALL");

  // Tabs
  const [activeTab, setActiveTab] = useState<TabKey>("project");

  // ---------- Hierarchy helpers ----------
  const getBaseSno = (sno?: number | string) => {
    if (sno === undefined || sno === null) return "";
    return String(sno).split(".")[0];
  };

  const isChildOf = (child: RFQDeliverable, parent: RFQDeliverable) => {
    if (child.sno == null || parent.sno == null) return false;
    const childStr = String(child.sno);
    const parentBase = getBaseSno(parent.sno);
    return childStr.includes(".") && childStr.startsWith(`${parentBase}.`);
  };

  const toggleParentExpanded = (parent: RFQDeliverable) => {
    const base = getBaseSno(parent.sno);
    if (!base) return;
    setExpandedParents((prev) => {
      const next = new Set(prev);
      if (next.has(base)) next.delete(base);
      else next.add(base);
      return next;
    });
  };

  // ---------- Effects ----------
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
    if (!project?.id) return;
    const fetchRFQDeliverables = async () => {
      setLoadingRFQ(true);
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project.id),
        {},
        "application/json",
        authToken,
        "getRFQDeliverables"
      );
      if (response?.status === 200 && Array.isArray(response.data)) {
        const normalized = response.data.map((item: any) => ({
          ...item,
          consumed_time:
            item.consumed_time && typeof item.consumed_time === "object"
              ? {
                  hours: item.consumed_time.hours ?? 0,
                  minutes: item.consumed_time.minutes ?? 0,
                  seconds: item.consumed_time.seconds ?? 0,
                }
              : item.consumed_time ?? null,
          work_person: item.work_person || item.assigned_user?.name || null,
          worker_id: item.worker_id ?? null,
          isNew: false,
        }));
        setRfqDeliverables(normalized);
      } else {
        setRfqDeliverables([]);
      }
      setLoadingRFQ(false);
    };
    fetchRFQDeliverables();
  }, [project?.id, makeApiCall, authToken]);

  useEffect(() => {
    const fetchWorkers = async () => {
      setLoadingWorkers(true);
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_WORKERS_LIST,
        {},
        "application/json",
        authToken,
        "getWorkers"
      );
      const list = Array.isArray(response?.data) ? response.data : [];
      setWorkers(list.map((w: any) => ({ id: w.id, name: w.name })));
      setLoadingWorkers(false);
    };
    fetchWorkers();
  }, [makeApiCall, authToken]);

  // Fetch Leaders
  
  useEffect(() => {
    if (project) {
      setEnableDelivery(project.status.toLowerCase() === "completed");
    }
  }, [project]);

  // ---------- Memoized data ----------
  const revisionOptions = useMemo(() => {
    const set = new Set<string>();
    rfqDeliverables.forEach((d) => {
      if (
        d.revision !== undefined &&
        d.revision !== null &&
        d.revision !== ""
      ) {
        set.add(String(d.revision));
      }
    });
    return Array.from(set).sort();
  }, [rfqDeliverables]);

  const filteredDeliverables = useMemo(() => {
    if (revisionFilter === "ALL") return rfqDeliverables;
    return rfqDeliverables.filter(
      (d) => String(d.revision ?? "") === revisionFilter
    );
  }, [rfqDeliverables, revisionFilter]);

  const visibleRows = useMemo(() => {
    const rows: RFQDeliverable[] = [];
    const parents = filteredDeliverables.filter(
      (d) => d.sno == null || !String(d.sno).includes(".")
    );
    parents.forEach((parent) => {
      rows.push(parent);
      const base = getBaseSno(parent.sno);
      if (base && expandedParents.has(base)) {
        const children = filteredDeliverables.filter((d) =>
          isChildOf(d, parent)
        );
        const sortedChildren = [...children].sort((a, b) => {
          const aParts = String(a.sno ?? "")
            .split(".")
            .map(Number);
          const bParts = String(b.sno ?? "")
            .split(".")
            .map(Number);
          for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
            const av = aParts[i] ?? 0;
            const bv = bParts[i] ?? 0;
            if (av !== bv) return av - bv;
          }
          return 0;
        });
        rows.push(...sortedChildren);
      }
    });
    return rows;
  }, [filteredDeliverables, expandedParents]);

  if ((fetching && fetchType === "getProject") || !project) {
    return <Loading />;
  }

  // ---------- Row editing ----------
  const handleFieldChange = (
    id: number,
    key: keyof RFQDeliverable,
    value: any
  ) => {
    setRfqDeliverables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [key]: value } : item))
    );
  };

  const handleHoursChange = (id: number, value: string) => {
    setRfqDeliverables((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, hours: value === "" ? null : Number(value) || "" }
          : item
      )
    );
  };

  const handleDeleteRow = (id: number) => {
    setRfqDeliverables((prev) => prev.filter((row) => row.id !== id));
  };

  const getNextSubSno = (parentSno: number | string | undefined) => {
    if (!parentSno) return "";
    const base = Number(String(parentSno).split(".")[0]);
    const childs = rfqDeliverables
      .filter((d) => d.sno && String(d.sno).startsWith(`${base}.`))
      .map((d) => Number(String(d.sno).split(".")[1] || "0"));
    return `${base}.${(childs.length ? Math.max(...childs) : 0) + 1}`;
  };

  const handleAddSubRow = (parent: RFQDeliverable) => {
    const newSno = getNextSubSno(parent.sno);
    if (!newSno) return;
    const newRow: RFQDeliverable = {
      id: Date.now(),
      sno: newSno,
      drawing_no: parent.drawing_no,
      title: parent.title,
      discipline: parent.discipline,
      deliverables: parent.deliverables,
      stage: parent.stage,
      revision: parent.revision,
      hours: parent.hours,
      consumed_time: null,
      work_person: null,
      worker_id: null,
      isNew: true,
    };

    setRfqDeliverables((prev) => {
      const list = [...prev];
      const parentIndex = list.findIndex((d) => d.id === parent.id);
      let insertIndex = parentIndex + 1;
      while (
        insertIndex < list.length &&
        list[insertIndex].sno &&
        String(list[insertIndex].sno).startsWith(
          String(parent.sno).split(".")[0] + "."
        )
      ) {
        insertIndex++;
      }
      list.splice(insertIndex, 0, newRow);
      return list;
    });

    const base = getBaseSno(parent.sno);
    if (base) {
      setExpandedParents((prev) => new Set(prev).add(base));
    }
  };

  // ---------- Update Deliverables ----------
  const handleUpdateAll = async () => {
    if (!project || !project.id) return;
    setSavingUpdate(true);
    try {
      // Create new rows
      const newRows = rfqDeliverables.filter((d) => d.isNew);
      if (newRows.length > 0) {
        const payload = newRows.map((d) => ({
          sno: d.sno,
          drawing_no: d.drawing_no,
          title: d.title,
          deliverables: d.deliverables,
          discipline: d.discipline,
        }));
        const resp = await makeApiCall(
          "post",
          API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project.id),
          { deliverables: payload },
          "application/json",
          authToken,
          "createDeliverables"
        );
        if (![200, 201].includes(resp?.status))
          throw new Error("Create failed");
      }

      // Update existing
      const existing = rfqDeliverables.filter((d) => !d.isNew && d.id > 0);
      for (const row of existing) {
        const updates = {
          sno: row.sno,
          drawing_no: row.drawing_no,
          title: row.title,
          deliverables: row.deliverables,
          discipline: row.discipline,
          stage: row.stage,
          revision: row.revision,
          hours: row.hours,
          worker_id: row.worker_id,
        };
        const resp = await makeApiCall(
          "patch",
          API_ENDPOINT.DELIVERABLES_PATCH_REQUEST(String(row.id)),
          updates,
          "application/json",
          authToken,
          "patchDeliverable"
        );
        if (resp?.status !== 200) throw new Error("Patch failed");
      }

      // Refetch
      const refetch = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project.id),
        {},
        "application/json",
        authToken,
        "refetch"
      );
      if (refetch?.status === 200) {
        const normalized = refetch.data.map((item: any) => ({
          ...item,
          consumed_time:
            item.consumed_time && typeof item.consumed_time === "object"
              ? {
                  hours: item.consumed_time.hours ?? 0,
                  minutes: item.consumed_time.minutes ?? 0,
                  seconds: item.consumed_time.seconds ?? 0,
                }
              : null,
          work_person: item.work_person || item.assigned_user?.name || null,
          worker_id: item.worker_id ?? null,
          isNew: false,
        }));
        setRfqDeliverables(normalized);
      }

      toast.success("Deliverables updated");
    } catch (e: any) {
      toast.error(e.message || "Update failed");
    } finally {
      setSavingUpdate(false);
    }
  };

  // ---------- Approve Project ----------
  const handleApproveProject = async () => {
    if (!project?.id) return;
    setApproving(true);
    try {
      const resp = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_PROJECT(project.id),
        { send_to_workers: true },
        "application/json",
        authToken,
        "approve"
      );
      if (resp?.status === 200) {
        setProject((prev: any) => ({ ...prev, send_to_workers: true }));
        toast.success("Project approved");
      } else throw new Error("Approval failed");
    } catch (e: any) {
      toast.error(e.message || "Approval failed");
    } finally {
      setApproving(false);
    }
  };

  // ---------- Assign Leader ----------
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

  // ---------- Delivery ----------
  const handleDeliverySubmit = async () => {
    if (!project) return;
    const resp = await makeApiCall(
      "post",
      API_ENDPOINT.ADD_DELIVERY_FILES(project.id),
      { file_ids: selectedDeliveryFiles },
      "application/json",
      authToken,
      "delivery"
    );
    if (resp.status === 201) {
      setProject({
        ...project,
        delivery_files: resp.data,
        status: "delivered",
      });
      setShowDeliveryDialog(false);
      toast.success("Delivery submitted");
    } else toast.error("Delivery failed");
  };

  const handleMakeDeliveryClick = async () => {
    if (!project) return;
    if (files.length === 0) {
      const resp = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ALL_DELIVERY_FILES(project.id),
        {},
        "application/json",
        authToken,
        "files"
      );
      if (resp.status === 200) setFiles(resp.data);
      else toast.error("Fetch files failed");
    }
    setShowDeliveryDialog(true);
  };

  // ---------- Stage Modal ----------
  const openStageModal = () => {
    setStageInput("");
    setStageInputList([...stageOptions]);
    setShowStageModal(true);
  };

  const handleAddStageToList = () => {
    const v = stageInput.trim();
    if (!v || stageInputList.includes(v)) {
      if (v) toast.error("Stage exists");
      return;
    }
    setStageInputList((prev) => [...prev, v]);
    setStageInput("");
  };

  const handleSaveStages = () => {
    setStageOptions(stageInputList);
    setShowStageModal(false);
    toast.success("Stages saved");
  };

  const currentLeaderName =
    leaders.find((l) => l.id === selectedLeaderId)?.name || "Not assigned";

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="w-full flex flex-col items-center pt-8 pb-4 px-2 md:px-8">
        <h1 className="text-xl font-bold text-slate-800">
          Project Control (PM)
        </h1>
      </div>

      <div className="flex-1 bg-white flex justify-center items-start px-0 md:px-8 overflow-y-auto">
        <div className="w-full bg-white rounded-2xl p-2 md:p-8 border mt-2 space-y-6">
          <ProjectTabs activeTab={activeTab} onTabChange={setActiveTab} />

          {activeTab === "project" && <ProjectDataCard project={project} />}

          {activeTab === "working" && (
            <>
              <WorkingTab
                project={project}
                stageOptions={stageOptions}
                onOpenStageModal={openStageModal}
                onUpdateAll={handleUpdateAll}
                savingUpdate={savingUpdate}
                onApproveProject={handleApproveProject}
                approving={approving}
                visibleRows={visibleRows}
                workers={workers}
                loadingWorkers={loadingWorkers}
                revisionOptions={revisionOptions}
                revisionFilter={revisionFilter}
                setRevisionFilter={setRevisionFilter}
                expandedParents={expandedParents}
                onToggleParent={toggleParentExpanded}
                onFieldChange={handleFieldChange}
                onHoursChange={handleHoursChange}
                onAddSubRow={handleAddSubRow}
                onDeleteRow={handleDeleteRow}
                loadingRFQ={loadingRFQ}
                deliverables={rfqDeliverables}
              />

             
            </>
          )}

          
        </div>
      </div>

      {/* Stage Manager Dialog */}
      <Dialog open={showStageModal} onOpenChange={setShowStageModal}>
        <DialogContent className="p-8">
          <DialogHeader>
            <DialogTitle className="pb-3">Manage Stages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={stageInput}
                onChange={(e) => setStageInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  (e.preventDefault(), handleAddStageToList())
                }
                placeholder="e.g. IDC, IFA"
                className="flex-1 border rounded px-3 py-2"
              />
              <Button onClick={handleAddStageToList}>Add</Button>
            </div>
            {stageInputList.length > 0 && (
              <div className="border rounded p-3 max-h-48 overflow-y-auto space-y-2">
                {stageInputList.map((st) => (
                  <div
                    key={st}
                    className="flex justify-between items-center bg-slate-100 px-3 py-2 rounded"
                  >
                    <span>{st}</span>
                    <button
                      onClick={() =>
                        setStageInputList((p) => p.filter((x) => x !== st))
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowStageModal(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveStages}>Save Changes</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delivery Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="max-w-lg p-8">
          <DialogHeader>
            <DialogTitle>Select Files for Delivery</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {files.length === 0 ? (
              <p className="text-center text-slate-500">No files available</p>
            ) : (
              <div className="max-h-64 overflow-y-auto border rounded p-3 space-y-2">
                {files.map((file) => (
                  <label
                    key={file.id}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDeliveryFiles.includes(file.id)}
                      onChange={(e) =>
                        setSelectedDeliveryFiles((prev) =>
                          e.target.checked
                            ? [...prev, file.id]
                            : prev.filter((i) => i !== file.id)
                        )
                      }
                    />
                    <span className="text-sm">{file.label}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeliveryDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeliverySubmit}
                disabled={selectedDeliveryFiles.length === 0}
              >
                Submit Delivery
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectControlPm;
