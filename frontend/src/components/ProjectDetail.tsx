/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import ShowFile from "@/components/ShowFile";
import Submission from "@/components/Submission";
import { useParams } from "react-router-dom";
import Loading from "@/components/atomic/Loading";
import { Progress } from "@/components/ui/progress";
import {
  User,
  Phone,
  Mail,
  FileText,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Pencil,
} from "lucide-react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useConfirmDialog } from "./ui/alert-dialog";

const ProjectTrack: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const [estimation, setEstimation] = useState<any>(null);

  const { makeApiCall, fetching, fetchType } = useAPICall();
  const { authToken, user } = useAuth();
  const isAdmin = user.role === "admin";
  const confirmDialog = useConfirmDialog();
  const [selectedStepIdx, setSelectedStepIdx] = useState<number | null>(null);

  type DeliveryFile = { id: number; label: string; url: string };
  const [files, setFiles] = useState<DeliveryFile[]>([]);
  const [enableDelivery, setEnableDelivery] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedDeliveryFiles, setSelectedDeliveryFiles] = useState<number[]>(
    []
  );
  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctionText, setCorrectionText] = useState("");

  type RFQDeliverable = {
    id: number;
    sno?: number;
    drawing_no?: string;
    title?: string;
    discipline?: string;
    deliverables?: string;
    amount?: number | string | null;
  };

  const [rfqDeliverables, setRfqDeliverables] = useState<RFQDeliverable[]>([]);
  const [loadingRFQ, setLoadingRFQ] = useState(false);
  const [savingAmounts, setSavingAmounts] = useState(false);
  const [editingAmountId, setEditingAmountId] = useState<number | null>(null);

  // Handle local amount change
  const handleAmountChange = (id: number, value: string) => {
    setRfqDeliverables((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, amount: value === "" ? null : Number(value) || "" }
          : item
      )
    );
  };

  // Save amounts to backend
  const saveAmounts = async () => {
    if (!projectId) return;

    const payload = rfqDeliverables
      .filter(
        (d) => d.amount !== null && d.amount !== "" && !isNaN(Number(d.amount))
      )
      .map((d) => ({
        sno: d.sno || 0,
        amount: Number(d.amount),
      }));

    if (payload.length === 0) {
      toast.error("Please enter at least one valid amount");
      return;
    }

    setSavingAmounts(true);
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.UPDATES_ADD_AMOUNTS(projectId),
      { deliverables: payload },
      "application/json",
      authToken,
      "saveAmounts"
    );

    if (response?.status === 200) {
      toast.success("Amounts saved successfully");
      setEditingAmountId(null);
    } else {
      toast.error(response?.data?.detail || "Failed to save amounts");
    }
    setSavingAmounts(false);
  };

  // Fetch RFQ Deliverables
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
        setRfqDeliverables(response.data);
      } else {
        setRfqDeliverables([]);
      }
      setLoadingRFQ(false);
    };
    fetchRFQDeliverables();
  }, [project?.id, makeApiCall, authToken]);

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

  // estimation made by me
  useEffect(() => {
    const fetchEstimation = async () => {
      if (!projectId) return;
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ESTIMATION_PROJECTS_BY_PROJECT_ID(projectId),
        {},
        "application/json",
        authToken,
        "getProject"
      );
      if (response.status === 200) {
        setEstimation(response.data[0]);
      }
    };
    fetchEstimation();
  }, [projectId, makeApiCall, authToken]);

  useEffect(() => {
    if (project) {
      setEnableDelivery(project.status.toLowerCase() === "completed");
    }
  }, [project]);

  if ((fetching && fetchType === "getProject") || !project) {
    return <Loading />;
  }

  // ==================== SHARED DELIVERABLES TABLE ====================
  const DeliverablesTable = ({
    currentStepIdx,
  }: {
    currentStepIdx: number;
  }) => (
    <div className="px-6 py-6">
      <div className="flex items-center gap-2 mb-6">
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
          {/* Save button only in Estimation step */}
          {currentStepIdx === 1 && (
            <div className="mb-6">
              <Button
                onClick={saveAmounts}
                disabled={savingAmounts}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {savingAmounts ? "Saving..." : "Save Amounts"}
              </Button>
            </div>
          )}

          <table className="w-full text-sm border rounded-lg overflow-hidden">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Drawing No</th>
                <th className="px-4 py-3 text-left">Title</th>
                <th className="px-4 py-3 text-left">Discipline</th>
                <th className="px-4 py-3 text-left">Deliverables</th>
                <th className="px-4 py-3 text-left font-semibold text-green-700">
                  Amount (₹)
                </th>
                {/* Action column only in Estimation step */}
                {currentStepIdx === 1 && (
                  <th className="px-4 py-3 text-left">Action</th>
                )}
              </tr>
            </thead>
            <tbody>
              {rfqDeliverables.map((item, index) => (
                <tr key={item.id} className="border-t hover:bg-slate-50">
                  <td className="px-4 py-3">{item.sno ?? index + 1}</td>
                  <td className="px-4 py-3">{item.drawing_no || "—"}</td>
                  <td className="px-4 py-3">{item.title || "—"}</td>
                  <td className="px-4 py-3">{item.discipline || "—"}</td>
                  <td className="px-4 py-3">{item.deliverables || "—"}</td>

                  <td className="px-4 py-3">
                    {editingAmountId === item.id && currentStepIdx === 1 ? (
                      <input
                        type="number"
                        min="0"
                        value={item.amount ?? ""}
                        onChange={(e) =>
                          handleAmountChange(item.id, e.target.value)
                        }
                        className="w-40 rounded-md border px-3 py-1.5 text-sm focus:border-green-500 focus:outline-none"
                        placeholder="Enter amount"
                        autoFocus
                      />
                    ) : (
                      <span className="font-semibold text-green-700">
                        {item.amount != null
                          ? `₹${Number(item.amount).toLocaleString()}`
                          : "—"}
                      </span>
                    )}
                  </td>

                  {/* Edit action only in Estimation step */}
                  {currentStepIdx === 1 && (
                    <td className="px-4 py-3">
                      {editingAmountId === item.id ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingAmountId(null)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <button
                          onClick={() => setEditingAmountId(item.id)}
                          className="p-1.5 text-green-600 hover:text-green-800 transition"
                        >
                          <Pencil size={16} />
                        </button>
                      )}
                    </td>
                  )}
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
  );
  // ======================================================================

  const STEP_CONFIG = [
    {
      label: "Project Creation",
      key: "creation",
      getCompleted: (project: any) => project.status !== "draft",
      renderContent: (project: any) => (
        <div className="rounded-2xl shadow-lg border bg-white">
          <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-400">
            <div className="flex items-center gap-3">
              <FileText className="text-white" size={28} />
              <span className="text-lg font-bold text-white">Project Data</span>
            </div>
            <span className="text-xs font-semibold text-white bg-blue-800 px-2 py-1 rounded capitalize">
              {project.project_id}
            </span>
          </div>

          <div className="px-6 py-6 grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 border-b">
            <div>
              <span className="font-medium text-slate-700">Client Name:</span>{" "}
              <span className="text-slate-900 capitalize">
                {project.client_name}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">
                Client Company:
              </span>{" "}
              <span className="text-slate-900 capitalize">
                {project.client_company}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Location:</span>{" "}
              <span className="text-slate-900 capitalize">
                {project.location}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Project Type:</span>{" "}
              <span className="text-slate-900 capitalize">
                {project.project_type}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Received Date:</span>{" "}
              <span className="text-slate-900">
                {new Date(project.received_date).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="font-medium text-slate-700">Priority:</span>{" "}
              <span className="capitalize text-slate-900">
                {project.priority}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 border-b">
            <div className="flex items-center gap-2">
              <User className="text-blue-700" size={18} />
              <span className="font-medium text-slate-700">
                Contact Person:
              </span>{" "}
              <span className="text-slate-900 capitalize">
                {project.contact_person}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="text-blue-700" size={18} />
              <span className="font-medium text-slate-700">Phone:</span>{" "}
              <span className="text-slate-900">
                {project.contact_person_phone}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="text-blue-700" size={18} />
              <span className="font-medium text-slate-700">Email:</span>{" "}
              <span className="text-slate-700 lowercase">
                {project.contact_person_email}
              </span>
            </div>
          </div>

          <div className="px-6 py-4 border-b">
            <div className="text-xs text-slate-500 mb-1">Notes</div>
            <div className="bg-slate-50 rounded p-3 text-slate-800 capitalize">
              {project.notes || (
                <span className="text-slate-400">No notes provided.</span>
              )}
            </div>
          </div>

          <div className="px-6 py-4 border-b">
            <div className="flex items-center gap-2 mb-1">
              <FileText className="text-blue-700" size={18} />
              <span className="text-xs font-semibold text-slate-700">
                Uploaded Files:
              </span>
            </div>
            <div className="flex flex-wrap gap-2 ml-1">
              {project.uploaded_files?.length > 0 ? (
                project.uploaded_files.map((file: any, i: number) => (
                  <ShowFile
                    key={file.id || i}
                    label={file.label}
                    url={file.file}
                  />
                ))
              ) : (
                <span className="text-slate-400 text-xs">
                  No files uploaded.
                </span>
              )}
            </div>
          </div>

          {Array.isArray(project.more_info) && project.more_info.length > 0 && (
            <div className="px-6 py-4 border-b">
              <div className="text-sm font-semibold text-blue-600 mb-3">
                Additional Info
              </div>
              <div className="flex flex-col gap-4">
                {project.more_info.map((info: any, index: number) => (
                  <div
                    key={info.id || index}
                    className="border rounded-lg p-4 bg-slate-50 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-600">
                        Entry #{index + 1}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(info.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="font-medium text-slate-700">
                          Enquiry:
                        </span>{" "}
                        <span className="text-slate-800 capitalize">
                          {info.enquiry || "—"}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-slate-700">
                          Notes:
                        </span>{" "}
                        <span className="text-slate-800 capitalize">
                          {info.notes || "—"}
                        </span>
                      </div>
                    </div>
                    {info.uploaded_files?.length > 0 && (
                      <div>
                        <div className="font-medium text-slate-700 mb-1">
                          Uploaded Files:
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {info.uploaded_files.map((file: any, i: number) => (
                            <ShowFile
                              key={file.id || i}
                              label={file.label}
                              url={file.file}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
      ),
    },
    {
      label: "Project Estimation",
      key: "estimation",
      status: project.estimation_status,
      getCompleted: (project: any) =>
        project.estimation && project.estimation.sent_to_pm === true,
      renderContent: (project: any) => (
        <div className="rounded-2xl shadow-lg border bg-white">
          <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-green-600 to-green-400">
            <div className="flex items-center gap-3">
              <FileText className="text-white" size={28} />
              <span className="text-lg font-bold text-white">
                Estimation Data
              </span>
            </div>
            <span className="text-xs font-semibold text-white bg-green-800 px-2 py-1 rounded capitalize">
              {project.project_id}
            </span>
          </div>

          <DeliverablesTable currentStepIdx={1} />

          {/* Admin Action Buttons */}
          {project.estimation_status === "sent_to_admin" && isAdmin && (
            <div className="w-full flex flex-col sm:flex-row gap-3 mt-8 px-6 pb-8">
              <Button
                className="bg-red-600 hover:bg-red-700 text-white flex-1"
                onClick={handleCloseProject}
              >
                Close this project
              </Button>
              <Button
                className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1"
                onClick={() => setShowCorrectionDialog(true)}
              >
                Correction request
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={handleApproveProject}
                disabled={!project.estimation}
              >
                {project.estimation
                  ? "Approve"
                  : "Approve (waiting for estimation)"}
              </Button>
            </div>
          )}

          {/* Correction Dialog */}
          <Dialog
            open={showCorrectionDialog}
            onOpenChange={setShowCorrectionDialog}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Correction Request</DialogTitle>
              </DialogHeader>
              <div className="p-6">
                <div className="mb-4">
                  <label className="block font-medium mb-1">
                    Correction Details
                  </label>
                  <textarea
                    className="border rounded w-full p-2 text-sm"
                    rows={3}
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    placeholder="Enter correction details..."
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowCorrectionDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-yellow-600 hover:bg-yellow-700 text-white"
                    onClick={handleCorrectionRequest}
                  >
                    Send Correction
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      ),
    },
    {
      label: "Project Working",
      key: "working",
      getCompleted: (project: any) =>
        project.status.toLowerCase() !== "working",
      renderContent: (project: any) => (
        <div className="space-y-8">
          <div className="rounded-2xl shadow-lg border bg-white">
            <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-blue-600 to-blue-400">
              <div className="flex items-center gap-3">
                <Clock className="text-white" size={28} />
                <span className="text-lg font-bold text-white">
                  Project Working
                </span>
              </div>
            </div>

            {/* RFQ Deliverables Table shown here (read-only) */}
            <DeliverablesTable currentStepIdx={2} />

          
          </div>
        </div>
      ),
    },
    {
      label: "Project Delivery",
      key: "delivery",
      getCompleted: (project: any) => project.status === "delivered",
      renderContent: (project: any) => (
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-blue-800 mb-2">
              Delivery Files
            </h2>
            {!isAdmin &&
              enableDelivery &&
              project.delivery_files.length === 0 && (
                <Button onClick={handleMakeDeliveryClick}>Make Delivery</Button>
              )}
          </div>
          <div className="flex flex-wrap gap-2">
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
      ),
    },
  ];

  const getStepStatus = (project: any) => {
    let foundCurrent = false;
    return STEP_CONFIG.map((step, idx) => {
      const completed = step.getCompleted(project);
      if (foundCurrent)
        return { ...step, completed: false, current: false, notStarted: true };
      if (completed)
        return { ...step, completed: true, current: false, notStarted: false };
      foundCurrent = true;
      return { ...step, completed: false, current: true, notStarted: false };
    });
  };

  const STEP_ICONS = [FileText, ClipboardList, Clock, CheckCircle2];
  const steps = getStepStatus(project);

  const forcedStepIdx =
    project?.estimation_status === "sent_to_admin" ? 0 : null;
  const defaultStepIdx = steps.findIndex((step) => step.current);
  const currentStepIdx =
    selectedStepIdx !== null
      ? selectedStepIdx
      : forcedStepIdx !== null
      ? forcedStepIdx
      : defaultStepIdx !== -1
      ? defaultStepIdx
      : 0;

  const currentStep = steps[currentStepIdx];

  const handleFileToggle = (fileId: number) => {
    setSelectedDeliveryFiles((prev) =>
      prev.includes(fileId)
        ? prev.filter((id) => id !== fileId)
        : [...prev, fileId]
    );
  };

  const handleDeliverySubmit = async () => {
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

  const handleCloseProject = async () => {
    const confirmed = await confirmDialog({
      title: "Close Project",
      description: "Are you sure?",
      confirmText: "Close",
    });
    if (confirmed) {
      const response = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_PROJECT(project.id),
        { estimation_status: "rejected", status: "rejected" },
        "application/json",
        authToken
      );
      if (response.status === 200) {
        setProject({
          ...project,
          estimation_status: "rejected",
          status: "rejected",
        });
        toast.success("Project closed");
      }
    }
  };

  const handleApproveProject = async () => {
    if (!estimation) {
      toast.error("Estimation not yet created. Cannot approve.");
      return;
    }

    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_ESTIMATION(estimation.id),
      { project_id: project.id, approved: true, sent_to_pm: true },
      "application/json",
      authToken
    );

    if (response.status === 200) {
      setProject({
        ...project,
        estimation_status: "approved",
        status: "working",
        estimation: { ...project.estimation, approved: true, sent_to_pm: true },
      });
      toast.success("Project approved");
    } else {
      toast.error("Failed to approve project");
    }
  };

  const handleCorrectionRequest = async () => {
    if (!correctionText.trim()) {
      toast.error("Correction text is required");
      return;
    }
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.CREATE_ESTIMATION_CORRECTION,
      {
        correction: correctionText,
        estimation_id: project.estimation.id,
        project_id: project.id,
      },
      "application/json",
      authToken
    );
    if (response.status === 201) {
      setProject((prev: any) => ({
        ...prev,
        estimation: {
          ...prev.estimation,
          corrections: [
            response.data.estimationCorrection,
            ...(prev.estimation.corrections || []),
          ],
        },
      }));
      toast.success("Correction request sent");
      setShowCorrectionDialog(false);
      setCorrectionText("");
    } else {
      toast.error("Failed to send correction");
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      <div className="w-full flex flex-col items-center pt-8 pb-4 px-2 md:px-8">
        <div className="w-full max-w-full overflow-x-auto whitespace-nowrap flex flex-row items-start justify-between gap-8 relative">
          {steps.map((step, idx) => {
            const Icon = STEP_ICONS[idx] || FileText;
            let circleColor = "bg-gray-200 text-gray-500";
            let iconColor = "text-gray-400";
            let labelColor = "text-gray-500";
            let shadow = "";
            if (step.completed) {
              circleColor = "bg-green-500 text-white";
              iconColor = "text-white";
              labelColor = "text-green-700 font-semibold";
            } else if (step.current) {
              circleColor = "bg-yellow-400 text-white";
              iconColor = "text-white";
              labelColor = "text-yellow-700 font-semibold";
              shadow = "shadow-lg";
            }
            if (step.status === "rejected") {
              circleColor = "bg-red-500 text-white";
              labelColor = "text-red-700 font-semibold";
              shadow = "shadow-lg";
            }
            return (
              <button
                key={step.key}
                className="relative inline-flex md:flex flex-col items-center group focus:outline-none bg-transparent"
                onClick={() => setSelectedStepIdx(idx)}
                disabled={step.notStarted}
              >
                {idx < steps.length - 1 && (
                  <span className="absolute top-1/2 left-full w-full h-1 bg-gradient-to-r from-gray-200 to-gray-100 z-0 -translate-y-1/2" />
                )}
                <span
                  className={`z-10 w-14 h-14 flex items-center justify-center rounded-full border-4 border-transparent ${circleColor} ${shadow}`}
                >
                  <Icon className={`w-7 h-7 ${iconColor}`} />
                </span>
                <span
                  className={`mt-2 text-base ${labelColor} tracking-wide text-center`}
                >
                  {step.label}
                </span>
                {step.completed && (
                  <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <CheckCircle2 size={16} />
                    Completed
                  </div>
                )}
                {step.current && (
                  <div className="text-xs text-yellow-600 mt-1 flex items-center gap-1">
                    <Clock size={16} />
                    Current
                  </div>
                )}
                {step.notStarted && (
                  <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={16} />
                    Not Started
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 bg-white flex justify-center items-start px-0 md:px-8 overflow-y-auto">
        <div className="w-full bg-white rounded-2xl p-2 md:p-8 border min-h-[30px] flex flex-col justify-start mt-2">
          {currentStep.renderContent(project)}
        </div>
      </div>

      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Select Files for Delivery</DialogTitle>
          </DialogHeader>
          <div className="p-6">
            <div className="space-y-4 max-h-80 overflow-y-auto">
              {files.length === 0 ? (
                <div className="text-slate-500 text-center">
                  No files available for delivery.
                </div>
              ) : (
                files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center gap-3 border rounded p-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDeliveryFiles.includes(file.id)}
                      onChange={() => handleFileToggle(file.id)}
                      className="accent-blue-600"
                    />
                    <ShowFile label={file.label} url={file.url} />
                  </div>
                ))
              )}
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button
                variant="outline"
                onClick={() => setShowDeliveryDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={handleDeliverySubmit}
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

export default ProjectTrack;
