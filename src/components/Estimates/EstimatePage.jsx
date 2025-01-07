import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import GroupDropdown from "./GroupDropdown";

const EstimatesPage = () => {
  const [estimatesData, setEstimatesData] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState({});
  const [noResults, setNoResults] = useState(false);
  const [ordersData, setOrdersData] = useState({});
  const [sortCriteria, setSortCriteria] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const groupedData = data.reduce((acc, estimate) => {
          const { clientName, projectName } = estimate;
          const groupKey = `${clientName}-${projectName}`;
          if (!acc[groupKey]) acc[groupKey] = [];
          acc[groupKey].push(estimate);
          return acc;
        }, {});

        setEstimatesData(groupedData);
        setFilteredData(groupedData);

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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFiltersAndSort(query, filterStatus, sortCriteria);
  };

  const handleSortChange = (e) => {
    const selectedSort = e.target.value;
    setSortCriteria(selectedSort);
    applyFiltersAndSort(searchQuery, filterStatus, selectedSort);
  };

  const handleFilterChange = (e) => {
    const selectedFilter = e.target.value;
    setFilterStatus(selectedFilter);
    applyFiltersAndSort(searchQuery, selectedFilter, sortCriteria);
  };

  const applyFiltersAndSort = (query, statusFilter, sortBy) => {
    let filtered = Object.entries(estimatesData);

    if (query) {
      filtered = filtered.filter(([groupKey, estimates]) => {
        const [clientName, projectName] = groupKey.split("-");
        return estimates.some((estimate) => {
          const jobType = estimate?.jobDetails?.jobType?.toLowerCase() || "";
          const quantity = estimate?.jobDetails?.quantity?.toString() || "";
          return (
            clientName.toLowerCase().includes(query) ||
            projectName.toLowerCase().includes(query) ||
            jobType.includes(query) ||
            quantity.includes(query)
          );
        });
      });
    }

    if (statusFilter) {
      filtered = filtered.filter(([groupKey, estimates]) => {
        const movedToOrders = estimates.some((estimate) => estimate.movedToOrders);
        const isCanceled = estimates.some((estimate) => estimate.isCanceled);

        if (statusFilter === "Order Confirmed") return movedToOrders;
        if (statusFilter === "Cancelled") return isCanceled;
        if (statusFilter === "Pending") return !movedToOrders && !isCanceled;

        return true;
      });
    }

    if (sortBy) {
      filtered = filtered.sort(([groupA, estimatesA], [groupB, estimatesB]) => {
        const estimateA = estimatesA[0];
        const estimateB = estimatesB[0];

        if (sortBy === "clientName") {
          return groupA.localeCompare(groupB);
        }
        if (sortBy === "quantity") {
          const quantityA = estimateA?.jobDetails?.quantity || 0;
          const quantityB = estimateB?.jobDetails?.quantity || 0;
          return quantityA - quantityB;
        }
        if (sortBy === "deliveryDate") {
          const dateA = new Date(estimateA?.deliveryDate || 0);
          const dateB = new Date(estimateB?.deliveryDate || 0);
          return dateA - dateB;
        }

        return 0;
      });
    }

    const result = Object.fromEntries(filtered);
    setFilteredData(result);
    setNoResults(Object.keys(result).length === 0);
  };

  if (loading) return <p>Loading estimates...</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>

      <div className="flex flex-wrap gap-4 items-center mb-6">
        <input
          type="text"
          placeholder="Search by client, project name, job type, or quantity..."
          value={searchQuery}
          onChange={handleSearch}
          className="flex-grow p-3 border rounded-md shadow-sm focus:outline-none focus:ring focus:ring-blue-300"
        />

        <select
          value={filterStatus}
          onChange={handleFilterChange}
          className="p-3 border rounded-md shadow-sm"
        >
          <option value="">All Statuses</option>
          <option value="Order Confirmed">Order Confirmed</option>
          <option value="Cancelled">Cancelled</option>
          <option value="Pending">Pending</option>
        </select>

        <select
          value={sortCriteria}
          onChange={handleSortChange}
          className="p-3 border rounded-md shadow-sm"
        >
          <option value="">Sort By</option>
          <option value="clientName">Client Name</option>
          <option value="quantity">Quantity</option>
          <option value="deliveryDate">Delivery Date</option>
        </select>
      </div>

      {noResults && <p className="text-gray-500 mt-2 text-sm">No such estimate found.</p>}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Object.entries(filteredData).map(([groupKey, estimates]) => {
          const [clientName, projectName] = groupKey.split("-");
          return (
            <GroupDropdown
              key={groupKey}
              clientName={clientName}
              projectName={projectName}
              estimates={estimates}
              ordersData={ordersData}
              setOrdersData={setOrdersData}
              setEstimatesData={setEstimatesData}
            />
          );
        })}
      </div>
    </div>
  );
};

export default EstimatesPage;
