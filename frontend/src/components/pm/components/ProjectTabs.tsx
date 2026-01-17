// src/components/project/ProjectTabs.tsx
import { FileText, ClipboardList, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

type TabKey = "project" | "working" | "delivery";

type Props = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
};

export const ProjectTabs: React.FC<Props> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b border-gray-200 mb-2">
      <ul className="flex -mb-px text-sm font-medium text-center">
        <li className="me-2 flex-1">
          <button
            type="button"
            onClick={() => onTabChange("project")}
            className={`inline-flex items-center justify-center gap-2 w-full p-3 border-b-2 ${activeTab === "project"
                ? "text-blue-600 border-blue-600 bg-blue-50"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <FileText size={16} />
            <span>Project Data</span>
          </button>
        </li>
        <li className="me-2 flex-1">
          <button
            type="button"
            onClick={() => onTabChange("working")}
            className={`inline-flex items-center justify-center gap-2 w-full p-3 border-b-2 ${activeTab === "working"
                ? "text-indigo-600 border-indigo-600 bg-indigo-50"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            <ClipboardList size={16} />
            <span>Working & RFQ</span>
          </button>
        </li>
        {/* Delivery Tab Hidden */}
        {/* <li className="flex-1">
          <button
            type="button"
            onClick={() => onTabChange("delivery")}
            className={`inline-flex items-center justify-center gap-2 w-full p-3 border-b-2 ${
              activeTab === "delivery"
                ? "text-green-600 border-green-600 bg-green-50"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            <CheckCircle2 size={16} />
            <span>Delivery</span>
          </button>
        </li> */}
      </ul>
    </div>
  );
};
