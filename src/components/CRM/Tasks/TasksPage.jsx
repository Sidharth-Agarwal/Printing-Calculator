import React, { useState, useEffect, useCallback } from "react";
import {
  getTasksDueToday, getUpcomingTasks, getOverdueTasks, getAllPendingTasks,
  createTask, updateTask, TASK_TYPES, TASK_STATUS
} from "../../../services/taskService";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";
import Modal from "../../Shared/Modal";
import CRMActionButton from "../../Shared/CRMActionButton";

const FILTERS = [
  { id: "today",    label: "Today" },
  { id: "upcoming", label: "Upcoming (7 days)" },
  { id: "overdue",  label: "Overdue" },
  { id: "all",      label: "All Pending" }
];

const TasksPage = () => {
  const [tasks,        setTasks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filter,       setFilter]       = useState("today");
  const [typeFilter,   setTypeFilter]   = useState("");
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [editTask,     setEditTask]     = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [counts,       setCounts]       = useState({ today: 0, overdue: 0 });
  const [notification, setNotification] = useState(null);

  const showNote = (msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadCounts = useCallback(async () => {
    const [today, overdue] = await Promise.all([getTasksDueToday(), getOverdueTasks()]);
    setCounts({ today: today.length, overdue: overdue.length });
  }, []);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (filter === "today")    data = await getTasksDueToday();
      else if (filter === "upcoming") data = await getUpcomingTasks(7);
      else if (filter === "overdue")  data = await getOverdueTasks();
      else                            data = await getAllPendingTasks();
      setTasks(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { loadTasks(); loadCounts(); }, [loadTasks, loadCounts]);

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editTask) {
        await updateTask(editTask.id, formData);
        showNote("Task updated");
      } else {
        await createTask(formData);
        showNote("Task created");
      }
      setIsFormOpen(false);
      setEditTask(null);
      loadTasks();
      loadCounts();
    } catch (e) { showNote(e.message, "error"); }
    finally { setIsSubmitting(false); }
  };

  const handleUpdate = () => { loadTasks(); loadCounts(); };

  const handleEdit = (task) => { setEditTask(task); setIsFormOpen(true); };

  const filtered = typeFilter
    ? tasks.filter(t => t.type === typeFilter)
    : tasks;

  // Group by type label for "all" view
  const grouped = filter === "all"
    ? TASK_TYPES.reduce((acc, type) => {
        const group = filtered.filter(t => t.type === type.value);
        if (group.length) acc[type.value] = { label: type.label, tasks: group };
        return acc;
      }, {})
    : null;

  return (
    <div className="p-4 max-w-screen-xl mx-auto">

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600 mt-1">Track follow-ups, deadlines and outreach</p>
        </div>
        <CRMActionButton type="primary" onClick={() => { setEditTask(null); setIsFormOpen(true); }}
          icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>}>
          New Task
        </CRMActionButton>
      </div>

      {notification && (
        <div className={`mb-4 p-3 rounded text-sm ${notification.type === "error" ? "bg-red-100 text-red-700 border border-red-200" : "bg-green-100 text-green-700 border border-green-200"}`}>
          {notification.msg}
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              filter === f.id ? "bg-cyan-500 text-white" : "bg-white border border-gray-300 text-gray-600 hover:bg-gray-50"
            }`}>
            {f.label}
            {f.id === "today"  && counts.today   > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${filter === "today" ? "bg-white text-cyan-600" : "bg-cyan-100 text-cyan-700"}`}>{counts.today}</span>}
            {f.id === "overdue" && counts.overdue > 0 && <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${filter === "overdue" ? "bg-white text-red-600" : "bg-red-100 text-red-700"}`}>{counts.overdue}</span>}
          </button>
        ))}

        {/* Type filter */}
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          className="ml-auto px-3 py-2 border border-gray-300 rounded-md text-sm">
          <option value="">All Types</option>
          {TASK_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      {/* Task count */}
      <p className="text-sm text-gray-500 mb-3">
        {filtered.length} {filter === "today" ? "task(s) due today" : filter === "overdue" ? "overdue task(s)" : filter === "upcoming" ? "upcoming task(s)" : "pending task(s)"}
      </p>

      {/* List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin h-10 w-10 rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          <p className="font-medium">
            {filter === "today"   ? "No tasks due today" :
             filter === "overdue" ? "Nothing overdue — great!" :
             filter === "upcoming" ? "No upcoming tasks" : "No pending tasks"}
          </p>
        </div>
      ) : grouped ? (
        // Grouped view for "all"
        <div className="space-y-6">
          {Object.values(grouped).map(group => (
            <div key={group.label}>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{group.label} ({group.tasks.length})</h3>
              <div className="space-y-2">
                {group.tasks.map(task => (
                  <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onEdit={handleEdit} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Flat list for today / upcoming / overdue
        <div className="space-y-2">
          {filtered.map(task => (
            <TaskCard key={task.id} task={task} onUpdate={handleUpdate} onEdit={handleEdit} />
          ))}
        </div>
      )}

      {/* Form modal */}
      <Modal isOpen={isFormOpen} onClose={() => { setIsFormOpen(false); setEditTask(null); }}
        title={editTask ? "Edit Task" : "New Task"} size="sm">
        <TaskForm task={editTask} onSubmit={handleSubmit}
          onCancel={() => { setIsFormOpen(false); setEditTask(null); }}
          isSubmitting={isSubmitting} />
      </Modal>
    </div>
  );
};

export default TasksPage;