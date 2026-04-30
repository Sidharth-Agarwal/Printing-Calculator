import React, { useState, useEffect } from "react";
import { getRecentDiscussions } from "../../../services/discussionService";

const TYPE_ICON = {
  call:    "📞",
  email:   "✉️",
  message: "💬"
};

const RecentActivityFeed = ({ leads = [] }) => {
  const [discussions, setDiscussions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getRecentDiscussions(8);
        setDiscussions(data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const formatRelative = (ts) => {
    if (!ts) return "";
    const d = ts?.toDate ? ts.toDate() : ts?.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
    const diff = Math.floor((Date.now() - d) / 60000);
    if (diff < 60)   return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };

  // Recent conversions from leads list
  const recentConversions = leads
    .filter(l => l.status === "converted" && l.convertedAt)
    .sort((a, b) => {
      const tA = a.convertedAt?.seconds || 0;
      const tB = b.convertedAt?.seconds || 0;
      return tB - tA;
    })
    .slice(0, 3);

  // Merge and sort all activity
  const activities = [
    ...discussions.map(d => ({
      id:      d.id,
      kind:    "discussion",
      name:    d.linkedName || "Unknown",
      summary: d.summary,
      commType:d.communicationType,
      ts:      d.date || d.createdAt
    })),
    ...recentConversions.map(l => ({
      id:   `conv-${l.id}`,
      kind: "conversion",
      name: l.name,
      ts:   l.convertedAt
    }))
  ].sort((a, b) => {
    const tA = a.ts?.seconds || 0;
    const tB = b.ts?.seconds || 0;
    return tB - tA;
  }).slice(0, 8);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 h-full">
      <h2 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin h-6 w-6 rounded-full border-b-2 border-cyan-500" />
        </div>
      ) : activities.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-8">No recent activity</p>
      ) : (
        <div className="space-y-3">
          {activities.map(a => (
            <div key={a.id} className="flex items-start gap-3">
              {/* Icon */}
              <div className={`flex-shrink-0 h-7 w-7 rounded-full flex items-center justify-center text-xs ${
                a.kind === "conversion" ? "bg-purple-100" : "bg-blue-50"
              }`}>
                {a.kind === "conversion"
                  ? "✅"
                  : TYPE_ICON[a.commType] || "💬"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 truncate">
                  {a.kind === "conversion"
                    ? <><span className="font-medium">{a.name}</span> converted to client</>
                    : <><span className="font-medium">{a.name}</span> — {a.summary}</>
                  }
                </p>
                <p className="text-xs text-gray-400">{formatRelative(a.ts)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivityFeed;