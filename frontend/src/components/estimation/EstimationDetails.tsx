/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";
import { Pencil, ArrowLeftRight, MessageCircle } from "lucide-react";

export default function EstimationDetails() {
  const { project_id } = useParams();
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [estimationStatus, setEstimationStatus] = useState<string>("");
  const [projectData, setProjectData] = useState<any>(null);

  /* =========================
     FETCH DELIVERABLES
  ========================= */
  useEffect(() => {
    if (!project_id) return;

    const fetchDeliverables = async () => {
      setLoading(true);

      const response = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_GET_RFQ_DELIVERABLES(project_id),
        {},
        "application/json",
        authToken,
        "getRFQDeliverables"
      );

      if (response?.status === 200) {
        setDeliverables(
          (response.data || []).map((d: any) => ({
            ...d,
            hours: d.hours ?? "",
          }))
        );
      } else {
        toast.error("Failed to fetch deliverables");
      }

      setLoading(false);
    };

    fetchDeliverables();
  }, [project_id, authToken, makeApiCall]);

  /* =========================
     FETCH PROJECT DETAILS
  ========================= */
  useEffect(() => {
    if (!project_id) return;

    const getProject = async () => {
      setLoading(true);

      const response = await makeApiCall(
        "get",
        API_ENDPOINT.GET_PROJECT_BY_ID(project_id),
        {},
        "application/json",
        authToken,
        "getProjectById"
      );

      if (response?.status === 200) {
        const data = response.data;
        setEstimationStatus(data.estimation_status || "");
        setProjectData(data);
      } else {
        toast.error("Failed to fetch project details");
      }

      setLoading(false);
    };

    getProject();
  }, [project_id, authToken, makeApiCall]);

  /* =========================
     HANDLE HOURS EDITING
  ========================= */
  const handleHourChange = (id: number, value: string) => {
    setDeliverables((prev) =>
      prev.map((item) => (item.id === id ? { ...item, hours: value } : item))
    );
  };

  const calculateTotalTime = () => {
    return deliverables.reduce((sum, d) => {
      const h = Number(d.hours);
      return !isNaN(h) ? sum + h : sum;
    }, 0);
  };

  /* =========================
     SAVE HOURS
  ========================= */
  const saveHours = async () => {
    if (!project_id) return;

    const payload = deliverables
      .filter((d) => d.hours !== "" && d.hours !== null)
      .map((d) => ({
        sno: d.sno,
        hours: Number(d.hours),
      }));

    if (payload.length === 0) {
      toast.error("Enter hours before saving");
      return;
    }

    setSaving(true);

    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.UPDATES_ADD_HOURS_BY_PROJECT(project_id),
      {
        deliverables: payload,
        total_time: calculateTotalTime(),
      },
      "application/json",
      authToken,
      "addHours"
    );

    if (response?.status === 200) {
      toast.success("Hours saved successfully");
      setEditingId(null);
    } else {
      toast.error("Failed to save hours");
    }

    setSaving(false);
  };

  /* =========================
     SEND TO ADMIN
     - Used for both normal flow and back_to_you flow
  ========================= */
  const sendToAdmin = async () => {
    if (!project_id) return;

    const payload = deliverables
      .filter((d) => d.hours !== "" && d.hours !== null)
      .map((d) => ({ sno: d.sno }));

    if (payload.length === 0) {
      toast.error("Save hours before sending to admin");
      return;
    }

    setSending(true);

    try {
      const updateProjectRes = await makeApiCall(
        "patch",
        API_ENDPOINT.EDIT_PROJECT(project_id),
        { estimation_status: "sent_to_admin" },
        "application/json",
        authToken,
        "updateProjectEstimationStatus"
      );

      if (updateProjectRes?.status !== 200) {
        toast.error("Failed to update project status");
        return;
      }

      const sendDeliverablesRes = await makeApiCall(
        "patch",
        API_ENDPOINT.SEND_DELIVERABLES_TO_ADMIN(project_id),
        {
          estimation_status: "sent_to_admin",
          deliverables: payload,
        },
        "application/json",
        authToken,
        "sendDeliverablesToAdmin"
      );

      if (sendDeliverablesRes?.status !== 200) {
        toast.error("Failed to send deliverables to admin");
        return;
      }

      toast.success("Deliverables sent to admin successfully");
      setEstimationStatus("sent_to_admin");
      setProjectData((prev: any) =>
        prev ? { ...prev, estimation_status: "sent_to_admin" } : prev
      );
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while sending to admin");
    } finally {
      setSending(false);
    }
  };

  /* =========================
     RENDER CORRECTIONS
  ========================= */
