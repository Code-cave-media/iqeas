/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import Loading from "@/components/atomic/Loading";
import { API_URL } from "@/config/backend";
import {
  CheckCircle,
  RefreshCw,
  Save,
  Clock,
  FileText,
  User,
  Hash,
  DollarSign,
  Calendar,
  Edit3,
} from "lucide-react";

export default function LeaderProjectDetails() {
  const { project_id } = useParams<{ project_id: string }>();
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>(
    {}
  );
  const [editedRows, setEditedRows] = useState<
    Record<string, { status?: boolean; note?: boolean }>
  >({});
  const [workerNames, setWorkerNames] = useState<Record<number, string>>({});
  const [workerLoading, setWorkerLoading] = useState<Record<number, boolean>>(
    {}
  );

  /* ---------- FETCH WORKER NAMES ---------- */
  const fetchWorkerName = useCallback(
    async (workerId: number) => {
      if (workerNames[workerId] || workerLoading[workerId]) return;

      setWorkerLoading((prev) => ({ ...prev, [workerId]: true }));

      try {
        console.log(`Fetching worker ${workerId}...`);
        const res = await makeApiCall(
          "get",
          `${API_URL}/updates/username/${workerId}`,
          {},
          "application/json",
          authToken
        );

        console.log(`Raw response for worker ${workerId}:`, res);

        let name = "Unknown";
        if (res?.data) {
          if (typeof res.data === "string") {
            name = res.data;
          } else if (res.data.name) {
            name = res.data.name;
          } else if (res.data.username) {
            name = res.data.username;
          } else if (res.data.full_name) {
            name = res.data.full_name;
          } else {
            // If it's an object, take first value or stringify
            name =
              (Object.values(res.data)[0] as string) ||
              JSON.stringify(res.data);
          }
        }

        console.log(`Processed name for worker ${workerId}: "${name}"`);
        setWorkerNames((prev) => ({ ...prev, [workerId]: name }));
      } catch (err: any) {
        console.error(`Failed to fetch worker ${workerId}:`, err);
        setWorkerNames((prev) => ({
          ...prev,
          [workerId]: `Worker ${workerId}`,
        }));
      } finally {
        setWorkerLoading((prev) => ({ ...prev, [workerId]: false }));
      }
    },
    [makeApiCall, authToken]
  );

  /* ---------- FETCH DATA ---------- */
  const fetchProjectDetails = async () => {
    if (!project_id) return;
    setLoading(true);
    setError(null);

    try {
      const res = await makeApiCall(
        "get",
        `${API_URL}/updates/leader/${project_id}/details`,
        {},
        "application/json",
        authToken
      );

      if (res?.data) {
        const {
          estimation_deliverables,
          workers_uploaded_files,
          uploaded_files,
        } = res.data;

        const workerFilesMap: Record<number, any[]> = {};
        workers_uploaded_files.forEach((wuf: any) => {
          const file = uploaded_files.find(
            (uf: any) => uf.id === wuf.uploaded_file_id
          );
          if (!workerFilesMap[wuf.worker_id])
            workerFilesMap[wuf.worker_id] = [];
          if (file) workerFilesMap[wuf.worker_id].push(file);
        });

        const tableRows: any[] = estimation_deliverables.map((ed: any) => ({
          ...ed,
          files: workerFilesMap[ed.worker_id] || [],
        }));

        setRows(tableRows);
        setEditedRows({});

        // Fetch worker names with slight delay to ensure rows are set
        setTimeout(() => {
          const uniqueWorkerIds = [
            ...new Set(tableRows.map((row: any) => row.worker_id)),
          ];
          console.log("Unique worker IDs:", uniqueWorkerIds);
          uniqueWorkerIds.forEach((workerId: number) => {
            fetchWorkerName(workerId);
          });
        }, 100);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to load project details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [project_id]);

  /* ---------- HANDLERS ---------- */
  const handleSelectChange = (id: number, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status: value } : row))
    );
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], status: true } }));
  };

  const handleNoteChange = (id: number, value: string) => {
    setRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, note: value } : row))
    );
    setEditedRows((prev) => ({ ...prev, [id]: { ...prev[id], note: true } }));
  };

  const handleSaveStatus = async (row: any) => {
    if (!row.id) return;
    setActionLoading((prev) => ({ ...prev, [`status-${row.id}`]: true }));

    try {
      const url =
        row.status === "approved"
          ? `${API_URL}/updates/estimation-deliverables/${row.id}/approve/${row.worker_id}`
          : `${API_URL}/updates/estimation-deliverables/${row.id}/rework/${row.worker_id}`;

      await makeApiCall("patch", url, {}, "application/json", authToken);

      setEditedRows((prev) => ({
        ...prev,
        [row.id]: { ...prev[row.id], status: false },
      }));
    } catch (err: any) {
      console.error(err);
      setError("Failed to update status");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`status-${row.id}`]: false }));
    }
  };

  const handleSaveNote = async (row: any) => {
    if (!row.id) return;
    setActionLoading((prev) => ({ ...prev, [`note-${row.id}`]: true }));

    try {
      const url = `${API_URL}/updates/rework-note/${row.id}/${row.worker_id}`;
      await makeApiCall(
        "patch",
        url,
        { note: row.note },
        "application/json",
        authToken
      );

      setEditedRows((prev) => ({
        ...prev,
        [row.id]: { ...prev[row.id], note: false },
      }));
    } catch (err: any) {
      console.error(err);
      setError("Failed to save note");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`note-${row.id}`]: false }));
    }
  };

  const formatTime = (consumed_time: any) => {
    const { hours, minutes, seconds } = consumed_time || {};
    if (!hours && !minutes && !seconds) return "00:00:00";
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const getWorkerDisplayName = (workerId: number) => {
    if (workerLoading[workerId]) return "Loading...";
    return workerNames[workerId] || `Worker ${workerId}`;
  };

  if (loading) return <Loading />;
  if (error) return <p className="text-red-600 p-6">{error}</p>;

  return (
    <section className="p-1">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/80 backdrop-blur-sm">
            <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-600" />
              Project Worker Details
            </h1>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50/50 border-b border-gray-200 sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[50px]">
                    <Hash className="w-4 h-4 inline mr-1" />
                    S.No
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[140px]">
                    <User className="w-4 h-4 inline mr-1" />
                    Worker
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[100px]">
                    Drawing No
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[200px]">
                    Title
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[140px]">
                    Deliverables
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[90px]">
                    <User className="w-4 h-4 inline mr-1" />
                    Discipline
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold text-gray-900 min-w-[80px]">
                    <Clock className="w-4 h-4 inline mr-1" />
                    Hours
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold text-gray-900 min-w-[90px]">
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Amount
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[80px]">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Stage
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[70px]">
                    Revision
                  </th>
                  <th className="px-4 py-3.5 text-right font-semibold text-gray-900 min-w-[100px]">
                    Consumed Time
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[110px]">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[180px]">
                    Note
                  </th>
                  <th className="px-4 py-3.5 text-left font-semibold text-gray-900 min-w-[200px]">
                    Files
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map((row, index) => (
                  <tr
                    key={row.id}
                    className={`transition-all duration-150 hover:bg-gray-50/80 group ${
                      index % 2 === 0 ? "bg-white/50" : "bg-white"
                    }`}
                  >
                    <td className="px-4 py-4 font-medium text-gray-900 text-xs border-r border-gray-100">
                      {row.sno}
                    </td>
                    {/* Worker Name Column */}
                    <td className="px-4 py-4 font-medium text-gray-900 text-sm border-r border-gray-100 max-w-[140px]">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="truncate font-semibold bg-yellow-100 px-2 py-1 rounded text-xs">
                          {getWorkerDisplayName(row.worker_id)}
                        </span>
                      </div>
                    </td>
                    {/* Rest of the columns remain the same... */}
                    <td className="px-4 py-4 font-mono text-sm text-gray-900 border-r border-gray-100">
                      {row.drawing_no}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900 max-w-[200px] truncate border-r border-gray-100">
                      {row.title}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 border-r border-gray-100">
                      {row.deliverables}
                    </td>
                    <td className="px-4 py-4 border-r border-gray-100">
                      <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        {row.discipline}
                      </span>
                    </td>
                    <td className="px-4 py-4 font-mono text-right font-semibold text-gray-900 text-sm border-r border-gray-100">
                      {row.hours}
                    </td>
                    <td className="px-4 py-4 font-mono text-right font-semibold text-gray-900 text-sm border-r border-gray-100">
                      {row.amount}
                    </td>
                    <td className="px-4 py-4 font-medium text-gray-900 text-sm border-r border-gray-100">
                      {row.stage}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-700 border-r border-gray-100">
                      {row.revision}
                    </td>
                    <td className="px-4 py-4 font-mono text-sm text-gray-900 border-r border-gray-100">
                      <div className="flex items-center justify-end gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" />
                        <span className="font-mono">
                          {formatTime(row.consumed_time)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-gray-100">
                      <div className="flex items-center gap-2 h-11">
                        <select
                          value={row.status}
                          onChange={(e) =>
                            handleSelectChange(row.id, e.target.value)
                          }
                          disabled={actionLoading[`status-${row.id}`]}
                          className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white/80 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-gray-300 disabled:bg-gray-100/50 disabled:cursor-not-allowed transition-all duration-200"
                        >
                          <option value="approved">Approved</option>
                          <option value="rework">Rework</option>
                        </select>
                        {editedRows[row.id]?.status && (
                          <button
                            onClick={() => handleSaveStatus(row)}
                            disabled={actionLoading[`status-${row.id}`]}
                            className="h-10 w-10 p-0 border border-emerald-200 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 disabled:bg-gray-400/50 disabled:cursor-not-allowed flex-shrink-0 group-hover:bg-emerald-600"
                            title="Save Status"
                          >
                            {actionLoading[`status-${row.id}`] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 border-r border-gray-100">
                      <div className="flex items-center gap-2 h-11">
                        <input
                          type="text"
                          value={row.note || ""}
                          onChange={(e) =>
                            handleNoteChange(row.id, e.target.value)
                          }
                          disabled={actionLoading[`note-${row.id}`]}
                          placeholder="Enter note..."
                          className="flex-1 h-10 px-3 border border-gray-200 rounded-lg text-sm bg-white/80 shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 hover:border-gray-300 disabled:bg-gray-100/50 disabled:cursor-not-allowed transition-all duration-200"
                        />
                        {editedRows[row.id]?.note && (
                          <button
                            onClick={() => handleSaveNote(row)}
                            disabled={actionLoading[`note-${row.id}`]}
                            className="h-10 w-10 p-0 border border-indigo-200 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg shadow-sm flex items-center justify-center transition-all duration-200 hover:shadow-md active:scale-95 disabled:bg-gray-400/50 disabled:cursor-not-allowed flex-shrink-0 group-hover:bg-indigo-600"
                            title="Save Note"
                          >
                            {actionLoading[`note-${row.id}`] ? (
                              <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm">
                      {row.files.length > 0 ? (
                        <div className="space-y-1.5">
                          {row.files.slice(0, 3).map((f: any) => (
                            <div
                              key={f.id}
                              className="flex items-center gap-2 text-blue-600 hover:text-blue-700 truncate text-sm group/file"
                            >
                              <FileText className="w-3.5 h-3.5 flex-shrink-0 text-blue-500 group-hover/file:text-blue-600" />
                              <span className="truncate font-medium">
                                {f.label}
                              </span>
                            </div>
                          ))}
                          {row.files.length > 3 && (
                            <div className="text-gray-500 text-xs font-medium mt-1">
                              +{row.files.length - 3} more files
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-gray-400 italic text-sm">
                          <FileText className="w-3.5 h-3.5" />
                          No files uploaded
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {rows.length === 0 && (
                  <tr>
                    <td
                      colSpan={14}
                      className="px-8 py-16 text-center text-gray-500 bg-gray-50/50"
                    >
                      <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-2xl flex items-center justify-center">
                        <FileText className="w-12 h-12 text-gray-400" />
                      </div>
                      <p className="text-lg font-medium text-gray-900 mb-1">
                        No data available
                      </p>
                      <p className="text-sm text-gray-500">
                        Project deliverables will appear here
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {error && (
            <div className="px-6 py-4 border-t border-red-100 bg-red-50/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-red-700 text-sm">
                <Edit3 className="w-4 h-4" />
                {error}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
