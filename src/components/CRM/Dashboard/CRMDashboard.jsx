import React, { useState, useEffect } from "react";
import { useCRM } from "../../../context/CRMContext";
import { getTasksDueToday } from "../../../services/taskService";
import { getClientStats } from "../../../services/clientService";
import { getActiveTickets } from "../../../services/jobTicketService";
import { getKanbanStatusForLead } from "../../../constants/leadStatuses";
import PipelineSummaryBar from "./PipelineSummaryBar";
import RecentActivityFeed from "./RecentActivityFeed";
import TaskCard from "../Tasks/TaskCard";
import { useNavigate } from "react-router-dom";

// ── Stat card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = "text-gray-800", onClick }) => (
  <div onClick={onClick}
    className={`bg-white rounded-lg border border-gray-200 p-4 ${onClick ? "cursor-pointer hover:shadow-md transition-shadow" : ""}`}>
    <p className="text-xs text-gray-500">{label}</p>
    <p className={`text-2xl font-bold mt-1 ${color}`}>{value}</p>
    {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Revenue helper ────────────────────────────────────────────────────────────
const getRevenueThisMonth = (tickets) => {
  const now = new Date();
  return tickets
    .filter(t => {
      const created = t.createdAt?.toDate
        ? t.createdAt.toDate()
        : t.createdAt?.seconds
        ? new Date(t.createdAt.seconds * 1000)
        : null;
      return created && created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + (parseFloat(t.finalBilled) || 0), 0);
};

const fmt = (n) => `₹${Number(n).toLocaleString("en-IN")}`;

// ── Dashboard ─────────────────────────────────────────────────────────────────
const CRMDashboard = () => {
  const { leads, isLoadingLeads } = useCRM();
  const navigate = useNavigate();

  const [todayTasks,    setTodayTasks]    = useState([]);
  const [clientStats,   setClientStats]   = useState(null);
  const [activeTickets, setActiveTickets] = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [taskRefresh,   setTaskRefresh]   = useState(0);

  useEffect(() => {
    const load = async () => {
      const [tasks, stats, tickets] = await Promise.all([
        getTasksDueToday(),
        getClientStats(),
        getActiveTickets()
      ]);
      setTodayTasks(tasks);
      setClientStats(stats);
      setActiveTickets(tickets);
      setLoading(false);
    };
    load();
  }, [taskRefresh]);

  // ── Derived stats ───────────────────────────────────────────────────────────
  const activeLeads    = leads.filter(l => !["converted", "lost", "dormant"].includes(l.status));
  const convertedLeads = leads.filter(l => l.status === "converted");
  const conversionRate = leads.length > 0
    ? Math.round((convertedLeads.length / leads.length) * 100) : 0;

  const repeatRate = clientStats && clientStats.total > 0
    ? Math.round(((clientStats.total - (clientStats.total - (clientStats.totalOrders - clientStats.total))) / clientStats.total) * 100)
    : 0;

  const revenueThisMonth = getRevenueThisMonth(activeTickets);
  const overdueTickets   = activeTickets.filter(t => {
    if (!t.deadline || t.orderStatus === "completed") return false;
    const d = t.deadline?.toDate ? t.deadline.toDate() : t.deadline?.seconds ? new Date(t.deadline.seconds * 1000) : new Date(t.deadline);
    return d < new Date();
  });

  // Dead pool: no discussion + created > 90 days
  const deadPoolCount = leads.filter(l => {
    if (l.lastDiscussionDate) return false;
    const c = l.createdAt?.toDate ? l.createdAt.toDate() : l.createdAt?.seconds ? new Date(l.createdAt.seconds * 1000) : null;
    return c && (Date.now() - c.getTime()) > 90 * 24 * 60 * 60 * 1000;
  }).length;

  return (
    <div className="p-4 max-w-screen-xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
        <StatCard label="Total Leads"      value={leads.length}           color="text-gray-800"   onClick={() => navigate("/crm/lead-management")} />
        <StatCard label="Active Leads"     value={activeLeads.length}     color="text-blue-600"   onClick={() => navigate("/crm/lead-management")} />
        <StatCard label="Conversion Rate"  value={`${conversionRate}%`}   color="text-purple-600" />
        <StatCard label="Active Clients"   value={clientStats?.active ?? "—"} color="text-cyan-600" onClick={() => navigate("/crm/clients")} />
        <StatCard label="Repeat Clients"   value={clientStats ? `${Math.round(((clientStats.total - clientStats.active) / Math.max(clientStats.total,1))*100) || "—"}%` : "—"} color="text-amber-600" sub="of total clients" />
        <StatCard label="Revenue (Month)"  value={revenueThisMonth > 0 ? fmt(revenueThisMonth) : "—"} color="text-green-700" />
        <StatCard label="Active Orders"    value={activeTickets.length}   color="text-indigo-600" onClick={() => navigate("/crm/clients")} sub={overdueTickets.length > 0 ? `${overdueTickets.length} overdue` : undefined} />
        <StatCard label="Dead Pool"        value={deadPoolCount}          color="text-red-500"    sub="no contact 90d+" onClick={() => navigate("/crm/lead-management")} />
      </div>

      {/* Pipeline */}
      <PipelineSummaryBar leads={leads} />

      {/* Middle row — activity + tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Recent activity */}
        <RecentActivityFeed leads={leads} />

        {/* Today's tasks */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-700">
              Today's Tasks
              {todayTasks.length > 0 && (
                <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                  {todayTasks.length}
                </span>
              )}
            </h2>
            <button onClick={() => navigate("/crm/tasks")}
              className="text-xs text-cyan-600 hover:underline font-medium">
              View all →
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-6 w-6 rounded-full border-b-2 border-cyan-500" />
            </div>
          ) : todayTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-sm">No tasks due today</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {todayTasks.map(task => (
                <TaskCard key={task.id} task={task} onUpdate={() => setTaskRefresh(r => r + 1)} showLinked />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Active orders summary */}
      {activeTickets.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Active Orders ({activeTickets.length})</h2>
            <button onClick={() => navigate("/crm/clients")} className="text-xs text-cyan-600 hover:underline font-medium">View clients →</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {["design", "production", "dispatched"].map(status => {
              const group = activeTickets.filter(t => t.orderStatus === status);
              const colors = {
                design:     { bg: "bg-blue-50",   text: "text-blue-700",   label: "Design" },
                production: { bg: "bg-amber-50",  text: "text-amber-700",  label: "Production" },
                dispatched: { bg: "bg-purple-50", text: "text-purple-700", label: "Dispatched" }
              };
              const c = colors[status];
              return (
                <div key={status} className={`rounded-lg p-3 ${c.bg}`}>
                  <p className={`text-xs font-medium ${c.text}`}>{c.label}</p>
                  <p className={`text-xl font-bold mt-1 ${c.text}`}>{group.length}</p>
                  {group.slice(0, 2).map(t => (
                    <p key={t.id} className={`text-xs mt-1 truncate ${c.text} opacity-70`}>{t.jobType}</p>
                  ))}
                  {group.length > 2 && <p className={`text-xs ${c.text} opacity-50`}>+{group.length - 2} more</p>}
                </div>
              );
            })}
          </div>

          {overdueTickets.length > 0 && (
            <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-700">
              ⚠️ {overdueTickets.length} order{overdueTickets.length > 1 ? "s are" : " is"} past deadline
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CRMDashboard;