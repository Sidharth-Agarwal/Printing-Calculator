import React, { useState } from "react";
import { TASK_TYPES, TASK_STATUS, setTaskStatus, deleteTask } from "../../../services/taskService";

const TYPE_STYLES = {
  followUp:    { bg: "bg-blue-100",   text: "text-blue-700",   icon: "💬" },
  deadline:    { bg: "bg-red-100",    text: "text-red-700",    icon: "⏰" },
  birthday:    { bg: "bg-pink-100",   text: "text-pink-700",   icon: "🎂" },
  anniversary: { bg: "bg-purple-100", text: "text-purple-700", icon: "💍" },
  tempExpiry:  { bg: "bg-orange-100", text: "text-orange-700", icon: "⚠️" },
  custom:      { bg: "bg-gray-100",   text: "text-gray-700",   icon: "📌" }
};

const TaskCard = ({ task, onUpdate, onEdit, showLinked = true }) => {
  const [marking, setMarking] = useState(false);

  const style    = TYPE_STYLES[task.type] || TYPE_STYLES.custom;
  const typeLabel = TASK_TYPES.find(t => t.value === task.type)?.label || "Task";
  const isDone   = task.status === TASK_STATUS.DONE;

  const formatDate = (v) => {
    if (!v) return "—";
    const d = v?.toDate ? v.toDate() : v?.seconds ? new Date(v.seconds * 1000) : new Date(v);
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
  };

  const isOverdue = () => {
    if (isDone || !task.dueDate) return false;
    const d = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000) : new Date(task.dueDate);
    return d < new Date();
  };

  const isToday = () => {
    if (!task.dueDate) return false;
    const d = task.dueDate?.toDate ? task.dueDate.toDate() : task.dueDate?.seconds ? new Date(task.dueDate.seconds * 1000) : new Date(task.dueDate);
    const now = new Date();
    return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  };

  const handleToggle = async () => {
    setMarking(true);
    try {
      await setTaskStatus(task.id, isDone ? TASK_STATUS.PENDING : TASK_STATUS.DONE);
      onUpdate?.();
    } catch (e) { console.error(e); }
    finally { setMarking(false); }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this task?")) return;
    try { await deleteTask(task.id); onUpdate?.(); }
    catch (e) { console.error(e); }
  };

  const overdue = isOverdue();
  const today   = isToday();

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${
      isDone   ? "bg-gray-50 border-gray-200 opacity-60" :
      overdue  ? "bg-red-50 border-red-200" :
      today    ? "bg-amber-50 border-amber-200" :
      "bg-white border-gray-200"
    }`}>

      {/* Checkbox */}
      <button onClick={handleToggle} disabled={marking}
        className={`flex-shrink-0 mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
          isDone ? "bg-green-500 border-green-500 text-white" : "border-gray-300 hover:border-cyan-400"
        }`}>
        {isDone && (
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
        {marking && <div className="h-3 w-3 rounded-full border-2 border-gray-300 border-t-cyan-500 animate-spin" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm font-medium ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
            {task.title}
          </p>
          <div className="flex items-center gap-1 flex-shrink-0">
            {onEdit && !isDone && (
              <button onClick={() => onEdit(task)} className="p-1 text-gray-400 hover:text-blue-500 rounded transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            )}
            <button onClick={handleDelete} className="p-1 text-gray-400 hover:text-red-500 rounded transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-1 flex-wrap">
          {/* Type badge */}
          <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${style.bg} ${style.text}`}>
            <span>{style.icon}</span> {typeLabel}
          </span>

          {/* Due date */}
          <span className={`text-xs ${overdue ? "text-red-600 font-medium" : today ? "text-amber-600 font-medium" : "text-gray-400"}`}>
            {overdue ? "Overdue · " : today ? "Today · " : ""}{formatDate(task.dueDate)}
          </span>

          {/* Linked entity */}
          {showLinked && task.linkedName && (
            <span className="text-xs text-gray-400">
              · {task.linkedType === "lead" ? "Lead" : "Client"}: <span className="text-gray-600">{task.linkedName}</span>
            </span>
          )}
        </div>

        {task.notes && (
          <p className="text-xs text-gray-500 mt-1 truncate">{task.notes}</p>
        )}
      </div>
    </div>
  );
};

export default TaskCard;