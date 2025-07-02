import React, { useState, useEffect } from "react";
import { getUpcomingDates, getTodaysDates } from "../../services/clientDatesService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";

/**
 * Compact widget to display upcoming important dates with popup
 * @param {Object} props - Component props
 * @param {function} props.onClientClick - Handler when client is clicked
 * @param {number} props.daysAhead - Number of days to look ahead (default: 30)
 */
const ImportantDatesWidget = ({ onClientClick, daysAhead = 30 }) => {
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [todaysDates, setTodaysDates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [clientsData, setClientsData] = useState({});

  // Fetch dates on component mount
  useEffect(() => {
    fetchAllDates();
  }, [daysAhead]);

  // Fetch all dates
  const fetchAllDates = async () => {
    try {
      setIsLoading(true);
      setError("");
      
      const [upcoming, today] = await Promise.all([
        getUpcomingDates(daysAhead),
        getTodaysDates()
      ]);
      
      // Fetch real client data for each unique client ID
      const allDates = [...upcoming, ...today];
      const uniqueClientIds = [...new Set(allDates.map(date => date.clientId))];
      
      const clientsMap = {};
      
      // Fetch each client's data from Firestore
      await Promise.all(
        uniqueClientIds.map(async (clientId) => {
          try {
            const clientDocRef = doc(db, 'clients', clientId);
            const clientDoc = await getDoc(clientDocRef);
            
            if (clientDoc.exists()) {
              const clientData = clientDoc.data();
              clientsMap[clientId] = {
                id: clientId,
                name: clientData.name || "Unknown Client",
                clientCode: clientData.clientCode || "",
                clientType: clientData.clientType || "Direct"
              };
            } else {
              clientsMap[clientId] = { 
                id: clientId,
                name: "Deleted Client" 
              };
            }
          } catch (error) {
            console.error(`Error fetching client ${clientId}:`, error);
            clientsMap[clientId] = { 
              id: clientId,
              name: "Error Loading Client" 
            };
          }
        })
      );
      
      setClientsData(clientsMap);
      setUpcomingDates(upcoming);
      setTodaysDates(today);
    } catch (err) {
      console.error("Error fetching dates:", err);
      setError("Failed to load dates");
    } finally {
      setIsLoading(false);
    }
  };

  // Format date for display
  const formatDateForDisplay = (date, isRecurring = false) => {
    try {
      const dateObj = date.toDate ? date.toDate() : new Date(date);
      const today = new Date();
      
      if (isRecurring) {
        const thisYearDate = new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate());
        const nextYearDate = new Date(today.getFullYear() + 1, dateObj.getMonth(), dateObj.getDate());
        
        const targetDate = thisYearDate >= today ? thisYearDate : nextYearDate;
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { text: "Today", class: "text-red-600 font-semibold" };
        if (diffDays === 1) return { text: "Tomorrow", class: "text-orange-600 font-medium" };
        if (diffDays <= 7) return { text: `In ${diffDays} days`, class: "text-yellow-600 font-medium" };
        
        return { 
          text: `${targetDate.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' })}`, 
          class: "text-gray-600" 
        };
      } else {
        const diffTime = dateObj - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return { text: "Today", class: "text-red-600 font-semibold" };
        if (diffDays === 1) return { text: "Tomorrow", class: "text-orange-600 font-medium" };
        if (diffDays > 0 && diffDays <= 7) return { text: `In ${diffDays} days`, class: "text-yellow-600 font-medium" };
        
        return { 
          text: dateObj.toLocaleDateString("en-IN", { month: 'short', day: 'numeric' }), 
          class: "text-gray-600" 
        };
      }
    } catch (error) {
      return { text: "Invalid Date", class: "text-red-500" };
    }
  };

  // Get icon for date type
  const getDateIcon = (title, isRecurring) => {
    const titleLower = title.toLowerCase();
    
    if (titleLower.includes('birthday')) return "🎂";
    if (titleLower.includes('anniversary')) return "💍";
    if (titleLower.includes('founded')) return "🏢";
    if (titleLower.includes('contract')) return "📄";
    if (titleLower.includes('meeting')) return "📅";
    if (isRecurring) return "🔄";
    return "📌";
  };

  // Calculate stats
  const tomorrowCount = [...upcomingDates, ...todaysDates].filter(d => 
    formatDateForDisplay(d.date, d.isRecurring).text === "Tomorrow"
  ).length;
  
  const thisWeekCount = [...upcomingDates, ...todaysDates].filter(d => {
    const display = formatDateForDisplay(d.date, d.isRecurring).text;
    return display.includes("In") && parseInt(display.split(" ")[1]) <= 7;
  }).length;

  // Calculate this month count
  const thisMonthCount = [...upcomingDates, ...todaysDates].filter(d => {
    const dateObj = d.date.toDate ? d.date.toDate() : new Date(d.date);
    const today = new Date();
    
    if (d.isRecurring) {
      const thisYearDate = new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate());
      const nextYearDate = new Date(today.getFullYear() + 1, dateObj.getMonth(), dateObj.getDate());
      const targetDate = thisYearDate >= today ? thisYearDate : nextYearDate;
      
      return targetDate.getMonth() === today.getMonth() && 
             targetDate.getFullYear() === today.getFullYear();
    } else {
      return dateObj.getMonth() === today.getMonth() && 
             dateObj.getFullYear() === today.getFullYear() &&
             dateObj >= today;
    }
  }).length;

  // Handle refresh
  const handleRefresh = () => {
    fetchAllDates();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">📅 Upcoming Important Dates</h3>
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600"></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-500 mb-2">📅 Upcoming Important Dates</h3>
        <div className="text-center py-4">
          <div className="text-red-500 text-xs">{error}</div>
          <button
            onClick={handleRefresh}
            className="text-xs text-blue-600 hover:text-blue-800 mt-1"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const totalUpcoming = upcomingDates.length + todaysDates.length;

  return (
    <div className="relative">
      {/* Compact Widget */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700">📅 Upcoming Important Dates</h3>
          <button
            onClick={handleRefresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Refresh"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 0 0 4.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 0 1-15.357-2m15.357 2H15"></path>
            </svg>
          </button>
        </div>

        {totalUpcoming > 0 ? (
          <div className="space-y-4">
            {/* Quick Stats - Horizontal layout for better space usage */}
            <div className="grid grid-cols-4 gap-3">
              <div className="text-center py-2 bg-red-50 rounded">
                <p className="text-xl font-bold text-red-600">{todaysDates.length}</p>
                <p className="text-xs text-gray-600">Today</p>
              </div>
              <div className="text-center py-2 bg-orange-50 rounded">
                <p className="text-xl font-bold text-orange-600">{tomorrowCount}</p>
                <p className="text-xs text-gray-600">Tomorrow</p>
              </div>
              <div className="text-center py-2 bg-yellow-50 rounded">
                <p className="text-xl font-bold text-yellow-600">{thisWeekCount}</p>
                <p className="text-xs text-gray-600">This Week</p>
              </div>
              <div className="text-center py-2 bg-blue-50 rounded">
                <p className="text-xl font-bold text-blue-600">{thisMonthCount}</p>
                <p className="text-xs text-gray-600">This Month</p>
              </div>
            </div>

            {/* Today's Dates - Horizontal layout in single row */}
            <div>
              {/* Today's Dates - Show ALL if any exist */}
              {todaysDates.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center">
                    Today ({todaysDates.length})
                  </h4>
                  {/* Horizontal grid layout for today's dates */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                    {todaysDates.map((dateItem) => (
                      <div key={dateItem.id} className="flex flex-col p-2 bg-red-50 border border-red-200 rounded text-sm">
                        <div className="flex items-center mb-1">
                          <span className="mr-1 flex-shrink-0 text-lg">{getDateIcon(dateItem.title, dateItem.isRecurring)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-red-800 truncate">{dateItem.title}</div>
                          </div>
                        </div>
                        <div className="text-xs text-red-600 truncate font-medium">
                          {clientsData[dateItem.clientId]?.name || "Loading..."}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Show message if no dates today */}
              {todaysDates.length === 0 && (
                <div className="text-center py-4">
                  <div className="text-2xl mb-2">✅</div>
                  <p className="text-sm text-gray-600 font-medium">No dates today</p>
                  <p className="text-xs text-gray-500">All clear for today!</p>
                </div>
              )}
            </div>

            {/* View All Button */}
            <button
              onClick={() => setShowPopup(true)}
              className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium py-2 border border-blue-200 rounded hover:bg-blue-50 transition-colors mt-4"
            >
              View All {totalUpcoming} Important Dates →
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="text-3xl mb-2">📅</div>
            <p className="text-sm text-gray-700 font-medium">No Upcoming Dates</p>
            <p className="text-xs text-gray-500">No important dates in the next {daysAhead} days</p>
          </div>
        )}
      </div>

      {/* Popup Modal */}
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-semibold">All Important Dates</h3>
              <button
                onClick={() => setShowPopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-4 overflow-y-auto max-h-96">
              {/* Today's Dates */}
              {todaysDates.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-red-600 mb-3">Today</h4>
                  <div className="space-y-2">
                    {todaysDates.map((dateItem) => (
                      <div key={dateItem.id} className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded">
                        <div className="flex items-center">
                          <span className="text-lg mr-3">{getDateIcon(dateItem.title, dateItem.isRecurring)}</span>
                          <div>
                            <div className="font-medium text-gray-800">{dateItem.title}</div>
                            <div className="text-sm text-gray-600">{clientsData[dateItem.clientId]?.name || "Unknown Client"}</div>
                            {dateItem.description && (
                              <div className="text-sm text-gray-500 italic">{dateItem.description}</div>
                            )}
                          </div>
                        </div>
                        {dateItem.isRecurring && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Annual</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upcoming Dates */}
              {upcomingDates.length > 0 && (
                <div>
                  <h4 className="font-medium text-blue-600 mb-3">Upcoming</h4>
                  <div className="space-y-2">
                    {upcomingDates.map((dateItem) => {
                      const displayDate = formatDateForDisplay(dateItem.date, dateItem.isRecurring);
                      
                      let bgClass = "bg-gray-50 border-gray-200";
                      if (displayDate.text === "Tomorrow") {
                        bgClass = "bg-orange-50 border-orange-200";
                      } else if (displayDate.text.includes("In") && parseInt(displayDate.text.split(" ")[1]) <= 7) {
                        bgClass = "bg-yellow-50 border-yellow-200";
                      }
                      
                      return (
                        <div key={dateItem.id} className={`flex justify-between items-center p-3 border rounded ${bgClass}`}>
                          <div className="flex items-center">
                            <span className="text-lg mr-3">{getDateIcon(dateItem.title, dateItem.isRecurring)}</span>
                            <div>
                              <div className="font-medium text-gray-800">{dateItem.title}</div>
                              <div className="text-sm text-gray-600">{clientsData[dateItem.clientId]?.name || "Unknown Client"}</div>
                              {dateItem.description && (
                                <div className="text-sm text-gray-500 italic">{dateItem.description}</div>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-sm ${displayDate.class}`}>{displayDate.text}</span>
                            {dateItem.isRecurring && (
                              <div className="text-xs text-gray-500">Annual</div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {totalUpcoming === 0 && (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📅</div>
                  <h5 className="text-gray-700 font-medium mb-1">No Important Dates</h5>
                  <p className="text-sm text-gray-500">No important dates in the next {daysAhead} days</p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowPopup(false)}
                className="w-full px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportantDatesWidget;