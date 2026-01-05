import { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Grid,
  List,
  Users,
  Clock,
  User,
  Building2,
  MapPin,
  Calendar,
  FileText,
  Send,
  Info,
  StickyNote,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Added
import { Textarea } from "@/components/ui/textarea"; // Added
import { Separator } from "@/components/ui/separator"; // Added
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
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
import toast from "react-hot-toast";
import { validateProjectForm } from "@/utils/validation";
import Loading from "./atomic/Loading";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"; // Full import
import { isValidEmail } from "@/lib/utils";

const initialForm = {
  name: "",
  clientName: "",
  clientCompany: "",
  location: "",
  projectType: "",
  received_date: new Date().toISOString().slice(0, 10),
  uploadedFiles: [] as { file: File; label: string; tempUrl: string }[],
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  notes: "",
  priority: "medium" as "high" | "medium" | "low",
};

const getPriorityBadgeProps = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case "high":
      return { variant: "destructive" as const };
    case "medium":
      return { variant: "secondary" as const };
    case "low":
      return { variant: "outline" as const };
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
      return { variant: "secondary" as const };
    case "estimating":
    case "ready for estimation":
      return { variant: "secondary" as const };
    default:
      return { variant: "outline" as const };
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
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isSubmitting, setIsSubmitting] = useState(false); // Added for button state

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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    const files = (e.target as HTMLInputElement).files;

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

  const submitProject = async () => {
    setIsSubmitting(true);

    const missing = validateProjectForm(form);
    if (missing.length > 0) {
      toast.error(`Missing required field: ${missing[0]}`);
      setIsSubmitting(false);
      return;
    }
    if (form.contactEmail && !isValidEmail(form.contactEmail)) {
      toast.error("Please enter a valid contact email");
      setIsSubmitting(false);
      return;
    }
    if (form.uploadedFiles.some((f) => f.file && !f.label.trim())) {
      toast.error("Please enter a label for every uploaded file.");
      setIsSubmitting(false);
      return;
    }

    const uploadedFileIds: number[] = [];
    for (const uf of form.uploadedFiles) {
      if (uf.file) {
        const uploaded = await uploadFile(uf.file, uf.label);
        if (uploaded?.id) {
          uploadedFileIds.push(uploaded.id);
        } else {
          toast.error("Failed to upload one or more files");
          setIsSubmitting(false);
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
      toast.success("Project created successfully");
      setShowForm(false);
      setForm(initialForm);
    } else {
      toast.error(response.data?.message || "Failed to create project");
    }
    setIsSubmitting(false);
  };

  const submitMoreInfo = async () => {
    if (!moreInfoProject) return;

    const uploadedFileIds: number[] = [];
    for (const uf of moreInfoForm.files) {
      if (uf.file) {
        const uploaded = await uploadFile(uf.file, uf.label);
        if (uploaded?.id) {
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

  if (!isFetched) return <Loading full />;

  return (
    <div className="p-6 max-w-screen-2xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">
            RFQ Team Dashboard
          </h1>
          <p className="text-slate-600">
            Manage client requests and project initiation
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5">
              <Users size={16} className="text-blue-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.active_projects} Total
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-3 py-1.5">
              <Clock size={16} className="text-yellow-700" />
              <span className="text-sm font-semibold text-slate-700">
                {cards.read_for_estimation} Pending
              </span>
            </div>
          </div>

          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <Input
              placeholder="Search projects..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && (setSearchTerm(searchInput), setPage(1))
              }
              className="pl-9 pr-4 py-2 w-64"
            />
          </div>

          <div className="flex rounded-md border border-slate-200 overflow-hidden">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-none"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-none border-l border-slate-200"
            >
              <List size={16} />
            </Button>
          </div>

          <Button
            onClick={startNewProject}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus size={18} className="mr-2" />
            New Project
          </Button>
        </div>
      </div>

      {/* Projects Display */}
      {fetching && fetchType === "getProjects" ? (
        <Loading full={false} />
      ) : projects.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <p className="text-lg font-medium">No projects found</p>
          <p className="text-sm mt-1">
            Try adjusting your search or create a new project
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className="space-y-3">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-md transition-shadow"
            >
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-8">
                  <div className="w-24 font-mono text-sm font-semibold">
                    {project.project_id}
                  </div>
                  <div className="w-64">
                    <p className="font-medium text-slate-800 truncate">
                      {project.name}
                    </p>
                    <p className="text-sm text-slate-600">
                      {project.client_name} • {project.client_company}
                    </p>
                  </div>
                  <div className="text-sm text-slate-500">
                    Received:{" "}
                    {project.received_date
                      ? new Date(project.received_date).toLocaleDateString()
                      : "-"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailsProject(project)}
                  >
                    <Info size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMoreInfoProject(project)}
                  >
                    <StickyNote size={16} />
                  </Button>
                  <a href={`/rfq/${project.id}/enquiry`}>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Send size={14} className="mr-1" />
                      View
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex justify-between items-start mb-3">
                  <CardTitle className="text-lg font-mono">
                    {project.project_id}
                  </CardTitle>
                  <div className="flex flex-col gap-1">
                    <Badge
                      {...getPriorityBadgeProps(project.priority)}
                      className="text-xs"
                    >
                      {project.priority?.toUpperCase()}
                    </Badge>
                    <Badge
                      {...getStatusBadgeProps(project.status)}
                      className="text-xs"
                    >
                      {project.status || "New"}
                    </Badge>
                  </div>
                </div>

                <h3 className="font-semibold text-slate-800 mb-3 line-clamp-2">
                  {project.name}
                </h3>

                <div className="space-y-2 text-sm text-slate-600">
                  <p className="flex items-center gap-2">
                    <User size={14} /> {project.client_name}
                  </p>
                  <p className="flex items-center gap-2">
                    <Building2 size={14} /> {project.client_company}
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin size={14} /> {project.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <Calendar size={14} />{" "}
                    {project.received_date
                      ? new Date(project.received_date).toLocaleDateString()
                      : "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <FileText size={14} /> {project.project_type}
                  </p>
                </div>

                <div className="flex gap-2 mt-6">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDetailsProject(project)}
                  >
                    <Info size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setMoreInfoProject(project)}
                  >
                    <StickyNote size={16} />
                  </Button>
                  <a href={`/rfq/${project.id}/enquiry`} className="flex-1">
                    <Button
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      <Send size={14} className="mr-1" />
                      View Project
                    </Button>
                  </a>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && !fetching && (
        <div className="flex justify-center mt-10 gap-2">
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

      {/* New Project Dialog - Enhanced UI */}
      {showForm && (
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto p-0">
            <DialogHeader className="p-8 pb-4">
              <DialogTitle className="text-3xl font-bold">
                Add New Project
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Fill in the project details and upload supporting files.
              </DialogDescription>
            </DialogHeader>

            {/* Step Indicator */}
            <div className="px-8">
              <div className="flex items-center justify-center mb-8">
                <div className="flex items-center w-full max-w-md">
                  <div className="flex-1 flex items-center">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                        formStep >= 1
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      1
                    </div>
                    <div
                      className={`flex-1 h-1 mx-2 transition-colors ${
                        formStep >= 2 ? "bg-blue-600" : "bg-gray-200"
                      }`}
                    />
                  </div>
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold transition-all ${
                      formStep === 2
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    2
                  </div>
                </div>
              </div>

              <div className="flex justify-center text-center mb-10">
                <p
                  className={`font-medium ${
                    formStep === 1 ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {formStep === 1 ? "Data Collection" : "Review & Confirm"}
                </p>
              </div>
            </div>

            <div className="px-8 pb-8">
              {formStep === 1 && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Project Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="name">
                          Project Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleFormChange}
                          placeholder="Enter project name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="projectType">Project Type</Label>
                        <Input
                          id="projectType"
                          name="projectType"
                          value={form.projectType}
                          onChange={handleFormChange}
                          placeholder="e.g. Pipeline, Plant, Facility"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          name="location"
                          value={form.location}
                          onChange={handleFormChange}
                          placeholder="City, State/Province"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="priority">Priority</Label>
                        <Select
                          value={form.priority}
                          onValueChange={(v) =>
                            setForm((f) => ({ ...f, priority: v as any }))
                          }
                        >
                          <SelectTrigger id="priority">
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="high">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-red-500 rounded-full" />
                                High
                              </span>
                            </SelectItem>
                            <SelectItem value="medium">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-yellow-500 rounded-full" />
                                Medium
                              </span>
                            </SelectItem>
                            <SelectItem value="low">
                              <span className="flex items-center gap-2">
                                <span className="w-3 h-3 bg-green-500 rounded-full" />
                                Low
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="received_date">Received Date</Label>
                        <Input
                          id="received_date"
                          type="date"
                          name="received_date"
                          value={form.received_date}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-semibold mb-4">
                      Client & Contact
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="clientName">Client Name</Label>
                        <ClientAutofillInput
                          value={form.clientName}
                          onChange={(val) =>
                            setForm((prev) => ({ ...prev, clientName: val }))
                          }
                          onSelect={handleClientSelect}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="clientCompany">Client Company</Label>
                        <Input
                          id="clientCompany"
                          name="clientCompany"
                          value={form.clientCompany}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPerson">Contact Person</Label>
                        <Input
                          id="contactPerson"
                          name="contactPerson"
                          value={form.contactPerson}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactEmail">Email</Label>
                        <Input
                          id="contactEmail"
                          type="email"
                          name="contactEmail"
                          value={form.contactEmail}
                          onChange={handleFormChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="contactPhone">Phone</Label>
                        <Input
                          id="contactPhone"
                          name="contactPhone"
                          value={form.contactPhone}
                          onChange={handleFormChange}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-6">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block">
                        Attachments
                      </Label>
                      <Input
                        type="file"
                        multiple
                        name="uploadedFiles"
                        onChange={handleFormChange}
                        className="cursor-pointer"
                      />
                      {form.uploadedFiles.length > 0 && (
                        <div className="mt-4 space-y-3">
                          {form.uploadedFiles.map((uf, idx) => (
                            <div
                              key={idx}
                              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border"
                            >
                              <div className="flex-1">
                                <Input
                                  placeholder="Add label (optional)"
                                  value={uf.label}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      uploadedFiles: prev.uploadedFiles.map(
                                        (u, i) =>
                                          i === idx
                                            ? { ...u, label: e.target.value }
                                            : u
                                      ),
                                    }))
                                  }
                                  className="border-0 bg-transparent focus-visible:ring-1"
                                />
                                <p className="text-sm text-gray-600 mt-1">
                                  {uf.file.name}
                                </p>
                              </div>
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
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Additional Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={form.notes}
                        onChange={handleFormChange}
                        placeholder="Any extra information about the project..."
                        rows={4}
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="max-w-3xl mx-auto">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">
                      Project Summary
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                      <div>
                        <p className="text-gray-600">Project Name</p>
                        <p className="font-medium text-lg">
                          {form.name || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Type</p>
                        <p className="font-medium">{form.projectType || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Location</p>
                        <p className="font-medium">{form.location || "—"}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Priority</p>
                        <p className="font-medium capitalize flex items-center gap-2">
                          {form.priority && (
                            <span
                              className={`w-3 h-3 rounded-full ${
                                form.priority === "high"
                                  ? "bg-red-500"
                                  : form.priority === "medium"
                                  ? "bg-yellow-500"
                                  : "bg-green-500"
                              }`}
                            />
                          )}
                          {form.priority || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Client</p>
                        <p className="font-medium">
                          {form.clientName || "—"}
                          {form.clientCompany && ` (${form.clientCompany})`}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Received Date</p>
                        <p className="font-medium">
                          {form.received_date || "—"}
                        </p>
                      </div>
                    </div>

                    {(form.contactPerson ||
                      form.contactEmail ||
                      form.contactPhone) && (
                      <>
                        <Separator className="my-6" />
                        <h4 className="font-medium mb-3">
                          Contact Information
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {form.contactPerson && (
                            <div>
                              <p className="text-gray-600">Name</p>
                              <p className="font-medium">
                                {form.contactPerson}
                              </p>
                            </div>
                          )}
                          {form.contactEmail && (
                            <div>
                              <p className="text-gray-600">Email</p>
                              <p className="font-medium">{form.contactEmail}</p>
                            </div>
                          )}
                          {form.contactPhone && (
                            <div>
                              <p className="text-gray-600">Phone</p>
                              <p className="font-medium">{form.contactPhone}</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}

                    {form.notes && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <p className="text-gray-600 mb-2">Notes</p>
                          <p className="font-medium whitespace-pre-wrap">
                            {form.notes}
                          </p>
                        </div>
                      </>
                    )}

                    {form.uploadedFiles.length > 0 && (
                      <>
                        <Separator className="my-6" />
                        <div>
                          <p className="text-gray-600 mb-3">
                            Attached Files ({form.uploadedFiles.length})
                          </p>
                          <div className="flex flex-wrap gap-3">
                            {form.uploadedFiles.map((f, i) => (
                              <div
                                key={i}
                                className="bg-white px-4 py-2 rounded-lg border shadow-sm"
                              >
                                <p className="font-medium text-sm">
                                  {f.label || f.file.name}
                                </p>
                                {f.label && (
                                  <p className="text-xs text-gray-500">
                                    {f.file.name}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="flex justify-between mt-10 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={formStep === 2 ? prevStep : () => setShowForm(false)}
                >
                  {formStep === 2 ? "Back" : "Cancel"}
                </Button>

                <div className="flex gap-3">
                  {formStep === 1 && (
                    <Button onClick={nextStep} disabled={!form.name.trim()}>
                      Next Step
                    </Button>
                  )}
                  {formStep === 2 && (
                    <Button
                      onClick={submitProject}
                      className="bg-green-600 hover:bg-green-700"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Creating..." : "Create Project"}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* More Info Dialog */}
      {moreInfoProject && (
        <Dialog
          open={!!moreInfoProject}
          onOpenChange={() => setMoreInfoProject(null)}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">
                Add More Info — {moreInfoProject.project_id}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 mt-4">
              <div>
                <Label className="block text-sm font-medium mb-2">
                  Additional Files
                </Label>
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
                {moreInfoForm.files.length > 0 &&
                  moreInfoForm.files.map((uf, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 mt-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <Input
                        placeholder="Label (optional)"
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
                      <span className="text-sm text-slate-600 truncate">
                        {uf.file.name}
                      </span>
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
                        <X size={16} />
                      </Button>
                    </div>
                  ))}
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">Notes</Label>
                <Textarea
                  rows={3}
                  value={moreInfoForm.notes}
                  onChange={(e) =>
                    setMoreInfoForm((prev) => ({
                      ...prev,
                      notes: e.target.value,
                    }))
                  }
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <Label className="block text-sm font-medium mb-1">
                  Enquiry Details
                </Label>
                <Textarea
                  rows={4}
                  value={moreInfoForm.enquiry}
                  onChange={(e) =>
                    setMoreInfoForm((prev) => ({
                      ...prev,
                      enquiry: e.target.value,
                    }))
                  }
                  placeholder="Detailed enquiry information..."
                />
              </div>

              <div className="flex justify-end gap-3">
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
                  Submit Info
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
