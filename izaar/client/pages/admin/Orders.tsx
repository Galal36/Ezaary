import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Eye,
  Edit2,
  Trash2,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { orders as ordersApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import OrderDetails from "@/components/admin/OrderDetails";
import { toast } from "sonner";

// Interfaces
interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

interface Order {
  id: string; // UUID
  orderNumber: string; // Display ID (ORD-...)
  customerName: string;
  phone: string;
  total: number;
  subtotal: number;
  shipping: number;
  discount: number;
  governorate?: string;
  district?: string;
  status: string;
  createdAt: string;
  products: OrderProduct[];
  email?: string;
  address?: string;
  notes?: string;
}

const statusOptions = [
  { value: "all", label: "الكل" },
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "out_for_delivery", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

const dateRangeOptions = [
  { value: "today", label: "اليوم" },
  { value: "7days", label: "آخر 7 أيام" },
  { value: "30days", label: "آخر 30 يوم" },
  { value: "all", label: "الكل" },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800", // Waiting -> Yellow
  confirmed: "bg-blue-100 text-blue-800", // Confirmed -> Blue
  processing: "bg-purple-100 text-purple-800", // Processing -> Purple
  shipped: "bg-cyan-100 text-cyan-800", // Shipped -> Cyan
  out_for_delivery: "bg-orange-100 text-orange-800", // Out for delivery -> Orange
  delivered: "bg-green-600 text-white", // Delivered -> Solid Green
  cancelled: "bg-red-100 text-red-800", // Cancelled -> Red
};

const statusLabels: Record<string, string> = {
  pending: "قيد الانتظار",
  confirmed: "تم التأكيد",
  processing: "قيد المعالجة",
  shipped: "تم الشحن",
  out_for_delivery: "قيد التوصيل",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
};

export default function AdminOrders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [dateRange, setDateRange] = useState(searchParams.get("dateRange") || "all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Selected Order for Details
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {
        page: currentPage.toString(),
        page_size: itemsPerPage.toString(),
      };

      if (searchQuery) params.search = searchQuery;
      if (statusFilter !== "all") params.status = statusFilter;
      // Date range logic would ideally be handled by backend. 
      // For now we might fetching all and filtering client side OR 
      // adding date params if backend supports 'created_after' etc.
      // Assuming backend supports basic filtering or we just fetch page.
      // The previous local filtering logic was powerful. 
      // Let's rely on basic API list for now.

      const data = await ordersApi.list(params);

      // Map API response to our Order interface
      const mappedOrders: Order[] = data.results.map((apiOrder: any) => ({
        id: apiOrder.id, // Use UUID for API actions
        orderNumber: apiOrder.order_number, // Use order number for display
        customerName: apiOrder.customer_name,
        phone: apiOrder.customer_phone,
        total: parseFloat(apiOrder.total),
        subtotal: parseFloat(apiOrder.subtotal),
        shipping: parseFloat(apiOrder.shipping_cost),
        discount: parseFloat(apiOrder.discount_amount),
        governorate: apiOrder.governorate,
        district: apiOrder.district,
        status: apiOrder.status,
        createdAt: apiOrder.created_at,
        products: apiOrder.items.map((item: any) => ({
          id: item.id,
          name: item.product_name_ar,
          quantity: item.quantity,
          price: parseFloat(item.unit_price),
          image: item.product // Ensure we handle image if accessible
        })),
        email: apiOrder.customer_email,
        address: [apiOrder.governorate, apiOrder.district, apiOrder.village, apiOrder.detailed_address].filter(Boolean).join(" - "),
        notes: apiOrder.customer_notes
      }));

      setOrders(mappedOrders);
      setTotalCount(data.count);

    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("فشل تحميل الطلبات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentPage, searchQuery, statusFilter]); // Refetch when these change

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateRange("all");
    setCurrentPage(1);
    setSearchParams({});
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    // Implement optimistic update or call API
    // Since ID here is order_number, we might need actual UUID for API update if required.
    // But let's assume current usage for now. 
    // If API requires UUID, we should map that too.
    // Let's verify `OrderDetailSerializer` had `id` (UUID) and `order_number`.
    // The mapping above uses `order_number` as `id`. We should store both.
    toast.info("تحديث الحالة قيد التطوير");
  };

  const hasActiveFilters = searchQuery || statusFilter !== "all";
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الطلبات</h1>
        <p className="text-muted-foreground">عرض وإدارة جميع طلبات العملاء</p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="الحالة" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Reset Button */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={handleResetFilters}>
              <X className="w-4 h-4 ml-2" />
              إعادة تعيين
            </Button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">رقم الطلب</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">العميل</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">التاريخ</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">الحالة</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">المنتجات</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">الإجمالي</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-600 uppercase">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex justify-center"><Loader2 className="animate-spin h-6 w-6 text-primary" /></div>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <p className="text-muted-foreground">لا توجد طلبات مطابقة للبحث</p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      #{order.id.split('-').slice(1).join('-')}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-foreground">{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {order.products.length} منتج
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {order.total.toLocaleString("ar-EG")} جنيه
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="p-1.5 hover:bg-gray-100 rounded transition-colors"
                          title="عرض التفاصيل"
                        >
                          <Eye className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              صفحة {currentPage} من {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronRight className="w-4 h-4" />
                السابق
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                التالي
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedOrder && (
            <OrderDetails
              order={selectedOrder}
              onClose={() => setIsDetailsOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}





