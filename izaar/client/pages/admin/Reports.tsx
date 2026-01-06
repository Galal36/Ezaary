import { useState } from "react";
import { Download } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { mockOrders, mockProducts, mockCategories } from "@/lib/admin-mock-data";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const dateRangeOptions = [
  { value: "7days", label: "آخر 7 أيام" },
  { value: "30days", label: "آخر 30 يوم" },
  { value: "month", label: "هذا الشهر" },
  { value: "all", label: "الكل" },
];

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

export default function AdminReports() {
  const [dateRange, setDateRange] = useState("30days");

  // Calculate statistics
  const totalSales = mockOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const ordersCount = mockOrders.length;
  const averageOrderValue = ordersCount > 0 ? totalSales / ordersCount : 0;

  // Sales by category
  const categorySales = mockCategories.map((category) => {
    const categoryProducts = mockProducts.filter(
      (p) => p.categoryId === category.id
    );
    const categoryOrders = mockOrders.filter((order) =>
      order.products.some((op) =>
        categoryProducts.some((cp) => cp.id === op.id)
      )
    );
    const revenue = categoryOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );
    return {
      name: category.name,
      orders: categoryOrders.length,
      revenue,
    };
  });

  // Status distribution
  const statusData = [
    { name: "جديد", value: mockOrders.filter((o) => o.status === "new").length },
    {
      name: "قيد المعالجة",
      value: mockOrders.filter((o) => o.status === "processing").length,
    },
    {
      name: "تم الشحن",
      value: mockOrders.filter((o) => o.status === "shipped").length,
    },
    {
      name: "تم التوصيل",
      value: mockOrders.filter((o) => o.status === "delivered").length,
    },
    {
      name: "ملغي",
      value: mockOrders.filter((o) => o.status === "cancelled").length,
    },
  ];

  // Best selling products
  const bestSelling = mockProducts
    .map((product) => {
      const productOrders = mockOrders.filter((order) =>
        order.products.some((op) => op.id === product.id)
      );
      const unitsSold = productOrders.reduce(
        (sum, order) =>
          sum +
          order.products.find((op) => op.id === product.id)?.quantity || 0,
        0
      );
      const revenue = productOrders.reduce(
        (sum, order) => sum + order.total,
        0
      );
      return {
        name: product.name,
        unitsSold,
        revenue,
      };
    })
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 10);

  // Sales by governorate
  const governorateSales = mockOrders.reduce((acc, order) => {
    if (!acc[order.governorate]) {
      acc[order.governorate] = { orders: 0, revenue: 0 };
    }
    acc[order.governorate].orders += 1;
    acc[order.governorate].revenue += order.total;
    return acc;
  }, {} as Record<string, { orders: number; revenue: number }>);

  const governorateData = Object.entries(governorateSales).map(
    ([governorate, data]) => ({
      name: governorate,
      orders: data.orders,
      revenue: data.revenue,
    })
  );

  // Weekly sales data (mock)
  const weeklySales = [
    { day: "السبت", sales: 2400 },
    { day: "الأحد", sales: 3210 },
    { day: "الاثنين", sales: 2290 },
    { day: "الثلاثاء", sales: 2000 },
    { day: "الأربعاء", sales: 2181 },
    { day: "الخميس", sales: 2500 },
    { day: "الجمعة", sales: 2100 },
  ];

  const handleExport = () => {
    // TODO: Export to PDF/Excel
    console.log("Exporting report...");
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            التقارير والإحصائيات
          </h1>
          <p className="text-muted-foreground">
            عرض تحليلات المبيعات والأداء
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleExport}>
            <Download className="w-4 h-4 ml-2" />
            تصدير التقرير
          </Button>
        </div>
      </div>

      {/* Sales Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-muted-foreground mb-2">إجمالي المبيعات</p>
          <p className="text-3xl font-bold text-foreground">
            {totalSales.toLocaleString("ar-EG")} جنيه
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-muted-foreground mb-2">عدد الطلبات</p>
          <p className="text-3xl font-bold text-foreground">
            {ordersCount.toLocaleString("ar-EG")}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-muted-foreground mb-2">
            متوسط قيمة الطلب
          </p>
          <p className="text-3xl font-bold text-foreground">
            {Math.round(averageOrderValue).toLocaleString("ar-EG")} جنيه
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-sm text-muted-foreground mb-2">عدد المنتجات</p>
          <p className="text-3xl font-bold text-foreground">
            {mockProducts.length}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Sales Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            المبيعات الأسبوعية
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-bold text-foreground mb-4">
            توزيع حالات الطلبات
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Performance */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          أداء الفئات
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={categorySales}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#3b82f6" name="عدد الطلبات" />
            <Bar dataKey="revenue" fill="#10b981" name="الإيرادات" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Best Selling Products */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          أكثر المنتجات مبيعاً
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  اسم المنتج
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الوحدات المباعة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإيرادات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {bestSelling.map((product, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.unitsSold}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {product.revenue.toLocaleString("ar-EG")} جنيه
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sales by Governorate */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-bold text-foreground mb-4">
          المبيعات حسب المحافظة
        </h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={governorateData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="orders" fill="#8b5cf6" name="عدد الطلبات" />
            <Bar dataKey="revenue" fill="#f59e0b" name="الإيرادات" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AdminLayout>
  );
}





