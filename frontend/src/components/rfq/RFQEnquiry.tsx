/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import SendToEstimationModal from "./SendToEstimationModal";

export default function RFQEnquiry() {
  const { project_id } = useParams();
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [hasDeliverables, setHasDeliverables] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    if (!project_id) return;

    const fetchProject = async () => {
      setLoading(true);

      const res = await makeApiCall(
        "get",
        API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
        {},
        "application/json",
        authToken,
        "getProjectById"
      );

      if (res.status === 200) {
        setProject(res.data);

        const delRes = await makeApiCall(
          "get",
          API_ENDPOINT.UPDATES_GET_RFQ_DELIVERABLES(project_id),
          {},
          "application/json",
          authToken,
          "getRFQDeliverables"
        );

        const rows =
          delRes?.data?.deliverables ||
          delRes?.data?.data ||
          delRes?.data ||
          [];

        setHasDeliverables(Array.isArray(rows) && rows.length > 0);
      } else {
        toast.error("Failed to fetch project details");
      }

      setLoading(false);
    };

    fetchProject();
  }, [project_id]);

  const InfoItem = ({ label, value }: { label: string; value: any }) => (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">{value || "-"}</p>
    </div>
  );

  if (loading) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        Loading project details...
      </div>
    );
  }

  if (!project) return null;

  return (
    <section className="max-w-6xl mx-auto p-6 space-y-6">
      {hasDeliverables && !project.send_to_estimation && (
        <Alert className="border-blue-200 bg-blue-50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <AlertTitle className="flex items-center gap-2">
                Deliverables Completed
                <Badge className="bg-green-400 hover:bg-green-400">Ready</Badge>
              </AlertTitle>
              <AlertDescription>
                RFQ deliverables are completed. Send the project to estimation.
              </AlertDescription>
            </div>

            <Button onClick={() => setOpenModal(true)}>
              Send to Estimation
            </Button>
          </div>
        </Alert>
      )}

      {project.send_to_estimation && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="flex items-center gap-2">
            Sent to Estimation
            <Badge className="bg-green-600 text-white">Completed</Badge>
          </AlertTitle>
          <AlertDescription>
            This project is already sent for estimation.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <InfoItem label="Project Name" value={project.name} />
            <InfoItem label="Project ID" value={project.project_id} />
            <InfoItem label="Client Name" value={project.client_name} />
            <InfoItem label="Client Company" value={project.client_company} />
            <InfoItem label="Location" value={project.location} />
            <InfoItem label="Project Type" value={project.project_type} />
            <InfoItem label="Priority" value={project.priority} />
            <InfoItem label="Status" value={project.status} />
            <InfoItem label="Progress" value={`${project.progress}%`} />
            <InfoItem
              label="Received Date"
              value={
                project.received_date
                  ? new Date(project.received_date).toLocaleDateString()
                  : "-"
              }
            />
            <InfoItem label="Contact Person" value={project.contact_person} />
            <InfoItem label="Phone" value={project.contact_person_phone} />
            <InfoItem label="Email" value={project.contact_person_email} />
            <InfoItem label="Notes" value={project.notes} />
          </div>
        </CardContent>
      </Card>

      {/* Created By */}
      <Card>
        <CardHeader>
          <CardTitle>Created By</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <InfoItem label="Name" value={project.user?.name} />
          <InfoItem label="Email" value={project.user?.email} />
        </CardContent>
      </Card>

      {project.uploaded_files?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.uploaded_files.map((file: any) => (
              <div key={file.id} className="space-y-2">
                <InfoItem label="Label" value={file.label} />
                <InfoItem label="File" value={file.file} />
                <Separator />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      <SendToEstimationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        projectId={Number(project_id)}
        onSuccess={() => {
          setProject((p: any) => ({ ...p, send_to_estimation: true }));
        }}
      />
    </section>
  );
}
