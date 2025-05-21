import React, { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

/**
 * Component to display a history of discussions with a lead
 * @param {Object} props - Component props
 * @param {Array} props.discussions - Array of discussion objects
 * @param {boolean} props.loading - Loading state
 * @param {function} props.formatDate - Function to format dates
 * @param {Object} props.lead - Lead object
 */
const DiscussionHistory = ({ 
  discussions = [], 
  loading = false,
  formatDate = (date) => {
    if (!date) return 'N/A';
    
    const dateObj = date.toDate ? date.toDate() : 
                   (date.seconds ? new Date(date.seconds * 1000) : 
                   new Date(date));
                   
    return dateObj.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  },
  lead = null
}) => {
  console.log("DiscussionHistory received:", { 
    discussions, 
    loading, 
    discussionsLength: discussions?.length,
    leadId: lead?.id
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600"></div>
        <span className="ml-2 text-gray-600">Loading discussions...</span>
      </div>
    );
  }

  if (!discussions || discussions.length === 0) {
    return (
      <div className="text-center p-6">
        <div className="mb-4 text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </div>
        <p className="text-gray-500">No discussion history found.</p>
        <p className="text-sm text-gray-400 mt-1">
          Add your first discussion to start tracking your communication with this lead.
        </p>
      </div>
    );
  }

  // Sort discussions by date (newest first)
  const sortedDiscussions = [...discussions].sort((a, b) => {
    const dateA = a.date ? (a.date.seconds ? a.date.seconds * 1000 : new Date(a.date).getTime()) : 0;
    const dateB = b.date ? (b.date.seconds ? b.date.seconds * 1000 : new Date(b.date).getTime()) : 0;
    return dateB - dateA;
  });

  return (
    <div className="space-y-4">
      {sortedDiscussions.map((discussion) => (
        <DiscussionItem 
          key={discussion.id} 
          discussion={discussion} 
          formatDate={formatDate}
        />
      ))}
    </div>
  );
};

/**
 * Component to display a single discussion item
 * @param {Object} props - Component props
 * @param {Object} props.discussion - Discussion object
 * @param {function} props.formatDate - Function to format dates
 */
const DiscussionItem = ({ discussion, formatDate }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      if (!discussion.createdBy) {
        setUserData({ displayName: "Unknown User", initials: "UN" });
        setLoading(false);
        return;
      }

      try {
        // Try to fetch the user from Firestore
        const userDoc = await getDoc(doc(db, "users", discussion.createdBy));
        
        if (userDoc.exists()) {
          const user = userDoc.data();
          
          // Get display name from Firestore
          let displayName = user.displayName || user.name || "Unknown User";
          
          // Create initials
          let initials;
          if (displayName && displayName !== "Unknown User") {
            const nameParts = displayName.split(' ');
            if (nameParts.length > 1) {
              initials = (nameParts[0][0] + nameParts[1][0]).toUpperCase();
            } else {
              initials = displayName.substring(0, 2).toUpperCase();
            }
          } else {
            initials = "UN";
          }
          
          setUserData({
            id: discussion.createdBy,
            displayName,
            initials,
            email: user.email
          });
        } else {
          // If user not found in Firestore, create a display name from the ID
          const firstPart = discussion.createdBy.substring(0, 4);
          setUserData({
            id: discussion.createdBy,
            displayName: "User " + firstPart,
            initials: discussion.createdBy.substring(0, 2).toUpperCase(),
          });
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Default to using parts of user ID if fetch fails
        setUserData({
          id: discussion.createdBy,
          displayName: "User",
          initials: discussion.createdBy.substring(0, 2).toUpperCase(),
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [discussion.createdBy]);

  // Check all expected properties exist
  const hasRequiredFields = discussion && 
                          discussion.date && 
                          (discussion.summary !== undefined);
                          
  if (!hasRequiredFields) {
    console.error("Discussion missing required fields:", discussion);
    return (
      <div className="p-3 bg-red-50 border border-red-100 rounded-md">
        <p className="text-red-500 text-sm">Invalid discussion data</p>
        <pre className="text-xs text-red-400 mt-1 overflow-auto max-h-20">
          {JSON.stringify(discussion, null, 2)}
        </pre>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm opacity-70">
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-200 animate-pulse"></div>
            <div className="ml-2 h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="ml-10">
          <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-md border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center">
          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium mr-2">
            {userData?.initials || "UN"}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-900">
              {userData?.displayName || "Unknown User"}
            </span>
          </div>
        </div>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {formatDate(discussion.date)}
        </span>
      </div>
      
      <div className="ml-10">
        <div className="text-gray-700 break-words">
          {discussion.summary || "No summary provided"}
        </div>
        
        {discussion.nextSteps && (
          <div className="mt-3 pt-2 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-1">Next Steps:</p>
            <p className="text-sm text-gray-600 break-words">
              {discussion.nextSteps}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionHistory;