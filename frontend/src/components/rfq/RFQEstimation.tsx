/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import toast from "react-hot-toast";

export default function RFQEstimationTable() {
  const { project_id } = useParams();
  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  const [table, setTable] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!project_id) return;

    const fetchTable = async () => {
      setLoading(true);

      const resp = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_GET_ESTIMATION_TABLE(project_id),
        {},
        "application/json",
        authToken,
        "getEstimationTable"
      );

      if (resp.status !== 200) {
        toast.error("Failed to fetch estimation table");
        setLoading(false);
        return;
      }

      const rows = resp.data?.table || resp.data?.data || resp.data || [];

      setTable(Array.isArray(rows) ? rows : []);
      setLoading(false);
    };

    fetchTable();
  }, [project_id]);

  if (loading) {
    return <div className="p-6">Loading estimation table...</div>;
  }

  return (
    <section className="p-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h2 className="text-xl font-bold mb-4">Estimation Table</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-slate-100 text-left">
              <tr>
                <th className="p-2">SNo</th>
                <th className="p-2">Drawing No</th>
                <th className="p-2">Title</th>
                <th className="p-2">Deliverables</th>
                <th className="p-2">Discipline</th>
                <th className="p-2">Hours</th>
                <th className="p-2">Amount</th>
              </tr>
            </thead>

            <tbody>
              {table.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No estimation data found
                  </td>
                </tr>
              )}

              {table.map((row) => (
                <tr key={row.sno ?? row.id} className="border-t">
                  <td className="p-2">{row.sno}</td>
                  <td className="p-2">{row.drawing_no}</td>
                  <td className="p-2">{row.title}</td>
                  <td className="p-2">{row.deliverables}</td>
                  <td className="p-2">{row.discipline}</td>
                  <td className="p-2">{row.hours}</td>
                  <td className="p-2">{row.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
