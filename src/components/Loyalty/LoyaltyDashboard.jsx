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
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
          <svg className="mx-auto h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h2 className="mt-4 text-xl font-bold text-red-800">Unauthorized Access</h2>
          <p className="mt-2 text-red-600">You don't have permission to view the loyalty dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Loyalty Dashboard</h1>
          <div className="animate-pulse w-64 h-8 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="h-32 bg-gray-200 rounded-lg"></div>
          </div>
          <div className="h-64 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 max-w-screen-xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-red-800 font-medium">Error loading loyalty data</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-screen-xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Loyalty Dashboard</h1>
        <p className="text-gray-600 mt-1">
          Manage B2B client loyalty tiers and view loyalty program statistics
        </p>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end mb-6">
        {isAdmin && (
          <button 
            onClick={handleSyncTiers}
            disabled={syncLoading}
            className={`px-4 py-2 rounded-md shadow hover:bg-cyan-600 transition-colors flex items-center ${
              syncLoading ? "bg-gray-400 cursor-not-allowed" : "bg-cyan-500 text-white"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">B2B Clients</h2>
          <p className="text-2xl font-bold text-gray-800">{report?.totalB2BClients || 0}</p>
          <p className="text-xs text-gray-500 mt-2">
            {report?.clientsWithTiers || 0} clients in loyalty tiers
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Active Tiers</h2>
          <p className="text-2xl font-bold text-red-600">{tiers.length}</p>
          <p className="text-xs text-gray-500 mt-2">
            From {tiers[0]?.discount || 0}% to {tiers[tiers.length - 1]?.discount || 0}% discount
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-sm font-medium text-gray-500 mb-2">Average Discount</h2>
          <p className="text-2xl font-bold text-green-600">
            {report?.clientsData && report.clientsData.length > 0
              ? (report.clientsData.reduce((sum, client) => sum + (client.discount || 0), 0) / report.clientsData.length).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across all B2B clients
          </p>
        </div>
      </div>
      
      {/* Tier Summary */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-800">Loyalty Tier Distribution</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Tier Name</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Order Threshold</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Discount</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Client Count</th>
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
                  <td className="px-4 py-3 text-gray-600">
                    {tier.orderThreshold} {tier.orderThreshold === 1 ? "Order" : "Orders"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-green-600">{tier.discount}%</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <div className="w-32 bg-gray-200 rounded-full h-2.5 mr-2">
                        <div
                          className="h-2.5 rounded-full" 
                          style={{ 
                            width: `${(tier.clientCount / report.totalB2BClients) * 100}%`,
                            backgroundColor: tier.color
                          }}
                        ></div>
                      </div>
                      <span className="font-medium text-gray-700">{tier.clientCount}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Client List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-4 py-3 border-b border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <h2 className="text-lg font-medium text-gray-800">B2B Client Loyalty Status</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-wrap md:flex-nowrap items-center gap-3 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clients..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
                />
              </div>
              
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none"
              >
                <option value="all">All Clients</option>
                <option value="withTier">With Tier</option>
                <option value="noTier">No Tier</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Client Count */}
        <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
          Showing {getFilteredClients().length} of {report?.clientsData.length || 0} clients
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Client Name</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Client Code</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Order Count</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Current Tier</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Discount</th>
                <th className="px-4 py-3 border-b border-gray-200 font-medium text-gray-500">Next Tier</th>
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
                    <td className="px-4 py-3 text-gray-600">{client.clientCode || "-"}</td>
                    <td className="px-4 py-3 text-gray-600">{client.orderCount}</td>
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
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          No Tier
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-green-600">
                        {client.discount > 0 ? `${client.discount}%` : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
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
            <div className="py-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="mt-2">No clients match your search criteria.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setViewType("all");
                }}
                className="mt-3 text-red-600 hover:text-red-800 text-sm font-medium"
              >
                Clear filters
              </button>
            </div>
          )}
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