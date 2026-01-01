/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_ENDPOINT } from "@/config/backend";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import Loading from "@/components/atomic/Loading";
import ShowFile from "@/components/ShowFile";
import { Progress } from "@/components/ui/progress";
import { FileText, ClipboardList, Clock, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import toast from "react-hot-toast";

type RFQDeliverable = {
  id: number;
  sno?: number;
  drawing_no?: string;
  title?: string;
  discipline?: string;
  deliverables?: string;
  amount?: number | string | null;
  hours: number;
};

type TabKey = "project" | "deliverables" | "estimation" | "files";

const ProjectControlAdmin: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const { makeApiCall, fetching, fetchType } = useAPICall();
  const { authToken } = useAuth();

  const [project, setProject] = useState<any>(null);
  const [estimation, setEstimation] = useState<any>(null);
  const [rfqDeliverables, setRfqDeliverables] = useState<RFQDeliverable[]>([]);
  const [loadingRFQ, setLoadingRFQ] = useState(false);

  const [savingAmounts, setSavingAmounts] = useState(false);
  const [editingAmountId, setEditingAmountId] = useState<number | null>(null);

  const [showCorrectionDialog, setShowCorrectionDialog] = useState(false);
  const [correctionText, setCorrectionText] = useState("");

  const [activeTab, setActiveTab] = useState<TabKey>("project");

  // derived flag
  const isApproved = project?.estimation?.approved === true;

  // Fetch project
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

  // Fetch estimation
  useEffect(() => {
    const fetchEstimation = async () => {
      if (!projectId) return;
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ESTIMATION_PROJECTS_BY_PROJECT_ID(projectId),
        {},
        "application/json",
        authToken,
        "getEstimation"
      );
      if (response.status === 200 && Array.isArray(response.data)) {
        setEstimation(response.data[0]);
      }
    };
    fetchEstimation();
  }, [projectId, makeApiCall, authToken]);

  // Fetch RFQ deliverables for estimation
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

  if ((fetching && fetchType === "getProject") || !project) {
    return <Loading />;
  }

  const handleAmountChange = (id: number, value: string) => {
    setRfqDeliverables((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, amount: value === "" ? null : Number(value) || "" }
          : item
      )
    );
  };

  const saveAmounts = async () => {
    if (!projectId) return;

    const payload = rfqDeliverables
      .map((d) => {
        const snoNum =
          d.sno !== undefined && d.sno !== null ? Number(d.sno) : NaN;
        const amountNum =
          d.amount !== null && d.amount !== "" ? Number(d.amount) : NaN;

        return {
          sno: snoNum,
          amount: amountNum,
        };
      })
      .filter((d) => Number.isFinite(d.sno) && Number.isFinite(d.amount));

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

  const handleApproveProject = async () => {
    if (isApproved) return;
    if (!project || !estimation) {
      toast.error("Estimation not yet created. Cannot approve.");
      return;
    }
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_ESTIMATION(estimation.id),
      { project_id: project.id, approved: true },
      "application/json",
      authToken
    );
    if (response.status === 200) {
      setProject({
        ...project,
        estimation_status: "approved",
        status: "working",
        estimation: { ...project.estimation, approved: true },
      });
      toast.success("Project approved");
    } else {
      toast.error("Failed to approve project");
    }
  };

  const handleCorrectionRequest = async () => {
    if (isApproved) return;
    if (!project || !project.estimation) return;
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

  const renderProjectTab = () => (
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
          <p className="text-xs text-slate-500">Client</p>
          <p className="text-sm font-medium text-slate-800">
            {project.client_name || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Project Name</p>
          <p className="text-sm font-medium text-slate-800">
            {project.name || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Location</p>
          <p className="text-sm font-medium text-slate-800">
            {project.location || "-"}
          </p>
        </div>
        <div>
          <p className="text-xs text-slate-500">Status</p>
          <p className="text-sm font-medium capitalize text-slate-800">
            {project.status || "-"}
          </p>
        </div>
      </div>

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
  );

  const renderDeliverablesTab = () => (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-green-600 to-green-400">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-white" size={28} />
          <span className="text-lg font-bold text-white">RFQ Deliverables</span>
        </div>
      </div>

      <div className="px-6 py-6">
        <div className="flex justify-between mb-4">
          <span className="font-semibold text-slate-800">Deliverables</span>
          <Button
            onClick={saveAmounts}
            disabled={savingAmounts}
            className="bg-black hover:bg-gray-800 text-white"
          >
            {savingAmounts ? "Saving..." : "Save Amounts"}
          </Button>
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
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Drawing No</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Discipline</th>
                  <th className="px-4 py-3 text-left">Deliverables</th>
                  <th className="px-4 py-3 text-left">Hours</th>
                  <th className="px-4 py-3 text-left font-semibold text-green-700">
                    Amount (₹)
                  </th>
                  <th className="px-4 py-3 text-left">Action</th>
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
                    <td className="px-4 py-3">{item.hours || "—"}</td>

                    <td className="px-4 py-3">
                      {editingAmountId === item.id ? (
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

      {project.estimation_status === "sent_to_admin" && (
        <div className="w-full flex flex-col sm:flex-row gap-3 mt-4 px-6 pb-8">
          {/* Reject removed */}
          <Button
            className="bg-yellow-500 hover:bg-yellow-600 text-white flex-1 disabled:opacity-50"
            onClick={() => setShowCorrectionDialog(true)}
            disabled={isApproved}
          >
            Correction request
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white flex-1 disabled:opacity-50"
            onClick={handleApproveProject}
            disabled={isApproved}
          >
            Approve
          </Button>
        </div>
      )}
    </div>
  );

  const renderEstimationTab = () => (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-emerald-600 to-emerald-400">
        <div className="flex items-center gap-3">
          <ClipboardList className="text-white" size={28} />
          <span className="text-lg font-bold text-white">Estimation Data</span>
        </div>
      </div>
      <div className="px-6 py-6 space-y-4">
        {estimation ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500">Estimation ID</p>
                <p className="text-sm font-medium text-slate-800">
                  {estimation.id}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500">Approved</p>
                <p className="text-sm font-medium text-slate-800 capitalize">
                  {estimation.approved ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-slate-500 text-sm">
            No estimation data available for this project.
          </p>
        )}
      </div>
    </div>
  );

  const renderFilesTab = () => (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-indigo-600 to-indigo-400">
        <div className="flex items-center gap-3">
          <Clock className="text-white" size={28} />
          <span className="text-lg font-bold text-white">Delivery Files</span>
        </div>
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
          <span className="text-slate-400">No delivery files available.</span>
        )}
      </div>
    </div>
  );

  const renderActiveTab = () => {
    switch (activeTab) {
      case "project":
        return renderProjectTab();
      case "deliverables":
        return renderDeliverablesTab();
      case "estimation":
        return renderEstimationTab();
      case "files":
        return renderFilesTab();
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="w-full flex flex-col items-center pt-8 pb-4 px-2 md:px-8">
        <h1 className="text-xl font-bold text-slate-800">
          Admin Project Control
        </h1>
      </div>

      <div className="flex-1 bg-white flex justify-center items-start px-0 md:px-8 overflow-y-auto">
        <div className="w-full bg-white rounded-2xl p-2 md:p-8 border mt-2 space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
              <li className="me-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("project")}
                  className={`inline-flex items-center gap-1 p-3 border-b-2 rounded-t-lg ${
                    activeTab === "project"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <FileText size={16} />
                  Project Data
                </button>
              </li>
              <li className="me-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("deliverables")}
                  className={`inline-flex items-center gap-1 p-3 border-b-2 rounded-t-lg ${
                    activeTab === "deliverables"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <ClipboardList size={16} />
                  Deliverables
                </button>
              </li>
              <li className="me-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("estimation")}
                  className={`inline-flex items-center gap-1 p-3 border-b-2 rounded-t-lg ${
                    activeTab === "estimation"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <ClipboardList size={16} />
                  Estimation
                </button>
              </li>
              <li className="me-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("files")}
                  className={`inline-flex items-center gap-1 p-3 border-b-2 rounded-t-lg ${
                    activeTab === "files"
                      ? "text-blue-600 border-blue-600"
                      : "text-gray-500 border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Clock size={16} />
                  Delivery Files
                </button>
              </li>
            </ul>
          </div>

          {/* Active tab content */}
          {renderActiveTab()}
        </div>
      </div>

      {/* Correction dialog */}
      <Dialog
        open={showCorrectionDialog}
        onOpenChange={setShowCorrectionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Correction Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              className="w-full border rounded p-2 text-sm"
              rows={4}
              value={correctionText}
              onChange={(e) => setCorrectionText(e.target.value)}
              placeholder="Enter correction details"
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCorrectionDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCorrectionRequest} disabled={isApproved}>
                Submit
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectControlAdmin;
