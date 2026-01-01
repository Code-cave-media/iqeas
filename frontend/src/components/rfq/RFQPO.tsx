/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { UploadCloud, X, Edit2, Lock } from "lucide-react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT, API_URL } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";

interface FileWithLabel {
  file: File;
  label: string;
}

interface ProjectEstimation {
  approved?: boolean;
  sent_to_pm?: boolean;
}

interface ProjectData {
  id: number;
  name: string;
  send_to_coordinator?: boolean;
  coordinator_id?: number | null;
  estimation?: ProjectEstimation;
  // extend as needed
}

interface PurchaseOrderFile {
  id: number;
  label: string;
  file: string;
}

interface PurchaseOrder {
  id: number;
  po_number: string;
  notes?: string;
  terms_and_conditions?: string;
  uploaded_files?: PurchaseOrderFile[];
}

interface Coordinator {
  id: number;
  name: string;
}

export default function RFQPO() {
  const { project_id } = useParams<{ project_id: string }>();
  const inputRef = useRef<HTMLInputElement | null>(null);

  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  const [filesWithLabel, setFilesWithLabel] = useState<FileWithLabel[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [poData, setPoData] = useState<PurchaseOrder | null>(null);
  const [projectData, setProjectData] = useState<ProjectData | null>(null);

  const [loadingPo, setLoadingPo] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  const [editField, setEditField] = useState<string | null>(null);
  const [showFileDrop, setShowFileDrop] = useState(false);

  const [poFields, setPoFields] = useState<{
    po_number: string;
    notes: string;
    terms_and_conditions: string;
  }>({
    po_number: "",
    notes: "",
    terms_and_conditions: "",
  });

  const [canEdit, setCanEdit] = useState(false);
  const [showSendToCoordinatorBanner, setShowSendToCoordinatorBanner] =
    useState(false);

  const [coordinators, setCoordinators] = useState<Coordinator[]>([]);
  const [selectedCoordinatorId, setSelectedCoordinatorId] = useState<
    number | null
  >(null);
  const [sendingToCoordinator, setSendingToCoordinator] = useState(false);

  /* ---------------- FETCH PROJECT ---------------- */
  const fetchProject = async () => {
    if (!project_id) return;
    try {
      setLoadingProject(true);
      const res = await makeApiCall<ProjectData>(
        "get",
        API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
        {},
        "application/json",
        authToken,
        "getProject"
      );

      if (res.status === 200 && res.data) {
        const project = res.data;
        setProjectData(project);
        const editable =
          project.send_to_coordinator === false ||
          project.send_to_coordinator === undefined ||
          project.send_to_coordinator === null;
        setCanEdit(editable);

        const hasPO = !!poData;
        const estimationApproved = project.estimation?.approved === true;
        setShowSendToCoordinatorBanner(
          hasPO && estimationApproved && project.send_to_coordinator === false
        );
      } else {
        setProjectData(null);
        setCanEdit(false);
        setShowSendToCoordinatorBanner(false);
      }
    } catch {
      setProjectData(null);
      setCanEdit(false);
      setShowSendToCoordinatorBanner(false);
    } finally {
      setLoadingProject(false);
    }
  };

  /* ---------------- FETCH PO ---------------- */
  const fetchPurchaseOrder = async () => {
    if (!project_id) return;
    try {
      setLoadingPo(true);
      const res = await makeApiCall<PurchaseOrder[]>(
        "get",
        API_ENDPOINT.GET_PURCHASE_ORDER(project_id),
        {},
        "application/json",
        authToken,
        "getPurchaseOrder"
      );

      if (res.status === 200 && Array.isArray(res.data)) {
        const first = res.data[0] ?? null;
        setPoData(first);

        if (first) {
          setPoFields({
            po_number: first.po_number || "",
            notes: first.notes || "",
            terms_and_conditions: first.terms_and_conditions || "",
          });
        }
      } else {
        setPoData(null);
      }
    } catch {
      setPoData(null);
    } finally {
      setLoadingPo(false);
    }
  };

  /* ---------------- FETCH COORDINATORS ---------------- */
  const fetchCoordinators = async () => {
    if (!authToken) return;
    try {
      const res = await makeApiCall<Coordinator[]>(
        "get",
        `${API_URL}/updates/coordinators`,
        {},
        "application/json",
        authToken,
        "getCoordinators"
      );

      if (res.status === 200 && Array.isArray(res.data)) {
        setCoordinators(res.data);
      } else {
        toast.error("Failed to fetch project coordinators");
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error fetching coordinators", err);
      toast.error("Failed to fetch project coordinators");
    }
  };

  useEffect(() => {
    if (!project_id) return;
    fetchProject();
    fetchPurchaseOrder();
    fetchCoordinators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project_id, authToken]);

  // Recompute banner + canEdit when project/PO changes
  useEffect(() => {
    if (projectData) {
      const hasPO = !!poData;
      const estimationApproved = projectData.estimation?.approved === true;
      setShowSendToCoordinatorBanner(
        hasPO && estimationApproved && projectData.send_to_coordinator === false
      );
      const editable =
        projectData.send_to_coordinator === false ||
        projectData.send_to_coordinator === undefined ||
        projectData.send_to_coordinator === null;
      setCanEdit(editable);
    }
  }, [projectData, poData]);

  /* ---------------- FILE HANDLERS ---------------- */
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || !canEdit) return;
    const mapped = Array.from(newFiles).map((file) => ({
      file,
      label: file.name,
    }));
    setFilesWithLabel(mapped);
    setShowFileDrop(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!canEdit) return;
    e.preventDefault();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    if (!canEdit) return;
    setFilesWithLabel((prev) => prev.filter((_, i) => i !== index));
  };

  const updateLabel = (index: number, value: string) => {
    if (!canEdit) return;
    setFilesWithLabel((prev) =>
      prev.map((item, i) => (i === index ? { ...item, label: value } : item))
    );
  };

  /* ---------------- UPLOAD FILE ---------------- */
  const uploadFiles = async (): Promise<number[] | null> => {
    const uploadedIds: number[] = [];
    for (const { file, label } of filesWithLabel) {
      if (!label.trim()) {
        toast.error(`Label required for ${file.name}`);
        return null;
      }

      const formData = new FormData();
      formData.append("label", label);
      formData.append("file", file);

      try {
        const res = await makeApiCall<{ id: number }>(
          "post",
          API_ENDPOINT.UPLOAD_FILE,
          formData,
          "application/form-data",
          authToken,
          "uploadFile"
        );

        if (res.status === 200 || res.status === 201) {
          if (res.data?.id) uploadedIds.push(res.data.id);
          toast.success(`Uploaded ${file.name}`);
        } else {
          toast.error(`Failed to upload ${file.name}`);
          return null;
        }
      } catch {
        toast.error(`Upload error: ${file.name}`);
        return null;
      }
    }
    return uploadedIds;
  };

  /* ---------------- SUBMIT PO (CREATE / UPDATE) ---------------- */
  const submitPO = async () => {
    if (!project_id) {
      toast.error("Project ID missing");
      return;
    }

    if (!canEdit) {
      toast.error("Cannot edit - sent to coordinator");
      return;
    }

    if (filesWithLabel.length === 0 && !poData) {
      toast.error("Upload at least one file");
      return;
    }

    setSubmitting(true);

    let uploadedIds: number[] | null = null;
    if (filesWithLabel.length > 0) {
      uploadedIds = await uploadFiles();
      if (!uploadedIds) {
        setSubmitting(false);
        return;
      }
    }

    const payload: any = {
      po_number: poFields.po_number,
      notes: poFields.notes,
      terms_and_conditions: poFields.terms_and_conditions,
    };

    if (uploadedIds && uploadedIds.length > 0) {
      payload.uploaded_file_id = uploadedIds[0];
    }

    try {
      let res;
      if (!poData) {
        // adjust if your backend uses different create endpoint
        res = await makeApiCall(
          "post",
          API_ENDPOINT.CREATE_PURCHASE_ORDER(project_id),
          payload,
          "application/json",
          authToken,
          "createPO"
        );
      } else {
        res = await makeApiCall(
          "patch",
          API_ENDPOINT.UPDATE_PO_DATA(poData.id),
          payload,
          "application/json",
          authToken,
          "updatePO"
        );
      }

      // eslint-disable-next-line no-console
      console.log("submitPO response:", res);

      const isSuccess =
        (res.status === 200 || res.status === 201) &&
        (res.data as any)?.success !== false;

      if (isSuccess) {
        toast.success((res.data as any)?.message || "PO updated successfully");
        setFilesWithLabel([]);
        setEditField(null);
        setShowFileDrop(false);
        await fetchPurchaseOrder();
      } else {
        // eslint-disable-next-line no-console
        console.error("API error details:", res);
        toast.error((res as any).detail || "Failed to submit PO");
      }
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Submit error:", err);
      toast.error(err?.message || "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- SEND TO PROJECT COORDINATOR ---------------- */
  const handleSendToProjectCoordinator = async () => {
    if (!project_id || !selectedCoordinatorId) {
      toast.error("Select a coordinator first");
      return;
    }

    const payload = {
      send_to_coordinator: true,
      coordinator_id: selectedCoordinatorId,
    };

    // eslint-disable-next-line no-console
    console.log("PATCH send_to_coordinator payload:", payload);

    try {
      setSendingToCoordinator(true);
      const res = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_PROJECT(project_id),
        payload,
        "application/json",
        authToken,
        "sendToCoordinator"
      );
      setSendingToCoordinator(false);

      // eslint-disable-next-line no-console
      console.log("sendToCoordinator response:", res);

      if (res.status === 200) {
        toast.success("Sent to Project Coordinator");
        setProjectData((prev) =>
          prev
            ? {
                ...prev,
                send_to_coordinator: true,
                coordinator_id: selectedCoordinatorId,
              }
            : prev
        );
      } else {
        toast.error(
          (res as any).detail || "Failed to send to Project Coordinator"
        );
      }
    } catch (err: any) {
      setSendingToCoordinator(false);
      // eslint-disable-next-line no-console
      console.error("Error sending to coordinator", err);
      toast.error(err?.message || "Failed to send to Project Coordinator");
    }
  };

  const isLoading = loadingPo || loadingProject;

  /* ---------------- UI ---------------- */
  return (
    <section className="w-full">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
        {/* Banner: PO ready, action required (same logic as RFQEnquiry) */}
        {showSendToCoordinatorBanner && (
          <Alert className="border-purple-200 bg-purple-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <AlertTitle className="flex items-center gap-2">
                  Purchase Order Ready
                  <Badge className="bg-purple-600 text-white">
                    Action Required
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  PO is uploaded and estimation is approved. Send this project
                  to Project Coordinator.
                </AlertDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={selectedCoordinatorId ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSelectedCoordinatorId(value ? Number(value) : null);
                  }}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="">Select Coordinator</option>
                  {coordinators.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <Button
                  onClick={handleSendToProjectCoordinator}
                  disabled={
                    sendingToCoordinator || selectedCoordinatorId === null
                  }
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  {sendingToCoordinator
                    ? "Sending..."
                    : "Send to Project Coordinator"}
                </Button>
              </div>
            </div>
          </Alert>
        )}

        {/* Banner: Already sent to coordinator */}
        {projectData?.send_to_coordinator && (
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle className="flex items-center gap-2">
              Sent to Project Coordinator
              <Badge className="bg-green-600 text-white">Completed</Badge>
            </AlertTitle>
            <AlertDescription>
              Project has been forwarded to Project Coordinator. PO is now
              read-only.
            </AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : poData ? (
          /* ---------------- Existing PO ---------------- */
          <div className="rounded-xl border bg-white p-6 shadow-sm space-y-4 text-sm">
            {/* Edit status header */}
            <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {canEdit ? (
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    Editable
                  </Badge>
                ) : (
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-gray-400" />
                    <span className="text-xs font-medium text-gray-700">
                      Sent to Coordinator – Read only
                    </span>
                  </div>
                )}
              </div>
              {projectData && (
                <Badge
                  className={
                    projectData.send_to_coordinator
                      ? "bg-green-600 text-white"
                      : "bg-orange-500 text-white"
                  }
                >
                  {projectData.send_to_coordinator ? "Sent" : "Pending"}
                </Badge>
              )}
            </div>

            {/* PO Number */}
            <div className="flex items-center justify-between">
              {editField === "po_number" && canEdit ? (
                <Input
                  value={poFields.po_number}
                  onChange={(e) =>
                    setPoFields({ ...poFields, po_number: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p>
                  <span className="text-gray-500">PO Number</span>
                  <br />
                  <span className="font-medium">{poData.po_number}</span>
                </p>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setEditField(editField === "po_number" ? null : "po_number")
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Notes */}
            <div className="flex items-center justify-between">
              {editField === "notes" && canEdit ? (
                <Textarea
                  value={poFields.notes}
                  onChange={(e) =>
                    setPoFields({ ...poFields, notes: e.target.value })
                  }
                  className="w-full"
                />
              ) : (
                <p>
                  <span className="text-gray-500">Notes</span>
                  <br />
                  <span className="font-medium">{poData.notes || "-"}</span>
                </p>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setEditField(editField === "notes" ? null : "notes")
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Terms & Conditions */}
            <div className="flex items-center justify-between">
              {editField === "terms_and_conditions" && canEdit ? (
                <Textarea
                  value={poFields.terms_and_conditions}
                  onChange={(e) =>
                    setPoFields({
                      ...poFields,
                      terms_and_conditions: e.target.value,
                    })
                  }
                  className="w-full"
                />
              ) : (
                <p>
                  <span className="text-gray-500">Terms & Conditions</span>
                  <br />
                  <span className="font-medium">
                    {poData.terms_and_conditions || "-"}
                  </span>
                </p>
              )}
              {canEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    setEditField(
                      editField === "terms_and_conditions"
                        ? null
                        : "terms_and_conditions"
                    )
                  }
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Current Files */}
            {Array.isArray(poData.uploaded_files) &&
              poData.uploaded_files.length > 0 && (
                <div>
                  <p className="text-gray-500 mb-2">Current File</p>
                  <ul>
                    {poData.uploaded_files.map((f) => (
                      <li
                        key={f.id}
                        className="flex justify-between items-center bg-gray-50 p-2 rounded"
                      >
                        <span>{f.label}</span>
                        <a
                          href={f.file}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 text-sm font-medium"
                        >
                          View
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            {/* Change File */}
            {canEdit && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowFileDrop(!showFileDrop)}
                >
                  Change File
                </Button>

                {showFileDrop && (
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragActive(true);
                    }}
                    onDragLeave={() => setDragActive(false)}
                    onDrop={handleDrop}
                    onClick={() => inputRef.current?.click()}
                    className={`cursor-pointer rounded-2xl border-2 border-dashed transition mt-2
                    ${
                      dragActive
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                      <div className="mb-4 rounded-full bg-blue-100 p-4">
                        <UploadCloud className="h-10 w-10 text-blue-600" />
                      </div>

                      <p className="text-sm text-gray-600">
                        Drag & drop a file or{" "}
                        <span className="font-medium text-blue-600">
                          browse
                        </span>
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        PDF, DOC, XLS, PNG, JPG
                      </p>

                      <input
                        ref={inputRef}
                        type="file"
                        multiple
                        hidden
                        onChange={(e) => handleFiles(e.target.files)}
                      />
                    </div>

                    {filesWithLabel.length > 0 && (
                      <div className="space-y-2 p-2">
                        {filesWithLabel.map(({ label }, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between rounded-lg border p-2"
                          >
                            <Input
                              value={label}
                              onChange={(e) =>
                                updateLabel(index, e.target.value)
                              }
                              className="flex-1 mr-2"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Save Button */}
            {canEdit && (
              <div className="flex justify-end mt-4">
                <Button onClick={submitPO} disabled={submitting}>
                  {submitting ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        ) : (
          /* ---------------- No PO: create ---------------- */
          <div className="space-y-4">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {canEdit ? (
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Can create PO
                </span>
              ) : (
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-500">
                    Cannot create PO – sent to coordinator
                  </span>
                </div>
              )}
            </div>

            {canEdit ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActive(true);
                }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`cursor-pointer rounded-2xl border-2 border-dashed transition py-12 px-6 text-center ${
                  dragActive
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-blue-400 hover:bg-gray-50"
                }`}
              >
                <div className="mb-4 rounded-full bg-blue-100 p-4 inline-block">
                  <UploadCloud className="h-10 w-10 text-blue-600" />
                </div>

                <p className="text-sm text-gray-600">
                  Drag & drop a file or{" "}
                  <span className="font-medium text-blue-600">browse</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  PDF, DOC, XLS, PNG, JPG
                </p>

                <input
                  ref={inputRef}
                  type="file"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {filesWithLabel.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {filesWithLabel.map(({ label }, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-lg border p-2"
                      >
                        <Input
                          value={label}
                          onChange={(e) => updateLabel(index, e.target.value)}
                          className="flex-1 mr-2"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeFile(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={submitPO}
                    disabled={submitting || filesWithLabel.length === 0}
                  >
                    {submitting ? "Uploading..." : "Upload PO"}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50">
                <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-lg font-medium text-gray-900 mb-2">
                  No Purchase Order
                </p>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Project has been sent to coordinator. PO can no longer be
                  created or edited from this screen.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
