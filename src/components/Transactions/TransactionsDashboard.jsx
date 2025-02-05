import React, { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';

const TransactionsDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [statusDistribution, setStatusDistribution] = useState([]);
  const [dateRange, setDateRange] = useState('lastMonth');
  const [selectedView, setSelectedView] = useState('revenue'); // 'revenue' or 'orders'
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [jobTypeStats, setJobTypeStats] = useState([]);
  const [topClients, setTopClients] = useState([]);

  const COLORS = ['#6366F1', '#06B6D4', '#F97316', '#EC4899', '#10B981', '#94A3B8'];

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        let start, end;

        switch (dateRange) {
          case 'lastWeek':
            start = new Date();
            start.setDate(start.getDate() - 7);
            end = new Date();
            break;
          case 'lastMonth':
            start = new Date();
            start.setMonth(start.getMonth() - 1);
            end = new Date();
            break;
          case 'last3Months':
            start = new Date();
            start.setMonth(start.getMonth() - 3);
            end = new Date();
            break;
          case 'custom':
            start = new Date(startDate);
            end = new Date(endDate);
            break;
          default:
            start = new Date();
            start.setMonth(start.getMonth() - 1);
            end = new Date();
        }

        const ordersQuery = query(
          collection(db, "orders"),
          where('date', '>=', start.toISOString()),
          where('date', '<=', end.toISOString())
        );

        const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
          const ordersData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));

          setOrders(ordersData);
          processOrdersData(ordersData);
          calculateJobTypeStats(ordersData);
          calculateTopClients(ordersData);
        });

        return () => unsubscribe();
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [dateRange, startDate, endDate]);

  const calculateJobTypeStats = (ordersData) => {
    const stats = ordersData.reduce((acc, order) => {
      const jobType = order.jobDetails?.jobType || 'Unknown';
      const revenue = calculateTotalCost(order);
      
      if (!acc[jobType]) {
        acc[jobType] = {
          type: jobType,
          count: 0,
          revenue: 0
        };
      }
      
      acc[jobType].count += 1;
      acc[jobType].revenue += revenue;
      return acc;
    }, {});

    setJobTypeStats(Object.values(stats));
    setSelectedJobTypes(Object.keys(stats));
  };

  const calculateTopClients = (ordersData) => {
    const clientStats = ordersData.reduce((acc, order) => {
      const clientName = order.clientName || 'Unknown';
      const revenue = calculateTotalCost(order);
      
      if (!acc[clientName]) {
        acc[clientName] = {
          name: clientName,
          orders: 0,
          revenue: 0
        };
      }
      
      acc[clientName].orders += 1;
      acc[clientName].revenue += revenue;
      return acc;
    }, {});

    const sortedClients = Object.values(clientStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    setTopClients(sortedClients);
  };

  const processOrdersData = (ordersData) => {
    // Filter by selected job types if any
    const filteredOrders = selectedJobTypes.length > 0
      ? ordersData.filter(order => selectedJobTypes.includes(order.jobDetails?.jobType))
      : ordersData;

    // Group by date
    const dataByDate = filteredOrders.reduce((acc, order) => {
      if (!order.date) return acc;
      
      const date = new Date(order.date);
      const dateStr = date.toISOString().split('T')[0];
      
      if (!acc[dateStr]) {
        acc[dateStr] = {
          date: dateStr,
          revenue: 0,
          orders: 0,
          averageOrderValue: 0
        };
      }
      
      const revenue = calculateTotalCost(order);
      acc[dateStr].revenue += revenue;
      acc[dateStr].orders += 1;
      acc[dateStr].averageOrderValue = acc[dateStr].revenue / acc[dateStr].orders;
      
      return acc;
    }, {});

    // Convert to array and sort by date
    const chartData = Object.values(dataByDate)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    setRevenueData(chartData);

    // Process status distribution
    const statusCount = filteredOrders.reduce((acc, order) => {
      const stage = order.stage || 'Not started yet';
      acc[stage] = (acc[stage] || 0) + 1;
      return acc;
    }, {});

    setStatusDistribution(
      Object.entries(statusCount).map(([name, value]) => ({ name, value }))
    );
  };

  const calculateTotalCost = (order) => {
    if (!order.calculations || !order.jobDetails?.quantity) return 0;
    
    const costFields = [
      'paperAndCuttingCostPerCard',
      'lpCostPerCard',
      'fsCostPerCard',
      'embCostPerCard',
      'lpCostPerCardSandwich',
      'fsCostPerCardSandwich',
      'embCostPerCardSandwich',
      'digiCostPerCard'
    ];

    const totalPerCard = costFields.reduce((acc, field) => {
      const value = order.calculations[field];
      return acc + (value && !isNaN(parseFloat(value)) ? parseFloat(value) : 0);
    }, 0);

    return totalPerCard * order.jobDetails.quantity;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-24 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-96 bg-gray-200 rounded-lg"></div>
            <div className="h-96 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header with Controls */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-800">TRANSACTIONS DASHBOARD</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Date Range Select */}
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="lastWeek">Last 7 Days</option>
              <option value="lastMonth">Last 30 Days</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="custom">Custom Range</option>
            </select>

            {/* Custom Date Range Inputs */}
            {dateRange === 'custom' && (
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
                <span>to</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border rounded-md px-3 py-2 text-sm"
                />
              </div>
            )}

            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-md p-1">
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedView === 'revenue' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedView('revenue')}
              >
                Revenue
              </button>
              <button
                className={`px-3 py-1 text-sm rounded-md ${
                  selectedView === 'orders' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-600'
                }`}
                onClick={() => setSelectedView('orders')}
              >
                Orders
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{revenueData.reduce((sum, data) => sum + data.revenue, 0).toLocaleString()}
          </p>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {revenueData.reduce((sum, data) => sum + data.orders, 0)}
          </p>
        </div>

        {/* Average Order Value */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Average Order Value</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{(revenueData.reduce((sum, data) => sum + data.revenue, 0) / 
               revenueData.reduce((sum, data) => sum + data.orders, 0) || 0).toLocaleString(undefined, { 
                 maximumFractionDigits: 0 
               })}
          </p>
        </div>

        {/* Conversion Rate */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-sm font-medium text-gray-500">Completed Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {statusDistribution.find(s => s.name === 'Delivery')?.value || 0}
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Chart */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">
            {selectedView === 'revenue' ? 'Revenue Trend' : 'Order Trend'}
          </h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    selectedView === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name
                  ]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey={selectedView === 'revenue' ? 'revenue' : 'orders'}
                  stroke="#6366F1"
                  strokeWidth={2}
                  name={selectedView === 'revenue' ? 'Revenue' : 'Orders'}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Order Status Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({
                    cx,
                    cy,
                    midAngle,
                    innerRadius,
                    outerRadius,
                    percent,
                    value
                  }) => {
                    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                    return (
                      <text
                        x={x}
                        y={y}
                        fill="white"
                        textAnchor={x > cx ? 'start' : 'end'}
                        dominantBaseline="central"
                        className="text-xs font-medium"
                      >
                        {`${value} (${(percent * 100).toFixed(0)}%)`}
                      </text>
                    );
                  }}
                  outerRadius={100}
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`${value} orders`]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusDistribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Job Type Statistics & Top Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Job Type Statistics */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Job Type Statistics</h2>
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={selectedView}
              onChange={(e) => setSelectedView(e.target.value)}
            >
              <option value="revenue">By Revenue</option>
              <option value="orders">By Orders</option>
            </select>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={jobTypeStats}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="type" 
                  type="category"
                  width={80}
                />
                <Tooltip
                  formatter={(value, name) => [
                    selectedView === 'revenue' 
                      ? `₹${parseFloat(value).toLocaleString()}`
                      : value,
                    name === 'revenue' ? 'Revenue' : 'Orders'
                  ]}
                  contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0' }}
                />
                <Legend />
                <Bar 
                  dataKey={selectedView === 'revenue' ? 'revenue' : 'count'}
                  fill="#6366F1"
                  name={selectedView === 'revenue' ? 'Revenue' : 'Orders'}
                  radius={[0, 4, 4, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold mb-4">Top 5 Clients</h2>
          <div className="space-y-4">
            {topClients.map((client, index) => (
              <div 
                key={client.name}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-gray-500">{client.orders} orders</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold">₹{client.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">
                    {((client.revenue * 100) / revenueData.reduce((sum, data) => sum + data.revenue, 0)).toFixed(1)}% of total
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionsDashboard;