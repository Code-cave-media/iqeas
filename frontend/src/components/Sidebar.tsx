import { useState, useContext } from "react";
import { 
  Folder, 
  Calendar, 
  File, 
  User, 
  Clock,
  FileText,
  ChevronRight,
  ChevronDown,
  Users,
  ListChecks,
  Activity,
  BookOpen,
  Layers,
  FileCheck2,
  FilePlus2,
  BarChart3,
  Home,
  MessageCircle,
  Settings,
  RefreshCcw,
  Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { MeetingsTabContext } from "@/pages/Index";
import { MOCK_PROJECTS } from "@/lib/mock-projects";

interface SidebarProps {
  userRole: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const rolePermissions = {
  "RFC Team": ["projects", "documents", "calendar"],
  "Estimation Department": ["projects", "estimation", "calendar", "reports", "meetings"],
  "PM Team": ["projects", "tasks", "team", "calendar", "reports", "timeline"],
  "Working Team": ["projects", "tasks", "calendar"],
  "Documentation Team": ["projects", "documents", "files", "calendar"],
  "Finalization Unit": ["projects", "reports", "archive", "calendar"]
};

export const Sidebar = ({ userRole, activeSection, onSectionChange }: SidebarProps) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(["projects"]);
  
  const permissions = rolePermissions[userRole as keyof typeof rolePermissions] || [];
  
  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const pmMenuItems = [
    { id: "projects", label: "Projects", icon: Folder, hasSubmenu: false },
    { id: "documents", label: "Document Center", icon: BookOpen, hasSubmenu: false },
    { id: "deliverables", label: "Deliverables", icon: Layers, hasSubmenu: false },
    { id: "task-assignment", label: "Task Assignment", icon: ListChecks, hasSubmenu: true, submenu: [
      ...MOCK_PROJECTS.map(p => ({ id: `project-tasks-${p.id}`, label: p.name + ' Tasks' }))
    ] },
    { id: "documentation-submissions", label: "Documentation Submissions", icon: FileText, hasSubmenu: false },
    { id: "settings", label: "Settings", icon: Settings, hasSubmenu: false },
  ];

  const rfcMenuItems = [
    { id: "projects", label: "Projects", icon: Folder, hasSubmenu: false },
    { id: "documents", label: "Document Center", icon: BookOpen, hasSubmenu: false },
    { id: "calendar", label: "Calendar", icon: Calendar, hasSubmenu: false },
  ];

  const estimationMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: Home, hasSubmenu: false },
    { id: "projects", label: "Projects", icon: Folder, hasSubmenu: false },
    { id: "documents", label: "Document Center", icon: BookOpen, hasSubmenu: false },
    { id: "estimation", label: "Estimation Tracker", icon: FileText, hasSubmenu: false },
    { id: "calendar", label: "Calendar", icon: Calendar, hasSubmenu: false },
    { id: "reports", label: "Reports & Analytics", icon: File, hasSubmenu: false },
  ];

  const documentationMenuItems = [
    { id: "dashboard", label: "Dashboard", icon: FileText, hasSubmenu: false },
    { id: "projects", label: "All Projects", icon: Folder, hasSubmenu: false },
    { id: "returned", label: "Returned Files", icon: RefreshCcw, hasSubmenu: false },
    { id: "outgoing", label: "Sent to Client", icon: Send, hasSubmenu: false },
    { id: "clientlog", label: "Client Log", icon: MessageCircle, hasSubmenu: false },
    { id: "register", label: "Document Register", icon: FileCheck2, hasSubmenu: false },
  ];

  const defaultMenuItems = [
    {
      id: "overview",
      label: "Overview",
      icon: Folder,
      hasSubmenu: false
    },
    {
      id: "tasks",
      label: "Tasks & Assignment",
      icon: ListChecks,
      hasSubmenu: false
    },
    {
      id: "team-activity",
      label: "Team Activity",
      icon: Activity,
      hasSubmenu: false
    },
    {
      id: "estimation",
      label: "Estimation Tracker",
      icon: FileText,
      hasSubmenu: false
    },
    {
      id: "timeline",
      label: "Project Timeline",
      icon: Calendar,
      hasSubmenu: false
    }
  ];

  const menuItems = userRole === "PM Team"
    ? pmMenuItems
    : userRole === "RFC Team"
      ? rfcMenuItems
      : userRole === "Estimation Department"
        ? estimationMenuItems
        : userRole === "Documentation Team"
          ? documentationMenuItems
          : defaultMenuItems;
  const availableItems = menuItems;

  const navigate = useNavigate();
  const { setMeetingsTab } = useContext(MeetingsTabContext);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen fixed top-16 overflow-y-auto">
      <div className="p-4">
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-slate-600 uppercase tracking-wider mb-3">
            Navigation
          </h3>
          
          <nav className="space-y-1">
            {availableItems.map((item) => (
              <div key={item.id}>
                <Button
                  variant={activeSection === item.id ? "secondary" : "ghost"}
                  className={`w-full justify-start text-left ${
                    activeSection === item.id
                      ? (item.color === 'green' ? "bg-green-50 text-green-700 border-r-2 border-green-600" : "bg-blue-50 text-blue-700 border-r-2 border-blue-600")
                      : (item.color === 'green' ? "text-green-700 hover:bg-green-50" : "text-slate-700 hover:bg-slate-50")
                  }`}
                  onClick={() => {
                    onSectionChange(item.id);
                    if (item.id === "meetings") {
                      setMeetingsTab();
                      return;
                    }
                    if (item.hasSubmenu) {
                      toggleSection(item.id);
                    }
                  }}
                >
                  <item.icon size={18} className={`mr-3 ${item.color === 'green' ? 'text-green-700' : ''}`} />
                  <span className={`flex-1 ${item.color === 'green' ? 'text-green-700' : ''}`}>{item.label}</span>
                  {item.hasSubmenu && (
                    expandedSections.includes(item.id) 
                      ? <ChevronDown size={16} />
                      : <ChevronRight size={16} />
                  )}
                </Button>
                
                {item.hasSubmenu && expandedSections.includes(item.id) && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.submenu?.map((subItem) => (
                      <Button
                        key={subItem.id}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-50"
                        onClick={() => onSectionChange(subItem.id)}
                      >
                        <span className="flex-1">{subItem.label}</span>
                        {subItem.count && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {subItem.count}
                          </Badge>
                        )}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
        
        <div className="border-t pt-4">
          <div className="bg-blue-50 p-3 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-1">Quick Stats</h4>
            <div className="text-xs text-blue-600 space-y-1">
              <div>Active Projects: 8</div>
              <div>Pending Tasks: 7</div>
              <div>Overdue Items: 2</div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
