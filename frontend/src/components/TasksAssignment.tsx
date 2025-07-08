import { useState } from "react";
import { Plus, Search, Filter, X, Trash2, User, FilePlus, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface TasksAssignmentProps {
  projectId: string;
  userRole: string;
}

const mockTasks = [
  {
    id: "TSK-001",
    title: "Site Survey and Data Collection",
    description: "Conduct comprehensive site survey and collect geological data",
    assignedTo: "Working Team",
    assignedBy: "Ahmed Al-Rashid",
    status: "In Progress",
    priority: "High",
    dueDate: "2024-02-20",
    createdDate: "2024-02-01",
    progress: 75
  },
  {
    id: "TSK-002", 
    title: "Client Document Review",
    description: "Review and analyze client provided RFQ and specifications",
    assignedTo: "RFC Team",
    assignedBy: "Ahmed Al-Rashid",
    status: "Completed",
    priority: "High",
    dueDate: "2024-02-05",
    createdDate: "2024-01-25",
    progress: 100
  },
  {
    id: "TSK-003",
    title: "Initial Cost Estimation",
    description: "Prepare preliminary cost estimation based on available data",
    assignedTo: "Estimation Department",
    assignedBy: "Ahmed Al-Rashid", 
    status: "To Do",
    priority: "Medium",
    dueDate: "2024-02-25",
    createdDate: "2024-02-10",
    progress: 0
  }
];

const mockAssignees = [
  "Working Team",
  "RFC Team",
  "Estimation Department",
  "PM Team",
  "Documentation Team",
  "Finalization Unit"
];

function getInitialTaskForm() {
  return {
    id: "",
    title: "",
    description: "",
    assignedTo: mockAssignees[0],
    assignedBy: "",
    status: "To Do",
    priority: "Medium",
    dueDate: "",
    createdDate: new Date().toISOString().slice(0, 10),
    progress: 0,
    comments: [],
    attachments: []
  };
}

export const TasksAssignment = ({ projectId, userRole }: TasksAssignmentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tasks, setTasks] = useState(mockTasks);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState(getInitialTaskForm());
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusTask, setStatusTask] = useState(null);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [commentsTask, setCommentsTask] = useState(null);
  const [newComment, setNewComment] = useState("");
  
  const canCreateTasks = ["PM Team"].includes(userRole);
  const canUpdateTasks = ["PM Team", "Working Team"].includes(userRole);
  
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || task.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "To Do": return "bg-gray-100 text-gray-800";
      case "In Progress": return "bg-blue-100 text-blue-800";
      case "Review": return "bg-yellow-100 text-yellow-800";
      case "Completed": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High": return "text-red-600";
      case "Medium": return "text-yellow-600";
      case "Low": return "text-green-600";
      default: return "text-gray-600";
    }
  };

  // Handlers
  const openAddTask = () => {
    setEditingTask(null);
    setTaskForm({ ...getInitialTaskForm(), assignedBy: "Ahmed Al-Rashid", dueDate: new Date().toISOString().slice(0, 10) });
    setShowTaskModal(true);
  };
  const openEditTask = (task) => {
    setEditingTask(task);
    setTaskForm({ ...task });
    setShowTaskModal(true);
  };
  const handleTaskFormChange = (e) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleTaskFormSelect = (name, value) => {
    setTaskForm((prev) => ({ ...prev, [name]: value }));
  };
  const handleTaskFormFile = (e) => {
    setTaskForm((prev) => ({ ...prev, attachments: [...prev.attachments, ...Array.from(e.target.files)] }));
  };
  const saveTask = () => {
    if (!taskForm.title.trim()) return;
    if (editingTask) {
      setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? { ...taskForm } : t)));
    } else {
      setTasks((prev) => [
        ...prev,
        { ...taskForm, id: `TSK-${Math.floor(Math.random() * 10000)}` }
      ]);
    }
    setShowTaskModal(false);
  };
  const deleteTask = (taskId) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };
  const openStatusModal = (task) => {
    setStatusTask(task);
    setShowStatusModal(true);
  };
  const updateStatus = (status, progress) => {
    setTasks((prev) => prev.map((t) => t.id === statusTask.id ? { ...t, status, progress } : t));
    setShowStatusModal(false);
  };
  const openCommentsModal = (task) => {
    setCommentsTask(task);
    setShowCommentsModal(true);
    setNewComment("");
  };
  const addComment = () => {
    if (!newComment.trim()) return;
    setTasks((prev) => prev.map((t) => t.id === commentsTask.id ? { ...t, comments: [...(t.comments || []), { text: newComment, date: new Date().toISOString() }] } : t));
    setNewComment("");
  };

  return (
    <div className="max-w-2xl mx-auto mt-6">
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-0">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">Tasks</h2>
          {canCreateTasks && (
            <Button className="bg-blue-600 hover:bg-blue-700 rounded-full px-4 py-1 text-sm font-medium" onClick={openAddTask}>
              <Plus size={16} className="mr-2" /> New
            </Button>
          )}
        </div>
        <div>
          {tasks.length === 0 && (
            <div className="text-slate-400 text-center py-10">No tasks yet.</div>
          )}
          {tasks.map((task, idx) => (
            <div key={task.id} className={`flex items-center px-6 py-4 ${idx !== tasks.length - 1 ? 'border-b border-slate-100' : ''} group hover:bg-slate-50 transition`}> 
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-slate-800 text-base truncate">{task.title}</span>
                  <Badge className={getStatusColor(task.status) + ' text-xs px-2 py-0.5 rounded-full'}>{task.status}</Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <span><User size={12} className="inline mr-1" />{task.assignedTo}</span>
                  <span>Due: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong></span>
                </div>
              </div>
              {canUpdateTasks && (
                <div className="flex items-center gap-1 ml-4 opacity-0 group-hover:opacity-100 transition">
                  <Button variant="ghost" size="icon" onClick={() => openEditTask(task)}><EditIcon /></Button>
                  <Button variant="ghost" size="icon" onClick={() => openStatusModal(task)}><StatusIcon /></Button>
                  <Button variant="ghost" size="icon" onClick={() => deleteTask(task.id)}><Trash2 size={16} className="text-red-500" /></Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Add/Edit Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTask ? "Edit Task" : "New Task"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input name="title" value={taskForm.title} onChange={handleTaskFormChange} placeholder="Task Title" className="w-full" />
            <Textarea name="description" value={taskForm.description} onChange={handleTaskFormChange} placeholder="Description" className="w-full" />
            <div className="flex gap-2">
              <Select value={taskForm.assignedTo} onValueChange={v => handleTaskFormSelect("assignedTo", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Assignee" /></SelectTrigger>
                <SelectContent>
                  {mockAssignees.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={taskForm.priority} onValueChange={v => handleTaskFormSelect("priority", v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Priority" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Input type="date" name="dueDate" value={taskForm.dueDate} onChange={handleTaskFormChange} className="w-full" />
              <Input type="file" multiple onChange={handleTaskFormFile} className="w-full" />
            </div>
          </div>
          <DialogFooter className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancel</Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={saveTask}>{editingTask ? "Save Changes" : "Add Task"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Status Update Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Status</DialogTitle></DialogHeader>
          {statusTask && (
            <div className="space-y-4">
              <Select value={statusTask.status} onValueChange={v => updateStatus(v, statusTask.progress)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Review">Review</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Input type="number" min={0} max={100} value={statusTask.progress} onChange={e => updateStatus(statusTask.status, Number(e.target.value))} placeholder="Progress (%)" />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {/* Comments Modal */}
      <Dialog open={showCommentsModal} onOpenChange={setShowCommentsModal}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Task Comments</DialogTitle></DialogHeader>
          {commentsTask && (
            <div className="space-y-3">
              <div className="max-h-40 overflow-y-auto space-y-2">
                {(commentsTask.comments || []).map((c, idx) => (
                  <div key={idx} className="bg-slate-100 rounded p-2 text-sm">
                    <span className="block text-slate-700">{c.text}</span>
                    <span className="block text-xs text-slate-400 mt-1">{new Date(c.date).toLocaleString()}</span>
                  </div>
                ))}
                {(!commentsTask.comments || commentsTask.comments.length === 0) && <div className="text-xs text-slate-400">No comments yet.</div>}
              </div>
              <Textarea value={newComment} onChange={e => setNewComment(e.target.value)} placeholder="Add a comment..." />
              <Button className="bg-blue-600 hover:bg-blue-700 w-full" onClick={addComment}>Add Comment</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Helper icons for minimal actions
function EditIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><path d="M11.13 2.87a2 2 0 0 1 2.83 2.83l-7.3 7.3a2 2 0 0 1-.71.44l-2.12.71.71-2.12a2 2 0 0 1 .44-.71l7.3-7.3Z" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M9.5 4.5l2 2" stroke="#334155" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function StatusIcon() {
  return <svg width="16" height="16" fill="none" viewBox="0 0 16 16"><circle cx="8" cy="8" r="6" stroke="#2563eb" strokeWidth="1.2"/><circle cx="8" cy="8" r="2" fill="#2563eb"/></svg>;
}
