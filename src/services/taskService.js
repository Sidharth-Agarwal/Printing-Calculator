import {
  collection, addDoc, doc, updateDoc, deleteDoc,
  getDoc, getDocs, query, where, orderBy, serverTimestamp, Timestamp
} from "firebase/firestore";
import { db } from "../firebaseConfig";

const COLLECTION = "tasks";

export const TASK_TYPES = [
  { value: "followUp",    label: "Follow-up" },
  { value: "deadline",    label: "Deadline" },
  { value: "birthday",    label: "Birthday Outreach" },
  { value: "anniversary", label: "Anniversary Outreach" },
  { value: "tempExpiry",  label: "Temp Client Expiry" },
  { value: "custom",      label: "Custom" }
];

export const TASK_STATUS = { PENDING: "pending", DONE: "done" };

const toTimestamp = (v) => {
  if (!v) return null;
  if (v instanceof Timestamp) return v;
  if (v instanceof Date) return Timestamp.fromDate(v);
  if (typeof v === "string") return Timestamp.fromDate(new Date(v));
  return null;
};

// ── Core CRUD ─────────────────────────────────────────────────────────────────

export const createTask = async (taskData) => {
  try {
    if (!taskData.title || !taskData.dueDate) throw new Error("Title and due date are required");
    const ref = await addDoc(collection(db, COLLECTION), {
      title:      taskData.title,
      linkedTo:   taskData.linkedTo   || null,
      linkedType: taskData.linkedType || null,
      linkedName: taskData.linkedName || null,
      dueDate:    toTimestamp(taskData.dueDate),
      type:       taskData.type       || "custom",
      assignedTo: taskData.assignedTo || null,
      status:     TASK_STATUS.PENDING,
      notes:      taskData.notes      || "",
      createdAt:  serverTimestamp(),
      updatedAt:  serverTimestamp()
    });
    const snap = await getDoc(ref);
    return { id: ref.id, ...snap.data() };
  } catch (err) { console.error("Error creating task:", err); throw err; }
};

export const updateTask = async (taskId, updates) => {
  try {
    if (updates.dueDate) updates.dueDate = toTimestamp(updates.dueDate);
    await updateDoc(doc(db, COLLECTION, taskId), { ...updates, updatedAt: serverTimestamp() });
  } catch (err) { console.error(`Error updating task ${taskId}:`, err); throw err; }
};

export const setTaskStatus = async (taskId, status) => updateTask(taskId, { status });

export const deleteTask = async (taskId) => {
  try { await deleteDoc(doc(db, COLLECTION, taskId)); }
  catch (err) { console.error(`Error deleting task ${taskId}:`, err); throw err; }
};

export const getTaskById = async (taskId) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, taskId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  } catch (err) { console.error(`Error fetching task ${taskId}:`, err); throw err; }
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const getTasksForEntity = async (linkedTo, linkedType) => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("linkedTo",   "==", linkedTo),
      where("linkedType", "==", linkedType),
      orderBy("dueDate", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error("Error fetching tasks for entity:", err); return []; }
};

export const getTasksDueToday = async () => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const q = query(
      collection(db, COLLECTION),
      where("status",  "==", TASK_STATUS.PENDING),
      where("dueDate", ">=", Timestamp.fromDate(start)),
      where("dueDate", "<=", Timestamp.fromDate(end)),
      orderBy("dueDate", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error("Error fetching today's tasks:", err); return []; }
};

export const getUpcomingTasks = async (days = 7) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setDate(end.getDate() + days); end.setHours(23, 59, 59, 999);
    const q = query(
      collection(db, COLLECTION),
      where("status",  "==", TASK_STATUS.PENDING),
      where("dueDate", ">=", Timestamp.fromDate(start)),
      where("dueDate", "<=", Timestamp.fromDate(end)),
      orderBy("dueDate", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error("Error fetching upcoming tasks:", err); return []; }
};

export const getOverdueTasks = async () => {
  try {
    const now = Timestamp.fromDate(new Date());
    const q = query(
      collection(db, COLLECTION),
      where("status",  "==", TASK_STATUS.PENDING),
      where("dueDate", "<",  now),
      orderBy("dueDate", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error("Error fetching overdue tasks:", err); return []; }
};

export const getAllPendingTasks = async () => {
  try {
    const q = query(
      collection(db, COLLECTION),
      where("status", "==", TASK_STATUS.PENDING),
      orderBy("dueDate", "asc")
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) { console.error("Error fetching all pending tasks:", err); return []; }
};

// ── Convenience creators ──────────────────────────────────────────────────────

export const createFollowUpTask = async ({ leadId, leadName, followUpDate, assignedTo = null }) =>
  createTask({
    title: `Follow up with ${leadName}`,
    linkedTo: leadId, linkedType: "lead", linkedName: leadName,
    dueDate: followUpDate, type: "followUp", assignedTo
  });

export const createDeadlineTask = async ({ clientId, clientName, ticketId, jobType, deadline }) =>
  createTask({
    title:      `Deadline: ${jobType} — ${clientName}`,
    linkedTo:   clientId, linkedType: "client", linkedName: clientName,
    dueDate:    deadline, type: "deadline",
    notes:      `Job ticket ID: ${ticketId}`
  });

export const createBirthdayTask = async ({ clientId, clientName, birthdayDate }) =>
  createTask({
    title:      `Birthday outreach — ${clientName}`,
    linkedTo:   clientId, linkedType: "client", linkedName: clientName,
    dueDate:    birthdayDate, type: "birthday"
  });

export const createAnniversaryTask = async ({ clientId, clientName, anniversaryDate }) =>
  createTask({
    title:      `Anniversary outreach — ${clientName}`,
    linkedTo:   clientId, linkedType: "client", linkedName: clientName,
    dueDate:    anniversaryDate, type: "anniversary"
  });