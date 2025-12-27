// src/components/project/DeliveryTab.tsx
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import ShowFile from "@/components/ShowFile";

type Props = {
  project: any;
  enableDelivery: boolean;
  onMakeDelivery: () => void;
};

export const DeliveryTab: React.FC<Props> = ({
  project,
  enableDelivery,
  onMakeDelivery,
}) => {
  return (
    <div className="rounded-2xl shadow-lg border bg-white">
      <div className="flex items-center justify-between px-6 py-4 rounded-t-2xl bg-gradient-to-r from-green-600 to-green-400">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-white" size={28} />
          <span className="text-lg font-bold text-white">Project Delivery</span>
        </div>
        {enableDelivery && project.delivery_files?.length === 0 && (
          <Button onClick={onMakeDelivery}>Make Delivery</Button>
        )}
      </div>
      <div className="px-6 py-4 flex flex-wrap gap-2">
        {project.delivery_files?.length > 0 ? (
          project.delivery_files.map((file: any, i: number) => (
            <ShowFile
              key={file.id || i}
              label={file.label}
              url={file.file || file.url}
            />
          ))
        ) : (
          <span className="text-slate-400">No delivery files available.</span>
        )}
      </div>
    </div>
  );
};
