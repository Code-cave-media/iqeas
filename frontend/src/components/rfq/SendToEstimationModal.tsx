import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useAPICall } from "@/hooks/useApiCall";
import { useAuth } from "@/contexts/AuthContext";
import { API_ENDPOINT } from "@/config/backend";
import toast from "react-hot-toast";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  projectId: number;
  onSuccess?: () => void;
}

export default function SendToEstimationModal({
  open,
  onClose,
  projectId,
  onSuccess,
}: Props) {
  const { authToken } = useAuth();
  const { makeApiCall } = useAPICall();
  const [loading, setLoading] = useState(false);

  const handleSendToEstimation = async () => {
    setLoading(true);

    const response = await makeApiCall(
      "patch",
      API_ENDPOINT.EDIT_PROJECT(projectId),
      { send_to_estimation: true },
      "application/json",
      authToken,
      "sentToEstimation"
    );

    setLoading(false);

    if (response.status === 200) {
      toast.success("Project sent to estimation successfully");
      onSuccess?.();
      onClose();
    } else {
      toast.error(response.detail || "Failed to send to estimation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            Send to Estimation
          </DialogTitle>
          <DialogDescription className="mt-2 text-sm leading-relaxed">
            This action will move the project to the estimation stage.
          </DialogDescription>
        </DialogHeader>

        <div className="px-6 py-5 space-y-4">
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-sm font-medium text-yellow-800">Important</p>
            <p className="mt-1 text-sm text-yellow-700">
              Once sent to estimation, you will not be able to edit RFQ
              deliverables.
            </p>
          </div>

          <p className="text-sm text-muted-foreground">
            Please confirm before continuing.
          </p>
        </div>

        <DialogFooter className="px-6 py-4 border-t flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            className="sm:min-w-[100px]"
          >
            Cancel
          </Button>

          <Button
            onClick={handleSendToEstimation}
            disabled={loading}
            className="sm:min-w-[160px]"
          >
            {loading ? "Sending..." : "Confirm & Send"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
