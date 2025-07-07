import { useState } from "react";
import {
  FileText,
  Upload,
  Download,
  Eye,
  MoreHorizontal,
  Filter,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";

interface DocumentCenterProps {
  projectId: string;
  userRole: string;
}

const mockDocuments = [
  {
    id: "DOC-001",
    name: "Client_RFQ_v2.pdf",
    type: "RFQ",
    uploadedBy: "RFC Team",
    uploadedDate: "2024-02-15",
    size: "2.4 MB",
    version: "2.0",
    status: "Approved",
    category: "Client Documents",
    project: "Pipeline Expansion - North Field",
  },
  {
    id: "DOC-002",
    name: "Site_Survey_Report.docx",
    type: "Report",
    uploadedBy: "Working Team",
    uploadedDate: "2024-02-12",
    size: "1.8 MB",
    version: "1.0",
    status: "Under Review",
    category: "Site Reports",
    project: "Pipeline Expansion - North Field",
  },
  {
    id: "DOC-003",
    name: "Technical_Specifications.pdf",
    type: "Specification",
    uploadedBy: "RFC Team",
    uploadedDate: "2024-02-10",
    size: "3.2 MB",
    version: "1.1",
    status: "Approved",
    category: "Technical Documents",
    project: "Compressor Station Upgrade",
  },
  {
    id: "DOC-004",
    name: "Cost_Estimation_Draft.xlsx",
    type: "Estimation",
    uploadedBy: "Estimation Department",
    uploadedDate: "2024-02-08",
    size: "856 KB",
    version: "1.0",
    status: "Draft",
    category: "Estimations",
    project: "Compressor Station Upgrade",
  },
  {
    id: "DOC-005",
    name: "Engineering_Drawings_Set1.dwg",
    type: "Drawing",
    uploadedBy: "Documentation Team",
    uploadedDate: "2024-02-05",
    size: "5.7 MB",
    version: "1.0",
    status: "Under Review",
    category: "Drawings",
    project: "Pipeline Expansion - North Field",
  },
];

export const DocumentCenter = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const { user } = useAuth();
  const canUpload = [
    "RFC Team",
    "Working Team",
    "Documentation Team",
    "Estimation Department",
  ].includes(user.role);

  const filteredDocuments = mockDocuments.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || doc.category === categoryFilter;
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Under Review":
        return "bg-yellow-100 text-yellow-800";
      case "Draft":
        return "bg-gray-100 text-gray-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getFileIcon = (type: string) => {
    return <FileText size={20} className="text-blue-600" />;
  };

  const documentsByProject = filteredDocuments.reduce((acc, doc) => {
    if (!acc[doc.project]) acc[doc.project] = [];
    acc[doc.project].push(doc);
    return acc;
  }, {} as Record<string, typeof mockDocuments>);

  // Get unique project names from filteredDocuments
  const projectNames = Array.from(
    new Set(filteredDocuments.map((doc) => doc.project))
  );
  const [selectedProject, setSelectedProject] = useState(projectNames[0] || "");

  // Only show documents for the selected project
  const docsForSelectedProject = filteredDocuments.filter(
    (doc) => doc.project === selectedProject
  );

  return (
    <div className="space-y-6 p-6">
      {/* Header */}

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Document Center</h1>
          <p className="text-slate-600 mt-1">
            Manage project documents with version control
          </p>
        </div>
        {/* <Button
          className="bg-blue-600 hover:bg-blue-700"
          onClick={startNewProject}
        >
          <Plus size={18} className="mr-2" />
          Add New Project
        </Button> */}
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Documents</p>
                <p className="text-2xl font-bold">{mockDocuments.length}</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText size={20} className="text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Approved</p>
                <p className="text-2xl font-bold text-green-600">
                  {mockDocuments.filter((d) => d.status === "Approved").length}
                </p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <div className="w-5 h-5 bg-green-600 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Under Review</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {
                    mockDocuments.filter((d) => d.status === "Under Review")
                      .length
                  }
                </p>
              </div>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <div className="w-5 h-5 bg-yellow-600 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">
                  {mockDocuments.filter((d) => d.status === "Draft").length}
                </p>
              </div>
              <div className="p-2 bg-gray-100 rounded-lg">
                <div className="w-5 h-5 bg-gray-600 rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4 items-center">
            <div className="flex-1">
              <Input
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Client Documents">
                  Client Documents
                </SelectItem>
                <SelectItem value="Site Reports">Site Reports</SelectItem>
                <SelectItem value="Technical Documents">
                  Technical Documents
                </SelectItem>
                <SelectItem value="Estimations">Estimations</SelectItem>
                <SelectItem value="Drawings">Drawings</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Draft">Draft</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Project Selector Dropdown */}
      {projectNames.length > 1 && (
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1">Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger className="w-64">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projectNames.map((name) => (
                <SelectItem key={name} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Documents List for selected project */}
      <Card>
        <CardHeader>
          <CardTitle>Project Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {docsForSelectedProject.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(doc.type)}
                  <div>
                    <h4 className="font-medium text-slate-800">{doc.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-slate-500 mt-1">
                      <span>v{doc.version}</span>
                      <span>{doc.size}</span>
                      <span>{doc.uploadedBy}</span>
                      <span>
                        {new Date(doc.uploadedDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Badge className={getStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                  <Badge variant="outline">{doc.category}</Badge>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download size={16} />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal size={16} />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            {docsForSelectedProject.length === 0 && (
              <div className="text-slate-400 text-center py-8">
                No documents found for this project.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
