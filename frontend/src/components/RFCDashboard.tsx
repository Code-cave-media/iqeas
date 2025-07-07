import { useState } from "react";
import {
  FileText,
  Upload,
  Search,
  Calendar,
  AlertCircle,
  Plus,
  X,
  CheckCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

function generateProjectId() {
  return `PRJ-${new Date().getFullYear()}-${Math.floor(
    Math.random() * 900 + 100
  )}`;
}

const initialForm = {
  projectId: "",
  clientName: "",
  clientCompany: "",
  location: "",
  projectType: "Pipeline",
  receivedDate: new Date().toISOString().slice(0, 10),
  uploadedFiles: [{ label: "", file: null }],
  contactPerson: "",
  contactPhone: "",
  contactEmail: "",
  notes: "",
  priority: "Normal",
  deadline: "",
};

export const RFCDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [projects, setProjects] = useState([
    {
      id: "PRJ-2024-001",
      clientName: "Saudi Aramco",
      clientCompany: "Saudi Aramco",
      location: "Riyadh",
      projectType: "Pipeline",
      receivedDate: "2024-01-15",
      uploadedFiles: [],
      contactPerson: "Ali Ahmed",
      contactPhone: "0501234567",
      contactEmail: "ali@aramco.com",
      notes: "Urgent project",
      status: "Data Collection",
      estimationStatus: "Not Started",
      priority: "High",
      documentsCount: 5,
      pendingClarifications: 2,
    },
    {
      id: "PRJ-2024-002",
      clientName: "ADNOC",
      clientCompany: "ADNOC",
      location: "Abu Dhabi",
      projectType: "Maintenance",
      receivedDate: "2024-01-20",
      uploadedFiles: [],
      contactPerson: "Sara Khalid",
      contactPhone: "0509876543",
      contactEmail: "sara@adnoc.com",
      notes: "",
      status: "Ready for Estimation",
      estimationStatus: "In Progress",
      priority: "Medium",
      documentsCount: 8,
      pendingClarifications: 0,
    },
  ]);
  const [formStep, setFormStep] = useState(1);
  const [sendToEstimation, setSendToEstimation] = useState(false);
  const [detailsProject, setDetailsProject] = useState(null);
  const [updateText, setUpdateText] = useState("");
  const [moreInfoProject, setMoreInfoProject] = useState(null);
  const [moreInfoFiles, setMoreInfoFiles] = useState([
    { label: "", file: null },
  ]);
  const [moreInfoNotes, setMoreInfoNotes] = useState("");
  const [moreInfoEnquiry, setMoreInfoEnquiry] = useState("");

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "uploadedFiles") {
      setForm({ ...form, uploadedFiles: Array.from(files) });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Update handleFormChange to handle labeled file inputs
  const handleFileChange = (idx, e) => {
    const file = e.target.files[0] || null;
    setForm((f) => {
      const uploadedFiles = f.uploadedFiles.map((uf, i) =>
        i === idx ? { ...uf, file } : uf
      );
      return { ...f, uploadedFiles };
    });
  };
  const handleLabelChange = (idx, e) => {
    const label = e.target.value;
    setForm((f) => {
      const uploadedFiles = f.uploadedFiles.map((uf, i) =>
        i === idx ? { ...uf, label } : uf
      );
      return { ...f, uploadedFiles };
    });
  };
  const addFileInput = () => {
    setForm((f) => ({
      ...f,
      uploadedFiles: [...f.uploadedFiles, { label: "", file: null }],
    }));
  };
  const removeFileInput = (idx) => {
    setForm((f) => ({
      ...f,
      uploadedFiles: f.uploadedFiles.filter((_, i) => i !== idx),
    }));
  };

  // Start new project entry
  const startNewProject = () => {
    setForm({
      ...initialForm,
      projectId: generateProjectId(),
      receivedDate: new Date().toISOString().slice(0, 10),
    });
    setFormStep(1);
    setShowForm(true);
  };

  // Go to next step
  const nextStep = () => setFormStep((s) => s + 1);
  const prevStep = () => setFormStep((s) => s - 1);

  // Submit new project
  const submitProject = (sendToEstimationNow = false) => {
    setProjects([
      {
        id: form.projectId,
        clientName: form.clientName,
        clientCompany: form.clientCompany,
        location: form.location,
        projectType: form.projectType,
        receivedDate: form.receivedDate,
        uploadedFiles: form.uploadedFiles,
        contactPerson: form.contactPerson,
        contactPhone: form.contactPhone,
        contactEmail: form.contactEmail,
        notes: form.notes,
        status: sendToEstimationNow
          ? "Ready for Estimation"
          : "Data Collection",
        estimationStatus: sendToEstimationNow ? "In Progress" : "Not Started",
        priority: form.priority,
        deadline: form.deadline,
        documentsCount: form.uploadedFiles.filter((f) => f.file).length,
        pendingClarifications: 0,
        updates: [],
      },
      ...projects,
    ]);
    setShowForm(false);
    setSendToEstimation(false);
  };

  // Mark as Ready for Estimation
  const markReadyForEstimation = (id) => {
    setProjects(
      projects.map((p) =>
        p.id === id
          ? {
              ...p,
              status: "Ready for Estimation",
              estimationStatus: "In Progress",
            }
          : p
      )
    );
  };

  // Update notes
  const updateNotes = (id, notes) => {
    setProjects(projects.map((p) => (p.id === id ? { ...p, notes } : p)));
  };

  // Filtered projects
  const filteredProjects = projects.filter(
    (project) =>
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Add function to add a new update to a project
  const addProjectUpdate = (projectId, text) => {
    setProjects((projects) =>
      projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              updates: [
                { text, date: new Date().toISOString(), author: "RFC User" },
                ...(p.updates || []),
              ],
            }
          : p
      )
    );
    setUpdateText("");
  };

  // Add handlers for more info modal
  const handleMoreInfoFileChange = (idx, e) => {
    const file = e.target.files[0] || null;
    setMoreInfoFiles((files) =>
      files.map((uf, i) => (i === idx ? { ...uf, file } : uf))
    );
  };
  const handleMoreInfoLabelChange = (idx, e) => {
    const label = e.target.value;
    setMoreInfoFiles((files) =>
      files.map((uf, i) => (i === idx ? { ...uf, label } : uf))
    );
  };
  const addMoreInfoFileInput = () => {
    setMoreInfoFiles((files) => [...files, { label: "", file: null }]);
  };
  const removeMoreInfoFileInput = (idx) => {
    setMoreInfoFiles((files) => files.filter((_, i) => i !== idx));
  };
  const submitMoreInfo = () => {
    setProjects((projects) =>
      projects.map((p) =>
        p.id === moreInfoProject.id
          ? {
              ...p,
              uploadedFiles: [
                ...p.uploadedFiles,
                ...moreInfoFiles.filter((f) => f.file),
              ],
              updates: [
                ...(moreInfoNotes.trim()
                  ? [
                      {
                        text: `Note: ${moreInfoNotes}`,
                        date: new Date().toISOString(),
                        author: "RFC User",
                      },
                    ]
                  : []),
                ...(moreInfoEnquiry.trim()
                  ? [
                      {
                        text: `Enquiry: ${moreInfoEnquiry}`,
                        date: new Date().toISOString(),
                        author: "RFC User",
                      },
                    ]
                  : []),
                ...(p.updates || []),
              ],
            }
          : p
      )
    );
    setMoreInfoProject(null);
    setMoreInfoFiles([{ label: "", file: null }]);
    setMoreInfoNotes("");
    setMoreInfoEnquiry("");
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            RFC Team Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage client requests and project initiation
          </p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={startNewProject}
        >
          <Plus size={18} className="mr-2" />
          Add New Project
        </Button>
      </div>

      {/* Modal/Form for New Project */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
            <button
              className="absolute top-2 right-2"
              onClick={() => setShowForm(false)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Add New Project</h2>
            {/* Stepper */}
            <div className="flex mb-6 space-x-4">
              <div
                className={`flex-1 text-center ${
                  formStep === 1 ? "font-bold text-blue-600" : "text-slate-500"
                }`}
              >
                1. Data Collection
              </div>
              <div
                className={`flex-1 text-center ${
                  formStep === 2 ? "font-bold text-blue-600" : "text-slate-500"
                }`}
              >
                2. Review & Confirm
              </div>
            </div>
            {formStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium">
                      Received Date
                    </label>
                    <Input
                      name="receivedDate"
                      value={form.receivedDate}
                      disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Client Name
                    </label>
                    <Input
                      name="clientName"
                      value={form.clientName}
                      onChange={handleFormChange}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Client Company
                    </label>
                    <Input
                      name="clientCompany"
                      value={form.clientCompany}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Location
                    </label>
                    <Input
                      name="location"
                      value={form.location}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Project Type
                    </label>
                    <Select
                      value={form.projectType}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, projectType: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pipeline">Pipeline</SelectItem>
                        <SelectItem value="Plant">Plant</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Priority
                    </label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) =>
                        setForm((f) => ({ ...f, priority: v }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.priority && (
                    <div>
                      <label className="block text-sm font-medium">
                        Deadline (optional)
                      </label>
                      <Input
                        type="date"
                        value={form.deadline}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, deadline: e.target.value }))
                        }
                      />
                    </div>
                  )}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-2">
                      Uploaded Files
                    </label>
                    {form.uploadedFiles.map((uf, idx) => (
                      <div key={idx} className="flex items-center gap-2 mb-2">
                        <select
                          className="border rounded px-2 py-1 text-sm"
                          value={uf.label}
                          onChange={(e) => handleLabelChange(idx, e)}
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
                          onChange={(e) => handleFileChange(idx, e)}
                        />
                        {form.uploadedFiles.length > 1 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => removeFileInput(idx)}
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
                      onClick={addFileInput}
                      className="mt-1"
                    >
                      + Add File
                    </Button>
                  </div>
                  <div>
                    <label className="block text-sm font-medium">
                      Contact Person
                    </label>
                    <Input
                      name="contactPerson"
                      value={form.contactPerson}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Phone</label>
                    <Input
                      name="contactPhone"
                      value={form.contactPhone}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium">Email</label>
                    <Input
                      name="contactEmail"
                      value={form.contactEmail}
                      onChange={handleFormChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium">Notes</label>
                    <Input
                      name="notes"
                      value={form.notes}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-4">
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
                <h3 className="font-semibold mb-2">Review Project Data</h3>
                <div className="bg-slate-50 p-4 rounded mb-4 text-sm space-y-2">
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
                    <strong>Received Date:</strong> {form.receivedDate}
                  </div>
                  <div>
                    <strong>Priority:</strong> {form.priority}
                  </div>
                  {form.deadline && (
                    <div>
                      <strong>Deadline:</strong> {form.deadline}
                    </div>
                  )}
                  <div>
                    <strong>Contact Person:</strong> {form.contactPerson}
                  </div>
                  <div>
                    <strong>Phone:</strong> {form.contactPhone}
                  </div>
                  <div>
                    <strong>Email:</strong> {form.contactEmail}
                  </div>
                  {form.notes && <div>{form.notes}</div>}
                  <div>
                    <strong>Uploaded Files:</strong>
                    <ul className="list-disc ml-6">
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
                <div className="flex items-center gap-2 mb-4">
                  <Switch
                    id="sendToEstimation"
                    checked={sendToEstimation}
                    onCheckedChange={setSendToEstimation}
                  />
                  <label htmlFor="sendToEstimation" className="text-sm">
                    Send to Estimation Department now
                  </label>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={prevStep}>
                    Back
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => submitProject(sendToEstimation)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{projects.length}</p>
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
                  {
                    projects.filter((p) => p.status === "Ready for Estimation")
                      .length
                  }
                </p>
                <p className="text-sm text-slate-600">Ready for Estimation</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle size={20} className="text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce(
                    (a, p) => a + (p.pendingClarifications || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-slate-600">Pending Clarifications</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <Upload size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">
                  {projects.reduce(
                    (a, p) =>
                      a + (p.uploadedFiles?.length || p.documentsCount || 0),
                    0
                  )}
                </p>
                <p className="text-sm text-slate-600">Documents Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
          />
          <Input
            placeholder="Search RFQs by client name or project ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* RFQ Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project) => (
          <Card
            key={project.id}
            className="hover:shadow-lg transition-shadow cursor-pointer"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.id}</CardTitle>
                  <p className="text-slate-600">{project.clientName}</p>
                </div>
                <Badge
                  variant={
                    project.priority === "High" ? "destructive" : "secondary"
                  }
                >
                  {project.priority}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">RFQ Received:</span>
                  <span className="text-sm font-medium">
                    {new Date(project.receivedDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Status:</span>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Estimation:</span>
                  <Badge variant="outline">{project.estimationStatus}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-slate-500">Documents:</span>
                  <span className="text-sm font-medium">
                    {Array.isArray(project.uploadedFiles)
                      ? project.uploadedFiles.filter((f) => f.file).length
                      : project.uploadedFiles?.length || project.documentsCount}
                  </span>
                </div>
                {project.pendingClarifications > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Pending:</span>
                    <Badge variant="destructive" className="text-xs">
                      {project.pendingClarifications} clarifications
                    </Badge>
                  </div>
                )}
                {project.deadline && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-500">Deadline:</span>
                    <span className="text-sm font-medium">
                      {new Date(project.deadline).toLocaleDateString()}
                    </span>
                  </div>
                )}
                <div className="flex flex-col gap-2 mt-2">
                  {/* <label className="text-xs text-slate-500">Notes:</label> */}
                  {project.notes && <div>{project.notes}</div>}
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                {project.status !== "Ready for Estimation" && (
                  <Button
                    size="sm"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                    onClick={() => markReadyForEstimation(project.id)}
                  >
                    Mark as Ready for Estimation
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setMoreInfoProject(project)}
                >
                  Add More Info
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Details View Modal */}
      {detailsProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2"
              onClick={() => setDetailsProject(null)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">Project Details</h2>
            <div className="space-y-2 text-sm mb-6">
              <div>
                <strong>Project ID:</strong> {detailsProject.id}
              </div>
              <div>
                <strong>Client Name:</strong> {detailsProject.clientName}
              </div>
              <div>
                <strong>Client Company:</strong> {detailsProject.clientCompany}
              </div>
              <div>
                <strong>Location:</strong> {detailsProject.location}
              </div>
              <div>
                <strong>Project Type:</strong> {detailsProject.projectType}
              </div>
              <div>
                <strong>Received Date:</strong> {detailsProject.receivedDate}
              </div>
              <div>
                <strong>Priority:</strong> {detailsProject.priority}
              </div>
              {detailsProject.deadline && (
                <div>
                  <strong>Deadline:</strong> {detailsProject.deadline}
                </div>
              )}
              <div>
                <strong>Status:</strong> {detailsProject.status}
              </div>
              <div>
                <strong>Estimation Status:</strong>{" "}
                {detailsProject.estimationStatus}
              </div>
              <div>
                <strong>Contact Person:</strong> {detailsProject.contactPerson}
              </div>
              <div>
                <strong>Phone:</strong> {detailsProject.contactPhone}
              </div>
              <div>
                <strong>Email:</strong> {detailsProject.contactEmail}
              </div>
              {detailsProject.notes && <div>{detailsProject.notes}</div>}
              <div>
                <strong>Uploaded Files:</strong>
                <ul className="list-disc ml-6">
                  {(detailsProject.uploadedFiles || [])
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
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Project Updates</h3>
              <div className="space-y-2 mb-2 max-h-40 overflow-y-auto">
                {(detailsProject.updates || []).length === 0 && (
                  <div className="text-slate-400">No updates yet.</div>
                )}
                {(detailsProject.updates || []).map((u, i) => (
                  <div key={i} className="border rounded p-2 bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">
                      {u.author} • {new Date(u.date).toLocaleString()}
                    </div>
                    <div>{u.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add new update..."
                  value={updateText}
                  onChange={(e) => setUpdateText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && updateText.trim()) {
                      addProjectUpdate(detailsProject.id, updateText);
                    }
                  }}
                />
                <Button
                  onClick={() =>
                    updateText.trim() &&
                    addProjectUpdate(detailsProject.id, updateText)
                  }
                  disabled={!updateText.trim()}
                >
                  Add
                </Button>
              </div>
            </div>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setDetailsProject(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* More Info Modal */}
      {moreInfoProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 right-2"
              onClick={() => setMoreInfoProject(null)}
            >
              <X />
            </button>
            <h2 className="text-xl font-bold mb-4">
              Add More Info to {moreInfoProject.id}
            </h2>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">
                Upload Additional Files
              </label>
              {moreInfoFiles.map((uf, idx) => (
                <div key={idx} className="flex items-center gap-2 mb-2">
                  <select
                    className="border rounded px-2 py-1 text-sm"
                    value={uf.label}
                    onChange={(e) => handleMoreInfoLabelChange(idx, e)}
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
                    onChange={(e) => handleMoreInfoFileChange(idx, e)}
                  />
                  {moreInfoFiles.length > 1 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeMoreInfoFileInput(idx)}
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
                onClick={addMoreInfoFileInput}
                className="mt-1"
              >
                + Add File
              </Button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add Notes
              </label>
              <textarea
                className="border rounded w-full p-2 text-sm"
                rows={2}
                value={moreInfoNotes}
                onChange={(e) => setMoreInfoNotes(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Add Enquiry
              </label>
              <textarea
                className="border rounded w-full p-2 text-sm"
                rows={2}
                value={moreInfoEnquiry}
                onChange={(e) => setMoreInfoEnquiry(e.target.value)}
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
                className="bg-blue-600 hover:bg-blue-700"
                onClick={submitMoreInfo}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
