import { useEffect, useState } from "react";
import {
  Calculator,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  FileText,
  AlertCircle,
  User as UserIcon,
  Phone as PhoneIcon,
  Mail as MailIcon,
  X,
  StickyNote,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  addDays,
  addMonths,
  addYears,
  format,
  parseISO,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  intervalToDuration,
} from "date-fns";
import { useConfirmDialog } from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Loading from "./atomic/Loading";
import type { IUser, ITeam, IEstimationProject } from "@/types/apiTypes";
import { formatRevenue, toReadableText } from "@/utils/utils";
import ShowFile from "./ShowFile";
import { validateRequiredFields } from "@/utils/validation";
import { Item } from "@radix-ui/react-select";

export const EstimationDashboard = () => {
  // State for the Ready for Execution toggle in the Approved form
  const [projects, setProjects] = useState<IEstimationProject[]>([]);
  const [cards, setCards] = useState({
    active_estimation: 0,
    pending_estimations: 0,
    completed_estimations: 0,
    total_value: 0,
  });
  const [selectedProject, setSelectedProject] = useState(null);
  const [rfcDetailsProject, setRfcDetailsProject] = useState(null);
  const [showReadyPrompt, setShowReadyPrompt] = useState(false);
  const [estimationFiles, setEstimationFiles] = useState([]);
  const [editDeletedFileIds, setDeleteSelectedIds] = useState([]);
  const [rejectModal, setRejectModal] = useState({
    open: false,
    project: null,
    files: [],
    notes: "",
  });
  const [viewEstimationProject, setViewEstimationProject] = useState(null);
  const [users, setUsers] = useState<IUser[]>([]);
  const [approvedForm, setApprovedForm] = useState({
    forward_type: "user",
    forward_id: "",
    uploadedFiles: [], // [{ file, label }]
    clientClarificationLog: "", // single string
    cost: "",
    costBreakdownFile: null,
    estimationFile: null,
    deadline: "",
    approvalDate: "",
    ready_for_estimation: false,
    notes: "",
    sentToPM: false,
  });

  const resetApprovedForm = () => {
    setApprovedForm({
      forward_type: "user",
      forward_id: "",
      uploadedFiles: [], // [{ file, label }]
      clientClarificationLog: "", // single string
      cost: "",
      costBreakdownFile: null,
      estimationFile: null,
      deadline: "",
      approvalDate: "",
      ready_for_estimation: false,
      notes: "",
      sentToPM: false,
    });
    setEstimationFiles([]);
  };

  // Add local state to track workflow step for each project
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const { authToken } = useAuth();
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  // Add state for estimation modal mode and editing
  const [editEstimationData, setEditEstimationData] = useState(null);

  useEffect(() => {
    const getProjects = async () => {
      // Add page and pageSize to API call if supported
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ALL_ESTIMATION_PROJECTS(searchTerm, page, 20),
        {},
        "application/json",
        authToken,
        "getProjects"
      );
      if (response.status == 200) {
        setProjects(response.data.projects);
        setTotalPages(response.data.total_pages);
        setCards(response.data.cards);
      } else {
        toast.error("Failed to fetch projects");
      }
    };
    getProjects();
  }, [searchTerm, page]);
  // Helper to advance workflow step for a project
  const getUsers = async () => {
    const response = await makeApiCall(
      "get",
      API_ENDPOINT.GET_USERS_BY_ROLE("pm"),
      {},
      "application/json",
      authToken,
      "getUsersAndTeams"
    );
    if (response.status === 200) {
      setUsers(response.data || []);
    }
  };
  const handleStatusTransition = async (project, nextStatus) => {
    if (nextStatus === "Rejected") {
      if (users.length == 0) {
        getUsers();
      }
      openRejectModal(project);
    } else if (nextStatus === "Approved") {
      resetApprovedForm();
      if (users.length == 0) {
        getUsers();
      }
      setSelectedProject(project);
    } else {
      await changeProjectStatus(project, nextStatus);
    }
  };
  // Handlers for project modal fields
  const handleFieldChange = (field, value) => {
    setSelectedProject((p) => ({ ...p, [field]: value }));
    setApprovedForm((f) => ({ ...f, [field]: value }));
  };

  const handleFileChange = (field, e) => {
    setApprovedForm((f) => ({ ...f, [field]: e.target.files[0] }));
  };

  const SubmitEstimation = async () => {
    // Validation
    const requiredFields = ["cost", "deadline", "approvalDate", "forward_id"];
    const missing = validateRequiredFields(approvedForm, requiredFields);
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing[0]}`);
      return;
    }
    if (!approvedForm.costBreakdownFile || !approvedForm.estimationFile) {
      toast.error(`Please Select Cost Break Down and Estimation`);
      return;
    }
    const uploadedFiles = [
      ...approvedForm.uploadedFiles,
      {
        label: "Cost Breakdown",
        file: approvedForm.costBreakdownFile,
      },
      {
        label: "Estimation",
        file: approvedForm.estimationFile,
      },
    ];
    const uploadedFileIds = [];

    for (const uf of uploadedFiles) {
      if (uf.file) {
        const uploaded = await uploadFile(uf.file, uf.label);
        if (uploaded && uploaded.id) {
          uploadedFileIds.push(uploaded.id);
        } else {
          toast.error("Failed to upload files");
          return;
        }
      }
    }
    const data = {
      project_id: selectedProject.id,
      status: "created",
      log: approvedForm.clientClarificationLog,
      cost: approvedForm.cost,
      deadline: approvedForm.deadline,
      approval_date: approvedForm.approvalDate,
      approved: false,
      sent_to_pm: false,
      forwarded_user_id: approvedForm.forward_id,
      notes: approvedForm.notes,
      uploaded_file_ids: uploadedFileIds,
    };
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.CREATE_ESTIMATION,
      data,
      "application/json",
      authToken,
      "createEstimation"
    );
    if ([201, 200].includes(response.status)) {
      toast.success(response.detail);
      setProjects((prev) =>
        prev.map((item) => {
          if (item.id == selectedProject.id) {
            return {
              ...selectedProject,
              ...response.data.project,
              estimation: response.data.estimation,
            };
          }
          return item;
        })
      );
      setCards({
        ...cards,
        total_value: cards.total_value + response.data.estimation.cost,
        completed_estimations:
          cards.completed_estimations +
          (response.data.estimation.sent_to_pm ? 1 : 0),
        pending_estimations:
          cards.completed_estimations +
          (response.data.estimation.sent_to_pm ? -1 : 0),
      });
      setSelectedProject(null);
    } else {
      toast.error("Failed to save estimation");
    }
  };

  const handleEditEstimation = async () => {
    console.log("enter");
    const requiredFields = ["cost", "deadline", "approvalDate", "forward_id"];
    const missing = validateRequiredFields(approvedForm, requiredFields);
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing[0]}`);
      return;
    }
    const existUploadedFiles = selectedProject.estimation.uploaded_files;
    const deletedFiles = existUploadedFiles.filter(
      (item) => estimationFiles.find((file) => file.id == item.id) == undefined
    );
    if (
      deletedFiles.find((item) => item.label == "Cost Breakdown") &&
      approvedForm.costBreakdownFile == null
    ) {
      toast.error("Please select cost break down file");
      return;
    }
    if (
      deletedFiles.find((item) => item.label == "Estimation") &&
      approvedForm.estimationFile == null
    ) {
      toast.error("Please select Estimation file");
      return;
    }

    const uploadedFiles = [
      ...approvedForm.uploadedFiles.filter((item) => !item.id),
      ...(approvedForm.estimationFile
        ? [{ label: "Estimation", file: approvedForm.estimationFile }]
        : []),
      ...(approvedForm.costBreakdownFile
        ? [{ label: "Cost Breakdown", file: approvedForm.costBreakdownFile }]
        : []),
    ];

    // check if already a cost break down chosen  then delete old one
    if (approvedForm.estimationFile) {
      deletedFiles.push(
        existUploadedFiles.find((item) => item.label == "Estimation")
      );
    }
    if (approvedForm.costBreakdownFile) {
      deletedFiles.push(
        existUploadedFiles.find((item) => item.label == "Cost Breakdown")
      );
    }

    for (const file of deletedFiles) {
      const data = await deleteFile(file.id);
    }
    const uploadedFileIds = [];
    for (const uf of uploadedFiles) {
      if (uf.file) {
        const uploaded = await uploadFile(uf.file, uf.label);
        if (uploaded && uploaded.id) {
          uploadedFileIds.push(uploaded.id);
        } else {
          toast.error("Failed to upload files");
          return;
        }
      }
    }
    const data = {
      project_id: selectedProject.id,
      status: "edited",
      log: approvedForm.clientClarificationLog,
      cost: approvedForm.cost,
      deadline: approvedForm.deadline,
      approval_date: approvedForm.approvalDate,
      approved: false,
      sent_to_pm: false,
      forwarded_user_id: approvedForm.forward_id,
      notes: approvedForm.notes,
      uploaded_file_ids: uploadedFileIds,
    };
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_ESTIMATION(editEstimationData.id),
      data,
      "application/json",
      authToken,
      "editEstimation"
    );
    if (response.status == 200) {
      setProjects((prev) =>
        prev.map((item) => {
          if (item.id == selectedProject.id) {
            return {
              ...selectedProject,
              estimation: response.data,
              estimation_status: "edited",
              progress: 75,
            };
          }
          return item;
        })
      );
      resetEditEstimation();
      toast.success(response.detail);
    } else {
      toast.error("Failed to update estimation");
    }
  };
  const resetEditEstimation = () => {
    setSelectedProject(null);
    setEstimationFiles([]);
    setEditEstimationData(null);
    setDeleteSelectedIds([]);
    resetApprovedForm();
  };
  const deleteFile = async (file_id) => {
    const data = new FormData();

    const response = await makeApiCall(
      "delete",
      API_ENDPOINT.DELETE_FILE(file_id),
      data,
      "application/json",
      authToken,
      "deleteFile"
    );
    if (response.status == 200) {
      return true;
    } else {
      return null;
    }
  };
  const uploadFile = async (file: File, label: string) => {
    const data = new FormData();
    data.append("label", label);

    data.append("file", file);
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.UPLOAD_FILE,
      data,
      "application/form-data",
      authToken,
      "uploadFile"
    );
    if (response.status == 201) {
      return response.data;
    } else {
      return null;
    }
  };

  const openRejectModal = (project) => {
    setRejectModal({
      open: true,
      project,
      files: [],
      notes: "",
    });
  };
  const closeRejectModal = () => {
    setRejectModal({
      open: false,
      project: null,
      files: [{ label: "", file: null }],
      notes: "",
    });
  };
  const handleRejectFileChange = (idx, e) => {
    const file = e.target.files[0] || null;
    setRejectModal((modal) => ({
      ...modal,
      files: modal.files.map((uf, i) => (i === idx ? { ...uf, file } : uf)),
    }));
  };
  const handleRejectLabelChange = (idx, e) => {
    const label = e.target.value;
    setRejectModal((modal) => ({
      ...modal,
      files: modal.files.map((uf, i) => (i === idx ? { ...uf, label } : uf)),
    }));
  };
  const addRejectFileInput = () => {
    setRejectModal((modal) => ({
      ...modal,
      files: [...modal.files, { label: "", file: null }],
    }));
  };
  const removeRejectFileInput = (idx) => {
    setRejectModal((modal) => ({
      ...modal,
      files: modal.files.filter((_, i) => i !== idx),
    }));
  };
  const changeProjectStatus = async (project, nextStatus) => {
    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(project.id),
      {
        estimation_status: nextStatus,
      },
      "application/json",
      authToken,
      `editProjectStatus${project.id}`
    );
    if (response.status == 200) {
      toast.success(response.detail);
      setProjects((prev) =>
        prev.map((item) => {
          if (item.id == project.id) {
            return {
              ...item,
              estimation_status: response.data.estimation_status,
              progress: response.data.progress,
            };
          }
          return item;
        })
      );
    } else {
      toast.error(`Failed to mark as ${toReadableText(nextStatus)}`);
    }
  };
  const GetUserAndRunFun = async (func) => {
    if (users.length == 0) {
      await getUsers();
    }
    func();
  };
  useEffect(() => {
    setApprovedForm((f) => ({
      ...f,
      uploadedFiles: estimationFiles,
    }));
  }, [estimationFiles]);

  if (!isFetched) {
    return <Loading full />;
  }

  const handleProjectReject = async () => {
    const requiredFields = ["notes"];
    const missing = validateRequiredFields(rejectModal, requiredFields);
    if (missing.length > 0) {
      toast.error(`Please fill: ${missing[0]}`);
      return;
    }
    const uploadedFileIds = [];

    for (const uf of rejectModal.files) {
      if (uf.file) {
        const uploaded = await uploadFile(uf.file, uf.label);
        if (uploaded && uploaded.id) {
          uploadedFileIds.push(uploaded.id);
        } else {
          toast.error("Failed to upload files");
          return;
        }
      }
    }
    const data = {
      reason: rejectModal.notes,
      projectId: rejectModal.project.id,
      uploaded_files_ids: uploadedFileIds,
    };
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.CREATE_PROJECT_REJECTION,
      data,
      "application/json",
      authToken,
      "createProjectRejection"
    );
    if (response.status == 201) {
      setProjects((prev) =>
        prev.map((item) => {
          if (item.id == data.projectId) {
            return {
              ...item,
              project_rejection: response.data,
              estimation_status: "rejected",
            };
          }
          return item;
        })
      );
      closeRejectModal();
      toast.success(response.detail);
    } else {
      toast.error("Failed to reject project");
    }
  };
  const handleSentToAdmin = async (project) => {
    await changeProjectStatus(project, "sent_to_admin");
  };
  console.log(editEstimationData);
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Estimation Department
          </h1>
          <p className="text-slate-600 mt-1">
            Project cost estimation and analysis
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Calculator size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cards.active_estimation}</p>
                <p className="text-sm text-slate-600">Active Estimations</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cards.completed_estimations}
                </p>
                <p className="text-sm text-slate-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cards.pending_estimations}
                </p>
                <p className="text-sm text-slate-600">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {formatRevenue(cards.total_value)}
                </p>
                <p className="text-sm text-slate-600">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Pagination */}
      <div className=" relative flex items-center gap-2 mb-6">
        <Search
          size={18}
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
        />
        <Input
          placeholder="Search RFQs by client name or project ID..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") setSearchTerm(searchInput);
          }}
          className="pl-10"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setPage(1);
            setSearchTerm(searchInput);
          }}
          className="px-2"
          aria-label="Search"
        >
          <Search size={18} />
        </Button>
      </div>

      {/* Estimation Cards */}
      {fetching && fetchType == "getProjects" ? (
        <Loading full={false} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {project.project_id}
                    </CardTitle>
                    <p className="text-slate-600">{project.client_name}</p>
                  </div>
                  <Badge
                    variant={
                      project.estimation_status === "approved"
                        ? "default"
                        : project.estimation_status === "rejected"
                        ? "destructive"
                        : project.estimation_status === "sent_to_client"
                        ? "secondary"
                        : project.estimation_status === "under_review"
                        ? "outline"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {toReadableText(project.estimation_status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {project.estimation ? (
                    <>
                      <div>
                        <span className="text-slate-500">Estimator:</span>
                        <p className="font-medium capitalize">
                          {project.estimation.user.name || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Deadline:</span>
                        <p className="font-medium">
                          {project.estimation.deadline
                            ? new Date(
                                project.estimation.deadline
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Cost:</span>
                        <p className="font-medium">
                          {project.estimation.cost
                            ? `₹${project.estimation.cost}`
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <p className="font-medium capitalize">
                          {toReadableText(project.estimation_status)}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="text-slate-500">Created By:</span>
                        <p className="font-medium capitalize">
                          {project.user?.name || project.user_id || "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Received Date:</span>
                        <p className="font-medium">
                          {project.received_date
                            ? new Date(
                                project.received_date
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Priority:</span>
                        <p className="font-medium capitalize">
                          {toReadableText(project.priority)}
                        </p>
                      </div>
                      <div>
                        <span className="text-slate-500">Status:</span>
                        <p className="font-medium capitalize">
                          {toReadableText(project.status)}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-slate-500">Progress</span>
                    <span className="text-sm font-medium">
                      {["rejected", "approved"].includes(
                        project.estimation_status
                      )
                        ? 100
                        : project.progress}
                      %
                    </span>
                  </div>
                  <Progress
                    value={
                      ["rejected", "approved"].includes(
                        project.estimation_status
                      )
                        ? 100
                        : project.progress
                    }
                    className="h-2"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setRfcDetailsProject(project)}
                  >
                    View Details
                  </Button>
                  {project.estimation && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => setViewEstimationProject(project)}
                    >
                      View Estimation
                    </Button>
                  )}
                  {/* Status workflow buttons */}
                  {(() => {
                    // Workflow after sent_to_client
                    if (project.estimation_status === "sent_to_client") {
                      if (!project.estimation) {
                        // No estimation yet, show Create Estimation
                        return (
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                            onClick={() => {
                              GetUserAndRunFun(() => {
                                setSelectedProject(project);
                              });
                            }}
                            loading={
                              fetching && fetchType == "getUsersAndTeams"
                            }
                          >
                            Create Estimation
                          </Button>
                        );
                      }
                    }
                    // If estimation exists and status is created/edited, show Send to Admin
                    if (
                      project.estimation &&
                      ["created", "edited"].includes(project?.estimation_status)
                    ) {
                      return (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() => handleSentToAdmin(project)}
                          loading={
                            fetching &&
                            fetchType == `editProjectStatus${project.id}`
                          }
                        >
                          Send to Admin
                        </Button>
                      );
                    }
                    // If status is back_to_you, show Edit Estimation
                    if (
                      project.estimation &&
                      project.estimation_status === "back_to_you"
                    ) {
                      return (
                        <Button
                          size="sm"
                          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
                          loading={fetching && fetchType == "getUsersAndTeams"}
                          onClick={() => {
                            GetUserAndRunFun(() => {
                              setSelectedProject(project);
                              setEstimationFiles(
                                project.estimation.uploaded_files
                              );
                              setEditEstimationData(project.estimation);
                              setDeleteSelectedIds([]);
                              setApprovedForm({
                                ...approvedForm,
                                cost: `${project.estimation.cost}` || "",
                                deadline: project.estimation.deadline || "",
                                approvalDate:
                                  project.estimation.approval_date || "",
                                forward_id:
                                  project.estimation.forwarded_to?.id?.toString() ||
                                  "",
                                forward_type: "user",
                                notes: project.estimation.notes || "",
                                clientClarificationLog:
                                  project.estimation.log || "",
                                uploadedFiles: [],
                              });
                            });
                          }}
                        >
                          Edit Estimation
                        </Button>
                      );
                    }
                    // If status is sent_to_admin, only show view buttons
                    if (
                      project.estimation &&
                      project.estimation_status === "sent_to_admin"
                    ) {
                      return null;
                    }
                    // Default: show previous workflow buttons
                    if (project.estimation_status === "not_started") {
                      return (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                          onClick={() =>
                            handleStatusTransition(project, "under_review")
                          }
                          disabled={fetching}
                          loading={
                            fetching &&
                            fetchType == `editProjectStatus${project.id}`
                          }
                        >
                          Mark as Under Review
                        </Button>
                      );
                    }
                    if (project.estimation_status === "under_review") {
                      return (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            handleStatusTransition(project, "sent_to_client")
                          }
                          disabled={fetching}
                          loading={
                            fetching &&
                            fetchType == `editProjectStatus${project.id}`
                          }
                        >
                          Mark as Sent to Client
                        </Button>
                      );
                    }
                    return null;
                  })()}
                </div>
                {/* New row for Ready for Execution button if estimation.sent_to_pm is false and status is approved */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {!fetching && projects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            No estimation projects found.
          </div>
        </div>
      )}
      {/* Pagination Controls */}
      {!fetching && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <span className="px-3 py-1 text-sm font-medium">
            Page {page} of {totalPages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            Next
          </Button>
        </div>
      )}

      {/* Project Modal */}
      {selectedProject && (
        <Dialog open={!!selectedProject} onOpenChange={resetEditEstimation}>
          <DialogContent>
            <DialogHeader className="px-6 py-4">
              <h2 className="text-xl font-bold">
                Estimation Workflow for {selectedProject.name}
              </h2>
            </DialogHeader>
            <div className=" px-6 pb-4">
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                {/* Cost Estimate */}
                <div>
                  <label className="block font-medium">Cost Estimate (₹)</label>
                  <Input
                    type="text"
                    value={approvedForm.cost}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (/^\d*$/.test(val)) {
                        handleFieldChange("cost", val);
                      }
                    }}
                  />
                </div>

                {/* Cost Breakdown File */}
                <div>
                  <label className="block font-medium">
                    Cost Breakdown File (Excel/PDF)
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange("costBreakdownFile", e)}
                  />
                </div>

                {/* Estimation PDF */}
                <div>
                  <label className="block font-medium">
                    Estimation PDF Upload
                  </label>
                  <Input
                    type="file"
                    onChange={(e) => handleFileChange("estimationFile", e)}
                  />
                </div>

                {/* Deadline */}
                <div>
                  <label className="block font-medium">Deadline</label>
                  <Input
                    type="date"
                    value={approvedForm.deadline}
                    onChange={(e) =>
                      handleFieldChange("deadline", e.target.value)
                    }
                    className="w-44"
                  />
                  {selectedProject.setExpectedDeadline &&
                    selectedProject.expectedDeadline !== "" &&
                    (() => {
                      const deadlineDate = parseISO(
                        selectedProject.expectedDeadline
                      );
                      const now = new Date();
                      const duration = intervalToDuration({
                        start: now,
                        end: deadlineDate,
                      });
                      const parts = [];
                      if (duration.years)
                        parts.push(
                          `${duration.years} year${
                            duration.years > 1 ? "s" : ""
                          }`
                        );
                      if (duration.months)
                        parts.push(
                          `${duration.months} month${
                            duration.months > 1 ? "s" : ""
                          }`
                        );
                      if (duration.days)
                        parts.push(
                          `${duration.days} day${duration.days > 1 ? "s" : ""}`
                        );
                      return (
                        <div className="mt-2 text-blue-700 font-medium bg-blue-50 rounded px-3 py-2 inline-block">
                          {parts.length > 0
                            ? `Time until deadline: ${parts.join(", ")}`
                            : "Deadline is today!"}
                        </div>
                      );
                    })()}
                </div>

                {/* Approval Date */}
                <div>
                  <label className="block font-medium">Approval Date</label>
                  <div className="flex gap-2 items-center">
                    <Input
                      type="date"
                      value={approvedForm.approvalDate}
                      onChange={(e) =>
                        handleFieldChange("approvalDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                {/* Forward To */}
                <div>
                  <label className="block font-medium">
                    Forward To {users.map((item) => item.name)}
                  </label>
                  <div className="flex gap-2 mb-2">
                    <Select
                      value={approvedForm.forward_id?.toString() || ""}
                      onValueChange={(value) =>
                        setApprovedForm({
                          ...approvedForm,
                          forward_id: value,
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Leader" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map((u) => (
                          <SelectItem key={u.id} value={u.id.toString()}>
                            <span className="capitalize">{u.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Remarks */}
                <div className="col-span-2">
                  <label className="block font-medium">Remarks / Notes</label>
                  <Input
                    value={approvedForm.notes}
                    onChange={(e) => handleFieldChange("notes", e.target.value)}
                  />
                </div>

                {/* Client Clarification Log */}
                <div className="col-span-2">
                  <label className="block font-medium">
                    Client Clarification Log
                  </label>
                  <Textarea
                    placeholder="Enter clarification..."
                    value={approvedForm.clientClarificationLog}
                    onChange={(e) =>
                      setApprovedForm((f) => ({
                        ...f,
                        clientClarificationLog: e.target.value,
                      }))
                    }
                    rows={3}
                  />
                </div>

                {/* File Upload */}
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-2">
                    Uploaded Files
                  </label>
                  <Input
                    type="file"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      setEstimationFiles((prev) => [
                        ...prev,
                        ...files.map((file) => ({
                          file,
                          label: "",
                          tempUrl: URL.createObjectURL(file),
                        })),
                      ]);
                      e.target.value = "";
                    }}
                  />
                  {estimationFiles.map((uf, idx) => (
                    <div key={idx} className="flex items-center gap-2 mt-1">
                      <Input
                        type="text"
                        placeholder="Label"
                        value={uf.label}
                        disabled={typeof uf.file === "string"}
                        onChange={(e) =>
                          setEstimationFiles((prev) =>
                            prev.map((u, i) =>
                              i === idx ? { ...u, label: e.target.value } : u
                            )
                          )
                        }
                        className={uf.label?.trim() ? "" : "border-red-400"}
                      />
                      <span className="text-xs">{uf.file?.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          setEstimationFiles((prev) =>
                            prev.filter((_, i) => i !== idx)
                          )
                        }
                      >
                        &times;
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end mt-4 gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700"
                  onClick={
                    editEstimationData ? handleEditEstimation : SubmitEstimation
                  }
                  loading={
                    fetching &&
                    [
                      "createEstimation",
                      "uploadFile",
                      "deleteFile",
                      "editEstimation",
                    ].includes(fetchType)
                  }
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* RFC Details Modal */}
      {rfcDetailsProject && (
        <Dialog
          open={!!rfcDetailsProject}
          onOpenChange={() => setRfcDetailsProject(null)}
        >
          <DialogContent className="w-full max-w-2xl p-0 bg-white rounded-xl shadow-2xl">
            {/* Sticky Header */}
            <DialogHeader className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-5 flex flex-row items-center gap-3">
              <FileText size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">RFQ Team Data</h2>
              <span className="ml-auto text-white/80 font-mono text-sm pr-3">
                {rfcDetailsProject?.project_id}
              </span>
            </DialogHeader>

            {/* Scrollable Body */}
            <div className="p-8 overflow-y-auto max-h-[90vh]">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div>
                  <span className="font-semibold text-slate-700">
                    Client Name:
                  </span>
                  <br />
                  {rfcDetailsProject.client_name}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Client Company:
                  </span>
                  <br />
                  {rfcDetailsProject.client_company}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Location:
                  </span>
                  <br />
                  {rfcDetailsProject.location}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Project Type:
                  </span>
                  <br />
                  {rfcDetailsProject.project_type}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Received Date:
                  </span>
                  <br />
                  {new Date(
                    rfcDetailsProject.received_date
                  ).toLocaleDateString()}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Priority:
                  </span>
                  <br />
                  {rfcDetailsProject.priority}
                </div>
                {rfcDetailsProject.deadline && (
                  <div>
                    <span className="font-semibold text-slate-700">
                      Deadline:
                    </span>
                    <br />
                    {rfcDetailsProject.deadline}
                  </div>
                )}
              </div>

              <div className="my-6 border-t pt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">
                    Contact Person:
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <UserIcon size={18} className="text-blue-500" />
                    {rfcDetailsProject.contact_person}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Phone:</span>
                  <a
                    href={`tel:${rfcDetailsProject.contact_phone}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <PhoneIcon size={18} className="text-green-500" />
                    {rfcDetailsProject.contact_person_phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Email:</span>
                  <a
                    href={`mailto:${rfcDetailsProject.contact_person_email}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <MailIcon size={18} className="text-rose-500" />
                    {rfcDetailsProject.contact_person_email}
                  </a>
                </div>
              </div>

              <div className="my-6 border-t pt-6">
                <div className="bg-slate-100 rounded p-3 text-slate-800 min-h-[40px]">
                  {rfcDetailsProject.notes || (
                    <span className="text-slate-400">No notes</span>
                  )}
                </div>
              </div>

              <div className="my-6 border-t pt-6">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  Uploaded Files:
                </div>
                <ul className="list-disc ml-8 space-y-1">
                  {(rfcDetailsProject.uploaded_files || []).filter(
                    (f) => f.file
                  ).length === 0 && (
                    <li className="text-slate-400">No files uploaded</li>
                  )}
                  {(rfcDetailsProject.uploaded_files || [])
                    .filter((f) => f.file)
                    .map((f, i) => (
                      <li key={i}>
                        <ShowFile label={f.label} url={f.file} />
                      </li>
                    ))}
                </ul>
              </div>

              <div className="my-6 border-t pt-6">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-500" />
                  RFC Updates:
                </div>
                <div className="space-y-2">
                  {rfcDetailsProject.add_more_infos?.length > 0 ? (
                    <div className="space-y-4">
                      {rfcDetailsProject.add_more_infos.map((info, idx) => (
                        <div
                          key={idx}
                          className="border rounded-lg p-4 bg-slate-50"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <StickyNote size={16} />
                            <span className="font-medium">Note:</span>
                            <span>{info.note || "-"}</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(info.uploaded_files || []).map((f, j) => (
                              <ShowFile
                                key={j}
                                label={f.label}
                                url={f.file}
                                size="small"
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-400 ml-2">
                      No additional info yet.
                    </div>
                  )}
                </div>
              </div>

              {(rfcDetailsProject.project_rejection ||
                rfcDetailsProject.estimation_status === "rejected") && (
                <div className="my-6 border-t pt-6">
                  <div className="font-semibold text-red-700 mb-1 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-500" />
                    Rejection Details:
                  </div>
                  {rfcDetailsProject.project_rejection ? (
                    <div className="mb-4">
                      <div className="text-slate-700 mb-1">
                        {rfcDetailsProject.project_rejection.note}
                      </div>
                      <ul className="list-disc ml-8 space-y-1">
                        {rfcDetailsProject.project_rejection.uploaded_files
                          ?.length > 0 ? (
                          rfcDetailsProject.project_rejection.uploaded_files.map(
                            (f, i) => (
                              <li key={i}>
                                <ShowFile label={f.label} url={f.file} />
                              </li>
                            )
                          )
                        ) : (
                          <li className="text-slate-400">No files uploaded</li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="text-slate-700 mb-1">
                      Project has been rejected but no detailed rejection
                      information is available.
                    </div>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {showReadyPrompt && (
        <Dialog open={true} onOpenChange={() => setShowReadyPrompt(false)}>
          <DialogContent className="max-w-md w-full p-8 border-green-400">
            <div className="flex flex-col items-center">
              <CheckCircle className="text-green-600 mb-2" size={40} />
              <div className="text-lg font-semibold mb-2 text-green-700">
                Client Approved!
              </div>
              <div className="mb-4 text-center text-slate-700">
                You have approved the client, but haven't forwarded the project
                to the Project Management Team.
                <br />
                Please click <b>Mark as Ready for Execution</b> to continue.
              </div>
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => setShowReadyPrompt(false)}
              >
                OK
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Reject Modal */}
      <Dialog open={rejectModal.open} onOpenChange={closeRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Project</DialogTitle>
          </DialogHeader>
          <div className="mb-4">
            <label className="block font-medium mb-2">Upload Files</label>
            {rejectModal.files.map((uf, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-2">
                <select
                  className="border rounded px-2 py-1 text-sm"
                  value={uf.label}
                  onChange={(e) => handleRejectLabelChange(idx, e)}
                >
                  <option value="">Select Label</option>
                  <option value="BOQ">BOQ</option>
                  <option value="Layout">Layout</option>
                  <option value="RFQ">RFQ</option>
                  <option value="Spec">Spec</option>
                  <option value="Drawing">Drawing</option>
                  <option value="Other">Other</option>
                </select>
                <input
                  type="file"
                  className="border rounded px-2 py-1 text-sm"
                  onChange={(e) => handleRejectFileChange(idx, e)}
                />
                {rejectModal.files.length > 1 && (
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeRejectFileInput(idx)}
                  >
                    <X size={16} />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={addRejectFileInput}
              className="mt-1"
            >
              + Add File
            </Button>
          </div>
          <div className="mb-4">
            <label className="block font-medium mb-1">Notes</label>
            <textarea
              className="border rounded w-full p-2 text-sm"
              rows={2}
              value={rejectModal.notes}
              onChange={(e) =>
                setRejectModal((modal) => ({ ...modal, notes: e.target.value }))
              }
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeRejectModal}>
              Cancel
            </Button>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={handleProjectReject}
              loading={
                fetching &&
                (fetchType == "createProjectRejection" ||
                  fetchType == "uploadFile")
              }
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Estimation Modal */}
      {viewEstimationProject && (
        <Dialog
          open={!!viewEstimationProject}
          onOpenChange={() => setViewEstimationProject(null)}
        >
          <DialogContent className="max-w-2xl p-0 ">
            <DialogHeader className="rounded-t-xl bg-gradient-to-r from-green-600 to-green-400 px-8 py-5 flex flex-row items-center gap-3">
              <Calculator size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">Estimation Data</h2>
            </DialogHeader>
            {/* Header */}

            {/* Body */}
            <div className="p-6">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div>
                  <span className="font-semibold text-slate-700">Cost:</span>
                  <br />
                  {viewEstimationProject.estimation?.cost ??
                    viewEstimationProject.cost ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Deadline:
                  </span>
                  <br />
                  {viewEstimationProject.estimation?.deadline ??
                    viewEstimationProject.deadline ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Approval Date:
                  </span>
                  <br />
                  {viewEstimationProject.estimation?.approval_date ??
                    viewEstimationProject.approval_date ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Ready for Execution:
                  </span>
                  <br />
                  {viewEstimationProject.estimation?.sent_to_pm !==
                  undefined ? (
                    viewEstimationProject.estimation.sent_to_pm ? (
                      "Yes"
                    ) : (
                      "No"
                    )
                  ) : viewEstimationProject.sent_to_pm !== undefined ? (
                    viewEstimationProject.sent_to_pm ? (
                      "Yes"
                    ) : (
                      "No"
                    )
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Forward To:
                  </span>
                  <br />
                  {viewEstimationProject.estimation?.forwarded_to?.label ??
                    viewEstimationProject.forwarded_to?.label ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-700">Notes:</span>
                  <br />
                  {viewEstimationProject.estimation?.notes ??
                    viewEstimationProject.notes ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-700">
                    Client Clarification Log:
                  </span>
                  <br />
                  {viewEstimationProject.estimation?.log ??
                    viewEstimationProject.log ?? (
                      <span className="text-slate-400">-</span>
                    )}
                </div>
                <div className="col-span-2">
                  <span className="font-semibold text-slate-700">
                    Client View:
                  </span>
                  <br />
                  <div className="flex items-center gap-2 mt-1">
                    <span className="truncate text-blue-700 font-mono text-xs bg-blue-50 px-2 py-1 rounded">
                      {`${window.location.origin}/client/${viewEstimationProject.public_share_token}`}
                    </span>
                    <button
                      className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-semibold"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/client/${viewEstimationProject.public_share_token}`
                        );
                        if (typeof toast === "function")
                          toast.success("Copied!");
                      }}
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              {/* Uploaded Files */}
              <div className="my-6 border-t pt-6">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <FileText size={18} className="text-green-500" />
                  Uploaded Files:
                </div>
                <div className="flex flex-wrap gap-2 ml-2">
                  {(
                    viewEstimationProject.estimation?.uploaded_files ||
                    viewEstimationProject.uploaded_files ||
                    []
                  ).length === 0 ? (
                    <span className="text-slate-400">No files uploaded</span>
                  ) : (
                    (
                      viewEstimationProject.estimation?.uploaded_files ||
                      viewEstimationProject.uploaded_files
                    ).map((f, i) => (
                      <ShowFile
                        key={i}
                        label={f.label}
                        url={f.file}
                        size="small"
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Rejection Info */}
              {(viewEstimationProject.project_rejection?.length > 0 ||
                viewEstimationProject.estimation_status === "rejected") && (
                <div className="my-6 border-t pt-6">
                  <div className="font-semibold text-red-700 mb-1 flex items-center gap-2">
                    <AlertCircle size={18} className="text-red-500" />
                    Rejection Details:
                  </div>
                  {viewEstimationProject.project_rejection?.length > 0 ? (
                    viewEstimationProject.project_rejection.map((rej, idx) => (
                      <div key={idx} className="mb-4">
                        <div className="text-slate-700 mb-1">{rej.note}</div>
                        <ul className="list-disc ml-8 space-y-1">
                          {rej.uploaded_files?.length > 0 ? (
                            rej.uploaded_files.map((f, i) => (
                              <li key={i}>
                                <span className="font-medium text-slate-700">
                                  {f.label ? `${f.label}: ` : ""}
                                </span>
                                {f.file}
                              </li>
                            ))
                          ) : (
                            <li className="text-slate-400">
                              No files uploaded
                            </li>
                          )}
                        </ul>
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-700 mb-1">
                      Project has been rejected but no detailed rejection
                      information is available.
                    </div>
                  )}
                </div>
              )}

              {/* Corrections */}
              <div className="py-4 border-b">
                <div className="font-semibold text-blue-700 mb-1 flex items-center gap-2">
                  <AlertCircle size={18} className="text-blue-500" />
                  Corrections:
                  {!viewEstimationProject.estimation?.corrections && (
                    <span className="text-xs text-gray-400">
                      No Correction made
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {viewEstimationProject.estimation?.corrections?.length > 0 ? (
                    viewEstimationProject.estimation.corrections.map((corr) => (
                      <div
                        key={corr.id}
                        className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex flex-col md:flex-col md:items-start gap-2 shadow-sm"
                      >
                        <div
                          className="flex-1 text-slate-800 text-sm md:text-base max-w-full break-words"
                          style={{ maxWidth: "600px", wordBreak: "break-word" }}
                        >
                          {corr.correction}
                        </div>
                        <div className="text-xs text-gray-500 ml-auto whitespace-nowrap">
                          {new Date(corr.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-gray-400 ml-2 text-xs">
                      No corrections made.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
