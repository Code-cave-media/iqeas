import { useState } from "react";
import { Wrench, CheckCircle, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const WorkerDashboard = () => {
  const workerTasks = [
    {
      id: "TSK-001",
      projectId: "PRJ-2024-001",
      clientName: "Saudi Aramco",
      taskTitle: "Site Survey - Pipeline Route",
      assignedBy: "Ahmed Al-Rashid",
      dueDate: "2024-02-10",
      priority: "High",
      status: "In Progress",
      estimatedHours: 16,
      loggedHours: 8,
      description: "Conduct detailed survey of proposed pipeline route including terrain mapping"
    },
    {
      id: "TSK-002", 
      projectId: "PRJ-2024-002",
      clientName: "ADNOC",
      taskTitle: "Equipment Inspection Report",
      assignedBy: "Sarah Mohammed",
      dueDate: "2024-02-15",
      priority: "Medium",
      status: "Pending",
      estimatedHours: 8,
      loggedHours: 0,
      description: "Inspect and document current equipment status at facility"
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Worker Dashboard</h1>
          <p className="text-slate-600 mt-1">Track your assigned tasks and project work</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Clock size={18} className="mr-2" />
          Log Time
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Wrench size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">7</p>
            <p className="text-sm text-slate-600">Active Tasks</p>
          </div>
        </div>
        <div className="bg-green-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">23</p>
            <p className="text-sm text-slate-600">Completed</p>
          </div>
        </div>
        <div className="bg-yellow-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock size={20} className="text-yellow-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">124</p>
            <p className="text-sm text-slate-600">Hours This Month</p>
          </div>
        </div>
        <div className="bg-red-50 rounded-xl p-4 flex items-center gap-3">
          <div className="p-2 bg-red-100 rounded-lg">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold">2</p>
            <p className="text-sm text-slate-600">Due Today</p>
          </div>
        </div>
      </div>

      {/* Tasks & Assignments Section */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-blue-800 text-xl font-bold tracking-tight">Tasks & Assignments</h2>
          <span className="text-slate-500 text-sm">(Only your assigned tasks are shown)</span>
        </div>
        <hr className="mb-4 border-blue-100" />
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full bg-white border border-blue-100 rounded-xl">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="px-4 py-3 text-left font-semibold">Task</th>
                <th className="px-4 py-3 text-left font-semibold">Project</th>
                <th className="px-4 py-3 text-left font-semibold">Assigned By</th>
                <th className="px-4 py-3 text-left font-semibold">Due Date</th>
                <th className="px-4 py-3 text-left font-semibold">Priority</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workerTasks.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-slate-400 py-6">No tasks assigned.</td></tr>
              ) : (
                workerTasks.map((task, idx) => (
                  <tr key={task.id} className={idx % 2 === 0 ? "bg-blue-50/40" : "bg-white"}>
                    <td className="px-4 py-3 font-medium text-slate-800">{task.taskTitle}</td>
                    <td className="px-4 py-3">{task.projectId} - {task.clientName}</td>
                    <td className="px-4 py-3">{task.assignedBy}</td>
                    <td className="px-4 py-3">{new Date(task.dueDate).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <Badge variant={task.priority === "High" ? "destructive" : task.priority === "Medium" ? "default" : "outline"}>
                        {task.priority}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={task.status === "In Progress" ? "default" : task.status === "Pending" ? "secondary" : "outline"}>
                        {task.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <Button size="sm" variant="outline">View Details</Button>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
                          {task.status === "Pending" ? "Start Task" : "Update Progress"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
