/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { useAPICall } from "@/hooks/useApiCall";
import { API_ENDPOINT } from "@/config/backend";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  value: string;
  onSelect: (project: any) => void;
  onChange: (value: string) => void;
}

export default function ClientAutofillInput({
  value,
  onSelect,
  onChange,
}: Props) {
  const { makeApiCall } = useAPICall();
  const { authToken } = useAuth();

  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const fetchClients = async () => {
      setLoading(true);
      const res = await makeApiCall(
        "get",
        API_ENDPOINT.CLIENT_AUTOFILL(value),
        {},
        "application/json",
        authToken,
        "clientAutofill"
      );

      if (res?.status === 200) {
        setSuggestions(res.data || []);
      }
      setLoading(false);
    };

    const t = setTimeout(fetchClients, 300);
    return () => clearTimeout(t);
  }, [value]);

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Client Name"
      />

      {suggestions.length > 0 && (
        <div className="absolute z-50 w-full bg-white border rounded-md shadow mt-1">
          {suggestions.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                onSelect(p);
                setSuggestions([]);
              }}
              className="px-3 py-2 cursor-pointer hover:bg-slate-100"
            >
              <p className="font-medium">{p.client_name}</p>
              <p className="text-xs text-slate-500">
                {p.client_company} • {p.location}
              </p>
            </div>
          ))}
        </div>
      )}

      {loading && <p className="text-xs text-slate-400 mt-1">Searching…</p>}
    </div>
  );
}
