import { useState } from "react";
import { ArrowLeft, Download, Share, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { ProjectOverview } from "@/components/ProjectOverview";
import { TasksAssignment } from "@/components/TasksAssignment";
import { TeamActivity } from "@/components/TeamActivity";
import { DocumentCenter } from "@/components/DocumentCenter";
import { EstimationTracker } from "@/components/EstimationTracker";
import { ProjectTimeline } from "@/components/ProjectTimeline";

interface ProjectDetailProps {
  projectId: string;
  onBack: () => void;
  userRole: string;
}

const mockProject = {
  id: "PRJ-2024-001",
  clientName: "Saudi Aramco",
  location: "Dhahran, Saudi Arabia",
  createdDate: "2024-01-15",
  status: "In Progress",
  assignedTeams: ["RFC Team", "PM Team", "Working Team"],
  progress: 65,
  priority: "High",
  estimatedCompletion: "2024-03-20",
  projectLead: "Ahmed Al-Rashid",
  description: "Comprehensive oil field development project including pipeline design, facility planning, and environmental impact assessment."
};

const getAvailableTabs = (userRole: string) => {
  const allTabs = [
    { id: "overview", label: "Overview", roles: ["all"] },
    { id: "estimation-submission", label: "Estimation Submission", roles: ["all"] },
    { id: "timeline", label: "Project Timeline", roles: ["PM Team", "Working Team"] }
  ];

  return allTabs.filter(tab => 
    tab.roles.includes("all") || tab.roles.includes(userRole)
  );
};

export const ProjectDetail = ({ projectId, onBack, userRole }: ProjectDetailProps) => {
  const [activeTab, setActiveTab] = useState("overview");
  const availableTabs = getAvailableTabs(userRole);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress": return "bg-blue-100 text-blue-800 border-blue-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={onBack} className="p-2">
            <ArrowLeft size={20} />
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-1">
              <h1 className="text-2xl font-bold text-slate-800">{mockProject.id}</h1>
              <Badge className={getStatusColor(mockProject.status)}>{mockProject.status}</Badge>
            </div>
            <h2 className="text-xl text-slate-600">{mockProject.clientName}</h2>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Download size={16} className="mr-2" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Share size={16} className="mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <MoreHorizontal size={16} />
          </Button>
        </div>
      </div>

      {/* Project Summary Card */}
      <div className="bg-white p-6 rounded-lg border border-slate-200 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Project Lead</h3>
            <p className="text-lg font-semibold text-slate-800">{mockProject.projectLead}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Location</h3>
            <p className="text-lg font-semibold text-slate-800">{mockProject.location}</p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Due Date</h3>
            <p className="text-lg font-semibold text-slate-800">
              {new Date(mockProject.estimatedCompletion).toLocaleDateString()}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-slate-500 mb-1">Progress</h3>
            <div className="flex items-center space-x-3">
              <Progress value={mockProject.progress} className="flex-1" />
              <span className="text-lg font-semibold text-slate-800">{mockProject.progress}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 gap-1">
          {availableTabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id} className="text-sm">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <ProjectOverview project={mockProject} userRole={userRole} />
        </TabsContent>

        <TabsContent value="estimation-submission" className="space-y-6">
          <div className="space-y-6">
            <div className="border-blue-200 shadow-md rounded-lg bg-white">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold">Estimation Submission</span>
                  <span className="text-lg font-bold text-blue-800">for {mockProject.id}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Project ID</div>
                    <div className="font-semibold text-blue-900">{mockProject.id}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Client Name</div>
                    <div className="font-semibold text-blue-900">{mockProject.clientName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Estimator Assigned</div>
                    <div className="font-semibold text-blue-900">Ahmed Al-Rashid</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Estimation Status</div>
                    <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-semibold">Draft</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Deadline</div>
                    <span className="text-slate-800 font-medium">--/--/----</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Approval Date</div>
                    <span className="text-slate-800 font-medium">--/--/----</span>
                  </div>
                </div>
                <div className="mb-4">
                  <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-semibold mr-2">Client Clarification Log</span>
                  <div className="bg-slate-50 border rounded p-3 mt-2 text-sm text-slate-700">No clarifications yet.</div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Cost Estimate (₹)</div>
                    <span className="text-slate-800 font-medium">--</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Cost Breakdown File (Excel/PDF)</div>
                    <span className="text-slate-800 font-medium">No file uploaded</span>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Estimation PDF Upload</div>
                    <span className="text-slate-800 font-medium">No file uploaded</span>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-semibold">Client Approved</span>
                    <input type="checkbox" className="accent-green-600" disabled />
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Forwarded To</div>
                    <span className="text-slate-800 font-medium">--</span>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-xs text-slate-500 mb-1">Remarks / Notes</div>
                  <div className="bg-slate-50 border rounded p-3 text-sm text-slate-700">--</div>
                </div>
                <div className="mb-4">
                  <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-semibold mr-2">Project Updates</span>
                  <div className="bg-slate-50 border rounded p-3 mt-2 text-sm text-slate-700">No updates yet.</div>
                </div>
                <div>
                  <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs font-semibold mr-2">Upload Additional Documents</span>
                  <div className="bg-slate-50 border rounded p-3 mt-2 text-sm text-slate-700">No additional documents uploaded.</div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <ProjectTimeline projectId={projectId} userRole={userRole} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