const renderCorrections = () => {
  const isBackToYou =
    estimationStatus === "back_to_you" &&
    projectData?.estimation?.approved === false;

  if (!isBackToYou) return null;

  // ✅ corrections live inside estimation
  const corrections = projectData?.estimation?.corrections || [];
  if (!corrections.length) return null;

  return (
    <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <ArrowLeftRight className="text-orange-600" size={18} />
        <h3 className="font-semibold text-orange-900 text-sm">
          Corrections ({corrections.length})
        </h3>
      </div>

      <div className="space-y-2 max-h-40 overflow-y-auto">
        {corrections.map((correction: any) => (
          <div
            key={correction.id}
            className="flex items-start gap-2 p-2 bg-white rounded-md text-xs"
          >
            <MessageCircle
              size={14}
              className="text-orange-500 mt-0.5 flex-shrink-0"
            />
            <div>
              <p className="font-medium text-gray-900">
                {correction.correction}
              </p>
              <p className="text-gray-500">
                {new Date(correction.created_at).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


  /* =========================
     RENDER ACTION BUTTONS
  ========================= */
  const renderActionButtons = () => {
    const isBackToYou =
      estimationStatus === "back_to_you" &&
      projectData?.estimation?.approved === false;
    const isSentToAdmin = estimationStatus === "sent_to_admin";

    return (
      <>
        <button
          onClick={saveHours}
          disabled={saving}
          className="rounded-lg bg-black px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Hours"}
        </button>

        <button
          onClick={sendToAdmin}
          disabled={sending || isSentToAdmin}
          className={`rounded-lg px-4 py-2 text-sm text-white disabled:opacity-50 ${
            isBackToYou
              ? "bg-orange-600 hover:bg-orange-700"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {sending ? "Sending..." : "Send to Admin"}
        </button>
      </>
    );
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <section className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Estimation Details
          </h1>
          <p className="text-sm text-gray-500">Project ID: {project_id}</p>
          <p className="mt-1 text-sm text-gray-600">
            Status:{" "}
            <span className="font-semibold capitalize">
              {estimationStatus || "-"}
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-600">
            Total Estimated Time:{" "}
            <span className="font-semibold text-gray-900">
              {calculateTotalTime()} hrs
            </span>
          </p>
        </div>

        <div className="flex gap-2">{renderActionButtons()}</div>
      </div>

      {/* Corrections (only when back_to_you && !approved) */}
      {renderCorrections()}

      {/* Deliverables Table */}
      <div className="rounded-xl bg-white shadow-sm overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading deliverables...</p>
        ) : deliverables.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No deliverables found</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50 text-left text-sm text-gray-600">
                  <th className="px-4 py-3">S.No</th>
                  <th className="px-4 py-3">Drawing No</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Deliverables</th>
                  <th className="px-4 py-3">Discipline</th>
                  <th className="px-4 py-3">Hours</th>
                </tr>
              </thead>

              <tbody>
                {deliverables.map((item) => (
                  <tr
                    key={item.id}
                    className="border-t text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <td className="px-4 py-3">{item.sno}</td>
                    <td className="px-4 py-3">{item.drawing_no}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">
                      {item.title}
                    </td>
                    <td className="px-4 py-3">{item.deliverables}</td>
                    <td className="px-4 py-3">{item.discipline}</td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <input
                          type="tel"
                          min="0"
                          value={item.hours}
                          onChange={(e) =>
                            handleHourChange(item.id, e.target.value)
                          }
                          onBlur={() => setEditingId(null)}
                          className="w-20 rounded-md border px-2 py-1 text-sm focus:border-black focus:outline-none"
                        />
                      ) : (
                        <div className="flex items-center gap-2">
                          <span>{item.hours || "-"}</span>
                          <button
                            onClick={() => setEditingId(item.id)}
                            className="p-1 text-gray-500 hover:text-black"
                          >
                            <Pencil size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
