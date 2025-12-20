/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { useAuth } from "@/contexts/AuthContext";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

/* ---------- helpers ---------- */
const makeDrawingNo = (index: number) =>
  `DRG-${String(index + 1).padStart(3, "0")}`;

export default function RFQDeliverables() {
  const { project_id } = useParams();
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();

  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  /* ---------- FETCH EXISTING DELIVERABLES ---------- */
  useEffect(() => {
    if (!project_id) return;

    const fetchDeliverables = async () => {
      setFetching(true);

      const resp = await makeApiCall(
        "get",
        API_ENDPOINT.UPDATES_GET_RFQ_DELIVERABLES(project_id),
        {},
        "application/json",
        authToken,
        "getRFQDeliverables"
      );

      const data =
        resp?.data?.deliverables || resp?.data?.data || resp?.data || [];

      if (resp.status === 200 && Array.isArray(data) && data.length > 0) {
        setRows(
          data.map((row: any, index: number) => ({
            sno: row.sno ?? String(index + 1),
            drawing_no: row.drawing_no ?? makeDrawingNo(index),
            title: row.title ?? "",
            deliverables: row.deliverables ?? "",
            discipline: row.discipline ?? "Arch",
          }))
        );
      } else {
        // fallback → empty first row
        setRows([
          {
            sno: "1",
            drawing_no: makeDrawingNo(0),
            title: "",
            deliverables: "",
            discipline: "Arch",
          },
        ]);
      }

      setFetching(false);
    };

    fetchDeliverables();
  }, [project_id]);

  /* ---------- actions ---------- */
  const addRow = () => {
    setRows((prev) => [
      ...prev,
      {
        sno: String(prev.length + 1),
        drawing_no: makeDrawingNo(prev.length),
        title: "",
        deliverables: "",
        discipline: "Arch",
      },
    ]);
  };

  const updateRow = (index: number, key: string, value: string) => {
    setRows((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [key]: value } : row))
    );
  };

  const submitDeliverables = async () => {
    if (!project_id) {
      toast.error("Project ID missing");
      return;
    }

    setLoading(true);

    const response = await makeApiCall(
      "post",
      API_ENDPOINT.UPDATES_CREATE_RFQ_DELIVERABLES(project_id),
      { deliverables: rows },
      "application/json",
      authToken,
      "createRFQDeliverables"
    );

    setLoading(false);

    if (response.status === 201) {
      toast.success("Deliverables saved successfully");
    } else {
      toast.error(response.detail || "Failed to save deliverables");
    }
  };

  if (fetching) {
    return <div className="p-6">Loading deliverables...</div>;
  }

  return (
    <section className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>RFQ Deliverables</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>S.No</TableHead>
                  <TableHead>Drawing No</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Deliverables</TableHead>
                  <TableHead>Discipline</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {rows.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <Input value={row.sno} disabled />
                    </TableCell>

                    <TableCell>
                      <Input
                        value={row.drawing_no}
                        onChange={(e) =>
                          updateRow(idx, "drawing_no", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        value={row.title}
                        onChange={(e) =>
                          updateRow(idx, "title", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Input
                        value={row.deliverables}
                        onChange={(e) =>
                          updateRow(idx, "deliverables", e.target.value)
                        }
                      />
                    </TableCell>

                    <TableCell>
                      <Select
                        value={row.discipline}
                        onValueChange={(value) =>
                          updateRow(idx, "discipline", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Arch">Architecture</SelectItem>
                          <SelectItem value="Struct">Structure</SelectItem>
                          <SelectItem value="MEP">MEP</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={addRow}>
              + Add Row
            </Button>

            <Button onClick={submitDeliverables} disabled={loading}>
              {loading ? "Saving..." : "Save Deliverables"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
