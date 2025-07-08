import { useState } from "react";
import { Calculator, Clock, CheckCircle, AlertTriangle, TrendingUp, FileText, AlertCircle, User as UserIcon, Phone as PhoneIcon, Mail as MailIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { addDays, addMonths, addYears, format, parseISO, differenceInDays, differenceInMonths, differenceInYears, intervalToDuration } from 'date-fns';

const initialEstimators = ["Ahmed Al-Rashid", "Sarah Mohammed", "John Doe", "Jane Smith"];
const initialPMs = ["PM Team 1", "PM Team 2", "Sarah PM", "Ahmed PM"];

const initialProjects = [
  {
    id: "PRJ-2024-001",
    clientName: "Saudi Aramco",
    assignedEstimator: "Ahmed Al-Rashid",
    receivedDate: "2024-01-20",
    dueDate: "2024-02-05",
    status: "Draft",
    estimationStatus: "Draft",
    progress: 75,
    complexity: "High",
    estimatedValue: "2500000",
    clarificationLog: [],
    costEstimate: "",
    costEstimateFile: null,
    estimationPDF: null,
    expectedDuration: "",
    approvalDate: "",
    forwardedTo: "",
    remarks: "",
    updates: [],
    clientClarification: "",
    estimationSummarySent: false
  },
  {
    id: "PRJ-2024-002",
    clientName: "ADNOC",
    assignedEstimator: "Sarah Mohammed",
    receivedDate: "2024-01-25",
    dueDate: "2024-02-10",
    status: "Under Review",
    estimationStatus: "Under Review",
    progress: 100,
    complexity: "Medium",
    estimatedValue: "1800000",
    clarificationLog: [],
    costEstimate: "",
    costEstimateFile: null,
    estimationPDF: null,
    expectedDuration: "",
    approvalDate: "",
    forwardedTo: "",
    remarks: "",
    updates: [],
    clientClarification: "",
    estimationSummarySent: false
  }
];

export const EstimationDashboard = () => {
  const [projects, setProjects] = useState(initialProjects);
  const [selectedProject, setSelectedProject] = useState(null);
  const [clarificationText, setClarificationText] = useState("");
  const [updateText, setUpdateText] = useState("");
  const [estimators] = useState(initialEstimators);
  const [pms] = useState(initialPMs);
  const [rfcDetailsProject, setRfcDetailsProject] = useState(null);
  const [expectedDeadline, setExpectedDeadline] = useState("");
  const [sendToPM, setSendToPM] = useState(false);
  const [showReadyPrompt, setShowReadyPrompt] = useState(false);
  const [estimationFiles, setEstimationFiles] = useState([{ label: '', file: null }]);

  // Handlers for project modal fields
  const handleFieldChange = (field, value) => {
    setSelectedProject(p => ({ ...p, [field]: value }));
  };
  const handleFileChange = (field, e) => {
    setSelectedProject(p => ({ ...p, [field]: e.target.files[0] }));
  };
  const addClarification = () => {
    if (clarificationText.trim()) {
      setSelectedProject(p => ({
        ...p,
        clarificationLog: [
          { text: clarificationText, date: new Date().toISOString(), author: "Estimator" },
          ...(p.clarificationLog || [])
        ]
      }));
      setClarificationText("");
    }
  };
  const addUpdate = () => {
    if (updateText.trim()) {
      setSelectedProject(p => ({
        ...p,
        updates: [
          { text: updateText, date: new Date().toISOString(), author: "Estimator" },
          ...(p.updates || [])
        ]
      }));
      setUpdateText("");
    }
  };
  const handleEstimationFileChange = (idx, e) => {
    const file = e.target.files[0] || null;
    setEstimationFiles(files => files.map((uf, i) => i === idx ? { ...uf, file } : uf));
  };
  const handleEstimationLabelChange = (idx, e) => {
    const label = e.target.value;
    setEstimationFiles(files => files.map((uf, i) => i === idx ? { ...uf, label } : uf));
  };
  const addEstimationFileInput = () => {
    setEstimationFiles(files => [...files, { label: '', file: null }]);
  };
  const removeEstimationFileInput = (idx) => {
    setEstimationFiles(files => files.filter((_, i) => i !== idx));
  };
  const saveProject = () => {
    if (selectedProject.approvalDate && !sendToPM && selectedProject.status !== "Ready for Execution") {
      setShowReadyPrompt(true);
      setProjects(projects => projects.map(p =>
        p.id === selectedProject.id
          ? { ...selectedProject, expectedDeadline: selectedProject.expectedDeadline || expectedDeadline, estimationUploadedFiles: estimationFiles }
          : p
      ));
      setSelectedProject(null);
      setSendToPM(false);
      setExpectedDeadline("");
      setEstimationFiles([{ label: '', file: null }]);
      return;
    }
    setProjects(projects => projects.map(p =>
      p.id === selectedProject.id
        ? {
            ...selectedProject,
            expectedDeadline: selectedProject.expectedDeadline || expectedDeadline,
            status: sendToPM ? "Ready for Execution" : selectedProject.status,
            estimationUploadedFiles: estimationFiles
          }
        : p
    ));
    setSelectedProject(null);
    setSendToPM(false);
    setExpectedDeadline("");
    setEstimationFiles([{ label: '', file: null }]);
  };
  const markReadyForExecution = () => {
    setSelectedProject(p => ({ ...p, status: "Ready for Execution" }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Estimation Department</h1>
          <p className="text-slate-600 mt-1">Project cost estimation and analysis</p>
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
                <p className="text-2xl font-bold">8</p>
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
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-slate-600">Completed This Month</p>
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
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-slate-600">Due This Week</p>
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
                <p className="text-2xl font-bold">$12.8M</p>
                <p className="text-sm text-slate-600">Total Value</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.id}</CardTitle>
                  <p className="text-slate-600">{project.clientName}</p>
                </div>
                <Badge variant={project.status === "Ready for Execution" ? "success" : "secondary"}>
                  {project.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Estimator:</span>
                  <p className="font-medium">{project.assignedEstimator}</p>
                </div>
                <div>
                  <span className="text-slate-500">Due Date:</span>
                  <p className="font-medium">{new Date(project.dueDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-slate-500">Complexity:</span>
                  <Badge variant={project.complexity === "High" ? "destructive" : "outline"} className="text-xs">
                    {project.complexity}
                  </Badge>
                </div>
                <div>
                  <span className="text-slate-500">Est. Value:</span>
                  <p className="font-medium text-green-600">₹{project.estimatedValue}</p>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Progress</span>
                  <span className="text-sm font-medium">{project.progress}%</span>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1" onClick={() => setRfcDetailsProject(project)}>
                  View Details
                </Button>
                <Button size="sm" className="flex-1" onClick={() => setSelectedProject(project)}>
                  Continue Work
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Project Modal */}
      {selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-2 right-2" onClick={() => setSelectedProject(null)}><X /></button>
            <h2 className="text-xl font-bold mb-4">Estimation Workflow for {selectedProject.id}</h2>
            <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
              <div>
                <label className="block font-medium">Project ID</label>
                <Input value={selectedProject.id} disabled />
              </div>
              <div>
                <label className="block font-medium">Client Name</label>
                <Input value={selectedProject.clientName} disabled />
              </div>
              <div>
                <label className="block font-medium">Estimator Assigned</label>
                <Select value={selectedProject.assignedEstimator} onValueChange={v => handleFieldChange('assignedEstimator', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {estimators.map(e => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block font-medium">Estimation Status</label>
                <Select value={selectedProject.estimationStatus} onValueChange={v => handleFieldChange('estimationStatus', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Under Review">Under Review</SelectItem>
                    <SelectItem value="Sent to Client">Sent to Client</SelectItem>
                    <SelectItem value="Approved">Estimation Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block font-medium">Client Clarification Log</label>
                <div className="space-y-2 mb-2 max-h-24 overflow-y-auto">
                  {(selectedProject.clarificationLog || []).length === 0 && <div className="text-slate-400">No clarifications yet.</div>}
                  {(selectedProject.clarificationLog || []).map((u, i) => (
                    <div key={i} className="border rounded p-2 bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">{u.author} • {new Date(u.date).toLocaleString()}</div>
                      <div>{u.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add clarification..."
                    value={clarificationText}
                    onChange={e => setClarificationText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && clarificationText.trim()) { addClarification(); } }}
                  />
                  <Button onClick={addClarification} disabled={!clarificationText.trim()}>Add</Button>
                </div>
              </div>
              <div>
                <label className="block font-medium">Cost Estimate (₹)</label>
                <Input type="number" value={selectedProject.costEstimate} onChange={e => handleFieldChange('costEstimate', e.target.value)} />
              </div>
              <div>
                <label className="block font-medium">Cost Breakdown File (Excel/PDF)</label>
                <Input type="file" onChange={e => handleFileChange('costEstimateFile', e)} />
                {selectedProject.costEstimateFile && <span className="text-xs">{selectedProject.costEstimateFile.name}</span>}
              </div>
              <div>
                <label className="block font-medium">Estimation PDF Upload</label>
                <Input type="file" onChange={e => handleFileChange('estimationPDF', e)} />
                {selectedProject.estimationPDF && <span className="text-xs">{selectedProject.estimationPDF.name}</span>}
              </div>
              <div>
                <label className="block font-medium">Deadline</label>
                <Input
                  type="date"
                  value={selectedProject.expectedDeadline || expectedDeadline || ""}
                  onChange={e => {
                    handleFieldChange('expectedDeadline', e.target.value);
                    setExpectedDeadline(e.target.value);
                  }}
                  className="w-44"
                />
                {((selectedProject.expectedDeadline || expectedDeadline) && (selectedProject.expectedDeadline || expectedDeadline) !== "") && (() => {
                  const deadlineDate = parseISO(selectedProject.expectedDeadline || expectedDeadline);
                  const now = new Date();
                  const duration = intervalToDuration({ start: now, end: deadlineDate });
                  const parts = [];
                  if (duration.years) parts.push(`${duration.years} year${duration.years > 1 ? 's' : ''}`);
                  if (duration.months) parts.push(`${duration.months} month${duration.months > 1 ? 's' : ''}`);
                  if (duration.days) parts.push(`${duration.days} day${duration.days > 1 ? 's' : ''}`);
                  return (
                    <div className="mt-2 text-blue-700 font-medium bg-blue-50 rounded px-3 py-2 inline-block">
                      {parts.length > 0 ? `Time until deadline: ${parts.join(', ')}` : 'Deadline is today!'}
                    </div>
                  );
                })()}
              </div>
              <div>
                <label className="block font-medium">Approval Date</label>
                <div className="flex gap-2 items-center">
                  <Input
                    type="date"
                    value={selectedProject.approvalDate}
                    onChange={e => {
                      handleFieldChange('approvalDate', e.target.value);
                    }}
                  />
                  <Button
                    size="sm"
                    variant={selectedProject.approvalDate ? "success" : "outline"}
                    onClick={() => handleFieldChange('approvalDate', format(new Date(), 'yyyy-MM-dd'))}
                    disabled={!!selectedProject.approvalDate}
                  >
                    {selectedProject.approvalDate ? "Approved" : "Client Approved"}
                  </Button>
                </div>
              </div>
              {selectedProject.approvalDate && (
                <div className="flex items-center gap-2 mt-2">
                  <Switch id="sendToPM" checked={sendToPM} onCheckedChange={setSendToPM} />
                  <label htmlFor="sendToPM" className="text-sm">Send to Project Management Team</label>
                </div>
              )}
              <div>
                <label className="block font-medium">Forwarded To</label>
                <Select value={selectedProject.forwardedTo} onValueChange={v => handleFieldChange('forwardedTo', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {pms.map(pm => <SelectItem key={pm} value={pm}>{pm}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <label className="block font-medium">Remarks / Notes</label>
                <Input value={selectedProject.remarks} onChange={e => handleFieldChange('remarks', e.target.value)} />
              </div>
              <div className="col-span-2">
                <label className="block font-medium">Project Updates</label>
                <div className="space-y-2 mb-2 max-h-24 overflow-y-auto">
                  {(selectedProject.updates || []).length === 0 && <div className="text-slate-400">No updates yet.</div>}
                  {(selectedProject.updates || []).map((u, i) => (
                    <div key={i} className="border rounded p-2 bg-slate-50">
                      <div className="text-xs text-slate-500 mb-1">{u.author} • {new Date(u.date).toLocaleString()}</div>
                      <div>{u.text}</div>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mb-2">
                  <Input
                    placeholder="Add update..."
                    value={updateText}
                    onChange={e => setUpdateText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter' && updateText.trim()) { addUpdate(); } }}
                  />
                  <Button onClick={addUpdate} disabled={!updateText.trim()}>Add</Button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block font-medium mb-2">Upload Additional Documents</label>
                {estimationFiles.map((uf, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2">
                    <select
                      className="border rounded px-2 py-1 text-sm"
                      value={uf.label.startsWith('Other:') ? 'Other' : uf.label}
                      onChange={e => {
                        if (e.target.value === 'Other') {
                          handleEstimationLabelChange(idx, { target: { value: 'Other:' } });
                        } else {
                          handleEstimationLabelChange(idx, { target: { value: e.target.value } });
                        }
                      }}
                    >
                      <option value="">Select Label</option>
                      <option value="BOQ">BOQ</option>
                      <option value="Layout">Layout</option>
                      <option value="RFQ">RFQ</option>
                      <option value="Spec">Spec</option>
                      <option value="Drawing">Drawing</option>
                      <option value="Other">Other</option>
                    </select>
                    {uf.label.startsWith('Other:') && (
                      <input
                        type="text"
                        className="border rounded px-2 py-1 text-sm"
                        placeholder="Enter label"
                        value={uf.label.replace('Other:', '')}
                        onChange={e => handleEstimationLabelChange(idx, { target: { value: 'Other:' + e.target.value } })}
                        style={{ minWidth: 120 }}
                      />
                    )}
                    <input
                      type="file"
                      className="border rounded px-2 py-1 text-sm"
                      onChange={e => handleEstimationFileChange(idx, e)}
                    />
                    {estimationFiles.length > 1 && (
                      <Button size="icon" variant="ghost" onClick={() => removeEstimationFileInput(idx)}><X size={16} /></Button>
                    )}
                  </div>
                ))}
                <Button type="button" size="sm" variant="outline" onClick={addEstimationFileInput} className="mt-1">+ Add File</Button>
                <div className="mt-2">
                  <div className="font-medium text-slate-700 mb-1">Uploaded Files:</div>
                  <ul className="list-disc ml-8 space-y-1">
                    {estimationFiles.filter(f => f.file).length === 0 && <li className="text-slate-400">No files uploaded</li>}
                    {estimationFiles.filter(f => f.file).map((f, i) => (
                      <li key={i}><span className="font-medium text-slate-700">{f.label.startsWith('Other:') ? f.label.replace('Other:', '') : f.label ? `${f.label}: ` : ""}</span>{f.file?.name}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <Button variant="outline" onClick={saveProject}>Save</Button>
              <Button
                className={`bg-green-600 hover:bg-green-700 ${selectedProject.approvalDate ? '' : 'opacity-50 cursor-not-allowed'}`}
                onClick={markReadyForExecution}
                disabled={!selectedProject.approvalDate}
              >
                Mark as Ready for Execution
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* RFC Details Modal */}
      {rfcDetailsProject && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 relative overflow-y-auto max-h-[90vh]">
            <button className="absolute top-4 right-4" onClick={() => setRfcDetailsProject(null)}><X size={22} /></button>
            <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-5 flex items-center gap-3">
              <FileText size={28} className="text-white" />
              <h2 className="text-2xl font-bold text-white">RFC Team Data</h2>
              <span className="ml-auto text-white/80 font-mono text-sm">{rfcDetailsProject.id}</span>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div><span className="font-semibold text-slate-700">Client Name:</span><br/>{rfcDetailsProject.clientName}</div>
                <div><span className="font-semibold text-slate-700">Client Company:</span><br/>{rfcDetailsProject.clientCompany}</div>
                <div><span className="font-semibold text-slate-700">Location:</span><br/>{rfcDetailsProject.location}</div>
                <div><span className="font-semibold text-slate-700">Project Type:</span><br/>{rfcDetailsProject.projectType}</div>
                <div><span className="font-semibold text-slate-700">Received Date:</span><br/>{rfcDetailsProject.receivedDate}</div>
                <div><span className="font-semibold text-slate-700">Priority:</span><br/>{rfcDetailsProject.priority}</div>
                {rfcDetailsProject.deadline && <div><span className="font-semibold text-slate-700">Deadline:</span><br/>{rfcDetailsProject.deadline}</div>}
              </div>
              <div className="my-6 border-t pt-6 grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Contact Person:</span>
                  <span className="inline-flex items-center gap-1"><UserIcon size={18} className="text-blue-500" />{rfcDetailsProject.contactPerson}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Phone:</span>
                  <a
                    href={`tel:${rfcDetailsProject.contactPhone}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ textDecoration: 'none' }}
                  >
                    <PhoneIcon size={18} className="text-green-500" />
                    {rfcDetailsProject.contactPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Email:</span>
                  <a
                    href={`mailto:${rfcDetailsProject.contactEmail}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                    style={{ textDecoration: 'none' }}
                  >
                    <MailIcon size={18} className="text-rose-500" />
                    {rfcDetailsProject.contactEmail}
                  </a>
                </div>
              </div>
              <div className="my-6 border-t pt-6">
                <div className="bg-slate-100 rounded p-3 text-slate-800 min-h-[40px]">{rfcDetailsProject.notes || <span className="text-slate-400">No notes</span>}</div>
              </div>
              <div className="my-6 border-t pt-6">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2"><FileText size={18} className="text-blue-500" />Uploaded Files:</div>
                <ul className="list-disc ml-8 space-y-1">
                  {(rfcDetailsProject.uploadedFiles || []).filter(f => f.file).length === 0 && <li className="text-slate-400">No files uploaded</li>}
                  {(rfcDetailsProject.uploadedFiles || []).filter(f => f.file).map((f, i) => (
                    <li key={i}><span className="font-medium text-slate-700">{f.label ? `${f.label}: ` : ""}</span>{f.file?.name}</li>
                  ))}
                </ul>
              </div>
              <div className="my-6 border-t pt-6">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2"><AlertCircle size={18} className="text-yellow-500" />RFC Updates:</div>
                <div className="space-y-2">
                  {(rfcDetailsProject.updates || []).length === 0 && <div className="text-slate-400">No updates yet.</div>}
                  {(rfcDetailsProject.updates || []).map((u, i) => (
                    <div key={i} className="border rounded p-2 bg-white shadow-sm">
                      <div className="text-xs text-slate-500 mb-1">{u.author} • {new Date(u.date).toLocaleString()}</div>
                      <div>{u.text}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex justify-end mt-8">
                <Button variant="outline" onClick={() => setRfcDetailsProject(null)}>Close</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showReadyPrompt && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border border-green-400 rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
            <CheckCircle className="text-green-600 mb-2" size={40} />
            <div className="text-lg font-semibold mb-2 text-green-700">Client Approved!</div>
            <div className="mb-4 text-center text-slate-700">You have approved the client, but haven't forwarded the project to the Project Management Team.<br/>Please click <b>Mark as Ready for Execution</b> to continue.</div>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setShowReadyPrompt(false)}>OK</Button>
          </div>
        </div>
      )}
    </div>
  );
};
