/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Play, Pause, Square } from "lucide-react";

import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { useWorkTimerSocket } from "@/hooks/useWorkTimerSocket";
import Loading from "@/components/atomic/Loading";

/* ---------- TIME HELPERS ---------- */
const toSeconds = (t: any) =>
  t ? t.hours * 3600 + t.minutes * 60 + t.seconds : 0;

const toClock = (s: number) => ({
  h: Math.floor(s / 3600),
  m: Math.floor((s % 3600) / 60),
  s: s % 60,
});

/* ---------- COLOR MAPS (TAILWIND SAFE) ---------- */
const BTN_COLORS: any = {
  green: "bg-green-500 hover:bg-green-600",
  yellow: "bg-yellow-500 hover:bg-yellow-600",
  red: "bg-red-500 hover:bg-red-600",
};

export default function WorkDetails() {
  const { user, authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const { project_id } = useParams();

  const [workData, setWorkData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [seconds, setSeconds] = useState<Record<number, number>>({});
  const [status, setStatus] = useState<Record<number, string>>({});

  /* ---------- FETCH ---------- */
  const fetchWork = async () => {
    setLoading(true);

    const res = await makeApiCall(
      "get",
      API_ENDPOINT.GET_WORKERS_WORK_DATA(user.id, project_id),
      {},
      "application/json",
      authToken
    );

    if (res?.data) {
      setWorkData(res.data);

      const sec: any = {};
      const stat: any = {};

      res.data.forEach((w: any) => {
        sec[w.id] = toSeconds(w.consumed_time);
        stat[w.id] = "STOPPED";
      });

      setSeconds(sec);
      setStatus(stat);
    }

    setLoading(false);
  };

  const { sendAction } = useWorkTimerSocket(user?.id, fetchWork);

  useEffect(() => {
    if (user?.id && project_id) fetchWork();
  }, [user?.id, project_id]);

  /* ---------- STOPWATCH ---------- */
  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((prev) => {
        const next = { ...prev };
        Object.keys(status).forEach((id) => {
          if (status[Number(id)] === "RUNNING") {
            next[Number(id)] += 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(t);
  }, [status]);

  if (loading) return <Loading />;

  return (
    <section className="p-4 space-y-6">
      <h2 className="text-xl font-semibold">My Assigned Work</h2>

      {workData.map((w) => {
        const t = toClock(seconds[w.id] || 0);
        const running = status[w.id] === "RUNNING";

        return (
          <div
            key={w.id}
            className="rounded-xl border bg-white p-5 shadow-sm space-y-4"
          >
            {/* HEADER */}
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{w.title}</h3>
                <p className="text-sm text-gray-500">
                  S.No {w.sno} · {w.discipline} · {w.stage} · Rev {w.revision}
                </p>
              </div>

              <span
                className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full
                ${
                  running
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    running ? "bg-red-500 animate-pulse" : "bg-gray-400"
                  }`}
                />
                {running ? "Recording" : "Stopped"}
              </span>
            </div>

            {/* DETAILS */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Drawing No</p>
                <p className="font-medium">{w.drawing_no}</p>
              </div>

              <div>
                <p className="text-gray-500">Deliverables</p>
                <p className="font-medium">{w.deliverables}</p>
              </div>
            </div>

            {/* TIME */}
            <div className="flex justify-between items-center text-sm pt-2">
              <span className="text-gray-600">
                Assigned: <b>{w.hours}h</b>
              </span>

              <div className="font-mono text-lg font-semibold text-indigo-600">
                {String(t.h).padStart(2, "0")}:{String(t.m).padStart(2, "0")}:
                {String(t.s).padStart(2, "0")}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <ActionBtn
                icon={Play}
                text="Start"
                color="green"
                disabled={running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "RUNNING" }));
                  sendAction("START");
                }}
              />

              <ActionBtn
                icon={Pause}
                text="Pause"
                color="yellow"
                disabled={!running}
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "PAUSED" }));
                  sendAction("PAUSE");
                }}
              />

              <ActionBtn
                icon={Square}
                text="Stop"
                color="red"
                onClick={() => {
                  setStatus((s) => ({ ...s, [w.id]: "STOPPED" }));
                  setSeconds((s) => ({ ...s, [w.id]: 0 }));
                  sendAction("STOP");
                }}
              />
            </div>
          </div>
        );
      })}
    </section>
  );
}

/* ---------- ACTION BUTTON ---------- */
const ActionBtn = ({ icon: Icon, text, color, ...props }: any) => (
  <button
    {...props}
    className={`flex items-center justify-center gap-2 py-2 rounded-lg
      text-white text-sm font-medium transition
      disabled:opacity-50 disabled:cursor-not-allowed
      ${BTN_COLORS[color]}`}
  >
    <Icon size={16} /> {text}
  </button>
);
