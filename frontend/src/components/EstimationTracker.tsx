import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EstimationTrackerProps {
  projectId: string;
  userRole: string;
}

const mockEstimationData = {
  estimator: "Lisa Chen", 
  status: "In Progress",
  startDate: "2024-02-01",
  targetDate: "2024-02-25",
  progress: 60,
  currentPhase: "Material Cost Analysis",
  totalEstimatedCost: "$2,450,000",
  lastUpdated: "2024-02-15",
  remarks: "Initial material costs calculated. Need client clarification on equipment specifications."
};

const estimationPhases = [
  { name: "Data Collection", status: "completed", progress: 100 },
  { name: "Scope Definition", status: "completed", progress: 100 },
  { name: "Material Cost Analysis", status: "in-progress", progress: 60 },
  { name: "Labor Cost Estimation", status: "pending", progress: 0 },
  { name: "Equipment & Services", status: "pending", progress: 0 },
  { name: "Risk Assessment", status: "pending", progress: 0 },
  { name: "Final Review & Approval", status: "pending", progress: 0 }
];

export const EstimationTracker = ({ projectId, userRole }: EstimationTrackerProps) => {
  const canUpdateEstimation = ["Estimation Department", "PM Team"].includes(userRole);

  const getPhaseStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "pending": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Draft": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Pending Review": return "bg-yellow-100 text-yellow-800";
      case "Approved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Estimation Tracker</h2>
          <p className="text-slate-600">Track cost estimation progress and status</p>
        </div>
        {canUpdateEstimation && (
          <Button className="bg-blue-600 hover:bg-blue-700">
            Update Estimation
          </Button>
        )}
      </div>

      {/* Estimation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Assigned Estimator</p>
              <p className="text-lg font-semibold">{mockEstimationData.estimator}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Status</p>
              <Badge className={getStatusColor(mockEstimationData.status)}>
                {mockEstimationData.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Current Estimate</p>
              <p className="text-lg font-bold text-green-600">{mockEstimationData.totalEstimatedCost}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Target Date</p>
              <p className="text-lg font-semibold">
                {new Date(mockEstimationData.targetDate).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Estimation Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm font-bold">{mockEstimationData.progress}%</span>
            </div>
            <Progress value={mockEstimationData.progress} className="h-3" />
            
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Start Date</p>
                <p className="font-medium">{new Date(mockEstimationData.startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">Last Updated</p>
                <p className="font-medium">{new Date(mockEstimationData.lastUpdated).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">Current Phase</p>
                <p className="font-medium">{mockEstimationData.currentPhase}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Estimation Phases */}
      <Card>
        <CardHeader>
          <CardTitle>Estimation Phases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {estimationPhases.map((phase, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div className={`w-4 h-4 rounded-full ${
                    phase.status === 'completed' ? 'bg-green-500' :
                    phase.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                  }`} />
                  <div>
                    <p className="font-medium">{phase.name}</p>
                    <Badge className={getPhaseStatusColor(phase.status)} variant="secondary">
                      {phase.status.replace('-', ' ')}
                    </Badge>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="w-32">
                    <Progress value={phase.progress} className="h-2" />
                  </div>
                  <span className="text-sm font-medium w-12">{phase.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Remarks and Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Remarks & Timeline</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-2 block">
              Current Remarks
            </label>
            <div className="p-3 bg-slate-50 rounded border">
              <p className="text-slate-700">{mockEstimationData.remarks}</p>
            </div>
          </div>
          
          {canUpdateEstimation && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Update Status
                </label>
                <Select defaultValue={mockEstimationData.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Pending Review">Pending Review</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <label className="text-sm font-medium text-slate-700 mb-2 block">
                  Add New Remarks
                </label>
                <Textarea 
                  placeholder="Add your remarks or updates..."
                  rows={3}
                />
              </div>
              
              <Button className="bg-blue-600 hover:bg-blue-700">
                Update Estimation Status
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-blue-200 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Badge className="bg-blue-100 text-blue-700">Estimation Workflow</Badge>
            for {projectId}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Project & Estimation Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Project ID</div>
              <div className="font-semibold text-blue-900">{projectId}</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Client Name</div>
              <div className="font-semibold text-blue-900">Saudi Aramco</div>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Estimator Assigned</div>
              <div className="font-semibold text-blue-900">Ahmed Al-Rashid</div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Estimation Status</div>
              <Badge className="bg-gray-100 text-gray-800">Draft</Badge>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Deadline</div>
              <input type="date" className="border rounded p-2 w-full" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Approval Date</div>
              <input type="date" className="border rounded p-2 w-full" />
            </div>
          </div>
          {/* Client Clarification Log */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-yellow-100 text-yellow-700">Client Clarification Log</Badge>
            </div>
            <div className="bg-slate-50 border rounded p-3 mb-2 text-sm text-slate-700">No clarifications yet.</div>
            <div className="flex gap-2">
              <input className="border rounded p-2 flex-1" placeholder="Add clarification..." />
              <Button className="bg-blue-600 hover:bg-blue-700">Add</Button>
            </div>
          </div>
          {/* Cost Estimate & Uploads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="text-xs text-slate-500 mb-1">Cost Estimate (₹)</div>
              <input className="border rounded p-2 w-full" placeholder="Enter cost estimate..." />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Cost Breakdown File (Excel/PDF)</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold text-xs">Choose File</span>
                <input type="file" className="hidden" />
                <span className="text-xs text-slate-600">No file chosen</span>
              </label>
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Estimation PDF Upload</div>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold text-xs">Choose File</span>
                <input type="file" className="hidden" />
                <span className="text-xs text-slate-600">No file chosen</span>
              </label>
            </div>
          </div>
          {/* Client Approved & Forwarded To */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Badge className="bg-green-100 text-green-700">Client Approved</Badge>
              <input type="checkbox" className="accent-green-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 mb-1">Forwarded To</div>
              <input className="border rounded p-2 w-full" placeholder="Enter name or department..." />
            </div>
          </div>
          {/* Remarks / Notes */}
          <div>
            <div className="text-xs text-slate-500 mb-1">Remarks / Notes</div>
            <textarea className="border rounded p-2 w-full" rows={2} placeholder="Add remarks or notes..." />
          </div>
          {/* Project Updates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-100 text-blue-700">Project Updates</Badge>
            </div>
            <div className="bg-slate-50 border rounded p-3 mb-2 text-sm text-slate-700">No updates yet.</div>
            <div className="flex gap-2">
              <input className="border rounded p-2 flex-1" placeholder="Add update..." />
              <Button className="bg-blue-600 hover:bg-blue-700">Add</Button>
            </div>
          </div>
          {/* Upload Additional Documents */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-purple-100 text-purple-700">Upload Additional Documents</Badge>
            </div>
            <div className="flex gap-2 mb-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select Label" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spec">Specification</SelectItem>
                  <SelectItem value="drawing">Drawing</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded font-semibold text-xs">Choose File</span>
                <input type="file" className="hidden" />
                <span className="text-xs text-slate-600">No file chosen</span>
              </label>
              <Button className="bg-blue-600 hover:bg-blue-700">+ Add File</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
