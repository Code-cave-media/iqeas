import { useState } from "react";
import {
  Users,
  Target,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export const PMDashboard = () => {
  const pmProjects = [
    {
      id: "PRJ-2024-001",
      clientName: "Saudi Aramco",
      projectLead: "Ahmed Al-Rashid",
      totalTasks: 45,
      completedTasks: 29,
      overdueItems: 3,
      teamMembers: 8,
      status: "In Progress",
      priority: "High",
      nextMilestone: "Site Survey Completion",
      milestoneDate: "2024-02-15",
    },
    {
      id: "PRJ-2024-002",
      clientName: "ADNOC",
      projectLead: "Sarah Mohammed",
      totalTasks: 32,
      completedTasks: 8,
      overdueItems: 1,
      teamMembers: 6,
      status: "Planning",
      priority: "Medium",
      nextMilestone: "Resource Allocation",
      milestoneDate: "2024-02-20",
    },
  ];

  const [mockDeliverables, setMockDeliverables] = useState([
    {
      id: "D-1",
      name: "Site Survey Report",
      stage: "IDC",
      assignee: "Ahmed Al-Rashid",
      dueDate: "2024-02-15",
      status: "In Progress",
      progress: 50,
      files: [{ name: "Site Survey Report.pdf" }],
    },
    {
      id: "D-2",
      name: "Resource Allocation Plan",
      stage: "IFR",
      assignee: "Sarah Mohammed",
      dueDate: "2024-02-20",
      status: "Not Started",
      progress: 0,
      files: [],
    },
  ]);

  const stages = ["IDC", "IFR", "IFA", "AFC"];
  const teamMembers = [
    "Ahmed Al-Rashid",
    "Sarah Mohammed",
    "Team Member 1",
    "Team Member 2",
  ];

  const handleStageChange = (index: number, stage: string) => {
    const updatedDeliverables = mockDeliverables.map((d, idx) =>
      idx === index ? { ...d, stage } : d
    );
    setMockDeliverables(updatedDeliverables);
  };

  const handleAssigneeChange = (index: number, assignee: string) => {
    const updatedDeliverables = mockDeliverables.map((d, idx) =>
      idx === index ? { ...d, assignee } : d
    );
    setMockDeliverables(updatedDeliverables);
  };

  const handleDueDateChange = (index: number, dueDate: string) => {
    const updatedDeliverables = mockDeliverables.map((d, idx) =>
      idx === index ? { ...d, dueDate } : d
    );
    setMockDeliverables(updatedDeliverables);
  };

  const handleFileUpload = (index: number, files: FileList | null) => {
    if (files) {
      const updatedDeliverables = mockDeliverables.map((d, idx) =>
        idx === index
          ? {
              ...d,
              files: Array.from(files).map((file) => ({ name: file.name })),
            }
          : d
      );
      setMockDeliverables(updatedDeliverables);
    }
  };

  const handleHandoff = (index: number) => {
    // Implement handoff logic
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Not Started":
        return "bg-gray-200 text-gray-500";
      case "In Progress":
        return "bg-yellow-200 text-yellow-600";
      case "Completed":
        return "bg-green-200 text-green-600";
      case "Awaiting Review":
        return "bg-blue-200 text-blue-600";
      case "Awaiting Feedback":
        return "bg-purple-200 text-purple-600";
      default:
        return "bg-gray-200 text-gray-500";
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Project Management Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Coordinate teams and track project progress
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Target size={18} className="mr-2" />
          Create Task
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Target size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-slate-600">Active Projects</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 size={20} className="text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className="text-sm text-slate-600">Tasks Completed</p>
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
                <p className="text-2xl font-bold">23</p>
                <p className="text-sm text-slate-600">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">7</p>
                <p className="text-sm text-slate-600">Overdue</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">47</p>
                <p className="text-sm text-slate-600">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Project Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        {pmProjects.map((project) => (
          <Card key={project.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{project.id}</CardTitle>
                  <p className="text-slate-600">{project.clientName}</p>
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant={
                      project.priority === "High" ? "destructive" : "secondary"
                    }
                  >
                    {project.priority}
                  </Badge>
                  <Badge variant="outline">{project.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-slate-500">Project Lead:</span>
                  <p className="font-medium">{project.projectLead}</p>
                </div>
                <div>
                  <span className="text-sm text-slate-500">Team Size:</span>
                  <p className="font-medium">{project.teamMembers} members</p>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-slate-500">Task Progress</span>
                  <span className="text-sm font-medium">
                    {project.completedTasks}/{project.totalTasks}
                  </span>
                </div>
                <Progress
                  value={(project.completedTasks / project.totalTasks) * 100}
                  className="h-2"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium">Next Milestone</span>
                  <span className="text-xs text-slate-500">
                    {new Date(project.milestoneDate).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-sm text-slate-700">
                  {project.nextMilestone}
                </p>
              </div>

              {project.overdueItems > 0 && (
                <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                  <AlertCircle size={16} className="text-red-600" />
                  <span className="text-sm text-red-700">
                    {project.overdueItems} overdue items need attention
                  </span>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" className="flex-1">
                  View Tasks
                </Button>
                <Button size="sm" className="flex-1">
                  Manage Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Deliverable Breakdown Table */}
      <div className="bg-white rounded-lg border border-slate-200 p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4 text-slate-800">
          Deliverable Breakdown
        </h2>
        <table className="min-w-full divide-y divide-slate-200">
          <thead>
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Deliverable
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Stage
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Assignee
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Due Date
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Status
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Progress
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Files
              </th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-slate-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {/* Mock deliverables data */}
            {mockDeliverables.map((d, idx) => (
              <tr key={d.id}>
                <td className="px-3 py-2 font-medium text-slate-800">
                  {d.name}
                </td>
                <td className="px-3 py-2">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={d.stage}
                    onChange={(e) => handleStageChange(idx, e.target.value)}
                  >
                    {stages.map((stage) => (
                      <option key={stage} value={stage}>
                        {stage}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <select
                    className="border rounded px-2 py-1 text-xs"
                    value={d.assignee}
                    onChange={(e) => handleAssigneeChange(idx, e.target.value)}
                  >
                    {teamMembers.map((member) => (
                      <option key={member} value={member}>
                        {member}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="date"
                    className="border rounded px-2 py-1 text-xs"
                    value={d.dueDate}
                    onChange={(e) => handleDueDateChange(idx, e.target.value)}
                  />
                </td>
                <td className="px-3 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(
                      d.status
                    )}`}
                  >
                    {d.status}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <Progress value={d.progress} className="h-2" />
                  <span className="ml-2 text-xs font-medium">
                    {d.progress}%
                  </span>
                </td>
                <td className="px-3 py-2">
                  <input
                    type="file"
                    multiple
                    className="text-xs"
                    onChange={(e) => handleFileUpload(idx, e.target.files)}
                  />
                  <div className="mt-1 flex flex-col gap-1">
                    {d.files.map((file, fidx) => (
                      <span
                        key={fidx}
                        className="text-xs text-blue-700 underline cursor-pointer"
                      >
                        {file.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-3 py-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="mb-1 w-full"
                    onClick={() => handleHandoff(idx)}
                  >
                    Handoff Docs
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
