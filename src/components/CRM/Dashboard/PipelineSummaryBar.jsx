import React from "react";

const SEGMENTS = [
  { key: "total",     label: "Total Leads",  color: "bg-gray-200",   text: "text-gray-700" },
  { key: "newLead",   label: "New",          color: "bg-blue-100",   text: "text-blue-700" },
  { key: "qualified", label: "Qualified",    color: "bg-green-100",  text: "text-green-700" },
  { key: "dormant",   label: "Dormant",      color: "bg-gray-100",   text: "text-gray-500" },
  { key: "converted", label: "Converted",    color: "bg-purple-100", text: "text-purple-700" },
  { key: "lost",      label: "Lost",         color: "bg-red-100",    text: "text-red-700" }
];

const PipelineSummaryBar = ({ leads = [] }) => {
  const stats = {
    total:     leads.length,
    newLead:   leads.filter(l => ["newLead", "contacted"].includes(l.status)).length,
    qualified: leads.filter(l => ["qualified", "negotiation"].includes(l.status)).length,
    dormant:   leads.filter(l => l.status === "dormant").length,
    converted: leads.filter(l => l.status === "converted").length,
    lost:      leads.filter(l => l.status === "lost").length
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Lead Pipeline</h2>
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {SEGMENTS.map(s => (
          <div key={s.key} className={`rounded-lg p-3 ${s.color}`}>
            <p className={`text-2xl font-bold ${s.text}`}>{stats[s.key]}</p>
            <p className={`text-xs mt-0.5 ${s.text} opacity-80`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Visual bar */}
      {stats.total > 0 && (
        <div className="mt-3 flex h-2 rounded-full overflow-hidden gap-0.5">
          {[
            { key: "newLead",   color: "bg-blue-400" },
            { key: "qualified", color: "bg-green-400" },
            { key: "dormant",   color: "bg-gray-300" },
            { key: "converted", color: "bg-purple-400" },
            { key: "lost",      color: "bg-red-400" }
          ].map(s => {
            const pct = (stats[s.key] / stats.total) * 100;
            return pct > 0 ? (
              <div key={s.key} className={`${s.color} rounded-full`} style={{ width: `${pct}%` }} title={`${s.key}: ${stats[s.key]}`} />
            ) : null;
          })}
        </div>
      )}
    </div>
  );
};

export default PipelineSummaryBar;