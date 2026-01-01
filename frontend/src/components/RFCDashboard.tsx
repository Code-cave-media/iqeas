import { useEffect, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Calendar,
  AlertCircle,
  Plus,
  X,
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  StickyNote,
  Info,
  Send,
  Blocks,
  ListCollapse,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ClientAutofillInput from "@/shared/ClientAutofillInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import type { IRFCProject } from "@/types/apiTypes";
import ShowFile from "./ShowFile";
import toast from "react-hot-toast";
import {
  validateProjectForm,
  validateRequiredFields,
} from "@/utils/validation";
import Loading from "./atomic/Loading";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { isValidEmail } from "@/lib/utils";

function generateProjectId() {
  return `PRJ-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;
}

const initialForm = {
  name: "",
  clientName: "",
  clientCompany: "",
  location: "",
  projectType: "Pipeline",
  received_date: new Date().toISOString().slice(0, 10),
  uploadedFiles: [] as { file: File; label: string; tempUrl: string }[],
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  notes: "",
  priority: "medium",
};

const getPriorityBadgeProps = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return { variant: "destructive" as const };
    case "medium":
      return { variant: "secondary" as const };
    case "low":
      return {
        variant: "outline" as const,
        className: "border-gray-400 text-gray-600",
      };
    default:
      return { variant: "default" as const };
  }
};

const getStatusBadgeProps = (status: string) => {
  if (!status) return { variant: "default" as const };
  switch (status.toLowerCase()) {
    case "rejected":
      return { variant: "destructive" as const };
    case "completed":
      return {
        variant: "secondary" as const,
        className: "bg-green-100 text-green-800 border-green-300",
      };
    case "estimating":
    case "ready for estimation":
      return {
        variant: "secondary" as const,
        className: "bg-blue-100 text-blue-800 border-blue-300",
      };
    default:
      return { variant: "outline" as const, className: "capitalize" };
  }
};

export const RFCDashboard = () => {
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [projects, setProjects] = useState<IRFCProject[]>([]);
  const { fetchType, fetching, isFetched, makeApiCall } = useAPICall();
  const { authToken } = useAuth();
  const [formStep, setFormStep] = useState(1);
  const [sendToEstimation, setSendToEstimation] = useState(false);
  const [detailsProject, setDetailsProject] = useState<IRFCProject | null>(
    null
  );
  const [moreInfoProject, setMoreInfoProject] = useState<IRFCProject | null>(
    null
  );
  const [moreInfoForm, setMoreInfoForm] = useState({
    files: [] as { file: File; label: string; tempUrl: string }[],
    notes: "",
    enquiry: "",
  });
  const [cards, setCards] = useState({
    active_projects: 0,
    read_for_estimation: 0,
  });
  const [listView, setListView] = useState(false);

  useEffect(() => {
    const fetchProjects = async () => {
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_ALL_RFQ_PROJECTS(searchTerm, page, 20),
        {},
        "application/json",
        authToken,
        "getProjects"
      );
      if (response.status === 200) {
        setProjects(response.data.projects);
        setCards(response.data.cards);
        setTotalPages(response.data.total_pages);
      } else {
        toast.error("Failed to fetch projects");
      }
    };
    fetchProjects();
  }, [searchTerm, page, makeApiCall, authToken]);

  const handleClientSelect = (client: any) => {
    setForm((prev) => ({
      ...prev,
      clientName: client.client_name || "",
      clientCompany: client.client_company || "",
      location: client.location || "",
      contactPerson: client.contact_person || "",
      contactPhone: client.contact_person_phone || "",
      contactEmail: client.contact_person_email || "",
    }));
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "uploadedFiles" && files) {
      const newFiles = Array.from(files).map((file) => ({
        file,
        label: "",
        tempUrl: URL.createObjectURL(file),
      }));
      setForm((prev) => ({
        ...prev,
        uploadedFiles: [...prev.uploadedFiles, ...newFiles],
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const startNewProject = () => {
    setForm({ ...initialForm });
    setFormStep(1);
    setShowForm(true);
  };

  const nextStep = () => setFormStep((s) => s + 1);
  const prevStep = () => setFormStep((s) => s - 1);

  const uploadFile = async (file: File, label: string) => {
    const data = new FormData();
    data.append("label", label);
    data.append("file", file);
    const response = await makeApiCall(
      "post",
      API_ENDPOINT.UPLOAD_FILE,
      data,
      "multipart/form-data",
      authToken,
      "uploadFile"
    );
    return response.status === 201 ? response.data : null;
  };

  const submitProject = async (sendToEstimationNow = false) => {
    const missing = validateProjectForm(form);
    if (missing.length > 0) {
      toast.error(`Missing required field: ${missing[0]}`);
      return;
    }
    if (!isValidEmail(form.contactEmail)) {
      toast.error("Please enter a valid contact email");
      return;
    }
    if (
      form.uploadedFiles.some(
        (f) => f.file && (!f.label || f.label.trim() === "")
      )
    ) {
      toast.error("Please enter a label for every uploaded file.");
      return;
    }

    const uploadedFileIds = [];
    for (const uf of form.uploadedFiles) {
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
      name: form.name,
      client_name: form.clientName,
      client_company: form.clientCompany,
      location: form.location,
      received_date: form.received_date,
      project_type: form.projectType,
      priority: form.priority,
      contact_person: form.contactPerson,
      contact_person_phone: form.contactPhone,
      contact_person_email: form.contactEmail,
      notes: form.notes,
      send_to_estimation: sendToEstimationNow,
      uploaded_files: uploadedFileIds,
    };

    const response = await makeApiCall(
      "post",
      API_ENDPOINT.CREATE_PROJECT,
      data,
      "application/json",
      authToken,
      "createProject"
    );

    if (response.status === 201) {
      setProjects([response.data, ...projects]);
      setCards((prev) => ({
        ...prev,
        active_projects: response.data.send_to_estimation
          ? prev.active_projects + 1
          : prev.active_projects,
        read_for_estimation: response.data.send_to_estimation
          ? prev.read_for_estimation
          : prev.read_for_estimation + 1,
      }));
      toast.success("Project created successfully");
    } else {
      toast.error("Failed to create project");
    }
    setShowForm(false);
  };

  const submitMoreInfo = async () => {
    if (!moreInfoProject) return;
    if (validateRequiredFields(moreInfoForm, ["enquiry", "notes"]).length > 0) {
      toast.error("Fill all the required fields");
      return;
    }

    const uploadedFileIds = [];
    for (const uf of moreInfoForm.files) {
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
      project_id: moreInfoProject.id,
      notes: moreInfoForm.notes,
      enquiry: moreInfoForm.enquiry,
      uploaded_file_ids: uploadedFileIds,
    };

    const response = await makeApiCall(
      "post",
      API_ENDPOINT.PROJECT_ADD_MORE_INFO,
      data,
      "application/json",
      authToken,
      "addMoreInfo"
    );

    if (response.status === 201) {
      toast.success("Additional info added!");
      setProjects((prev) =>
        prev.map((item) =>
          item.id === moreInfoProject.id
            ? {
                ...item,
                add_more_infos: item.add_more_infos
                  ? [response.data, ...item.add_more_infos]
                  : [response.data],
              }
            : item
        )
      );
      setMoreInfoProject(null);
      setMoreInfoForm({ files: [], notes: "", enquiry: "" });
    } else {
      toast.error("Failed to add more info");
    }
  };

  if (!isFetched) {
    return <Loading full />;
  }

  // Fixed: filteredProjects is now properly defined
  const filteredProjects = projects;

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            RFQ Team Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage client requests and project initiation
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={startNewProject}
        >
          <Plus size={18} className="mr-2" /> Add New Project
        </Button>
      </div>

      {/* Add New Project Dialog */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={() => setShowForm(false)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="px-6 py-4">
              <h2 className="text-xl font-bold">Add New Project</h2>
            </DialogHeader>
            <div className="p-6">
              <div className="flex mb-6 space-x-4">
                <div
                  className={`flex-1 text-center ${
                    formStep === 1
                      ? "font-bold text-blue-600"
                      : "text-slate-500"
                  }`}
                >
                  1. Data Collection
                </div>
                <div
                  className={`flex-1 text-center ${
                    formStep === 2
                      ? "font-bold text-blue-600"
                      : "text-slate-500"
                  }`}
                >
                  2. Review & Confirm
                </div>
              </div>

              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Project Name
                      </label>
                      <Input
                        name="name"
                        value={form.name}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Client Name
                      </label>
                      <ClientAutofillInput
                        value={form.clientName}
                        onChange={(val) =>
                          setForm((prev) => ({ ...prev, clientName: val }))
                        }
                        onSelect={handleClientSelect}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Client Company
                      </label>
                      <Input
                        name="clientCompany"
                        value={form.clientCompany}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Location
                      </label>
                      <Input
                        name="location"
                        value={form.location}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Project Type
                      </label>
                      <Select
                        value={form.projectType}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, projectType: v }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select Project Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Pipeline">Pipeline</SelectItem>
                          <SelectItem value="Plant">Plant</SelectItem>
                          <SelectItem value="Maintenance">
                            Maintenance
                          </SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Priority
                      </label>
                      <Select
                        value={form.priority}
                        onValueChange={(v) =>
                          setForm((f) => ({ ...f, priority: v.toLowerCase() }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Received Date
                      </label>
                      <Input
                        type="date"
                        name="received_date"
                        value={form.received_date}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Contact Person
                      </label>
                      <Input
                        name="contactPerson"
                        value={form.contactPerson}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Phone
                      </label>
                      <Input
                        name="contactPhone"
                        value={form.contactPhone}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Email
                      </label>
                      <Input
                        name="contactEmail"
                        value={form.contactEmail}
                        onChange={handleFormChange}
                      />
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-2">
                        Uploaded Files
                      </label>
                      <Input
                        type="file"
                        multiple
                        onChange={handleFormChange}
                        name="uploadedFiles"
                      />
                      {form.uploadedFiles.map((uf, idx) => (
                        <div key={idx} className="flex items-center gap-2 mt-2">
                          <Input
                            type="text"
                            placeholder="Label"
                            value={uf.label}
                            onChange={(e) =>
                              setForm((prev) => ({
                                ...prev,
                                uploadedFiles: prev.uploadedFiles.map((u, i) =>
                                  i === idx
                                    ? { ...u, label: e.target.value }
                                    : u
                                ),
                              }))
                            }
                            className={
                              !uf.label?.trim() ? "border-red-400" : ""
                            }
                          />
                          <span className="text-xs text-gray-600">
                            {uf.file.name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                uploadedFiles: prev.uploadedFiles.filter(
                                  (_, i) => i !== idx
                                ),
                              }))
                            }
                          >
                            ×
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1">
                        Notes
                      </label>
                      <Input
                        name="notes"
                        value={form.notes}
                        onChange={handleFormChange}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      onClick={nextStep}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div>
                  <h3 className="font-semibold mb-4">Review Project Data</h3>
                  <div className="bg-slate-50 p-4 rounded-lg text-sm space-y-2">
                    <div>
                      <strong>Project Name:</strong> {form.name}
                    </div>
                    <div>
                      <strong>Client Name:</strong> {form.clientName}
                    </div>
                    <div>
                      <strong>Client Company:</strong> {form.clientCompany}
                    </div>
                    <div>
                      <strong>Location:</strong> {form.location}
                    </div>
                    <div>
                      <strong>Project Type:</strong> {form.projectType}
                    </div>
                    <div>
                      <strong>Received Date:</strong> {form.received_date}
                    </div>
                    <div>
                      <strong>Priority:</strong> {form.priority}
                    </div>
                    <div>
                      <strong>Contact Person:</strong> {form.contactPerson}
                    </div>
                    <div>
                      <strong>Phone:</strong> {form.contactPhone}
                    </div>
                    <div>
                      <strong>Email:</strong> {form.contactEmail}
                    </div>
                    {form.notes && (
                      <div>
                        <strong>Notes:</strong> {form.notes}
                      </div>
                    )}
                    <div>
                      <strong>Uploaded Files:</strong>
                      <ul className="list-disc ml-6 mt-1">
                        {form.uploadedFiles
                          .filter((f) => f.file)
                          .map((f, i) => (
                            <li key={i}>
                              {f.label ? `${f.label}: ` : ""}
                              {f.file?.name}
                            </li>
                          ))}
                      </ul>
                    </div>
                  </div>

                  <div className="flex justify-between mt-6">
                    <Button variant="outline" onClick={prevStep}>
                      Back
                    </Button>
                    <Button
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => submitProject(sendToEstimation)}
                      disabled={fetching}
                    >
                      Save Project
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{cards.active_projects}</p>
                <p className="text-sm text-slate-600">Active RFQs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {cards.read_for_estimation}
                </p>
                <p className="text-sm text-slate-600">Ready for Estimation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & View Toggle */}
      <div className="mb-6">
        <div className="relative flex items-center gap-2">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search RFQs by client name or project ID..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearchTerm(searchInput)}
            className="pl-10"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setPage(1);
              setSearchTerm(searchInput);
            }}
          >
            <Search size={18} />
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => setListView(!listView)}
          >
            {listView ? <ListCollapse size={18} /> : <Blocks size={18} />}
          </Button>
        </div>
      </div>

      {/* Project List */}
      {fetching && fetchType === "getProjects" ? (
        <Loading full={false} />
      ) : (
        <>
          {listView ? (
            <div className="space-y-2">
              {filteredProjects.map((project) => (
                <a
                  key={project.id}
                  href={`/rfq/${project.id}/enquiry`}
                  className="p-2 border rounded-lg cursor-pointer hover:bg-slate-50 flex items-center justify-between h-10"
                  onClick={(e) => e.preventDefault()}
                >
                  <div className="flex items-center gap-10">
                    <p className="text-sm font-semibold w-20">
                      {project.project_id}
                    </p>
                    <p className="text-sky-800 w-40 truncate">{project.name}</p>
                    <p className="text-slate-500 text-sm w-32">
                      Received:{" "}
                      {project.received_date
                        ? new Date(project.received_date).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      className="w-7 h-7 rounded hover:bg-slate-200"
                      onClick={() => setDetailsProject(project)}
                    >
                      <Info size={14} />
                    </button>
                    <button
                      className="w-7 h-7 rounded hover:bg-slate-200"
                      onClick={() => setMoreInfoProject(project)}
                    >
                      <StickyNote size={14} />
                    </button>
                    <a href={`/rfq/${project.id}/enquiry`}>
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <Send size={14} className="mr-1" /> View project
                      </Button>
                    </a>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <Card
                  key={project.id}
                  className="hover:shadow-lg transition-shadow"
                >
                  <CardHeader className="pb-4 mb-2 border-b border-slate-100">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-2">
                        <CardTitle className="text-lg">
                          {project.project_id}
                        </CardTitle>
                        <p className="text-base font-bold text-slate-800 mb-1">
                          {project.name}
                        </p>
                        <p className="text-slate-600 font-semibold flex items-center gap-1">
                          <User size={14} /> {project.client_name}
                        </p>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <Building2 size={12} /> {project.client_company}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <MapPin size={12} /> {project.location}
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Calendar size={12} /> Received:{" "}
                          {project.received_date
                            ? new Date(
                                project.received_date
                              ).toLocaleDateString()
                            : "-"}
                        </p>
                        <div className="text-xs text-slate-500 flex items-center gap-1">
                          <FileText size={12} /> {project.project_type}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3">
                        <Badge {...getPriorityBadgeProps(project.priority)}>
                          {project.priority}
                        </Badge>
                        <Badge {...getStatusBadgeProps(project.status)}>
                          {project.status}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <a href={`/rfq/${project.id}/enquiry`}>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Send size={14} className="mr-1" /> View project
                        </Button>
                      </a>
                    </div>
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!fetching && filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">No RFQ projects found.</div>
        </div>
      )}

      {/* Pagination */}
      {!fetching && totalPages > 1 && (
        <div className="flex justify-center mt-8 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i + 1}
              size="sm"
              variant={page === i + 1 ? "default" : "outline"}
              onClick={() => setPage(i + 1)}
            >
              {i + 1}
            </Button>
          ))}
        </div>
      )}

      {/* Project Details Modal */}
      {detailsProject && (
        <Dialog
          open={!!detailsProject}
          onOpenChange={() => setDetailsProject(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Project Details</h2>
                <span className="text-sm font-mono">
                  {detailsProject.project_id}
                </span>
              </div>
            </DialogHeader>
            {/* ... (your existing detailed view content) */}
          </DialogContent>
        </Dialog>
      )}

      {/* Add More Info Modal */}
      {moreInfoProject && (
        <Dialog
          open={!!moreInfoProject}
          onOpenChange={() => setMoreInfoProject(null)}
        >
          <DialogContent>
            <DialogHeader>
              <h2 className="text-xl font-bold">
                Add More Info to {moreInfoProject.project_id}
              </h2>
            </DialogHeader>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Upload Additional Files
                </label>
                <Input
                  type="file"
                  multiple
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setMoreInfoForm((prev) => ({
                      ...prev,
                      files: [
                        ...prev.files,
                        ...files.map((f) => ({
                          file: f,
                          label: "",
                          tempUrl: URL.createObjectURL(f),
                        })),
                      ],
                    }));
                  }}
                />
                {moreInfoForm.files.map((uf, idx) => (
                  <div key={idx} className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Label"
                      value={uf.label}
                      onChange={(e) =>
                        setMoreInfoForm((prev) => ({
                          ...prev,
                          files: prev.files.map((u, i) =>
                            i === idx ? { ...u, label: e.target.value } : u
                          ),
                        }))
                      }
                    />
                    <span className="text-xs">{uf.file.name}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        setMoreInfoForm((prev) => ({
                          ...prev,
                          files: prev.files.filter((_, i) => i !== idx),
                        }))
                      }
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea
                  className="border rounded w-full p-2"
                  rows={3}
                  value={moreInfoForm.notes}
                  onChange={(e) =>
                    setMoreInfoForm((f) => ({ ...f, notes: e.target.value }))
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Enquiry
                </label>
                <textarea
                  className="border rounded w-full p-2"
                  rows={3}
                  value={moreInfoForm.enquiry}
                  onChange={(e) =>
                    setMoreInfoForm((f) => ({ ...f, enquiry: e.target.value }))
                  }
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setMoreInfoProject(null)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={submitMoreInfo}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Submit
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RFCDashboard;
