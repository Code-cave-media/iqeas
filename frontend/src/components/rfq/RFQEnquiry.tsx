/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT, API_URL } from "@/config/backend";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Pencil, Check, X } from "lucide-react";

import SendToEstimationModal from "./SendToEstimationModal";

const InfoItem = ({ label, value }: { label: string; value: any }) => (
  <div className="space-y-1">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-sm font-medium break-words">{value || "-"}</p>
  </div>
);

const EditableInfoItem = ({
  label,
  value,
  onSave,
}: {
  label: string;
  value: any;
  onSave: (newValue: any) => void;
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = () => {
    onSave(editValue);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(value);
    setIsEditing(false);
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{label}</p>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        ) : (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={handleSave}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
      {isEditing ? (
        <Input
          value={editValue || ""}
          onChange={(e) => setEditValue(e.target.value)}
          className="text-sm"
        />
      ) : (
        <p className="text-sm font-medium break-words">{value || "-"}</p>
      )}
    </div>
  );
};

export default function RFQEnquiry() {
  const { project_id } = useParams();
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasDeliverables, setHasDeliverables] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [sendingToPM, setSendingToPM] = useState(false);
  const [hasPurchaseOrder, setHasPurchaseOrder] = useState(false);

  const [coordinators, setCoordinators] = useState<any[]>([]);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<
    number | null
  >(null);

  // Debug selectedCoordinatorId
  useEffect(() => {
    console.log("selectedCoordinatorId (effect):", selectedCoordinatorId);
  }, [selectedCoordinatorId]);

  // Fetch project details, deliverables and PO
  useEffect(() => {
    if (!project_id) return;

    const fetchProjectAndMeta = async () => {
      setLoading(true);

      const res = await makeApiCall(
        "get",
        API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
        {},
        "application/json",
        authToken,
        "getProjectById"
      );

      if (res.status === 200) {
        const projectData = res.data;
        setProject(projectData);

        const delRes = await makeApiCall(
          "get",
          API_ENDPOINT.UPDATES_GET_RFQ_DELIVERABLES(project_id),
          {},
          "application/json",
          authToken,
          "getRFQDeliverables"
        );
        const rows =
          delRes?.data?.deliverables ||
          delRes?.data?.data ||
          delRes?.data ||
          [];

        console.log("DEBUG: fetch RFQ deliverables response:", delRes);
        console.log("DEBUG: parsed rows:", rows);
        console.log("DEBUG: hasDeliverables check:", Array.isArray(rows) && rows.length > 0);

        setHasDeliverables(Array.isArray(rows) && rows.length > 0);

        const poRes = await makeApiCall(
          "get",
          API_ENDPOINT.GET_PURCHASE_ORDER(project_id),
          {},
          "application/json",
          authToken,
          "getPurchaseOrder"
        );

        const poRows = Array.isArray(poRes?.data) ? poRes.data : [];
        setHasPurchaseOrder(poRows.length > 0);
      } else {
        toast.error("Failed to fetch project");
      }

      setLoading(false);
    };

    fetchProjectAndMeta();
  }, [project_id, authToken, makeApiCall]);

  // Fetch coordinators once (you already confirmed this returns id 32, Aromal S)
  useEffect(() => {
    const fetchCoordinators = async () => {
      try {
        const res = await makeApiCall(
          "get",
          `${API_URL}/updates/coordinators`,
          {},
          "application/json",
          authToken,
          "getCoordinators"
        );

        if (res.status === 200) {
          setCoordinators(res.data || []);
        } else {
          toast.error("Failed to fetch project coordinators");
        }
      } catch (err) {
        console.error("Error fetching coordinators", err);
        toast.error("Failed to fetch project coordinators");
      }
    };

    if (authToken) {
      fetchCoordinators();
    }
  }, [authToken, makeApiCall]);

  const handleSaveField = async (field: string, newValue: any) => {
    if (!project_id) return;

    const res = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(project_id),
      { [field]: newValue },
      "application/json",
      authToken,
      "editProject"
    );

    if (res.status === 200) {
      setProject((prev: any) => ({ ...prev, [field]: newValue }));
      toast.success(`${field} updated`);
    } else {
      toast.error("Update failed");
    }
  };

  const handleSendToProjectCoordinator = async () => {
    if (!project_id || !selectedCoordinatorId) {
      toast.error("Missing coordinator");
      return;
    }

    const payload = {
      send_to_coordinator: true,
      coordinator_id: selectedCoordinatorId,
    };

    console.log("PATCH payload:", payload);

    setSendingToPM(true);
    const res = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(project_id),
      payload,
      "application/json",
      authToken,
      "sendToPM"
    );
    setSendingToPM(false);

    console.log("sendToPM response:", res);

    if (res.status === 200) {
      toast.success("Sent to Project Coordinator");
      setProject((prev: any) => ({
        ...prev,
        send_to_coordinator: true,
        coordinator_id: selectedCoordinatorId,
      }));
    } else {
      toast.error(res.detail || "Failed to send to Project Coordinator");
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading project details...
      </div>
    );
  }

  if (!project) return null;

  const hasPO = hasPurchaseOrder;

  const showSendToPMBanner =
    hasPO &&
    project.estimation.approved == true &&
    project.send_to_coordinator === false;

  console.log("hasPO", hasPO);
  console.log("estimation", project.estimation);
  console.log("sent_to_pm", project.estimation?.sent_to_pm);
  console.log("showSendToPMBanner", showSendToPMBanner);

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {showSendToPMBanner && (
        <Alert className="border-purple-200 bg-purple-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <AlertTitle className="flex items-center gap-2">
                Purchase Order Received
                <Badge className="bg-purple-600 text-white">
                  Action Required
                </Badge>
              </AlertTitle>
              <AlertDescription>
                PO is uploaded and estimation is completed. Send this project to
                Project Coordinator.
              </AlertDescription>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={selectedCoordinatorId ?? ""}
                onChange={(e) => {
                  const value = e.target.value;
                  console.log("onChange raw value:", value);
                  setSelectedCoordinatorId(Number(value));
                }}
                className="border rounded px-2 py-1"
              >
                <option value="">Select Coordinator</option>
                {coordinators.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => {
                  console.log(
                    "Send button clicked with id:",
                    selectedCoordinatorId
                  );
                  handleSendToProjectCoordinator();
                }}
                disabled={sendingToPM || selectedCoordinatorId === null}
                className="bg-purple-600 hover:bg-purple-700"
              >
                {sendingToPM ? "Sending..." : "Send to Project Coordinator"}
              </Button>
            </div>
          </div>
        </Alert>
      )}

      {project.estimation?.sent_to_pm && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="flex items-center gap-2">
            Sent to Project Manager
            <Badge className="bg-green-600 text-white">Completed</Badge>
          </AlertTitle>
          <AlertDescription>
            Estimation has been successfully forwarded to PM.
          </AlertDescription>
        </Alert>
      )}

      {hasDeliverables && !project.send_to_estimation && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <AlertTitle className="flex items-center gap-2">
                Deliverables Completed
                <Badge className="bg-green-400">Ready</Badge>
              </AlertTitle>
              <AlertDescription>
                RFQ deliverables are completed. Send the project to estimation.
              </AlertDescription>
            </div>
            <Button onClick={() => setOpenModal(true)}>
              Send to Estimation
            </Button>
          </div>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2">
            Project Details
            {project.estimation?.approved ? (
              <span className="text-xs text-teal-700 border border-teal-600 px-2 py-1 bg-green-300 rounded-full">
                Approved
              </span>
            ) : (
              <span className="text-xs text-amber-700 border border-amber-600 px-2 py-1 bg-amber-300 rounded-full">
                Pending
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <EditableInfoItem
              label="Project Name"
              value={project.name}
              onSave={(v) => handleSaveField("name", v)}
            />
            <InfoItem label="Project ID" value={project.project_id} />
            <EditableInfoItem
              label="Client Name"
              value={project.client_name}
              onSave={(v) => handleSaveField("client_name", v)}
            />
            <EditableInfoItem
              label="Client Company"
              value={project.client_company}
              onSave={(v) => handleSaveField("client_company", v)}
            />
            <EditableInfoItem
              label="Location"
              value={project.location}
              onSave={(v) => handleSaveField("location", v)}
            />
            <EditableInfoItem
              label="Project Type"
              value={project.project_type}
              onSave={(v) => handleSaveField("project_type", v)}
            />
            <EditableInfoItem
              label="Priority"
              value={project.priority}
              onSave={(v) => handleSaveField("priority", v)}
            />
            <InfoItem label="Status" value={project.status} />
            <InfoItem label="Progress" value={`${project.progress}%`} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact & Meta Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoItem label="Contact Person" value={project.contact_person} />
          <InfoItem label="Phone" value={project.contact_person_phone} />
          <InfoItem label="Email" value={project.contact_person_email} />
          <InfoItem label="Location" value={project.location} />
          <InfoItem
            label="Received Date"
            value={
              project.received_date
                ? new Date(project.received_date).toLocaleDateString()
                : "-"
            }
          />
          <InfoItem label="Notes" value={project.notes} />
        </CardContent>
      </Card>

      <SendToEstimationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        projectId={Number(project_id)}
        onSuccess={() =>
          setProject((p: any) => ({ ...p, send_to_estimation: true }))
        }
      />
    </section>
  );
}
