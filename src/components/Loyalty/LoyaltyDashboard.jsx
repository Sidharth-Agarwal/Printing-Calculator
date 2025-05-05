import React, { useState, useEffect } from "react";
import { getLoyaltyStatusReport, syncAllClientLoyaltyTiers } from "../../utils/ClientLoyaltyService";
import { getLoyaltyTiers } from "../../utils/LoyaltyService";
import { useAuth } from "../Login/AuthContext";
import ConfirmationModal from "../Shared/ConfirmationModal";

const LoyaltyDashboard = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const [notification, setNotification] = useState({
    isOpen: false,
    message: "",
    title: "",
    status: "success"
  });
  const [viewType, setViewType] = useState('all'); // 'all', 'withTier', 'noTier'
  const [searchTerm, setSearchTerm] = useState("");

  // Only admin and staff can access this dashboard
  const isAuthorized = userRole === "admin" || userRole === "staff";
  const isAdmin = userRole === "admin";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch loyalty tiers
        const tiersData = await getLoyaltyTiers();
        // Sort by order threshold
        const sortedTiers = tiersData.sort((a, b) => a.orderThreshold - b.orderThreshold);
        setTiers(sortedTiers);
        
        // Fetch loyalty report
        const reportData = await getLoyaltyStatusReport();
        setReport(reportData);
        
        setError(null);
      } catch (err) {
        console.error("Error fetching loyalty data:", err);
        setError("Failed to load loyalty program data");
      } finally {
        setLoading(false);
      }
    };
    
    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const handleSyncTiers = async () => {
    try {
      setSyncLoading(true);
      
      const results = await syncAllClientLoyaltyTiers();
      
      setNotification({
        isOpen: true,
        title: "Sync Complete",
        message: `Updated ${results.updated} of ${results.total} clients. ${results.errors} errors.`,
        status: results.errors > 0 ? "warning" : "success"
      });
      
      // Refresh the report
      const reportData = await getLoyaltyStatusReport();
      setReport(reportData);
    } catch (err) {
      console.error("Error syncing tiers:", err);
      setNotification({
        isOpen: true,
        title: "Sync Failed",
        message: `Error syncing tiers: ${err.message}`,
        status: "error"
      });
    } finally {
      setSyncLoading(false);
    }
  };

  const closeNotification = () => {
    setNotification({
      isOpen: false,
      message: "",
      title: "",
      status: "success"
    });
  };

  // Filter clients based on search term and view type
  const getFilteredClients = () => {
    if (!report || !report.clientsData) return [];
    
    return report.clientsData.filter(client => {
      // Filter by search term
      const matchesSearch = searchTerm === "" || 
        client.name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by tier status
      const matchesTierFilter = 
        viewType === 'all' ||
        (viewType === 'withTier' && client.currentTierId) ||
        (viewType === 'noTier' && !client.currentTierId);
      
      return matchesSearch && matchesTierFilter;
    });
  };

  if (!isAuthorized) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Unauthorized Access</h2>
        <p className="text-red-600">You don't have permission to view the loyalty dashboard.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="rounded bg-gray-900 py-4">
        <h1 className="text-2xl text-white font-bold pl-4">B2B Loyalty Program</h1>
      </div>

      {/* Main content */}
      <div className="py-4">
        {/* Action buttons */}
        <div className="flex justify-end mb-4 px-4">
          {isAdmin && (
            <button 
              onClick={handleSyncTiers}
              disabled={syncLoading}
              className={`px-4 py-2 rounded-md shadow hover:bg-red-700 transition-colors flex items-center ${
                syncLoading ? "bg-gray-400 cursor-not-allowed" : "bg-red-600 text-white"
              }`}
            >
              {syncLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                  Sync Client Tiers
                </>
              )}
            </button>
          )}
        </div>
      
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6 px-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">B2B Clients</h2>
            <p className="text-3xl font-bold text-red-600">{report?.totalB2BClients || 0}</p>
            <p className="text-sm text-gray-500 mt-2">
              {report?.clientsWithTiers || 0} clients in loyalty tiers
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">Active Tiers</h2>
            <p className="text-3xl font-bold text-red-600">{tiers.length}</p>
            <p className="text-sm text-gray-500 mt-2">
              From {tiers[0]?.discount || 0}% to {tiers[tiers.length - 1]?.discount || 0}% discount
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-lg font-bold mb-2">Average Discount</h2>
            <p className="text-3xl font-bold text-red-600">
              {report?.clientsData && report.clientsData.length > 0
                ? (report.clientsData.reduce((sum, client) => sum + (client.discount || 0), 0) / report.clientsData.length).toFixed(1)
                : 0}%
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Across all B2B clients
            </p>
          </div>
        </div>
        
        {/* Tier Summary */}
        <div className="bg-white rounded-lg shadow-md mb-6 mx-4">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-lg font-bold">Loyalty Tier Distribution</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Tier Name</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Order Threshold</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Discount</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Client Count</th>
                </tr>
              </thead>
              <tbody>
                {report?.tierSummary.map((tier) => (
                  <tr key={tier.tierId} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-2" 
                          style={{ backgroundColor: tier.color }}
                        ></div>
                        <div className="font-medium text-gray-900">{tier.tierName}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {tier.orderThreshold} {tier.orderThreshold === 1 ? "Order" : "Orders"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-green-600">{tier.discount}%</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <div className="w-32 bg-gray-200 rounded-full h-2.5">
                          <div
                            className="h-2.5 rounded-full" 
                            style={{ 
                              width: `${(tier.clientCount / report.totalB2BClients) * 100}%`,
                              backgroundColor: tier.color
                            }}
                          ></div>
                        </div>
                        <span className="ml-2 text-gray-900">{tier.clientCount}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Client List */}
        <div className="bg-white rounded-lg shadow-md mx-4">
          <div className="px-4 py-3 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-3">
            <h2 className="text-lg font-bold">B2B Client Loyalty Status</h2>
            
            {/* Search and Filter */}
            <div className="flex items-center space-x-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-3 py-2 w-full border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              >
                <option value="all">All Clients</option>
                <option value="withTier">With Tier</option>
                <option value="noTier">No Tier</option>
              </select>
            </div>
          </div>
          
          {/* Client Count */}
          <div className="px-4 py-2 text-sm text-gray-600">
            Showing {getFilteredClients().length} of {report?.clientsData.length || 0} clients
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Client Name</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Client Code</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Order Count</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Current Tier</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Discount</th>
                  <th className="px-4 py-3 border-b-2 border-gray-200 font-semibold text-gray-800 text-left">Next Tier</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredClients().map((client) => {
                  // Find next tier
                  const currentTierIndex = tiers.findIndex((t) => t.dbId === client.currentTierId);
                  const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
                  const ordersUntilNextTier = nextTier ? nextTier.orderThreshold - client.orderCount : null;
                  
                  return (
                    <tr 
                      key={client.id} 
                      className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                      style={{
                        borderLeft: client.currentTierId ? `4px solid ${client.color}` : '',
                        backgroundColor: client.currentTierId ? `${client.color}10` : ''
                      }}
                    >
                      <td className="px-4 py-3 font-medium text-gray-900">{client.name}</td>
                      <td className="px-4 py-3">{client.clientCode || "-"}</td>
                      <td className="px-4 py-3">{client.orderCount}</td>
                      <td className="px-4 py-3">
                        {client.currentTierName ? (
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: client.color }}
                            ></div>
                            <span 
                              className="px-2 py-1 rounded text-xs font-medium text-white"
                              style={{ 
                                backgroundColor: client.color,
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)" 
                              }}
                            >
                              {client.currentTierName}
                            </span>
                          </div>
                        ) : (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            No Tier
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-green-600">
                          {client.discount > 0 ? `${client.discount}%` : "-"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {nextTier ? (
                          <>
                            {nextTier.name} in {ordersUntilNextTier} more {ordersUntilNextTier === 1 ? "order" : "orders"}
                          </>
                        ) : (
                          client.currentTierId ? "Highest tier reached" : `${tiers[0]?.name || 'First tier'} in ${tiers[0]?.orderThreshold || 1} orders`
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {getFilteredClients().length === 0 && (
              <div className="py-8 text-center text-gray-500 bg-white">
                <p>No clients match your search criteria.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Notification Modal */}
      <ConfirmationModal
        isOpen={notification.isOpen}
        onClose={closeNotification}
        message={notification.message}
        title={notification.title}
        status={notification.status}
      />
    </div>
  );
};

export default LoyaltyDashboard;