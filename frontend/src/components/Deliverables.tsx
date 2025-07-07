import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Plus } from "lucide-react";
import DeliverablesTable from "./DeliverablesTable";
import ShowFile from "@/components/ShowFile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const stageList = ["IDC", "IFR", "IFA", "AFC"];
const categories = [
  "Mechanical",
  "Electrical",
  "Civil",
  "Instrumentation",
  "Other",
];
const priorities = ["High", "Medium", "Low"];
const fileLabelOptions = [
  "BOQ",
  "Layout",
  "Spec",
  "Drawing",
  "Estimation Doc",
  "Other",
];

// Mock projects
const mockProjects = [
  { id: "P-001", name: "Pipeline Expansion - North Field" },
  { id: "P-002", name: "Compressor Station Upgrade" },
];
// Mock deliverables (for list)
const initialDeliverables = [
  {
    id: "D-1",
    name: "Piping Layout - Zone 1",
    projectId: "P-001",
    stage: "IDC",
    category: "Mechanical",
    priority: "High",
    estHours: "12",
  },
  {
    id: "D-2",
    name: "Cable Tray Routing",
    projectId: "P-001",
    stage: "IFR",
    category: "Electrical",
    priority: "Medium",
    estHours: "8",
  },
  {
    id: "D-3",
    name: "Compressor Schematic",
    projectId: "P-002",
    stage: "IFA",
    category: "Instrumentation",
    priority: "Low",
    estHours: "5",
  },
];
const STAGES = ["IDC", "IFR", "IFA", "AFC"];
// Mock estimation team docs
const estimationDocs = [
  { id: "DOC-001", fileName: "Technical_Specifications_v2.pdf" },
  { id: "DOC-002", fileName: "Site_Survey_Report.docx" },
  { id: "DOC-003", fileName: "Client_RFQ_Original.pdf" },
];

const SYSTEM_FILES = [
  { id: "sys1", label: "P&ID Drawing", file: "pid.pdf" },
  { id: "sys2", label: "Layout Plan", file: "layout.pdf" },
];

interface DeliverablesProps {
  projectId: string;
}

export const Deliverables = ({ projectId }: DeliverablesProps) => {
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(1);
  const [deliverables, setDeliverables] = useState(initialDeliverables);
  const [stageFilter, setStageFilter] = useState<string>(STAGES[0]);

  const [form, setForm] = useState({
    title: "",
    description: "",
    category: categories[0],
    priority: priorities[1],
    estHours: "",
    systemFiles: [],
    uploadFiles: [],
    files: [{ label: "", file: null, fromEstimation: false, estimationId: "" }],
    stage: stageList[0],
  });
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  // System file handler
  const handleSystemFileChange = (id, checked) => {
    setForm((f) => ({
      ...f,
      systemFiles: checked
        ? [...f.systemFiles, id]
        : f.systemFiles.filter((fid) => fid !== id),
    }));
  };
  // Upload file handler
  const handleUploadFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm((f) => ({
      ...f,
      uploadFiles: [
        ...f.uploadFiles,
        ...files.map((file) => ({
          file,
          label: "",
          tempUrl: file instanceof File ? URL.createObjectURL(file) : "",
        })),
      ],
    }));
    e.target.value = "";
  };
  const handleUploadLabelChange = (idx, e) => {
    setForm((f) => ({
      ...f,
      uploadFiles: f.uploadFiles.map((u, i) =>
        i === idx ? { ...u, label: e.target.value } : u
      ),
    }));
  };
  const removeUploadFile = (idx) => {
    setForm((f) => ({
      ...f,
      uploadFiles: f.uploadFiles.filter((_, i) => i !== idx),
    }));
  };

  // Stepper navigation
  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  // Submission
  const handleSubmit = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setMessage("Deliverable created!");
      setDeliverables((ds) => [
        ...ds,
        {
          id: `D-${Math.random().toString(36).substr(2, 5)}`,
          name: form.title,
          projectId: projectId,
          stage: form.stage,
          category: form.category,
          priority: form.priority,
          estHours: form.estHours,
        },
      ]);
      setForm({
        title: "",
        description: "",
        category: categories[0],
        priority: priorities[1],
        estHours: "",
        systemFiles: [],
        uploadFiles: [],
        files: [
          { label: "", file: null, fromEstimation: false, estimationId: "" },
        ],
        stage: stageList[0],
      });
      setStep(1);
      setTimeout(() => {
        setMessage("");
        setShowModal(false);
      }, 1200);
    }, 900);
  };

  // Filter deliverables by projectId prop
  const filteredDeliverables = deliverables.filter(
    (d) => d.projectId === projectId
  );

  return (
    <div className="w-full  mx-auto">
      {/* Create Button */}
      <section className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Deliverables</h2>
        <Button onClick={() => setShowModal(true)}>
          <Plus size={20} /> Create Deliverable
        </Button>
      </section>
      <div className="mb-4 pl-1">
        <Select value={stageFilter} onValueChange={setStageFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Select Stage" />
          </SelectTrigger>
          <SelectContent>
            {STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {/* Deliverables List Section */}
      <section className="mb-10">
        {/* <div className="flex items-center justify-between mb-2">
          <h2 className="text-blue-800 text-2xl font-bold tracking-tight">
            Deliverables for{" "}
            <span className="font-bold">
              {mockProjects.find((p) => p.id === projectId)?.name}
            </span>
          </h2>
          <Badge className="bg-blue-100 text-blue-700 font-semibold text-base">
            {filteredDeliverables.length} Total
          </Badge>
        </div> */}
        <DeliverablesTable deliverables={filteredDeliverables} />
      </section>
      {/* Modal for Create Deliverable */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-4xl" overlayClassName="!bg-black/20">
          <DialogHeader>
            <DialogTitle>Create Deliverable</DialogTitle>
          </DialogHeader>
          <div className=" md:p-0">
            {/* Stepper */}
            <div className="flex mb-8 space-x-4">
              <div
                className={`flex-1 text-center py-2 rounded-lg ${
                  step === 1
                    ? "bg-blue-100 font-bold text-blue-700"
                    : "text-slate-500"
                }`}
              >
                1. Data Entry
              </div>
              <div
                className={`flex-1 text-center py-2 rounded-lg ${
                  step === 2
                    ? "bg-blue-100 font-bold text-blue-700"
                    : "text-slate-500"
                }`}
              >
                2. Review & Confirm
              </div>
            </div>
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Deliverable Title
                    </label>
                    <Input
                      value={form.title}
                      onChange={(e) =>
                        setForm({ ...form, title: e.target.value })
                      }
                      placeholder="e.g., Piping GA Zone A"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Category
                    </label>
                    <Select
                      value={form.category}
                      onValueChange={(v) => setForm({ ...form, category: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Description
                    </label>
                    <textarea
                      value={form.description}
                      onChange={(e) =>
                        setForm({ ...form, description: e.target.value })
                      }
                      placeholder="Short description of the work"
                      className="border rounded w-full px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Priority
                    </label>
                    <Select
                      value={form.priority}
                      onValueChange={(v) => setForm({ ...form, priority: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Stage
                    </label>
                    <Select
                      value={form.stage}
                      onValueChange={(v) => setForm({ ...form, stage: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {stageList.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium mb-1">
                      Est. Hours{" "}
                      <span className="text-xs text-slate-400">(optional)</span>
                    </label>
                    <Input
                      type="number"
                      min="0"
                      value={form.estHours}
                      onChange={(e) =>
                        setForm({ ...form, estHours: e.target.value })
                      }
                      placeholder="Estimated hours"
                    />
                  </div>
                </div>
                {/* File upload area - REPLACED with TaskAssignmentPage style */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Attach Reference Files
                  </label>
                  {/* System Files */}
                  <div className="mb-2">
                    <div className="text-xs mb-1">Select system files:</div>
                    {SYSTEM_FILES.map((sf) => (
                      <label
                        key={sf.id}
                        className="flex items-center gap-2 mt-2"
                      >
                        <input
                          type="checkbox"
                          checked={form.systemFiles.includes(sf.id)}
                          onChange={(e) =>
                            handleSystemFileChange(sf.id, e.target.checked)
                          }
                        />
                        <ShowFile label={sf.label} url={""} size="small" />
                      </label>
                    ))}
                  </div>
                  {/* Upload Files */}
                  <div className="mb-2">
                    <div className="text-xs mb-1">
                      Upload files (label required):
                    </div>
                    <Input
                      type="file"
                      multiple
                      onChange={handleUploadFileChange}
                    />
                    {form.uploadFiles.map((uf, idx) => (
                      <div key={idx} className="flex items-center gap-2 mt-1">
                        <Input
                          type="text"
                          placeholder="Label"
                          value={uf.label}
                          onChange={(e) => handleUploadLabelChange(idx, e)}
                          className={uf.label.trim() ? "" : "border-red-400"}
                        />
                        <span className="text-xs">{uf.file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeUploadFile(idx)}
                        >
                          &times;
                        </Button>
                      </div>
                    ))}
                    {/* Show uploaded files with ShowFile */}
                    {form.uploadFiles.length > 0 && (
                      <div className="mt-2 space-y-2">
                        {form.uploadFiles.map((uf, idx) => (
                          <ShowFile
                            key={idx}
                            label={uf.label || uf.file.name}
                            url={uf.tempUrl}
                            size="small"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                  <Button
                    onClick={nextStep}
                    className="bg-blue-600 hover:bg-blue-700 px-8 py-2 text-lg rounded-lg"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="font-semibold mb-2 text-lg">
                  Review Deliverable Data
                </h3>
                <div className="bg-slate-50 p-4 rounded mb-4 text-base space-y-2">
                  <div>
                    <strong>Title:</strong> {form.title}
                  </div>
                  <div>
                    <strong>Description:</strong> {form.description}
                  </div>
                  <div>
                    <strong>Category:</strong> {form.category}
                  </div>
                  <div>
                    <strong>Priority:</strong> {form.priority}
                  </div>
                  <div>
                    <strong>Stage:</strong> {form.stage}
                  </div>
                  <div>
                    <strong>Est. Hours:</strong> {form.estHours || "-"}
                  </div>
                  <div>
                    <strong>Reference Files:</strong>
                    <ul className="list-disc ml-6">
                      {form.files
                        .filter((f) => f.file || f.fromEstimation)
                        .map((f, i) => (
                          <li key={i}>
                            {f.label ? `${f.label}: ` : ""}
                            {f.fromEstimation
                              ? estimationDocs.find(
                                  (d) => d.id === f.estimationId
                                )?.fileName
                              : f.file?.name}
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
                <div className="flex justify-between mt-6">
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="px-8 py-2 text-lg rounded-lg"
                  >
                    Back
                  </Button>
                  <Button
                    className="bg-green-600 hover:bg-green-700 px-8 py-2 text-lg rounded-lg"
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    Create
                  </Button>
                </div>
              </div>
            )}
            {message && (
              <div className="text-green-700 font-semibold text-center mt-4 text-lg">
                {message}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
