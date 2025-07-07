import React, { useState } from "react";
import { FileText, Upload, Download, Eye, Archive, Folder, Lock, CheckCircle2, ArrowRight, RefreshCcw, Send, MessageCircle, FilePlus2, FileCheck2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const mockProjects = [
  { id: "PRJ-1024", client: "Al Wajeeh", stage: "IDC", status: "Awaiting Docs Approval" },
  { id: "PRJ-1025", client: "Delta Oil", stage: "IFR", status: "Approved" },
  { id: "PRJ-1026", client: "Petro Gulf", stage: "IFA", status: "In Progress" },
];

const STAGES = ["IDC", "IFR", "IFA", "AFC"];

// Mock deliverables per stage
const mockDeliverables = {
  IDC: [
    { name: "Pipe GA Z1", version: "v1.1", submittedBy: "Anand", date: "2024-07-02", status: "Awaiting Review" },
    { name: "Cable Tray Layout", version: "v1.0", submittedBy: "James", date: "2024-07-01", status: "Returned" },
  ],
  IFR: [
    { name: "P&ID Update", version: "v2.0", submittedBy: "Priya", date: "2024-07-03", status: "Awaiting Review" },
  ],
  IFA: [
    { name: "Civil GA Drawing", version: "v1.2", submittedBy: "Rahul", date: "2024-07-04", status: "In Progress" },
  ],
  AFC: [],
};

// Mock data for dashboard widgets
const dashboardStats = [
  { label: "Projects Awaiting Review", value: 3, icon: <Eye className="text-blue-600" /> },
  { label: "Pending Client Feedback", value: 4, icon: <MessageCircle className="text-yellow-600" /> },
  { label: "Returned to PM/Design", value: 2, icon: <RefreshCcw className="text-red-600" /> },
  { label: "Final Approved Docs (AFC)", value: 6, icon: <CheckCircle2 className="text-green-600" /> },
];

// Mock returned files
const returnedFiles = [
  { deliverable: "Lighting Layout", stage: "IDC", reason: "Missing spec sheet", date: "2024-07-02", status: "Awaiting Resubmission" },
];

// Mock outgoing submissions
const outgoingSubmissions = [
  { project: "PRJ-1010", stage: "IFR", deliverables: 3, sentOn: "2024-07-03", status: "Awaiting Reply" },
];

// Mock client log
const clientLog = [
  { project: "PRJ-1010", contact: "Mr. Kareem", summary: "Client approved SLD", date: "2024-07-03" },
  { project: "PRJ-1012", contact: "Ms. Fatima", summary: "Requested revised BOQ", date: "2024-07-01" },
];

// Mock document register
const documentRegister = [
  { project: "PRJ-1010", deliverable: "Main SLD", stage: "IFR", version: "v1.2", status: "Approved", approvedOn: "2024-07-04" },
];

// Add mock data for deliverables and last submission
const reviewerProjects = [
  { id: "PRJ-1010", client: "Al Wajeeh", stage: "IFR", status: "Awaiting Review", deliverables: 5, pending: 2, lastSubmission: "2024-07-03" },
  { id: "PRJ-1011", client: "Delta Oil", stage: "IDC", status: "Returned", deliverables: 3, pending: 1, lastSubmission: "2024-07-02" },
  { id: "PRJ-1012", client: "Petro Gulf", stage: "AFC", status: "Approved", deliverables: 7, pending: 0, lastSubmission: "2024-07-01" },
];

interface DocumentationDashboardProps {
  userRole: string;
}

export const DocumentationDashboard = ({ userRole }: DocumentationDashboardProps) => {
  const [tab, setTab] = useState("projects");
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [viewProject, setViewProject] = useState<null | typeof mockProjects[0]>(null);
  const [activeStage, setActiveStage] = useState<string | null>(null);
  const [reviewDeliverable, setReviewDeliverable] = useState(null);
  const [selectedExistingFiles, setSelectedExistingFiles] = useState([]);

  const documents = [
    {
      id: "DOC-001",
      projectId: "PRJ-2024-001",
      clientName: "Saudi Aramco",
      fileName: "Technical_Specifications_v2.pdf",
      type: "Technical Drawing",
      uploadedBy: "Ahmed Al-Rashid",
      uploadDate: "2024-02-01",
      version: "2.0",
      status: "Approved",
      size: "2.4 MB"
    },
    {
      id: "DOC-002",
      projectId: "PRJ-2024-001", 
      clientName: "Saudi Aramco",
      fileName: "Site_Survey_Report.docx",
      type: "Report",
      uploadedBy: "Sarah Mohammed",
      uploadDate: "2024-02-03",
      version: "1.0",
      status: "Under Review",
      size: "1.8 MB"
    },
    {
      id: "DOC-003",
      projectId: "PRJ-2024-002",
      clientName: "ADNOC",
      fileName: "Client_RFQ_Original.pdf",
      type: "Client Document",
      uploadedBy: "RFC Team",
      uploadDate: "2024-01-25",
      version: "1.0", 
      status: "Final",
      size: "3.2 MB"
    }
  ];

  // For demo: Only unlock up to the current stage
  const getStageStatus = (project, stage) => {
    const currentIdx = STAGES.indexOf(project.stage);
    const idx = STAGES.indexOf(stage);
    if (idx < currentIdx) return "approved";
    if (idx === currentIdx) return "unlocked";
    return "locked";
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Dashboard Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {dashboardStats.map(stat => (
          <div key={stat.label} className="bg-white rounded-xl shadow flex items-center gap-3 p-4 border border-blue-50">
            <div className="p-2 bg-blue-50 rounded-lg">{stat.icon}</div>
            <div>
              <div className="text-2xl font-bold text-blue-900">{stat.value}</div>
              <div className="text-sm text-slate-600">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Tabs Navigation */}
      <Tabs value={tab} onValueChange={setTab} className="mb-8">
        <TabsList className="bg-blue-50">
          <TabsTrigger value="projects">All Projects</TabsTrigger>
          <TabsTrigger value="returned">Returned Files</TabsTrigger>
          <TabsTrigger value="outgoing">Sent to Client</TabsTrigger>
          <TabsTrigger value="clientlog">Client Log</TabsTrigger>
          <TabsTrigger value="register">Document Register</TabsTrigger>
        </TabsList>
        {/* All Projects Tab */}
        <TabsContent value="projects">
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">All Projects (Document Reviewer View)</h2>
            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Client</label>
                <select className="border rounded px-2 py-1 text-sm" defaultValue="all">
                  <option value="all">All</option>
                  {[...new Set(reviewerProjects.map(p => p.client))].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Stage</label>
                <select className="border rounded px-2 py-1 text-sm" defaultValue="all">
                  <option value="all">All</option>
                  {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Status</label>
                <select className="border rounded px-2 py-1 text-sm" defaultValue="all">
                  <option value="all">All</option>
                  {[...new Set(reviewerProjects.map(p => p.status))].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <table className="min-w-full bg-white rounded-xl border">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-4 py-3 text-left">Project ID</th>
                  <th className="px-4 py-3 text-left">Client</th>
                  <th className="px-4 py-3 text-left">Current Stage</th>
                  <th className="px-4 py-3 text-left">Submission Status</th>
                  <th className="px-4 py-3 text-left"># Deliverables</th>
                  <th className="px-4 py-3 text-left"># Pending Review</th>
                  <th className="px-4 py-3 text-left">Last Submission</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {reviewerProjects.map((p) => (
                  <tr key={p.id} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{p.id}</td>
                    <td className="px-4 py-3">{p.client}</td>
                    <td className="px-4 py-3">{p.stage}</td>
                    <td className="px-4 py-3">{p.status}</td>
                    <td className="px-4 py-3">{p.deliverables}</td>
                    <td className="px-4 py-3">{p.pending}</td>
                    <td className="px-4 py-3">{p.lastSubmission}</td>
                    <td className="px-4 py-3 text-center">
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4" onClick={() => { setViewProject(p); setActiveStage(null); }}>
                        <Eye className="w-4 h-4 mr-1" /> Review
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        {/* Returned Files Tab */}
        <TabsContent value="returned">
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Returned Files</h2>
            <table className="min-w-full bg-white rounded-xl border">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-4 py-3 text-left">Deliverable</th>
                  <th className="px-4 py-3 text-left">Stage</th>
                  <th className="px-4 py-3 text-left">Reason</th>
                  <th className="px-4 py-3 text-left">Date Returned</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {returnedFiles.map((f, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{f.deliverable}</td>
                    <td className="px-4 py-3">{f.stage}</td>
                    <td className="px-4 py-3">{f.reason}</td>
                    <td className="px-4 py-3">{f.date}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-yellow-100 text-yellow-700">{f.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        {/* Outgoing Submissions Tab */}
        <TabsContent value="outgoing">
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Sent to Client</h2>
            <table className="min-w-full bg-white rounded-xl border">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-4 py-3 text-left">Project</th>
                  <th className="px-4 py-3 text-left">Stage</th>
                  <th className="px-4 py-3 text-left">Deliverables</th>
                  <th className="px-4 py-3 text-left">Sent On</th>
                  <th className="px-4 py-3 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {outgoingSubmissions.map((o, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{o.project}</td>
                    <td className="px-4 py-3">{o.stage}</td>
                    <td className="px-4 py-3">{o.deliverables} docs</td>
                    <td className="px-4 py-3">{o.sentOn}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-yellow-100 text-yellow-700">{o.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        {/* Client Log Tab */}
        <TabsContent value="clientlog">
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Client Interaction Log</h2>
            <table className="min-w-full bg-white rounded-xl border">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-4 py-3 text-left">Project</th>
                  <th className="px-4 py-3 text-left">Contact Person</th>
                  <th className="px-4 py-3 text-left">Summary</th>
                  <th className="px-4 py-3 text-left">Date</th>
                </tr>
              </thead>
              <tbody>
                {clientLog.map((c, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{c.project}</td>
                    <td className="px-4 py-3">{c.contact}</td>
                    <td className="px-4 py-3">{c.summary}</td>
                    <td className="px-4 py-3">{c.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
        {/* Document Register Tab */}
        <TabsContent value="register">
          <div className="bg-white rounded-xl shadow border border-blue-100 p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-4">Document Register</h2>
            <table className="min-w-full bg-white rounded-xl border">
              <thead>
                <tr className="bg-blue-50 text-blue-900">
                  <th className="px-4 py-3 text-left">Project</th>
                  <th className="px-4 py-3 text-left">Deliverable</th>
                  <th className="px-4 py-3 text-left">Stage</th>
                  <th className="px-4 py-3 text-left">Version</th>
                  <th className="px-4 py-3 text-left">Final Status</th>
                  <th className="px-4 py-3 text-left">Approved On</th>
                </tr>
              </thead>
              <tbody>
                {documentRegister.map((d, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition">
                    <td className="px-4 py-3 font-medium text-slate-800">{d.project}</td>
                    <td className="px-4 py-3">{d.deliverable}</td>
                    <td className="px-4 py-3">{d.stage}</td>
                    <td className="px-4 py-3">{d.version}</td>
                    <td className="px-4 py-3">
                      <Badge className="bg-green-100 text-green-700">{d.status}</Badge>
                    </td>
                    <td className="px-4 py-3">{d.approvedOn}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
      {/* Stage-wise Review Panel Modal */}
      {viewProject && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row p-0 relative overflow-y-auto rounded-2xl shadow-2xl bg-gradient-to-br from-slate-50 via-white to-blue-50 border border-blue-100">
            <button className="absolute top-3 right-3 text-slate-400 hover:text-blue-600 z-10 text-2xl font-bold" style={{right: 24, top: 24}} onClick={() => { setViewProject(null); setActiveStage(null); setReviewDeliverable(null); }}>&times;</button>
            {/* Left: Project Info & Stages */}
            <div className="md:w-1/3 w-full p-4 flex flex-col gap-4 min-w-[240px] min-h-0">
              {/* Project Info Card */}
              <Card className="mb-2 shadow-md border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Folder className="text-blue-600 w-5 h-5" />
                    <span className="text-lg font-bold text-blue-800 break-words">{viewProject.id} – {viewProject.client}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm mb-1">
                    <span className="text-slate-600">Current Stage:</span>
                    <Badge className="bg-blue-100 text-blue-700 font-semibold">{viewProject.stage}</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm">
                    <span className="text-slate-600">Status:</span>
                    <Badge className="bg-yellow-100 text-yellow-700 font-semibold">{viewProject.status}</Badge>
                  </div>
                </CardContent>
              </Card>
              {/* Stage Navigation Card */}
              <Card className="flex-1 shadow-md border-blue-200">
                <CardContent className="p-4 flex flex-col gap-3 min-w-0">
                  {STAGES.map(stage => {
                    const status = getStageStatus(viewProject, stage);
                    let cardClass = "flex items-center gap-3 p-3 rounded-lg border-2 min-w-0 transition-all ";
                    let icon = null;
                    let badge = null;
                    if (status === "approved") {
                      cardClass += "border-green-300 bg-green-50 text-green-700 hover:bg-green-100";
                      icon = <CheckCircle2 className="w-5 h-5 text-green-600" />;
                      badge = <Badge className="bg-green-100 text-green-700 ml-auto">Approved</Badge>;
                    } else if (status === "unlocked") {
                      cardClass += "border-blue-400 bg-blue-50 text-blue-800 cursor-pointer hover:bg-blue-100";
                      icon = <ArrowRight className="w-5 h-5 text-blue-600" />;
                      badge = <Badge className="bg-blue-100 text-blue-700 ml-auto">Active</Badge>;
                    } else {
                      cardClass += "border-slate-200 bg-slate-100 text-slate-400 opacity-60";
                      icon = <Lock className="w-5 h-5" />;
                      badge = <Badge className="bg-slate-200 text-slate-500 ml-auto">Locked</Badge>;
                    }
                    return (
                      <div
                        key={stage}
                        className={cardClass}
                        onClick={() => status === "unlocked" ? setActiveStage(stage) : undefined}
                        style={{ pointerEvents: status === "unlocked" ? 'auto' : 'none' }}
                      >
                        {icon}
                        <div className="font-bold text-base truncate">{stage}</div>
                        {badge}
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
              {/* Back Button */}
              <Button variant="outline" className="w-full mt-2 font-semibold text-blue-700 border-blue-300 hover:bg-blue-50" onClick={() => { setViewProject(null); setActiveStage(null); setReviewDeliverable(null); }}>
                <ArrowRight className="w-4 h-4 mr-1" /> Back to Dashboard
              </Button>
            </div>
            {/* Right: Deliverables Section */}
            <div className="md:w-2/3 w-full p-6 flex flex-col bg-white min-w-0 min-h-0 gap-4">
              {activeStage && (
                <Card className="shadow-lg border-blue-200 flex-1 flex flex-col">
                  <CardHeader className="flex flex-row items-center gap-2 border-b-2 border-blue-100 bg-gradient-to-r from-blue-50 to-white rounded-t-2xl">
                    <FileText className="text-blue-600 w-6 h-6" />
                    <CardTitle className="text-blue-800 text-xl font-bold tracking-wide">{activeStage} Deliverables</CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col p-4">
                    <div className="overflow-x-auto mt-2 rounded-xl">
                      <table className="min-w-full bg-white rounded-xl shadow border">
                        <thead className="bg-blue-100 z-10">
                          <tr className="text-blue-900">
                            <th className="px-4 py-2 text-left font-semibold">Deliverable</th>
                            <th className="px-4 py-2 text-left font-semibold">Draft Version</th>
                            <th className="px-4 py-2 text-left font-semibold">Submitted By</th>
                            <th className="px-4 py-2 text-left font-semibold">Upload Date</th>
                            <th className="px-4 py-2 text-left font-semibold">Status</th>
                            <th className="px-4 py-2 text-center font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(mockDeliverables[activeStage] || []).length === 0 ? (
                            <tr><td colSpan={6} className="text-center text-slate-400 py-4">No deliverables for this stage.</td></tr>
                          ) : (
                            mockDeliverables[activeStage].map((d, idx) => (
                              <tr key={d.name + d.version} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                                <td className="px-4 py-2 font-medium text-slate-800 rounded-l-xl">{d.name}</td>
                                <td className="px-4 py-2">{d.version}</td>
                                <td className="px-4 py-2">{d.submittedBy}</td>
                                <td className="px-4 py-2">{d.date}</td>
                                <td className="px-4 py-2">
                                  <Badge className={
                                    d.status === 'Awaiting Review' ? 'bg-yellow-100 text-yellow-700' :
                                    d.status === 'Returned' ? 'bg-red-100 text-red-700' :
                                    d.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                                    'bg-green-100 text-green-700'
                                  }>{d.status}</Badge>
                                </td>
                                <td className="px-4 py-2 text-center rounded-r-xl">
                                  {userRole === "PM Team" && (
                                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md" onClick={() => setReviewDeliverable(d)}>
                                      <FileText className="w-4 h-4 mr-1" /> Review / Submit
                                    </Button>
                                  )}
                                  {userRole === "Documentation Team" && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold shadow-md" onClick={() => setReviewDeliverable(d)}>
                                      <CheckCircle2 className="w-4 h-4 mr-1" /> Review
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                    <Button variant="outline" className="mt-6 w-40 font-semibold text-blue-700 border-blue-300 hover:bg-blue-50" onClick={() => setActiveStage(null)}>
                      <ArrowRight className="w-4 h-4 mr-1" /> Back to Stages
                    </Button>
                  </CardContent>
                </Card>
              )}
              {!activeStage && (
                <Card className="flex flex-col items-center justify-center h-full text-slate-400 shadow-md border-blue-200">
                  <CardContent className="flex flex-col items-center justify-center p-8">
                    <span className="text-lg font-semibold">Select a stage to view deliverables.</span>
                  </CardContent>
                </Card>
              )}
            </div>
            {/* Review Deliverable Modal (overlay) */}
            {reviewDeliverable && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-60">
                <Card className="w-full max-w-lg shadow-2xl rounded-2xl relative">
                  <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-blue-50 to-white rounded-t-2xl border-b border-blue-100 p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="text-blue-600 w-6 h-6" />
                      <CardTitle className="text-blue-800 text-lg font-bold">Review: {reviewDeliverable.name} ({reviewDeliverable.version})</CardTitle>
                    </div>
                    <button className="text-slate-400 hover:text-blue-600 text-2xl font-bold" onClick={() => setReviewDeliverable(null)}>&times;</button>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    {/* Internal Notes Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="text-blue-500 w-4 h-4" />
                        <span className="text-base font-semibold text-blue-900">Internal Notes</span>
                      </div>
                      <textarea className="w-full border rounded p-2 bg-slate-50 focus:bg-white" rows={3} placeholder="Add internal notes..." />
                    </div>
                    {/* Attachments Section */}
                    <div className="bg-slate-50 border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Upload className="text-blue-500 w-4 h-4" />
                        <span className="text-base font-semibold text-blue-900">Attachments</span>
                      </div>
                      {/* Existing Files */}
                      <div className="mb-3">
                        <div className="text-sm font-medium mb-1 text-slate-700">Select from Existing Files</div>
                        <div className="flex flex-wrap gap-2">
                          {documents.map(doc => (
                            <label key={doc.id} className={`flex items-center gap-1 px-2 py-1 rounded cursor-pointer border text-xs font-medium ${selectedExistingFiles.includes(doc.id) ? 'bg-blue-100 border-blue-400 text-blue-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'}`}>
                              <input
                                type="checkbox"
                                className="accent-blue-600 mr-1"
                                checked={selectedExistingFiles.includes(doc.id)}
                                onChange={e => {
                                  if (e.target.checked) setSelectedExistingFiles([...selectedExistingFiles, doc.id]);
                                  else setSelectedExistingFiles(selectedExistingFiles.filter(id => id !== doc.id));
                                }}
                              />
                              {doc.fileName.endsWith('.pdf') ? <FileText className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                              {doc.fileName} <span className="text-slate-400">({doc.uploadedBy})</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      {/* Divider */}
                      <div className="border-t my-3" />
                      {/* Upload New Files */}
                      <div>
                        <div className="text-sm font-medium mb-1 text-slate-700">Upload New Files</div>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold text-xs">Choose File</span>
                          <input type="file" className="hidden" multiple onChange={() => {}} />
                          <span className="text-xs text-slate-600">No file chosen</span>
                        </label>
                      </div>
                    </div>
                    {/* Submit Button */}
                    <div className="flex justify-end">
                      <Button className="bg-blue-600 hover:bg-blue-700 px-6 py-2 text-base font-semibold shadow-lg flex items-center gap-2">
                        <Upload className="w-4 h-4" /> Submit Finalized Draft to Documentation Team
                      </Button>
                    </div>
                    {/* Approval Status & Returned Comments */}
                    <div className="bg-blue-50 border-l-4 border-blue-400 rounded-lg p-4 flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-blue-600 mt-1" />
                      <div>
                        <div className="text-sm text-blue-900 mb-1 font-semibold">Approval Status: <span className="font-bold">{reviewDeliverable.status}</span></div>
                        <div className="text-sm text-blue-700">If returned, see comments from Documentation Team below.</div>
                        <div className="mt-1 text-slate-500 italic">[Returned comment placeholder]</div>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2" onClick={() => setReviewDeliverable(null)}>Close</Button>
                  </CardContent>
                </Card>
              </div>
            )}
            {/* End Review Deliverable Modal */}
          </div>
        </div>
      )}
    </div>
  );
};
