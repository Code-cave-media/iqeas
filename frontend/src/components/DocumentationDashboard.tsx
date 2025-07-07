import React, { useState } from "react";
import {
  Folder,
  Mail,
  Phone,
  X,
  FileText,
  User,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import ShowFile from "./ShowFile";
import ProjectDocumentsDropdown, {
  ProjectDocument,
} from "./ProjectDocumentsDropdown";

// Mock deliverables needing documentation team action
const docReviewDeliverables = [
  {
    id: "D-001",
    projectId: "PRJ-1024",
    client: "Al Wajeeh",
    clientEmail: "client1@email.com",
    clientPhone: "+966500000001",
    stage: "IDC",
    deliverable: "Pipe GA Z1",
    submittedBy: "Anand",
    date: "2024-07-02",
    status: "Awaiting Docs Approval",
    files: [
      { label: "Pipe GA Z1 v1.1", url: "/uploads/pipe-ga-z1-v1.1.pdf" },
      { label: "Pipe GA Z1 v1.0", url: "/uploads/pipe-ga-z1-v1.0.pdf" },
    ],
    notes: "",
  },
  {
    id: "D-002",
    projectId: "PRJ-1025",
    client: "Delta Oil",
    clientEmail: "client2@email.com",
    clientPhone: "+966500000002",
    stage: "IFR",
    deliverable: "P&ID Update",
    submittedBy: "Priya",
    date: "2024-07-03",
    status: "Awaiting Docs Approval",
    files: [
      { label: "P&ID Update v2.0", url: "/uploads/pid-update-v2.0.pdf" },
      { label: "P&ID Update v1.9", url: "/uploads/pid-update-v1.9.pdf" },
    ],
    notes: "",
  },
];

// Mock all project-related documents (could be fetched or filtered by projectId in real use)
const allProjectDocuments: ProjectDocument[] = [
  {
    label: "Pipe GA Z1 v1.1",
    url: "/uploads/pipe-ga-z1-v1.1.pdf",
    projectId: "PRJ-1024",
  },
  {
    label: "Pipe GA Z1 v1.0",
    url: "/uploads/pipe-ga-z1-v1.0.pdf",
    projectId: "PRJ-1024",
  },
  {
    label: "P&ID Update v2.0",
    url: "/uploads/pid-update-v2.0.pdf",
    projectId: "PRJ-1025",
  },
  {
    label: "P&ID Update v1.9",
    url: "/uploads/pid-update-v1.9.pdf",
    projectId: "PRJ-1025",
  },
  {
    label: "Old Spec Sheet",
    url: "/uploads/spec-sheet.pdf",
    projectId: "PRJ-1024",
  },
];

export const DocumentationDashboard = () => {
  const [deliverables, setDeliverables] = useState(docReviewDeliverables);
  const [rejectModal, setRejectModal] = useState<{
    open: boolean;
    deliverableId: string | null;
  }>({ open: false, deliverableId: null });
  const [rejectNote, setRejectNote] = useState("");
  const [rejectFiles, setRejectFiles] = useState<File[]>([]);
  const [viewDetail, setViewDetail] = useState<
    (typeof docReviewDeliverables)[0] | null
  >(null);

  // Approve handler
  const handleApprove = (id: string) => {
    setDeliverables((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: "Approved" } : d))
    );
  };

  // Reject handler
  const handleReject = () => {
    setDeliverables((prev) =>
      prev.map((d) =>
        d.id === rejectModal.deliverableId
          ? { ...d, status: "Rejected", notes: rejectNote }
          : d
      )
    );
    setRejectModal({ open: false, deliverableId: null });
    setRejectNote("");
    setRejectFiles([]);
  };

  return (
    <div className="p-6 mx-auto">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">
        Documentation Team Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deliverables.map((d) => (
          <Card
            key={d.id}
            className="hover:shadow-lg transition-shadow border-blue-100"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{d.projectId}</CardTitle>
                  <p className="text-slate-600">{d.client}</p>
                </div>
                <Badge
                  variant={
                    d.status === "Rejected"
                      ? "destructive"
                      : d.status === "Approved"
                      ? "default"
                      : "secondary"
                  }
                >
                  {d.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-slate-500">Stage:</span>
                  <p className="font-medium">{d.stage}</p>
                </div>
                <div>
                  <span className="text-slate-500">Deliverable:</span>
                  <p className="font-medium">{d.deliverable}</p>
                </div>
                <div>
                  <span className="text-slate-500">Submitted By:</span>
                  <p className="font-medium">{d.submittedBy}</p>
                </div>
                <div>
                  <span className="text-slate-500">Date:</span>
                  <p className="font-medium">{d.date}</p>
                </div>
              </div>
              {/* Actions Section */}
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Actions
                </div>
                <div className="flex flex-col md:flex-row gap-2 md:gap-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="md:flex-1"
                    onClick={() => setViewDetail(d)}
                  >
                    View Project Detail
                  </Button>
                  <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white md:flex-1 shadow-sm"
                    onClick={() => handleApprove(d.id)}
                    disabled={d.status === "Approved"}
                  >
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    className="bg-red-600 hover:bg-red-700 text-white md:flex-1 shadow-sm"
                    onClick={() =>
                      setRejectModal({ open: true, deliverableId: d.id })
                    }
                    disabled={d.status === "Approved"}
                  >
                    Reject
                  </Button>
                </div>
              </div>
              {/* Contact Section */}
              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-500 mb-1">
                  Contact
                </div>
                <div className="flex gap-4 items-center">
                  <a href={`mailto:${d.clientEmail}`} title="Email Client">
                    <Mail className="w-5 h-5 text-blue-600 hover:text-blue-800 cursor-pointer" />
                  </a>
                  <a href={`tel:${d.clientPhone}`} title="Call Client">
                    <Phone className="w-5 h-5 text-green-600 hover:text-green-800 cursor-pointer" />
                  </a>
                  <span className="text-xs text-slate-500 ml-2">
                    {d.client}
                  </span>
                </div>
              </div>
              {/* Files Section */}
              
              {d.status === "Rejected" && d.notes && (
                <div className="mt-2 text-red-700 font-semibold">
                  Rejection Note: {d.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Reject Modal */}
      <Dialog
        open={rejectModal.open}
        onOpenChange={() =>
          setRejectModal({ open: false, deliverableId: null })
        }
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Reject Deliverable</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea
              placeholder="Enter rejection note..."
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
            />
            <Input
              type="file"
              multiple
              onChange={(e) => {
                setRejectFiles(Array.from(e.target.files || []));
              }}
            />
            <div className="flex gap-2 justify-end mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setRejectModal({ open: false, deliverableId: null })
                }
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={handleReject}
                disabled={!rejectNote.trim()}
              >
                Reject
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Project Detail Modal */}
      <Dialog open={!!viewDetail} onOpenChange={() => setViewDetail(null)}>
        {!!viewDetail && (
          <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-0 relative overflow-y-auto max-h-[90vh]">
              {/* Header */}
              <div className="rounded-t-xl bg-gradient-to-r from-blue-600 to-blue-400 px-8 py-5 flex items-center gap-3 relative">
                <FileText size={28} className="text-white" />
                <h2 className="text-2xl font-bold text-white">
                  Project/Deliverable Details
                </h2>
                <span className="ml-auto text-white/80 font-mono text-sm">
                  {viewDetail.projectId}
                </span>
                <button
                  className="fixed z-50 top-6 right-6 text-white/80 hover:text-white text-2xl font-bold bg-blue-700/80 rounded-full p-1 shadow-lg"
                  onClick={() => setViewDetail(null)}
                >
                  <X />
                </button>
              </div>
              {/* Info Grid */}
              <div className="p-8 grid grid-cols-2 gap-x-8 gap-y-4 text-base">
                <div>
                  <span className="font-semibold text-slate-700">
                    Client Name:
                  </span>
                  <br />
                  {viewDetail.client}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Stage:</span>
                  <br />
                  {viewDetail.stage}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Deliverable:
                  </span>
                  <br />
                  {viewDetail.deliverable}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Submitted By:
                  </span>
                  <br />
                  {viewDetail.submittedBy}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">
                    Submission Date:
                  </span>
                  <br />
                  {viewDetail.date}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">Status:</span>
                  <br />
                  {viewDetail.status}
                </div>
              </div>
              <hr className="mx-8" />
              {/* Contact Section */}
              <div className="px-8 py-4 flex gap-8 items-start flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">
                    Contact Person:
                  </span>
                  <User size={18} className="text-blue-500" />
                  <span className="text-slate-700">N/A</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Phone:</span>
                  <a
                    href={`tel:${viewDetail.clientPhone}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <Phone className="text-green-500" />
                    {viewDetail.clientPhone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700">Email:</span>
                  <a
                    href={`mailto:${viewDetail.clientEmail}`}
                    className="inline-flex items-center gap-1 border border-blue-200 rounded px-2 py-1 text-blue-700 hover:bg-blue-50 transition-colors text-sm font-medium outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    <Mail className="text-rose-500" />
                    {viewDetail.clientEmail}
                  </a>
                </div>
              </div>
              {/* Notes Section */}
              <div className="mx-8 my-4 bg-slate-100 rounded p-3 text-slate-800 min-h-[40px]">
                {viewDetail.notes ? (
                  viewDetail.notes
                ) : (
                  <span className="text-slate-400">No notes</span>
                )}
              </div>
              {/* Uploaded Files Section */}
              <div className="mx-8 my-4">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <FileText size={18} className="text-blue-500" />
                  Uploaded Files:
                </div>
                <ul className="list-disc ml-8 space-y-1">
                  {viewDetail.files.length === 0 && (
                    <li className="text-slate-400">No files uploaded</li>
                  )}
                  {viewDetail.files.map((f, i) => (
                    <li key={i}>
                      <ShowFile label={f.label} url={f.url} size="medium" />
                    </li>
                  ))}
                </ul>
              </div>
              {/* Project Related Documents Dropdown */}
              <div className="mx-8 my-4">
                <ProjectDocumentsDropdown
                  documents={allProjectDocuments.filter(
                    (doc) => doc.projectId === viewDetail.projectId
                  )}
                  title="Project Related Documents"
                />
              </div>
              {/* Updates Section */}
              <div className="mx-8 my-4">
                <div className="font-semibold text-slate-700 mb-1 flex items-center gap-2">
                  <AlertCircle size={18} className="text-yellow-500" />
                  Updates:
                </div>
                <div className="text-slate-400">No updates yet.</div>
              </div>
              {/* Close Button */}
              <div className="flex justify-end px-8 pb-6">
                <Button variant="outline" onClick={() => setViewDetail(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
};
