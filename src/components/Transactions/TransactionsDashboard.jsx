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
  const [selectedView, setSelectedView] = useState('revenue');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedJobTypes, setSelectedJobTypes] = useState([]);
  const [jobTypeStats, setJobTypeStats] = useState([]);
  const [topClients, setTopClients] = useState([]);
  const [clientTypeStats, setClientTypeStats] = useState({ b2b: 0, direct: 0 });

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
          case 'thisYear':
            start = new Date(new Date().getFullYear(), 0, 1);
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
          calculateClientTypeStats(ordersData);
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

  const calculateClientTypeStats = (ordersData) => {
    const stats = ordersData.reduce((acc, order) => {
      if (order.isLoyaltyEligible) {
        acc.b2b++;
      } else {
        acc.direct++;
      }
      return acc;
    }, { b2b: 0, direct: 0 });

    setClientTypeStats(stats);
  };

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
    if (selectedJobTypes.length === 0) {
      setSelectedJobTypes(Object.keys(stats));
    }
  };

  const calculateTopClients = (ordersData) => {
    const clientStats = ordersData.reduce((acc, order) => {
      const clientName = order.clientName || order.clientInfo?.name || 'Unknown';
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
          averageOrderValue: 0,
          gstCollected: 0,
          discountsGiven: 0
        };
      }
      
      const revenue = calculateTotalCost(order);
      const gst = parseFloat(order.calculations?.gstAmount || 0);
      const discount = parseFloat(order.calculations?.loyaltyDiscountAmount || 0);
      
      acc[dateStr].revenue += revenue;
      acc[dateStr].orders += 1;
      acc[dateStr].gstCollected += gst;
      acc[dateStr].discountsGiven += discount;
      acc[dateStr].averageOrderValue = acc[dateStr].revenue / acc[dateStr].orders;
      
      return acc;
    }, {});

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

  // UPDATED: Use new calculation structure from DB
  const calculateTotalCost = (order) => {
    if (!order.calculations) return 0;
    
    // Use totalWithGST for full revenue including tax
    // Or use totalCost for revenue before GST
    return parseFloat(order.calculations.totalWithGST || 
                     order.calculations.totalCost || 0);
  };

  // Calculate summary metrics
  const calculateMetrics = () => {
    const totalRevenue = revenueData.reduce((sum, data) => sum + data.revenue, 0);
    const totalOrders = revenueData.reduce((sum, data) => sum + data.orders, 0);
    const totalGST = revenueData.reduce((sum, data) => sum + data.gstCollected, 0);
    const totalDiscounts = revenueData.reduce((sum, data) => sum + data.discountsGiven, 0);
    const completedOrders = statusDistribution.find(s => s.name === 'Completed')?.value || 0;
    const serializedOrders = orders.filter(o => o.orderSerial).length;

    return {
      totalRevenue,
      totalOrders,
      avgOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      completedOrders,
      totalGST,
      totalDiscounts,
      serializedOrders,
      serializationRate: orders.length > 0 ? (serializedOrders / orders.length) * 100 : 0
    };
  };

  const metrics = calculateMetrics();

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
          <h1 className="text-2xl font-bold text-gray-800">Analytics Dashboard</h1>
          
          <div className="flex flex-wrap items-center gap-4">
            <select 
              className="border rounded-md px-3 py-2 text-sm"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="lastWeek">Last 7 Days</option>
              <option value="lastMonth">Last 30 Days</option>
              <option value="last3Months">Last 3 Months</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>

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

      {/* Stats Grid - UPDATED with new metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{metrics.totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Including GST</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            {metrics.totalOrders}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.completedOrders} completed
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Avg Order Value</h3>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            ₹{metrics.avgOrderValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Per order</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">GST Collected</h3>
          <p className="text-2xl font-bold text-green-600 mt-2">
            ₹{metrics.totalGST.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Tax revenue</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Discounts Given</h3>
          <p className="text-2xl font-bold text-red-600 mt-2">
            ₹{metrics.totalDiscounts.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Loyalty discounts</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">B2B Orders</h3>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            {clientTypeStats.b2b}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {orders.length > 0 ? Math.round((clientTypeStats.b2b / orders.length) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Direct Orders</h3>
          <p className="text-2xl font-bold text-blue-600 mt-2">
            {clientTypeStats.direct}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {orders.length > 0 ? Math.round((clientTypeStats.direct / orders.length) * 100) : 0}% of total
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-500">Serialization Rate</h3>
          <p className="text-2xl font-bold text-indigo-600 mt-2">
            {metrics.serializationRate.toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {metrics.serializedOrders} serialized
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
                  tickFormatter={(date) => new Date(date).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short'
                  })}
                />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [
                    selectedView === 'revenue' ? `₹${value.toLocaleString()}` : value,
                    name
                  ]}
                  labelFormatter={(date) => new Date(date).toLocaleDateString('en-GB')}
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
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
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
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Job Type Statistics</h2>
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
                  formatter={(value) => 
                    selectedView === 'revenue' 
                      ? `₹${parseFloat(value).toLocaleString()}`
                      : value
                  }
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
                  <p className="font-semibold">₹{client.revenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                  <p className="text-sm text-gray-500">
                    {metrics.totalRevenue > 0 ? ((client.revenue * 100) / metrics.totalRevenue).toFixed(1) : 0}% of total
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