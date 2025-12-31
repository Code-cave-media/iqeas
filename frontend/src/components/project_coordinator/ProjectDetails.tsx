import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import Loading from "../atomic/Loading";
import { API_ENDPOINT } from "@/config/backend";
import { ArrowLeft, CheckCircle } from "lucide-react";

/* ================= COMPONENT ================= */

export default function ProjectDetails() {
  const { project_id } = useParams<{ project_id: string }>();
  const { authToken } = useAuth();
  const { makeApiCall, fetching } = useAPICall();

  const [project, setProject] = useState<any>(null);
  const [pms, setPms] = useState<any[]>([]);
  const [selectedPmId, setSelectedPmId] = useState<number | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loadingApprove, setLoadingApprove] = useState(false);

  /* ================= FETCH PROJECT ================= */

  useEffect(() => {
    if (!project_id) return;

    const fetchProject = async () => {
      try {
        const res = await makeApiCall(
          "get",
          API_ENDPOINT.GET_DATAS_FOR_COORDINATOR_FROM_ID(project_id),
          {},
          "application/json",
          authToken
        );

        if (res?.data) {
          setProject(res.data);
        } else {
          toast.error("Failed to fetch project details");
        }
      } catch {
        toast.error("Something went wrong");
      }
    };

    fetchProject();
  }, [project_id, authToken, makeApiCall]);

  /* ================= FETCH PMS ================= */

  useEffect(() => {
    const fetchPms = async () => {
      try {
        const res = await makeApiCall(
          "get",
          API_ENDPOINT.GET_PM,
          {},
          "application/json",
          authToken
        );

        if (res?.data) {
          setPms(res.data);
        } else {
          toast.error("Failed to load PMs");
        }
      } catch {
        toast.error("Failed to load PMs");
      }
    };

    fetchPms();
  }, [authToken, makeApiCall]);

  /* ================= APPROVE ================= */

  const handleApprove = async () => {
    if (!project?.estimation_id) {
      toast.error("Estimation not found");
      return;
    }

    if (!selectedPmId) {
      toast.error("Please select a Project Manager");
      return;
    }

    try {
      setLoadingApprove(true);

      const res = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_ESTIMATION(project.estimation_id),
        {
          sent_to_pm: true,
          pm_id: selectedPmId,
        },
        "application/json",
        authToken
      );

      if (res?.data) {
        toast.success("Estimation sent to PM");

        setProject((prev: any) => ({
          ...prev,
          estimation_sent_to_pm: true,
        }));

        setConfirmOpen(false);
        setSelectedPmId(null);
      } else {
        toast.error("Approval failed");
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoadingApprove(false);
    }
  };

  /* ================= LOADING ================= */

  if (fetching) return <Loading full />;
  if (!project) return null;

  const estimation_deliverables = project.estimation_deliverables ?? [];
  const purchase_orders = project.purchase_orders ?? [];

  /* ================= UI ================= */

  return (
    <section className="p-6 space-y-10">
      {/* ================= HEADER ================= */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-4">
          <a href="/project-coordinator">
            <ArrowLeft />
          </a>
          Project Details
        </h1>

        {!project.estimation_sent_to_pm ? (
          <Button onClick={() => setConfirmOpen(true)}>
            Confirm & Approve
          </Button>
        ) : (
          <span className="text-green-600 font-semibold flex items-center gap-2">
            <CheckCircle /> Estimation Sent to PM
          </span>
        )}
      </div>

      {/* ================= DELIVERABLES ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Deliverables</h2>

        <div className="overflow-x-auto border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr>
                <th className="p-3 text-left">S.No</th>
                <th className="p-3 text-left">Drawing No</th>
                <th className="p-3 text-left">Deliverables</th>
                <th className="p-3 text-left">Discipline</th>
                <th className="p-3 text-left">Stage</th>
                <th className="p-3 text-left">Revision</th>
                <th className="p-3 text-left">Hours</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Status</th>
              </tr>
            </thead>

            <tbody>
              {estimation_deliverables.map((item: any) => (
                <tr key={item.id} className="border-t">
                  <td className="p-3">{item.sno}</td>
                  <td className="p-3">{item.drawing_no}</td>
                  <td className="p-3">{item.deliverables}</td>
                  <td className="p-3">{item.discipline}</td>
                  <td className="p-3">{item.stage}</td>
                  <td className="p-3">{item.revision}</td>
                  <td className="p-3">{item.hours}</td>
                  <td className="p-3">₹ {item.amount}</td>
                  <td className="p-3">
                    <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-700">
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}

              {estimation_deliverables.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-4 text-center text-slate-500">
                    No deliverables found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= FILES ================= */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Uploaded Files</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {purchase_orders.flatMap((po: any) =>
            po.uploaded_files.map((file: any) => (
              <div
                key={file.id}
                className="border rounded-lg p-4 space-y-2 shadow-sm"
              >
                <p className="font-medium truncate">{file.label}</p>

                <p className="text-xs text-slate-500">
                  Status:{" "}
                  <span className="capitalize font-semibold">
                    {file.status.replace("_", " ")}
                  </span>
                </p>

                <p className="text-xs text-slate-500">
                  Uploaded: {new Date(file.created_at).toLocaleDateString()}
                </p>

                <Button size="sm" className="w-full mt-2">
                  Download
                </Button>
              </div>
            ))
          )}

          {purchase_orders.length === 0 && (
            <p className="text-slate-500">No files uploaded</p>
          )}
        </div>
      </div>

      {/* ================= CONFIRM MODAL ================= */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-lg">
            <h3 className="text-lg font-semibold">Confirm Approval</h3>

            <p className="mt-2 text-sm text-slate-600">
              Select a Project Manager and send the estimation.
            </p>

            {/* PM SELECT */}
            <select
              className="mt-4 w-full border rounded-md p-2 text-sm"
              value={selectedPmId ?? ""}
              onChange={(e) => setSelectedPmId(Number(e.target.value))}
            >
              <option value="">Select Project Manager</option>
              {pms.map((pm: any) => (
                <option key={pm.id} value={pm.id}>
                  {pm.name || pm.email}
                </option>
              ))}
            </select>

            <div className="mt-6 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>

              <Button
                disabled={loadingApprove || !selectedPmId}
                onClick={handleApprove}
              >
                {loadingApprove ? "Sending..." : "Approve & Send"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
