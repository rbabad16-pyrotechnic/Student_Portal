"use client";

import React, { useState, useEffect } from "react";

//Update this when adding category
interface DropdownConfig {
  section:          string[];
  room:             string[];
  employee_status:  string[];
  employee_role:    string[];
  prefix:           string[];
  specification:    string[];
}

//Update this when adding category
export default function SettingsConfigPage() {
  const [config, setConfig] = useState<DropdownConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inputs, setInputs] = useState<Record<string, string>>({
    section:          "",
    room:             "",
    employee_status:  "",
    employee_role:    "",
    prefix:           "",
    specification:    "",
  });

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/portal/admin?table=configuration");
      if (res.ok) {
        const data = await res.json();
        setConfig(data);
      }
    } catch (err) {
      console.error("Error reading setup variables:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleAddOption = async (field: keyof DropdownConfig) => {
    const valueToAdd = inputs[field].trim();
    if (!valueToAdd) return;

    try {
      const res = await fetch("/api/portal/admin?table=configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", field, value: valueToAdd }),
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        // 🚀 Extract the .data property from your combined API response
        setConfig(jsonResponse.data); 
        setInputs({ ...inputs, [field]: "" }); // Reset input field
      }
    } catch (err) {
      console.error("Failed to append configuration option:", err);
    }
  };

  const handleRemoveOption = async (field: keyof DropdownConfig, valueToRemove: string) => {
    try {
      const res = await fetch("/api/portal/admin?table=configuration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "remove", field, value: valueToRemove }),
      });

      if (res.ok) {
        const jsonResponse = await res.json();
        // 🚀 Extract the .data property from your combined API response
        setConfig(jsonResponse.data);
      }
    } catch (err) {
      console.error("Failed to eliminate variable tag:", err);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500 animate-pulse">Loading System Configurations...</div>;
  }

  //Update this when adding category
  const sectionsList: Array<{ id: keyof DropdownConfig; title: string; placeholder: string }> = [
    { id: "section", title: "Sections", placeholder: "e.g., ICT-1A" },
    { id: "room", title: "Rooms", placeholder: "e.g., Computer Lab 1" },
    { id: "employee_status", title: "Employee Status", placeholder: "e.g., Active, Inactive" },
    { id: "employee_role", title: "Employee Role", placeholder: "e.g., Teacher, Department Head" },
    { id: "prefix", title: "Prefix", placeholder: "e.g., Mr., Mrs." },
    { id: "specification", title: "Specification", placeholder: "e.g., Core, Applied" },
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div>
        <h2 className="text-2xl font-black text-gray-800 tracking-tight">System Global Configurations</h2>
        <p className="text-sm text-gray-500">Append or delete options used across dynamic registration portals.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sectionsList.map((sec) => (
          <div key={sec.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between space-y-4">
            <div>
              <h3 className="text-md font-bold text-gray-700 border-b pb-2 mb-3">{sec.title}</h3>
              
              {/* Dynamic tag container array view */}
              <div className="flex flex-wrap gap-2 max-h-36 overflow-y-auto p-1">
                {config?.[sec.id]?.map((item) => (
                  <span 
                    key={item} 
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 hover:bg-red-50 text-slate-700 hover:text-red-700 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors group cursor-pointer"
                    onClick={() => handleRemoveOption(sec.id, item)}
                    title="Click to remove option"
                  >
                    {item}
                    <span className="text-slate-400 group-hover:text-red-500 font-bold">✕</span>
                  </span>
                ))}
                {config?.[sec.id]?.length === 0 && (
                  <span className="text-xs text-gray-400 italic">No options defined.</span>
                )}
              </div>
            </div>

            {/* Input field block wrapper */}
            <div className="flex gap-2 pt-2">
              <input
                type="text"
                placeholder={sec.placeholder}
                value={inputs[sec.id]}
                onChange={(e) => setInputs({ ...inputs, [sec.id]: e.target.value })}
                onKeyDown={(e) => e.key === "Enter" && handleAddOption(sec.id)}
                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50"
              />
              <button
                type="button"
                onClick={() => handleAddOption(sec.id)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase transition"
              >
                Add
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}