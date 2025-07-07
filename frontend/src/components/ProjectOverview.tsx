import { MapPin, Calendar, User, FileText, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ProjectOverviewProps {
  project: any;
  userRole: string;
}

export const ProjectOverview = ({ project, userRole }: ProjectOverviewProps) => {
  const recentDocuments = [
    { name: "Client RFQ.pdf", uploadedBy: "RFC Team", date: "2024-02-15" },
    { name: "Site Survey Report.docx", uploadedBy: "Working Team", date: "2024-02-12" },
    { name: "Technical Specifications.pdf", uploadedBy: "RFC Team", date: "2024-02-10" }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Project Details */}
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <User size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Project Lead</p>
                  <p className="font-medium">{project.projectLead}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <MapPin size={16} className="text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Location</p>
                  <p className="font-medium">{project.location}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Calendar size={16} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Start Date</p>
                  <p className="font-medium">{new Date(project.createdDate).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <Clock size={16} className="text-red-600" />
                </div>
                <div>
                  <p className="text-sm text-slate-500">Due Date</p>
                  <p className="font-medium flex items-center gap-2">
                    {new Date(project.estimatedCompletion).toLocaleDateString()}
                    {(() => {
                      const due = new Date(project.estimatedCompletion);
                      const now = new Date();
                      const msPerDay = 1000 * 60 * 60 * 24;
                      const daysLeft = Math.ceil((due.setHours(0,0,0,0) - now.setHours(0,0,0,0)) / msPerDay);
                      if (daysLeft > 1) return <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-xs font-semibold">{daysLeft} days left</span>;
                      if (daysLeft === 1) return <span className="ml-2 px-2 py-0.5 rounded bg-yellow-100 text-yellow-800 text-xs font-semibold">Due tomorrow</span>;
                      if (daysLeft === 0) return <span className="ml-2 px-2 py-0.5 rounded bg-green-100 text-green-800 text-xs font-semibold">Due today</span>;
                      return <span className="ml-2 px-2 py-0.5 rounded bg-red-100 text-red-700 text-xs font-semibold">Overdue</span>;
                    })()}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-2">Project Description</h4>
              <p className="text-slate-600 leading-relaxed">{project.description}</p>
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-medium mb-3">Assigned Teams</h4>
              <div className="flex flex-wrap gap-2">
                {project.assignedTeams.map((team: string, index: number) => (
                  <Badge key={index} variant="secondary">{team}</Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText size={18} />
              <span>Recent Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentDocuments.map((doc, index) => (
                <div key={index} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer">
                  <p className="font-medium text-sm">{doc.name}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {doc.uploadedBy} • {new Date(doc.date).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-4" size="sm">
              View All Documents
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
