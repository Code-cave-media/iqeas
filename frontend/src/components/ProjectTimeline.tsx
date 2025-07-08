import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useState } from "react";
import { format, differenceInDays, parseISO } from 'date-fns';

interface ProjectTimelineProps {
  projectId: string;
  userRole: string;
}

const mockTimelineData = [
  {
    id: "1",
    title: "Project Initiation",
    description: "Client RFQ received and project setup",
    assignedTeam: "RFC Team",
    startDate: "2024-01-15",
    endDate: "2024-01-20",
    status: "completed",
    progress: 100,
    dependencies: []
  },
  {
    id: "2", 
    title: "Data Collection & Analysis",
    description: "Site survey and initial data gathering", 
    assignedTeam: "Working Team",
    startDate: "2024-01-21",
    endDate: "2024-02-05",
    status: "completed",
    progress: 100,
    dependencies: ["1"]
  },
  {
    id: "3",
    title: "Cost Estimation",
    description: "Detailed cost analysis and estimation",
    assignedTeam: "Estimation Department", 
    startDate: "2024-02-01",
    endDate: "2024-02-25",
    status: "in-progress",
    progress: 60,
    dependencies: ["2"]
  },
  {
    id: "4",
    title: "Engineering Design",
    description: "Technical design and engineering drawings",
    assignedTeam: "Working Team",
    startDate: "2024-02-20",
    endDate: "2024-03-15",
    status: "scheduled", 
    progress: 0,
    dependencies: ["3"]
  },
  {
    id: "5",
    title: "Documentation & Review",
    description: "Prepare final documentation for client review",
    assignedTeam: "Documentation Team",
    startDate: "2024-03-10",
    endDate: "2024-03-20",
    status: "scheduled",
    progress: 0,
    dependencies: ["4"]
  },
  {
    id: "6",
    title: "Project Finalization",
    description: "Final review and project closure",
    assignedTeam: "Finalization Unit",
    startDate: "2024-03-18",
    endDate: "2024-03-25",
    status: "scheduled",
    progress: 0,
    dependencies: ["5"]
  }
];

