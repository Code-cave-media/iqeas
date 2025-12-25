/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import Loading from "@/components/atomic/Loading";
import { FolderKanban, ChevronRight } from "lucide-react";


export default function WorkersDashboard() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [workData, setWorkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getWorkerWork = async () => {
    setLoading(true);

    const response = await makeApiCall(
      "get",
      API_ENDPOINT.GET_WORKERS_WORK_PROJECT_DATA(user.id),
      {},
      "application/json",
      authToken
    );
    console.log("API Response:", response);

    if (response.data) {
      setWorkData(response.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (user?.id) {
      getWorkerWork();
    }
  }, [user?.id]);

  console.log("workData in render:", workData);

  if (loading) return <Loading />;

  return (
    <section className="p-4">
      <h2 className="text-xl font-semibold mb-6 text-gray-800">My Projects</h2>

      {workData.length === 0 ? (
        <p className="text-gray-500">No work assigned</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {workData.map((work, index) => (
            <a
              key={index}
              href={`/working/${work.id}/work-details`}
              className="group relative overflow-hidden rounded-xl border border-gray-200
                     bg-white p-4 shadow-sm transition-all
                     hover:shadow-md hover:border-blue-300"
            >
              {/* Accent bar */}
              <div className="absolute left-0 top-0 h-full w-1 bg-blue-500" />

              <div className="flex items-center justify-between">
                {/* Left */}
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                    <FolderKanban size={20} />
                  </div>

                  <div>
                    <p className="text-base font-semibold text-gray-900">
                      {work.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      Project ID: {work.project_id}
                    </p>
                  </div>
                </div>

                {/* Right */}
                <ChevronRight
                  size={20}
                  className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-500"
                />
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
}
