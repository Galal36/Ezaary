import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  TrendingUp,
  Clock,
  Box,
  ArrowUpRight,
  Eye,
  Edit2,
  Plus,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { orders, products } from "@/lib/api-client";
import { mapBackendOrder, mapBackendProduct } from "@/lib/data-mappers";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    todayOrders: 0,
    totalRevenue: 0,
    processingOrders: 0,
    totalProducts: 0,
    outOfStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch order statistics
        const orderStats = await orders.statistics();
        
        // Fetch recent orders
        const ordersResponse = await orders.list({ ordering: '-created_at', page_size: '5' });
        const mappedOrders = ordersResponse.results?.map(mapBackendOrder) || [];
        
        // Fetch products to count out of stock
        const productsResponse = await products.list({ page_size: '1000' });
        const mappedProducts = productsResponse.results?.map(mapBackendProduct) || [];
        const outOfStock = mappedProducts.filter((p: any) => !p.inStock).length;
        
        setStats({
          todayOrders: orderStats.today_orders || 0,
          totalRevenue: orderStats.total_revenue || 0,
          processingOrders: orderStats.pending_orders + orderStats.confirmed_orders || 0,
          totalProducts: productsResponse.count || 0,
          outOfStock,
        });
        
        setRecentOrders(mappedOrders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart data for weekly sales
  const chartData = [
    { day: "السبت", sales: 2400 },
    { day: "الأحد", sales: 3210 },
    { day: "الاثنين", sales: 2290 },
    { day: "الثلاثاء", sales: 2000 },
    { day: "الأربعاء", sales: 2181 },
    { day: "الخميس", sales: 2500 },
    { day: "الجمعة", sales: 2100 },
  ];

  const statusColors = {
    new: "bg-blue-100 text-blue-800",
    processing: "bg-yellow-100 text-yellow-800",
    shipped: "bg-green-100 text-green-800",
    "out-for-delivery": "bg-purple-100 text-purple-800",
    delivered: "bg-green-600 text-white",
    cancelled: "bg-red-100 text-red-800",
  };

  const statusLabels = {
    new: "جديد",
    processing: "قيد المعالجة",
    shipped: "تم الشحن",
    "out-for-delivery": "قيد التوصيل",
    delivered: "تم التوصيل",
    cancelled: "ملغي",
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">نظرة عامة</h1>
        <p className="text-muted-foreground">مرحباً بك في لوحة التحكم</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Card 1: Today's Orders */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">طلبات اليوم</h3>
            <ShoppingCart className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            {stats.todayOrders}
          </p>
          <p className="text-xs text-green-600 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            +12% عن أمس
          </p>
        </div>

        {/* Card 2: Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">إجمالي المبيعات</h3>
            <TrendingUp className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            {stats.totalRevenue.toLocaleString("ar-EG")}
          </p>
          <p className="text-xs text-gray-500">جنيه مصري</p>
        </div>

        {/* Card 3: Processing Orders */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">طلبات معلقة</h3>
            <Clock className="w-5 h-5 text-orange-500" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            {stats.processingOrders}
          </p>
          <p className="text-xs text-orange-600">يحتاج إلى اهتمام</p>
        </div>

        {/* Card 4: Total Products */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-600 text-sm font-medium">إجمالي المنتجات</h3>
            <Box className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-foreground mb-2">
            {stats.totalProducts}
          </p>
          <p className="text-xs text-red-600">
            {stats.outOfStock} منتج نفذ من المخزون
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            المبيعات الأسبوعية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip
                contentStyle={{ backgroundColor: "#f3f4f6", border: "none" }}
              />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#1e3a8a"
                strokeWidth={2}
                dot={{ fill: "#1e3a8a", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            إجراءات سريعة
          </h2>
          <div className="space-y-3">
            <Link
              to="/admin/products?action=add"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-blue-50 transition-colors border border-gray-200"
            >
              <Plus className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium">إضافة منتج جديد</span>
            </Link>
            <Link
              to="/admin/orders?status=processing"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-orange-50 transition-colors border border-gray-200"
            >
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              <span className="text-sm font-medium">معالجة الطلبات</span>
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-green-50 transition-colors border border-gray-200"
            >
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium">عرض التقارير</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">آخر الطلبات</h2>
          <Link
            to="/admin/orders"
            className="text-sm text-primary hover:underline font-medium"
          >
            عرض جميع الطلبات ←
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  رقم الطلب
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  العميل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  التاريخ
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإجمالي
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-foreground">
                      {order.customerName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {order.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        statusColors[order.status]
                      }`}
                    >
                      {statusLabels[order.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">
                    {order.total.toLocaleString("ar-EG")} جنيه
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/orders?order=${order.id}`}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="عرض التفاصيل"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </Link>
                      <Link
                        to={`/admin/orders?order=${order.id}`}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="تعديل الحالة"
                      >
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
