import { useState } from "react";
import { Search, Plus, Grid, List, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProjectCard } from "@/components/ProjectCard";
import { Badge } from "@/components/ui/badge";
import ProjectSlidingPanel from "./ProjectSlidingPanel";

const mockProjects = [
  {
    id: "PRJ-2024-001",
    clientName: "Saudi Aramco",
    location: "Dhahran, Saudi Arabia",
    createdDate: "2024-01-15",
    status: "In Progress",
    assignedTeams: ["RFC Team", "PM Team", "Working Team"],
    progress: 65,
    priority: "High",
    estimatedCompletion: "2024-03-20",
    estimationDetails: {
      costEstimate: "2,500,000",
      costBreakdownFile: {
        label: "Cost Breakdown.xlsx",
        url: "/files/cost-breakdown.xlsx",
      },
      estimationPDF: { label: "Estimation.pdf", url: "/files/estimation.pdf" },
      deadline: "2024-02-28",
      approvalDate: "2024-02-20",
      remarks: "Reviewed and approved by client.",
      uploadedFiles: [
        { label: "BOQ", url: "/files/boq.pdf" },
        { label: "Layout", url: "/files/layout.pdf" },
      ],
    },
  },
  {
    id: "PRJ-2024-002",
    clientName: "ADNOC",
    location: "Abu Dhabi, UAE",
    createdDate: "2024-01-20",
    status: "Under Estimation",
    assignedTeams: ["RFC Team", "Estimation Department"],
    progress: 25,
    priority: "Medium",
    estimatedCompletion: "2024-04-15",
    estimationDetails: {
      costEstimate: "1,800,000",
      costBreakdownFile: {
        label: "Cost Breakdown.xlsx",
        url: "/files/cost-breakdown-adnoc.xlsx",
      },
      estimationPDF: {
        label: "Estimation.pdf",
        url: "/files/estimation-adnoc.pdf",
      },
      deadline: "2024-03-15",
      approvalDate: "",
      remarks: "Pending client review.",
      uploadedFiles: [{ label: "Spec", url: "/files/spec-adnoc.pdf" }],
    },
  },
  {
    id: "PRJ-2024-003",
    clientName: "Kuwait Oil Company",
    location: "Kuwait City, Kuwait",
    createdDate: "2024-02-01",
    status: "Data Collection",
    assignedTeams: ["RFC Team"],
    progress: 10,
    priority: "Low",
    estimatedCompletion: "2024-05-30",
    estimationDetails: {
      costEstimate: "-",
      costBreakdownFile: null,
      estimationPDF: null,
      deadline: "2024-04-30",
      approvalDate: "",
      remarks: "Estimation not started.",
      uploadedFiles: [],
    },
  },
];

type Project = (typeof mockProjects)[number];

export const ProjectsDashboard = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = mockProjects.filter((project) => {
    const matchesSearch =
      project.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Projects Dashboard
          </h1>
          <p className="text-slate-600 mt-1">
            Manage and track oil engineering projects
          </p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400"
              />
              <Input
                placeholder="Search projects by client, location, or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="Data Collection">Data Collection</SelectItem>
              <SelectItem value="Under Estimation">Under Estimation</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Finalized">Finalized</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === "grid" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="rounded-r-none"
            >
              <Grid size={16} />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("list")}
              className="rounded-l-none"
            >
              <List size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-slate-600">
            Showing {filteredProjects.length} of {mockProjects.length} projects
          </span>
          <div className="flex space-x-2">
            <Badge variant="outline">
              Active:{" "}
              {mockProjects.filter((p) => p.status === "In Progress").length}
            </Badge>
            <Badge variant="outline">
              Pending:{" "}
              {
                mockProjects.filter((p) => p.status === "Under Estimation")
                  .length
              }
            </Badge>
            <Badge variant="outline">
              Completed:{" "}
              {mockProjects.filter((p) => p.status === "Finalized").length}
            </Badge>
          </div>
        </div>
      </div>

      {/* Projects Grid/List */}
      <div
        className={
          viewMode === "grid"
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }
      >
        {filteredProjects.map((project) => (
          <div key={project.id} className="relative">
            <ProjectCard
              project={project}
              onSelect={() => setSelectedProject(project)}
              viewMode={viewMode}
              userRole={""}
            />
          </div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <div className="text-slate-400 mb-4">
            <Folder size={48} className="mx-auto mb-4" />
            <p className="text-lg font-medium">No projects found</p>
            <p className="text-sm">Try adjusting your search criteria</p>
          </div>
        </div>
      )}

      {/* Sliding Panel */}
      {selectedProject && (
        <ProjectSlidingPanel
          selectedProject={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </div>
  );
};
