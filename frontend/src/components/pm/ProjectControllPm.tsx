/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/atomic/Loading";
import ShowFile from "@/components/ShowFile";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  ClipboardList,
  Clock,
  CheckCircle2,
  Plus,
  Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

type RFQDeliverable = {
  id: number; // DB id if >0, temp id if isNew
  sno?: number | string;
  drawing_no?: string;
  title?: string;
  discipline?: string;
  deliverables?: string;
  stage?: string;
  revision?: string | number;
  hours?: number | string | null;
  consumed_time?: number | string | null; // readonly for PM
  work_person?: string | null;
  worker_id?: number | null;
  isNew?: boolean;
};

type DeliveryFile = { id: number; label: string; url: string };

type Worker = {
  id: number;
  name: string;
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

  // stage manager
  const [stageOptions, setStageOptions] = useState<string[]>([
    "IDC",
    "IFR",
    "IFA",
    "IFC",
  ]);
  const [showStageModal, setShowStageModal] = useState(false);
  const [stageInput, setStageInput] = useState("");
  const [stageInputList, setStageInputList] = useState<string[]>([]);

  // workers
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loadingWorkers, setLoadingWorkers] = useState(false);

  const openStageModal = () => {
    setStageInput("");
    setStageInputList(stageOptions);
    setShowStageModal(true);
  };

  const handleAddStageToList = () => {
    const v = stageInput.trim();
    if (!v) return;
    if (stageInputList.includes(v)) {
      toast.error("Stage already added");
      return;
    }
    setStageInputList((prev) => [...prev, v]);
    setStageInput("");
  };

  const handleSaveStages = () => {
    setStageOptions(stageInputList);
    setShowStageModal(false);
  };

  // ---------- fetch project ----------
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

  // ---------- fetch deliverables ----------
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

      console.log("workers API raw response", response);

      const list = Array.isArray(response?.data) ? response.data : [];
      setWorkers(
        list.map((w: any) => ({
          id: w.id,
          name: w.name,
        }))
      );

      setLoadingWorkers(false);
    };
    fetchWorkers();
  }, [makeApiCall, authToken]);

  useEffect(() => {
    console.log("workers state", workers);
  }, [workers]);

  // ---------- enable delivery ----------
  useEffect(() => {
    if (project) {
      setEnableDelivery(project.status.toLowerCase() === "completed");
    }
  }, [project]);

  if ((fetching && fetchType === "getProject") || !project) {
    return <Loading />;
  }

  // ---------- generic editable fields ----------
  const handleFieldChange = (
    id: number,
    key: keyof RFQDeliverable,
    value: string | number | null
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

  // ---------- add sub‑rows (1.1, 1.2 …) ----------
  const getNextSubSno = (parentSno: number | string | undefined) => {
    if (parentSno === undefined || parentSno === null) return "";
    const base = Number(String(parentSno).split(".")[0]);
    const childs = rfqDeliverables
      .filter((d) => {
        if (d.sno === undefined) return false;
        const [p] = String(d.sno).split(".");
        return Number(p) === base && String(d.sno).includes(".");
      })
      .map((d) => Number(String(d.sno).split(".")[1] || "0"));

    const nextChild = (childs.length ? Math.max(...childs) : 0) + 1;
    return `${base}.${nextChild}`;
  };

  const handleAddSubRow = (parent: RFQDeliverable) => {
    const newSno = getNextSubSno(parent.sno);
    if (!newSno) return;

    const newRow: RFQDeliverable = {
      id: Date.now(), // temp id
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

      for (let i = parentIndex + 1; i < list.length; i++) {
        const s = list[i].sno;
        if (s && String(s).startsWith(String(parent.sno).split(".")[0] + ".")) {
          insertIndex = i + 1;
        } else {
          break;
        }
      }

      list.splice(insertIndex, 0, newRow);
      return list;
    });
  };

  // ---------- single Update button ----------
  // ---------- single Update button ----------
  const handleUpdateAll = async () => {
    if (!project || !project.id) return;

    setSavingUpdate(true);

    try {
      // 1) create NEW rows via POST (only allowed RFQ fields)
      const newRows = rfqDeliverables.filter((d) => d.isNew);
      if (newRows.length > 0) {
        const deliverablesPayload = newRows.map((d) => ({
          sno: d.sno,
          drawing_no: d.drawing_no,
          title: d.title,
          deliverables: d.deliverables,
          discipline: d.discipline,
          // NO stage, revision, hours, worker_id, work_person here
        }));
        const respNew = await makeApiCall(
          "post",
          API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project.id),
          { deliverables: deliverablesPayload },
          "application/json",
          authToken,
          "createDeliverables"
        );
        if (!(respNew?.status === 201 || respNew?.status === 200)) {
          throw new Error(
            respNew?.data?.detail || "Failed to create RFQ deliverables"
          );
        }
      }

      // 2) patch EXISTING rows via deliverable_id
      const existingRows = rfqDeliverables.filter((d) => !d.isNew && d.id > 0);
      for (const row of existingRows) {
        const updates: any = {
          sno: row.sno,
          drawing_no: row.drawing_no,
          title: row.title,
          deliverables: row.deliverables,
          discipline: row.discipline,
          stage: row.stage,
          revision: row.revision,
          hours: row.hours,
          worker_id: row.worker_id,
          work_person: row.work_person, // worker name
        };

        const respPatch = await makeApiCall(
          "patch",
          API_ENDPOINT.DELIVERABLES_PATCH_REQUEST(String(row.id)),
          updates,
          "application/json",
          authToken,
          "deliverablePatch"
        );

        if (respPatch?.status !== 200) {
          throw new Error(
            respPatch?.data?.detail || "Failed to update a deliverable"
          );
        }
      }

      // 3) refetch final list
      const refetch = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project.id),
        {},
        "application/json",
        authToken,
        "getRFQDeliverables"
      );
      if (refetch?.status === 200 && Array.isArray(refetch.data)) {
        const normalized = refetch.data.map((item: any) => ({
          ...item,
          work_person: item.work_person || item.assigned_user?.name || null,
          worker_id: item.worker_id ?? null,
          isNew: false,
        }));
        setRfqDeliverables(normalized);
      }

      toast.success("Deliverables updated");
    } catch (e: any) {
      toast.error(e.message || "Failed to update");
    } finally {
      setSavingUpdate(false);
    }
  };

  const handleDeliverySubmit = async () => {
    if (!project) return;
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.ADD_DELIVERY_FILES(project.id),
      { file_ids: selectedDeliveryFiles },
      "application/json",
      authToken,
      "addDeliverySubmit"
    );
    if (response.status === 201) {
      setProject({
        ...project,
        delivery_files: response.data,
        status: "delivered",
      });
      setShowDeliveryDialog(false);
    } else {
      toast.error("Failed to submit delivery");
    }
  };

  const handleMakeDeliveryClick = async () => {
    if (!project) return;
    if (files.length > 0) {
      setShowDeliveryDialog(true);
      return;
    }
    const response = await makeApiCall(
      "get",
      API_ENDPOINT.GET_ALL_DELIVERY_FILES(project.id),
      {},
      "application/json",
      authToken,
      "getDeliveryFiles"
    );
    if (response.status === 200 && Array.isArray(response.data)) {
      setFiles(response.data);
    } else {
      setFiles([]);
      toast.error("Failed to fetch files");
    }
    setShowDeliveryDialog(true);
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="w-full flex flex-col items-center pt-8 pb-4 px-2 md:px-8">
        <h1 className="text-xl font-bold text-slate-800">
          Project Control (PM)
        </h1>
      </div>

      <div className="flex-1 bg-white flex justify-center items-start px-0 md:px-8 overflow-y-auto">
        <div className="w-full bg-white rounded-2xl p-2 md:p-8 border mt-2 space-y-8">
          {/* Project overview */}
          <div className="rounded-2xl shadow-lg border bg-white">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-400">
              <div className="flex items-center gap-3">
                <FileText className="text-white" size={28} />
                <span className="text-lg font-bold text-white">
                  Project Data
                </span>
              </div>
              <span className="text-xs font-semibold text-white bg-blue-800 px-2 py-1 rounded capitalize">
                {project.project_id}
              </span>
            </div>

            {/* add your project detail fields here */}

            <div className="px-6 py-4 flex items-center gap-3">
              <Progress
                value={project.status === "draft" ? 50 : 100}
                className="h-2 bg-gray-200 flex-1"
              />
              <span className="text-xs font-mono text-slate-600">
                {project.status === "draft" ? 50 : 100}%
              </span>
            </div>
          </div>

          {/* Working + RFQ assign section */}
          <div className="rounded-2xl shadow-lg border bg-white">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-indigo-400">
              <div className="flex items-center gap-3">
                <Clock className="text-white" size={28} />
                <span className="text-lg font-bold text-white">
                  Project Working
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={openStageModal}
                  className="text-white/80 hover:text-white flex items-center gap-1 text-sm"
                  title="Manage stages"
                >
                  <Settings2 size={18} />
                  <span className="hidden sm:inline">Stages</span>
                </button>
                <Button
                  onClick={handleUpdateAll}
                  disabled={savingUpdate}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  {savingUpdate ? "Updating..." : "Update"}
                </Button>
              </div>
            </div>

            <div className="px-6 py-6">
              <div className="flex items-center gap-2 mb-4">
                <ClipboardList className="text-indigo-600" size={20} />
                <span className="text-lg font-semibold text-slate-800">
                  RFQ Deliverables
                </span>
              </div>

              {loadingRFQ ? (
                <div className="text-center py-8 text-slate-500">
                  Loading deliverables...
                </div>
              ) : rfqDeliverables.length > 0 ? (
                <div className="overflow-x-auto">
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
                      </tr>
                    </thead>
                    <tbody>
                      {rfqDeliverables.map((item, index) => (
                        <tr
                          key={item.id}
                          className={`border-t ${
                            item.isNew ? "bg-amber-50" : "bg-white"
                          } hover:bg-slate-50`}
                        >
                          <td className="px-4 py-3">{item.sno ?? index + 1}</td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 group">
                              <button
                                type="button"
                                className="opacity-0 group-hover:opacity-100 transition text-emerald-600 hover:text-emerald-800"
                                onClick={() => handleAddSubRow(item)}
                              >
                                <Plus size={16} />
                              </button>
                              <span>{item.drawing_no || "—"}</span>
                            </div>
                          </td>

                          <td className="px-4 py-3">{item.title || "—"}</td>
                          <td className="px-4 py-3">
                            {item.deliverables || "—"}
                          </td>
                          <td className="px-4 py-3">
                            {item.discipline || "—"}
                          </td>

                          <td className="px-4 py-3">
                            <select
                              value={item.stage ?? ""}
                              onChange={(e) =>
                                handleFieldChange(
                                  item.id,
                                  "stage",
                                  e.target.value
                                )
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
                                handleFieldChange(
                                  item.id,
                                  "revision",
                                  e.target.value
                                )
                              }
                              className="w-20 border rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                              placeholder="Rev"
                            />
                          </td>

                          <td className="px-4 py-3">
                            <input
                              type="tel"
                              value={item.hours ?? ""}
                              onChange={(e) =>
                                handleHoursChange(item.id, e.target.value)
                              }
                              className="w-20 border rounded px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none"
                              placeholder="Hours"
                            />
                          </td>

                          {/* Worker select */}
                          <td className="px-4 py-3">
                            <select
                              value={item.worker_id ?? ""}
                              onChange={(e) => {
                                const workerId = e.target.value
                                  ? Number(e.target.value)
                                  : null;
                                const worker =
                                  workers.find((w) => w.id === workerId) ||
                                  null;

                                setRfqDeliverables((prev) =>
                                  prev.map((row) =>
                                    row.id === item.id
                                      ? {
                                          ...row,
                                          worker_id: workerId,
                                          work_person: worker
                                            ? worker.name
                                            : null,
                                        }
                                      : row
                                  )
                                );
                              }}
                              className="w-40 border rounded px-2 py-1 text-xs bg-white focus:border-indigo-500 focus:outline-none"
                              disabled={loadingWorkers}
                            >
                              <option value="">
                                {loadingWorkers
                                  ? "Loading..."
                                  : "Select worker"}
                              </option>
                              {workers.map((w) => (
                                <option key={w.id} value={w.id}>
                                  {w.name}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3">
                            <span>{item.consumed_time ?? "—"}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No RFQ deliverables found for this project.
                </div>
              )}
            </div>
          </div>

          {/* Delivery control for PM */}
          <div className="rounded-2xl shadow-lg border bg-white">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-green-600 to-green-400">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-white" size={28} />
                <span className="text-lg font-bold text-white">
                  Project Delivery
                </span>
              </div>
              {enableDelivery && project.delivery_files.length === 0 && (
                <Button onClick={handleMakeDeliveryClick}>Make Delivery</Button>
              )}
            </div>
            <div className="px-6 py-4 flex flex-wrap gap-2">
              {project.delivery_files?.length > 0 ? (
                project.delivery_files.map((file: any, i: number) => (
                  <ShowFile
                    key={file.id || i}
                    label={file.label}
                    url={file.file || file.url}
                  />
                ))
              ) : (
                <span className="text-slate-400">
                  No delivery files available.
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delivery selection dialog */}
      

      {/* Stage manager dialog */}
      <Dialog open={showStageModal} onOpenChange={setShowStageModal}>
        <DialogContent className="p-6">
          <DialogHeader>
            <DialogTitle className="text-center pb-4">Manage Stages</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={stageInput}
                onChange={(e) => setStageInput(e.target.value)}
                className="flex-1 border rounded px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                placeholder="Enter stage name (e.g. IDC, IFR)"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddStageToList();
                  }
                }}
              />
              <Button onClick={handleAddStageToList}>Add</Button>
            </div>

            {stageInputList.length > 0 && (
              <div className="border rounded p-2 max-h-40 overflow-y-auto text-sm space-y-1">
                {stageInputList.map((st) => (
                  <div
                    key={st}
                    className="flex items-center justify-between px-2 py-1 bg-slate-50 rounded"
                  >
                    <span>{st}</span>
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
              <Button onClick={handleSaveStages}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectControlPm;
