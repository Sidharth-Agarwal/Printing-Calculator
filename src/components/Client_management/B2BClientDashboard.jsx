import React, { useState, useEffect } from "react";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { useAuth } from "../Login/AuthContext";
import { Link } from "react-router-dom";

const B2BClientDashboard = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [clientData, setClientData] = useState(null);
  const [estimates, setEstimates] = useState([]);
  const [orders, setOrders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClientData = async () => {
      if (!currentUser) return;

      try {
        // First, get the user document to find the linked client ID
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        
        if (!userDoc.exists()) {
          setError("User data not found");
          setLoading(false);
          return;
        }
        
        const userData = userDoc.data();
        
        // Check if this user has a linked client ID
        if (!userData.clientId) {
          setError("Your account is not linked to a client record");
          setLoading(false);
          return;
        }
        
        // Fetch the client data
        const clientDoc = await getDoc(doc(db, "clients", userData.clientId));
        
        if (!clientDoc.exists()) {
          setError("Client data not found");
          setLoading(false);
          return;
        }
        
        const client = {
          id: clientDoc.id,
          ...clientDoc.data()
        };
        
        setClientData(client);
        
        // Fetch estimates
        const estimatesQuery = query(
          collection(db, "estimates"),
          where("clientId", "==", userData.clientId)
        );
        const estimatesSnapshot = await getDocs(estimatesQuery);
        const estimatesData = estimatesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEstimates(estimatesData);
        
        // Fetch orders
        const ordersQuery = query(
          collection(db, "orders"),
          where("clientId", "==", userData.clientId)
        );
        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersData = ordersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(ordersData);
        
        // Fetch invoices
        const invoicesQuery = query(
          collection(db, "invoices"),
          where("clientId", "==", userData.clientId)
        );
        const invoicesSnapshot = await getDocs(invoicesQuery);
        const invoicesData = invoicesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setInvoices(invoicesData);
        
      } catch (err) {
        console.error("Error fetching client data:", err);
        setError("Failed to load your data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchClientData();
  }, [currentUser]);
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("en-IN");
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
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
    <div className="py-6">
      <div className="mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome, {clientData?.name}</h1>
          <p className="text-gray-600">Here's an overview of your account with Famous Letterpress</p>
          
          {/* Client Information */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Client Code</h3>
              <p className="mt-1 text-lg font-semibold">{clientData?.clientCode}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Contact Person</h3>
              <p className="mt-1 text-lg font-semibold">{clientData?.contactPerson || "N/A"}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-500">Email</h3>
              <p className="mt-1 text-lg font-semibold">{clientData?.email}</p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Account Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Active Estimates</h3>
              <p className="mt-1 text-2xl font-semibold">{estimates.filter(e => e.status === 'active').length}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Active Orders</h3>
              <p className="mt-1 text-2xl font-semibold">{orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
              <p className="mt-1 text-2xl font-semibold">{clientData?.totalOrders || orders.length}</p>
            </div>
            
            <div className="border rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-500">Total Spend</h3>
              <p className="mt-1 text-2xl font-semibold">{formatCurrency(clientData?.totalSpend || 0)}</p>
            </div>
          </div>
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Orders</h2>
            <Link to="/orders" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          {orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.slice(0, 5).map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.orderNumber || order.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(order.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{order.jobName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(order.totalAmount)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          order.status === 'completed' ? 'bg-green-100 text-green-800' :
                          order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4">No orders found.</p>
          )}
        </div>
        
        {/* Estimates */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Active Estimates</h2>
            <Link to="/estimates" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          {estimates.filter(e => e.status === 'active').length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimate #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Job Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valid Until</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {estimates.filter(e => e.status === 'active').slice(0, 5).map((estimate) => (
                    <tr key={estimate.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{estimate.estimateNumber || estimate.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(estimate.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{estimate.jobName || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(estimate.totalAmount)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(estimate.validUntil)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4">No active estimates found.</p>
          )}
        </div>
        
        {/* Invoices */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Recent Invoices</h2>
            <Link to="/invoices" className="text-blue-600 hover:text-blue-800 text-sm">
              View All
            </Link>
          </div>
          
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order #</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoices.slice(0, 5).map((invoice) => (
                    <tr key={invoice.id}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{invoice.invoiceNumber || invoice.id}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(invoice.createdAt)}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{invoice.orderNumber || "N/A"}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(invoice.totalAmount)}</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          invoice.status === 'paid' ? 'bg-green-100 text-green-800' : 
                          invoice.status === 'due' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {invoice.status?.charAt(0).toUpperCase() + invoice.status?.slice(1) || "Pending"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 py-4">No invoices found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default B2BClientDashboard;