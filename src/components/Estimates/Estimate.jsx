import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebaseConfig"; // Adjust the import based on your file structure

const EstimatesPage = () => {
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdown, setOpenDropdown] = useState(null); // Track the opened dropdown

  useEffect(() => {
    const fetchEstimates = async () => {
      try {
        // Fetching from the correct "estimates" collection
        const querySnapshot = await getDocs(collection(db, "estimates"));
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEstimates(data);
      } catch (error) {
        console.error("Error fetching estimates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstimates();
  }, []);

  const toggleDropdown = (id) => {
    setOpenDropdown((prev) => (prev === id ? null : id));
  };

  if (loading) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>Loading estimates...</p>
      </div>
    );
  }

  if (estimates.length === 0) {
    return (
      <div className="text-center mt-8">
        <h2 className="text-xl font-bold">Estimates DB</h2>
        <p>No estimates available. Please create an estimate using the billing form.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto mt-8">
      <h2 className="text-2xl font-bold mb-4">Estimates DB</h2>
      <div className="space-y-6">
        {estimates.map((estimate) => (
          <div
            key={estimate.id}
            className="border border-gray-300 rounded-lg p-4 shadow-md"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">
                Estimate for {estimate.clientName} - {estimate.projectName}
              </h3>
              <button
                onClick={() => toggleDropdown(estimate.id)}
                className="text-blue-500 underline"
              >
                {openDropdown === estimate.id ? "Hide Details" : "Show Details"}
              </button>
            </div>
            {openDropdown === estimate.id && (
              <div className="mt-4 space-y-2">
                <p>
                  <strong>Job Type:</strong> {estimate.jobType}
                </p>
                <p>
                  <strong>Quantity:</strong> {estimate.quantity}
                </p>
                <p>
                  <strong>Delivery Date:</strong> {estimate.deliveryDate}
                </p>
                <p>
                  <strong>Paper Name:</strong> {estimate.paperName}
                </p>
                <p>
                  <strong>Paper Provided:</strong> {estimate.paperProvided}
                </p>
                <p>
                  <strong>Die Code:</strong> {estimate.dieCode}
                </p>
                <p>
                  <strong>Die Size:</strong> {estimate.dieSize?.length} x{" "}
                  {estimate.dieSize?.breadth}
                </p>
                <p>
                  <strong>LP Used:</strong>{" "}
                  {estimate.isLPUsed ? "Yes" : "No"}
                </p>
                <p>
                  <strong>FS Used:</strong>{" "}
                  {estimate.isFSUsed ? "Yes" : "No"}
                </p>
                <p>
                  <strong>EMB Used:</strong>{" "}
                  {estimate.isEMBUsed ? "Yes" : "No"}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EstimatesPage;
