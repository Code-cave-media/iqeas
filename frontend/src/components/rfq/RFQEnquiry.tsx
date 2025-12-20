/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

function RFQDeliverablesManager({ projectId }: { projectId: any }) {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const [rows, setRows] = useState([
    {
      sno: "1",
      drawing_no: "",
      title: "",
      deliverables: "",
      discipline: "Arch",
    },
  ]);
  const [loading, setLoading] = useState(false);

  const fetchDeliverables = async () => {
    const resp = await makeApiCall(
      "get",
      API_ENDPOINT.UPDATES_GET_RFQ_DELIVERABLES(projectId),
      {},
      "application/json",
      authToken,
      "getRFQDeliverables"
    );
    if (resp.status === 200) {
      const data = resp.data || [];
      if (Array.isArray(data))
        setRows(
          data.map((d) => ({
            sno: d.sno,
            drawing_no: d.drawing_no,
            title: d.title,
            deliverables: d.deliverables,
            discipline: d.discipline,
          }))
        );
    }
  };

  const addRow = () =>
    setRows((r) => [
      ...r,
      {
        sno: (r.length + 1).toString(),
        drawing_no: "",
        title: "",
        deliverables: "",
        discipline: "Arch",
      },
    ]);

  const updateRow = (idx, key, value) =>
    setRows((r) =>
      r.map((row, i) => (i === idx ? { ...row, [key]: value } : row))
    );

  const submit = async () => {
    // Validate
    if (!projectId) return toast.error("Missing project id");
    const deliverables = rows.map((r) => ({
      sno: r.sno,
      drawing_no: r.drawing_no,
      title: r.title,
      deliverables: r.deliverables,
      discipline: r.discipline,
    }));
    setLoading(true);
    const resp = await makeApiCall(
      "post",
      API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(projectId),
      { deliverables },
      "application/json",
      authToken,
      "createRFQDeliverables"
    );
    setLoading(false);
    if (resp.status === 201) {
      toast.success(resp.detail || "Deliverables saved");
      fetchDeliverables();
    } else {
      toast.error(resp.detail || "Failed to save deliverables");
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {rows.map((r, idx) => (
          <div key={idx} className="grid grid-cols-6 gap-2 items-start">
            <input
              className="col-span-1 border rounded px-2 py-1"
              value={r.sno}
              onChange={(e) => updateRow(idx, "sno", e.target.value)}
            />
            <input
              className="col-span-1 border rounded px-2 py-1"
              placeholder="Drawing No"
              value={r.drawing_no}
              onChange={(e) => updateRow(idx, "drawing_no", e.target.value)}
            />
            <input
              className="col-span-1 border rounded px-2 py-1"
              placeholder="Title"
              value={r.title}
              onChange={(e) => updateRow(idx, "title", e.target.value)}
            />
            <input
              className="col-span-2 border rounded px-2 py-1"
              placeholder="Deliverables"
              value={r.deliverables}
              onChange={(e) => updateRow(idx, "deliverables", e.target.value)}
            />
            <select
              className="col-span-1 border rounded px-2 py-1"
              value={r.discipline}
              onChange={(e) => updateRow(idx, "discipline", e.target.value)}
            >
              <option>Arch</option>
              <option>Struct</option>
              <option>MEP</option>
            </select>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-2 bg-gray-100 rounded" onClick={addRow}>
          Add Row
        </button>
        <button
          className="px-3 py-2 bg-blue-600 text-white rounded"
          onClick={submit}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Deliverables"}
        </button>
        <button
          className="px-3 py-2 bg-gray-200 rounded"
          onClick={fetchDeliverables}
        >
          Refresh
        </button>
      </div>
    </div>
  );
}

export default function RFQEnquiry() {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const { project_id } = useParams();

  const [project, setProjects] = useState(null);

  useEffect(() => {
    if (!project_id) return;

    const fetchProjects = async () => {
      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
        {},
        "application/json",
        authToken,
        "getProjects"
      );

      if (response.status === 200) {
        setProjects(response.data);
      } else {
        toast.error("Failed to fetch project");
      }
    };

    fetchProjects();
  }, [project_id]);

  const Info = ({ label, value }) => (
    <div className="flex flex-col gap-1">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-[15px] font-semibold text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );

  const Card = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
      <h2 className="text-xl font-bold mb-5">{title}</h2>
      {children}
    </div>
  );

  if (!project) return null;

  return (
    <section className="p-6 space-y-10  mx-auto">
      <Card title="Project Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="Name" value={project.name} />
          <Info label="Project ID" value={project.project_id} />
          <Info label="Client Name" value={project.client_name} />
          <Info label="Client Company" value={project.client_company} />
          <Info label="Location" value={project.location} />
          <Info label="Project Type" value={project.project_type} />
          <Info label="Priority" value={project.priority} />
          <Info label="Status" value={project.status} />
          <Info label="Progress" value={project.progress + "%"} />
          <Info label="Received Date" value={project.received_date} />
          <Info label="Contact Person" value={project.contact_person} />
          <Info label="Phone" value={project.contact_person_phone} />
          <Info label="Email" value={project.contact_person_email} />
          <Info label="Notes" value={project.notes} />
        </div>
      </Card>

      <Card title="RFQ Deliverables">
        <RFQDeliverablesManager projectId={project.id} />
      </Card>

      <Card title="Created By">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Info label="User ID" value={project.user?.id} />
          <Info label="Name" value={project.user?.name} />
          <Info label="Email" value={project.user?.email} />
        </div>
      </Card>

      <Card title="Uploaded Files">
        <div className="space-y-4">
          {project.uploaded_files?.map((file) => (
            <div
              key={file.id}
              className="border border-gray-200 p-4 rounded-lg bg-gray-50"
            >
              <Info label="Label" value={file.label} />
              <Info label="File" value={file.file} />
            </div>
          ))}
        </div>
      </Card>

      <Card title="Delivery Files">
        <div className="space-y-4">
          {project.delivery_files?.map((file) => (
            <div
              key={file.id}
              className="border border-gray-200 p-4 rounded-lg bg-gray-50"
            >
              <Info label="Label" value={file.label} />
              <Info label="File" value={file.file} />
            </div>
          ))}
        </div>
      </Card>

      {project.estimation && (
        <Card title="Estimation Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Info label="Status" value={project.estimation.status} />
            <Info label="Cost" value={project.estimation.cost} />
            <Info label="Deadline" value={project.estimation.deadline} />
            <Info
              label="Approval Date"
              value={project.estimation.approval_date}
            />
            <Info label="Notes" value={project.estimation.notes} />
          </div>

          <h3 className="font-semibold mt-6 mb-3">Uploaded Files</h3>
          <div className="space-y-4">
            {project.estimation.uploaded_files?.map((file) => (
              <div key={file.id} className="border p-4 rounded-lg bg-gray-50">
                <Info label="Label" value={file.label} />
                <Info label="File" value={file.file} />
              </div>
            ))}
          </div>

          <h3 className="font-semibold mt-6 mb-3">Corrections</h3>
          <div className="space-y-4">
            {project.estimation.corrections?.map((correction) => (
              <div
                key={correction.id}
                className="border p-4 rounded-lg bg-gray-50"
              >
                <Info label="Correction" value={correction.correction} />
                <Info label="Created At" value={correction.created_at} />
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card title="More Info">
        <div className="space-y-6">
          {project.more_info?.map((info) => (
            <div
              key={info.id}
              className="border p-4 rounded-lg bg-gray-50 space-y-3"
            >
              <Info label="Notes" value={info.notes} />
              <Info label="Enquiry" value={info.enquiry} />
              <Info label="Created At" value={info.created_at} />

              <h4 className="font-semibold mt-2">Files</h4>
              <div className="space-y-2">
                {info.uploaded_files?.map((uf) => (
                  <Info key={uf.id} label={uf.label} value={uf.file} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
