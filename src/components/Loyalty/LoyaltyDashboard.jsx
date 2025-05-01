import React, { useState, useEffect } from "react";
import { getLoyaltyStatusReport, syncAllClientLoyaltyTiers } from "../../utils/ClientLoyaltyService"
import { getLoyaltyTiers } from "../../utils/LoyaltyService";
import { useAuth } from "../Login/AuthContext";

const LoyaltyDashboard = () => {
  const { userRole } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [report, setReport] = useState(null);
  const [tiers, setTiers] = useState([]);
  const [syncStatus, setSyncStatus] = useState(null);
  const [syncLoading, setSyncLoading] = useState(false);

  // Only admin and staff can access this dashboard
  const isAuthorized = userRole === "admin" || userRole === "staff";

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch loyalty tiers
        const tiersData = await getLoyaltyTiers();
        setTiers(tiersData);
        
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
      setSyncStatus(null);
      
      const results = await syncAllClientLoyaltyTiers();
      
      setSyncStatus({
        success: true,
        message: `Updated ${results.updated} of ${results.total} clients. ${results.errors} errors.`,
        details: results
      });
      
      // Refresh the report
      const reportData = await getLoyaltyStatusReport();
      setReport(reportData);
    } catch (err) {
      console.error("Error syncing tiers:", err);
      setSyncStatus({
        success: false,
        message: `Error syncing tiers: ${err.message}`
      });
    } finally {
      setSyncLoading(false);
    }
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
      <div className="p-6 flex justify-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 rounded-full border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-300 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">B2B Loyalty Program Dashboard</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">B2B Clients</h2>
          <p className="text-3xl font-bold text-blue-600">{report?.totalB2BClients || 0}</p>
          <p className="text-sm text-gray-500 mt-2">
            {report?.clientsWithTiers || 0} clients in loyalty tiers
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Loyalty Tiers</h2>
          <p className="text-3xl font-bold text-purple-600">{tiers.length}</p>
          <p className="text-sm text-gray-500 mt-2">
            From {tiers[0]?.discount || 0}% to {tiers[tiers.length - 1]?.discount || 0}% discount
          </p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-2">Actions</h2>
          <button
            onClick={handleSyncTiers}
            disabled={syncLoading}
            className={`w-full py-2 rounded-md ${
              syncLoading ? "bg-gray-300" : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            {syncLoading ? "Processing..." : "Sync All Client Tiers"}
          </button>
          
          {syncStatus && (
            <div className={`mt-2 text-sm ${syncStatus.success ? "text-green-600" : "text-red-600"}`}>
              {syncStatus.message}
            </div>
          )}
        </div>
      </div>
      
      {/* Tier Summary */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">Loyalty Tier Distribution</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Threshold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Count</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report?.tierSummary.map((tier) => (
                <tr key={tier.tierName}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{tier.tierName}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {tier.orderThreshold} {tier.orderThreshold === 1 ? "Order" : "Orders"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-green-600">{tier.discount}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{tier.clientCount}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Client List */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 className="text-xl font-semibold mb-4">B2B Client Loyalty Status</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Current Tier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Discount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Tier</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {report?.clientsData.map((client) => {
                // Find next tier
                const currentTierIndex = tiers.findIndex((t) => t.dbId === client.currentTierId);
                const nextTier = currentTierIndex < tiers.length - 1 ? tiers[currentTierIndex + 1] : null;
                const ordersUntilNextTier = nextTier ? nextTier.orderThreshold - client.orderCount : null;
                
                return (
                  <tr key={client.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{client.orderCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {client.currentTierName || "No Tier"}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">
                        {client.discount}%
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {nextTier ? (
                        <div className="text-sm text-gray-500">
                          {nextTier.name} in {ordersUntilNextTier} more {ordersUntilNextTier === 1 ? "order" : "orders"}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-500">Highest tier reached</div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyDashboard;