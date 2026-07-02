import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  UserCircle,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import api from "../services/api";

const formatCurrency = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

const StatCard = ({ label, value, sub, icon: Icon, color, trend }) => (
  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
    <div className="flex items-center justify-between mb-3">
      <p className="text-sm text-gray-500">{label}</p>
      <div className={`p-2 rounded-lg ${color}`}>
        <Icon size={18} />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <div className="flex items-center gap-1 mt-2">
      {trend === "up" ? (
        <TrendingUp size={14} className="text-green-500" />
      ) : trend === "down" ? (
        <TrendingDown size={14} className="text-red-500" />
      ) : null}
      <span className="text-xs text-gray-500">{sub}</span>
    </div>
  </div>
);

const Dashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const { data: res } = await api.get("/dashboard");
        setData(res.data);
      } catch (err) {
        setError(
          err.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const stats = data?.stats;

  const statCards = [
    {
      label: "Total Employees",
      value: stats?.employees?.total ?? 0,
      sub: `${stats?.employees?.active ?? 0} active`,
      icon: Users,
      color: "bg-blue-50 text-blue-600",
      trend: "up",
    },
    {
      label: "Total Users",
      value: stats?.users?.total ?? 0,
      sub: `${stats?.users?.active ?? 0} active`,
      icon: UserCircle,
      color: "bg-purple-50 text-purple-600",
      trend: "up",
    },
    {
      label: "Income",
      value: formatCurrency(stats?.finance?.income),
      sub: `${stats?.finance?.totalTransactions ?? 0} transactions`,
      icon: TrendingUp,
      color: "bg-green-50 text-green-600",
      trend: "up",
    },
    {
      label: "Expense",
      value: formatCurrency(stats?.finance?.expense),
      sub: `Net: ${formatCurrency(stats?.finance?.netBalance)}`,
      icon: TrendingDown,
      color: "bg-red-50 text-red-600",
      trend: "down",
    },
    {
      label: "Purchase Orders",
      value: stats?.orders?.total ?? 0,
      sub: formatCurrency(stats?.orders?.totalAmount),
      icon: ShoppingCart,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Net Balance",
      value: formatCurrency(stats?.finance?.netBalance),
      sub:
        (stats?.finance?.netBalance ?? 0) >= 0
          ? "Profit"
          : "Loss",
      icon: DollarSign,
      color:
        (stats?.finance?.netBalance ?? 0) >= 0
          ? "bg-green-50 text-green-600"
          : "bg-red-50 text-red-600",
      trend:
        (stats?.finance?.netBalance ?? 0) >= 0 ? "up" : "down",
    },
  ];

  // Chart Data
  const financeChartData = data?.financeSummary?.map((s) => ({
    name: s._id,
    amount: s.total,
    count: s.count,
  })) || [];

  const orderChartData = data?.orderSummary?.map((s) => ({
    name: s._id,
    value: s.count,
  })) || [];

  const departmentData = data?.departmentSummary?.map((d) => ({
    name: d._id,
    employees: d.count,
    avgSalary: d.avgSalary,
  })) || [];

  const modules = [
    { name: "HR", desc: "Manage employees", path: "/hr", color: "bg-blue-500" },
    { name: "Finance", desc: "Track transactions", path: "/finance", color: "bg-green-500" },
    { name: "Supply Chain", desc: "Purchase orders", path: "/supply-chain", color: "bg-amber-500" },
    { name: "Users", desc: "Manage accounts", path: "/users", color: "bg-purple-500" },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl p-5 shadow-sm animate-pulse h-28"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Finance Bar Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Finance Summary
          </h3>
          {financeChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={financeChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                />
                <Bar dataKey="amount" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">
              No data available
            </p>
          )}
        </div>

        {/* Order Pie Chart */}
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Order Status
          </h3>
          {orderChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={orderChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {orderChartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-400 text-center py-10">
              No orders yet
            </p>
          )}
        </div>
      </div>

      {/* Department Chart */}
      {departmentData.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Employees by Department
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={departmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="employees" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Transactions */}
      {data?.recentTransactions?.length > 0 && (
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">
            Recent Transactions
          </h3>
          <div className="space-y-3">
            {data.recentTransactions.map((t) => (
              <div
                key={t._id}
                className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {t.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {t.category} • {formatDate(t.date)}
                  </p>
                </div>
                <span
                  className={`text-sm font-semibold ${
                    t.type === "income"
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {t.type === "income" ? "+" : "-"}
                  {formatCurrency(t.amount)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modules */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Quick Access
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {modules.map((mod) => (
            <button
              key={mod.name}
              onClick={() => navigate(mod.path)}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition text-left group"
            >
              <div
                className={`w-10 h-10 rounded-lg ${mod.color} flex items-center justify-center text-white font-bold text-lg mb-3 group-hover:scale-110 transition`}
              >
                {mod.name.charAt(0)}
              </div>
              <p className="font-medium text-gray-900">{mod.name}</p>
              <p className="text-xs text-gray-500 mt-1">{mod.desc}</p>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Dashboard;