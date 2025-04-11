import React, { useState } from "react";

const DisplayClientTable = ({ clients, onDelete, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // Filter clients based on search term and category filter
  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      searchTerm === "" ||
      client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.clientCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = filterCategory === "" || client.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

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

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-lg font-semibold mb-4">Clients</h2>
      
      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search by name, code, email, or contact person..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-sm"
          />
        </div>
        <div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="w-full px-4 py-2 border rounded-sm"
          >
            <option value="">All Categories</option>
            <option value="Regular">Regular</option>
            <option value="Premium">Premium</option>
            <option value="Enterprise">Enterprise</option>
          </select>
        </div>
      </div>

      {/* Client Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredClients.length} of {clients.length} clients
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Client Code</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Name</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Contact Person</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Email</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Phone</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Category</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">City</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Active Orders</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Total Spend</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Last Order</th>
              <th className="px-4 py-2 border font-medium text-gray-700 uppercase text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length > 0 ? (
              filteredClients.map((client) => (
                <tr key={client.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{client.clientCode}</td>
                  <td className="px-4 py-2 font-medium">{client.name}</td>
                  <td className="px-4 py-2">{client.contactPerson}</td>
                  <td className="px-4 py-2">{client.email}</td>
                  <td className="px-4 py-2">{client.phone}</td>
                  <td className="px-4 py-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      client.category === "Premium" 
                        ? "bg-green-100 text-green-800" 
                        : client.category === "Enterprise" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-blue-100 text-blue-800"
                    }`}>
                      {client.category || "Regular"}
                    </span>
                  </td>
                  <td className="px-4 py-2">{client.address?.city}</td>
                  <td className="px-4 py-2 text-center">{client.activeOrders || 0}</td>
                  <td className="px-4 py-2">{formatCurrency(client.totalSpend || 0)}</td>
                  <td className="px-4 py-2">{formatDate(client.lastOrderDate)}</td>
                  <td className="px-4 py-2">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => onEdit(client)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <span className="text-gray-300">|</span>
                      <button
                        onClick={() => onDelete(client.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="11" className="px-4 py-8 text-center text-gray-500">
                  No clients found matching your criteria
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DisplayClientTable;