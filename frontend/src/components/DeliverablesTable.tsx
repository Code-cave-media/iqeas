import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import ShowFile from "./ShowFile";

interface DeliverableFile {
  label: string;
  url: string;
}
interface Deliverable {
  id: string;
  name: string;
  stage: string;
  category: string;
  priority: string;
  estHours: string | number;
  description?: string;
  files?: DeliverableFile[];
}

interface DeliverablesTableProps {
  deliverables: Deliverable[];
}

const DeliverablesTable: React.FC<DeliverablesTableProps> = ({
  deliverables,
}) => {
  const [detailsModal, setDetailsModal] = useState<Deliverable | null>(null);

  return (
    <div className="overflow-x-auto rounded-xl">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Deliverable</TableHead>
            <TableHead>Stage</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Est. Hours</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliverables.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-center text-muted-foreground"
              >
                No deliverables
              </TableCell>
            </TableRow>
          ) : (
            deliverables.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="px-4 py-3 font-medium text-slate-800">
                  {d.name}
                </TableCell>
                <TableCell className="px-4 py-3">
                  <Badge className="bg-blue-100 text-blue-700 font-semibold">
                    {d.stage}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-3">{d.category}</TableCell>
                <TableCell className="px-4 py-3">{d.priority}</TableCell>
                <TableCell className="px-4 py-3">{d.estHours}</TableCell>
                <TableCell>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDetailsModal(d)}
                  >
                    View Details
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <Dialog open={!!detailsModal} onOpenChange={() => setDetailsModal(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Deliverable Details</DialogTitle>
          </DialogHeader>
          {detailsModal && (
            <div className="space-y-3">
              <div>
                <b>Title:</b> {detailsModal.name}
              </div>
              <div>
                <b>Stage:</b> {detailsModal.stage}
              </div>
              <div>
                <b>Category:</b> {detailsModal.category}
              </div>
              <div>
                <b>Priority:</b> {detailsModal.priority}
              </div>
              <div>
                <b>Est. Hours:</b> {detailsModal.estHours}
              </div>
              {detailsModal.description && (
                <div>
                  <b>Description:</b> {detailsModal.description}
                </div>
              )}
              <div>
                <b>Files:</b>
                {detailsModal.files && detailsModal.files.length > 0 ? (
                  <ul className="space-y-2 mt-2">
                    {detailsModal.files.map((file, idx) => (
                      <li key={idx}>
                        <ShowFile
                          label={file.label}
                          url={file.url}
                          size="small"
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-slate-400 ml-2">
                    No files attached.
                  </span>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliverablesTable;
