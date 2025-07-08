
import { useState } from "react";
import { MessageCircle, FileText, Clock, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface TeamActivityProps {
  projectId: string;
  userRole: string;
}

const mockActivities = [
  {
    id: "1",
    type: "comment",
    user: {
      name: "Ahmed Al-Rashid",
      role: "PM Team",
      avatar: "/placeholder.svg"
    },
    content: "Site survey has been completed. Initial findings look promising with good soil conditions.",
    timestamp: "2024-02-15T10:30:00Z",
    attachments: []
  },
  {
    id: "2", 
    type: "status_update",
    user: {
      name: "Sarah Johnson",
      role: "Working Team",
      avatar: "/placeholder.svg"
    },
    content: "Task 'Site Survey and Data Collection' updated to In Progress",
    timestamp: "2024-02-15T09:15:00Z",
    attachments: []
  },
  {
    id: "3",
    type: "document",
    user: {
      name: "Mohammad Hassan",
      role: "RFC Team", 
      avatar: "/placeholder.svg"
    },
    content: "Uploaded new document: Client_RFQ_Updated.pdf",
    timestamp: "2024-02-14T16:45:00Z",
    attachments: [
      { name: "Client_RFQ_Updated.pdf", size: "2.4 MB" }
    ]
  },
  {
    id: "4",
    type: "comment",
    user: {
      name: "Lisa Chen",
      role: "Estimation Department",
      avatar: "/placeholder.svg"
    },
    content: "Initial cost estimates are ready for review. Need clarification on scope for drilling operations.",
    timestamp: "2024-02-14T14:20:00Z",
    attachments: []
  }
];

export const TeamActivity = ({ projectId, userRole }: TeamActivityProps) => {
  const [newComment, setNewComment] = useState("");
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "comment": return <MessageCircle size={16} className="text-blue-600" />;
      case "document": return <FileText size={16} className="text-green-600" />;
      case "status_update": return <Clock size={16} className="text-yellow-600" />;
      default: return <User size={16} className="text-gray-600" />;
    }
  };

  const getActivityTitle = (type: string) => {
    switch (type) {
      case "comment": return "commented";
      case "document": return "uploaded document";
      case "status_update": return "updated status";
      default: return "activity";
    }
  };

  const handleSubmitComment = () => {
    if (newComment.trim()) {
      // Handle comment submission
      console.log("New comment:", newComment);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-slate-800">Team Activity Log</h2>
        <p className="text-slate-600">Track team updates, comments, and project changes</p>
      </div>

      {/* Add New Comment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Add Comment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Share an update, ask a question, or leave a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
          />
          <div className="flex justify-between items-center">
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <FileText size={16} className="mr-2" />
                Attach File
              </Button>
            </div>
            <Button 
              onClick={handleSubmitComment}
              disabled={!newComment.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Post Comment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockActivities.map((activity, index) => (
              <div key={activity.id} className="flex space-x-4">
                <div className="flex-shrink-0">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {activity.user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <p className="text-sm font-medium text-slate-800">{activity.user.name}</p>
                    <Badge variant="outline" className="text-xs">{activity.user.role}</Badge>
                    <span className="text-xs text-slate-500">
                      {getActivityTitle(activity.type)}
                    </span>
                    {getActivityIcon(activity.type)}
                    <span className="text-xs text-slate-500">
                      {new Date(activity.timestamp).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-slate-700">{activity.content}</p>
                    
                    {activity.attachments.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {activity.attachments.map((attachment, idx) => (
                          <div key={idx} className="flex items-center space-x-2 p-2 bg-slate-50 rounded border">
                            <FileText size={16} className="text-slate-500" />
                            <span className="text-sm font-medium">{attachment.name}</span>
                            <span className="text-xs text-slate-500">({attachment.size})</span>
                            <Button variant="ghost" size="sm" className="ml-auto">
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <Button variant="outline">Load More Activity</Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Chat Section */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Team Chat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 p-4 rounded-lg">
            <p className="text-slate-600 text-center">
              Real-time chat feature would be implemented here with role-based access
            </p>
            <div className="flex justify-center mt-4">
              <Button variant="outline">
                <MessageCircle size={16} className="mr-2" />
                Open Team Chat
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
