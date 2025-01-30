import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import Estimate from "./Estimate";

const EstimatesPage = () => {
  const [estimatesData, setEstimatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [ordersData, setOrdersData] = useState({});
  const [sortCriteria, setSortCriteria] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [expandedGroups, setExpandedGroups] = useState({});

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Group data by client and project
        const groupedData = data.reduce((acc, estimate) => {
          const { clientName, projectName } = estimate;
          const groupKey = `${clientName}-${projectName}`;
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(estimate);
          return acc;
        }, {});

        setEstimatesData(groupedData);
        setFilteredData(groupedData);

        // Set orders state
        const ordersState = Object.entries(groupedData).reduce(
          (acc, [groupKey, estimates]) => {
            const movedEstimate = estimates.find((estimate) => estimate.movedToOrders);
            if (movedEstimate) {
              acc[groupKey] = movedEstimate.id;
            }
            return acc;
          },
          {}
        );
        setOrdersData(ordersState);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  // Calculate total estimate cost for a group
  const calculateTotalCost = (estimates) => {
    return estimates.reduce((total, estimate) => {
      if (!estimate.calculations) return total;

      const relevantFields = [
        'paperAndCuttingCostPerCard',
        'lpCostPerCard',
        'fsCostPerCard',
        'embCostPerCard',
        'lpCostPerCardSandwich',
        'fsCostPerCardSandwich',
        'embCostPerCardSandwich',
        'digiCostPerCard'
      ];

      const costPerCard = relevantFields.reduce((acc, key) => {
        const value = estimate.calculations[key];
        return acc + (value !== null && value !== "Not Provided" ? parseFloat(value) || 0 : 0);
      }, 0);

      return total + (costPerCard * (estimate.jobDetails?.quantity || 0));
    }, 0);
  };

  // Determine group status
  const getGroupStatus = (estimates) => {
    if (estimates.some(est => est.isCanceled)) return "Cancelled";
    if (estimates.some(est => est.movedToOrders)) return "Moved to Orders";
    return "Pending";
  };

  // Handle search and filtering
  useEffect(() => {
    const filtered = Object.entries(estimatesData).reduce((acc, [groupKey, estimates]) => {
      const [clientName, projectName] = groupKey.split("-");
      const matchesSearch = estimates.some((estimate) =>
        Object.values({
          clientName: clientName || "",
          projectName: projectName || "",
          jobType: estimate.jobDetails?.jobType || "",
          quantity: estimate.jobDetails?.quantity?.toString() || "",
        }).some((value) => value.toLowerCase().includes(searchQuery.toLowerCase()))
      );

      if (matchesSearch) {
        if (filterStatus) {
          const status = getGroupStatus(estimates);
          if (status === filterStatus) {
            acc[groupKey] = estimates;
          }
        } else {
          acc[groupKey] = estimates;
        }
      }

      return acc;
    }, {});

    setFilteredData(filtered);
  }, [searchQuery, estimatesData, filterStatus]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Estimates</h1>
          <div className="animate-pulse w-64 h-10 bg-gray-200 rounded-md"></div>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
          <div className="h-12 bg-gray-200 rounded-md"></div>
        </div>
      </div>
    );
  }

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({
      ...prev,
      [groupKey]: !prev[groupKey]
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Estimates DB</h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search estimates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Moved to Orders">Moved to Orders</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Client Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Expected Delivery Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Estimate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(filteredData).map(([groupKey, estimates]) => {
              const [clientName, projectName] = groupKey.split("-");
              const firstEstimate = estimates[0];
              const status = getGroupStatus(estimates);
              const totalCost = calculateTotalCost(estimates);

              return (
                <React.Fragment key={groupKey}>
                  <tr 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-blue-600">{clientName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{projectName}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.jobType}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{firstEstimate.jobDetails?.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {new Date(firstEstimate.deliveryDate).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">₹ {totalCost.toFixed(2)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        status === "Moved to Orders"
                          ? "bg-green-100 text-green-800"
                          : status === "Cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}>
                        {status}
                      </span>
                    </td>
                  </tr>
                  {expandedGroups[groupKey] && (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 bg-gray-50">
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                          {estimates.map((estimate, index) => (
                            <Estimate
                              key={estimate.id}
                              estimate={estimate}
                              estimateNumber={index + 1}
                              movedToOrdersEstimateId={ordersData[groupKey]}
                              setMovedToOrders={(id) =>
                                setOrdersData((prev) => ({ ...prev, [groupKey]: id }))
                              }
                              estimates={estimates}
                              setEstimatesData={setEstimatesData}
                              groupKey={groupKey}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EstimatesPage;