export const ProjectTimeline = ({ projectId, userRole }: ProjectTimelineProps) => {
  const [timelineData, setTimelineData] = useState(mockTimelineData);
  const [newMilestone, setNewMilestone] = useState({
    title: '',
    description: '',
    assignedTeam: '',
    startDate: '',
    endDate: ''
  });

  const handleAddMilestone = () => {
    if (!newMilestone.title || !newMilestone.assignedTeam || !newMilestone.startDate || !newMilestone.endDate) return;
    setTimelineData([
      ...timelineData,
      {
        id: (timelineData.length + 1).toString(),
        title: newMilestone.title,
        description: newMilestone.description,
        assignedTeam: newMilestone.assignedTeam,
        startDate: newMilestone.startDate,
        endDate: newMilestone.endDate,
        status: 'scheduled',
        progress: 0,
        dependencies: []
      }
    ]);
    setNewMilestone({ title: '', description: '', assignedTeam: '', startDate: '', endDate: '' });
  };

  const handleCompleteMilestone = (id: string) => {
    setTimelineData(timelineData.map(m => m.id === id ? { ...m, status: 'completed', progress: 100 } : m));
  };

  // Gantt bar helpers
  const allDates = timelineData.flatMap(m => [m.startDate, m.endDate]).filter(Boolean).map(d => parseISO(d));
  const minDate = allDates.length ? allDates.reduce((a, b) => a < b ? a : b) : new Date();
  const maxDate = allDates.length ? allDates.reduce((a, b) => a > b ? a : b) : new Date();
  const totalDays = Math.max(1, differenceInDays(maxDate, minDate) + 1);

  const getBarColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-400';
      case 'in-progress': return 'bg-blue-500';
      case 'scheduled': return 'bg-gray-300';
      default: return 'bg-gray-200';
    }
  };

  const incomplete = timelineData.filter(m => m.status !== 'completed');
  const completed = timelineData.filter(m => m.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Project Timeline</h2>
        <p className="text-slate-600">Gantt-style visual for task and team coordination</p>
      </div>

      {/* Milestone Creation Form */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Add Project Milestone</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <input className="border rounded p-2" placeholder="Title" value={newMilestone.title} onChange={e => setNewMilestone({ ...newMilestone, title: e.target.value })} />
            <input className="border rounded p-2" placeholder="Assigned Team" value={newMilestone.assignedTeam} onChange={e => setNewMilestone({ ...newMilestone, assignedTeam: e.target.value })} />
            <input className="border rounded p-2" placeholder="Start Date" type="date" value={newMilestone.startDate} onChange={e => setNewMilestone({ ...newMilestone, startDate: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input className="border rounded p-2" placeholder="End Date" type="date" value={newMilestone.endDate} onChange={e => setNewMilestone({ ...newMilestone, endDate: e.target.value })} />
            <input className="border rounded p-2" placeholder="Description" value={newMilestone.description} onChange={e => setNewMilestone({ ...newMilestone, description: e.target.value })} />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold" onClick={handleAddMilestone}>Add Milestone</button>
        </CardContent>
      </Card>

      {/* Gantt-style Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Project Milestones</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Incomplete Milestones */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-blue-700 mb-4">Active & Upcoming Milestones</h3>
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[600px] space-y-6">
                {incomplete.length === 0 && <div className="text-slate-400 italic">No active or upcoming milestones.</div>}
                {incomplete.map((m, idx) => {
                  const start = differenceInDays(parseISO(m.startDate), minDate);
                  const duration = Math.max(1, differenceInDays(parseISO(m.endDate), parseISO(m.startDate)) + 1);
                  return (
                    <div key={m.id} className="relative flex flex-col md:flex-row md:items-center gap-2 md:gap-6 bg-white border rounded-lg shadow p-4">
                      <div className="flex-1 min-w-[200px]">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-blue-900 text-base">{m.title}</span>
                          <Badge className={m.status === 'in-progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>{m.status.replace('-', ' ')}</Badge>
                        </div>
                        <div className="text-xs text-slate-500 mb-1">{m.assignedTeam}</div>
                        <div className="text-xs text-slate-500 mb-1">{m.description}</div>
                        <div className="flex gap-4 text-xs text-slate-500">
                          <span>Start: {format(parseISO(m.startDate), 'MMM d, yyyy')}</span>
                          <span>End: {format(parseISO(m.endDate), 'MMM d, yyyy')}</span>
                        </div>
                      </div>
                      {/* Gantt Bar */}
                      <div className="flex-1 flex items-center min-w-[300px]">
                        <div className="relative w-full h-6 bg-slate-100 rounded">
                          <div
                            className={`absolute h-6 rounded ${getBarColor(m.status)}`}
                            style={{
                              left: `${(start / totalDays) * 100}%`,
                              width: `${(duration / totalDays) * 100}%`,
                              transition: 'all 0.3s',
                            }}
                          />
                        </div>
                      </div>
                      {/* Complete Button */}
                      {(m.status === 'in-progress' || m.status === 'scheduled') && (
                        <button className="ml-2 bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded font-semibold" onClick={() => handleCompleteMilestone(m.id)}>
                          Mark as Complete
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          {/* Completed Milestones */}
          <div>
            <h3 className="text-lg font-bold text-green-700 mb-4">Completed Milestones</h3>
            <div className="min-w-[600px] space-y-6">
              {completed.length === 0 && <div className="text-slate-400 italic">No completed milestones yet.</div>}
              {completed.map((m, idx) => {
                const start = differenceInDays(parseISO(m.startDate), minDate);
                const duration = Math.max(1, differenceInDays(parseISO(m.endDate), parseISO(m.startDate)) + 1);
                return (
                  <div key={m.id} className="relative flex flex-col md:flex-row md:items-center gap-2 md:gap-6 bg-slate-50 border rounded-lg shadow p-4 opacity-60">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-green-900 text-base">{m.title}</span>
                        <Badge className="bg-green-100 text-green-700">Completed</Badge>
                      </div>
                      <div className="text-xs text-slate-500 mb-1">{m.assignedTeam}</div>
                      <div className="text-xs text-slate-500 mb-1">{m.description}</div>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Start: {format(parseISO(m.startDate), 'MMM d, yyyy')}</span>
                        <span>End: {format(parseISO(m.endDate), 'MMM d, yyyy')}</span>
                      </div>
                    </div>
                    {/* Gantt Bar */}
                    <div className="flex-1 flex items-center min-w-[300px]">
                      <div className="relative w-full h-6 bg-slate-100 rounded">
                        <div
                          className={`absolute h-6 rounded ${getBarColor(m.status)}`}
                          style={{
                            left: `${(start / totalDays) * 100}%`,
                            width: `${(duration / totalDays) * 100}%`,
                            transition: 'all 0.3s',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Total Phases</p>
              <p className="text-2xl font-bold">{timelineData.length}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {timelineData.filter(p => p.status === 'completed').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {timelineData.filter(p => p.status === 'in-progress').length}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-sm text-slate-600 mb-1">Scheduled</p>
              <p className="text-2xl font-bold text-gray-600">
                {timelineData.filter(p => p.status === 'scheduled').length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
