import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ShoppingCart, Search, ChevronRight, ChevronLeft } from "lucide-react";
import OrderDetailModal from "./OrderDetailModal";
import { toast } from "sonner";

const STATUS_OPTIONS = [
  { value: "", label: "الكل" },
  { value: "pending", label: "في الانتظار" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "processing", label: "قيد التجهيز" },
  { value: "shipped", label: "تم الشحن" },
  { value: "delivered", label: "تم التسليم" },
  { value: "cancelled", label: "ملغي" },
];

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-orange-100 text-orange-800 border-orange-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  out_for_delivery: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
  returned: "bg-red-100 text-red-800 border-red-300",
};

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export default function MyOrdersTab() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [detailOrder, setDetailOrder] = useState<any | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await customerAuth.getMyOrders({
        page: currentPage,
        status: statusFilter || undefined,
        search: debouncedSearch || undefined,
      });
      setOrders(res.results || []);
      setTotalCount(res.count || 0);
      setTotalPages(res.total_pages || 1);
    } catch (err: any) {
      setError(err?.message || "فشل تحميل الطلبات.");
    } finally {
      setLoading(false);
    }
  }, [currentPage, statusFilter, debouncedSearch]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleViewDetails = async (order: any) => {
    setSelectedOrder(order);
    try {
      const detail = await customerAuth.getMyOrder(order.order_number);
      setDetailOrder(detail);
    } catch (err: any) {
      toast.error(err?.message || "فشل تحميل تفاصيل الطلب.");
    }
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
    setDetailOrder(null);
  };

  const handleCancelOrder = async (orderNumber: string) => {
    setCancellingOrder(orderNumber);
    try {
      await customerAuth.cancelMyOrder(orderNumber);
      toast.success("تم إلغاء طلبك بنجاح.");
      setShowCancelConfirm(null);
      setDetailOrder(null);
      setSelectedOrder(null);
      setOrders((prev) =>
        prev.map((o) =>
          o.order_number === orderNumber ? { ...o, status: "cancelled", can_cancel: false } : o
        )
      );
    } catch (err: any) {
      toast.error(err?.message || "فشل إلغاء الطلب.");
    } finally {
      setCancellingOrder(null);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  const formatCurrency = (val: number) => `${Number(val).toFixed(2)} جنيه`;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="ابحث برقم الطلب..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="pr-10"
          />
        </div>
        <Select
          value={statusFilter || "_all_"}
          onValueChange={(v) => {
            setStatusFilter(v === "_all_" ? "" : v);
            setCurrentPage(1);
          }}
        >
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="حالة الطلب" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => (
              <SelectItem key={o.value || "_all_"} value={o.value === "" ? "_all_" : o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <div className="text-center py-12 text-muted-foreground">جاري التحميل...</div>}
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-lg text-center">{error}</div>
      )}

      {!loading && !error && orders.length === 0 && (
        <div className="text-center py-16 bg-card rounded-lg border border-border">
          <ShoppingCart className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-6">لا توجد طلبات حتى الآن</p>
          <Link to="/">
            <Button>تصفح المتجر</Button>
          </Link>
        </div>
      )}

      {!loading && !error && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-card rounded-lg border border-border p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center"
            >
              {order.first_item_image && (
                <img
                  src={order.first_item_image}
                  alt=""
                  className="w-20 h-20 object-cover rounded-lg hidden sm:block"
                />
              )}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-lg">{order.order_number}</p>
                <p className="text-sm text-muted-foreground">{formatDate(order.created_at)}</p>
                <span
                  className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium border ${
                    STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                  }`}
                >
                  {order.status_display || order.status}
                </span>
                <p className="text-sm mt-1">
                  {order.items_count} منتج • {formatCurrency(order.total_amount || order.total)}
                </p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <Button variant="outline" size="sm" onClick={() => handleViewDetails(order)}>
                  عرض التفاصيل
                </Button>
                {order.can_cancel && (
                  <>
                    {showCancelConfirm === order.order_number ? (
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleCancelOrder(order.order_number)}
                          disabled={cancellingOrder === order.order_number}
                        >
                          {cancellingOrder === order.order_number ? "جاري..." : "تأكيد الإلغاء"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowCancelConfirm(null)}
                        >
                          رجوع
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-600 hover:bg-red-50"
                        onClick={() => setShowCancelConfirm(order.order_number)}
                      >
                        إلغاء الطلب
                      </Button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                صفحة {currentPage} من {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}

      <OrderDetailModal
        open={!!selectedOrder}
        onClose={handleCloseModal}
        order={detailOrder}
        orderNumber={selectedOrder?.order_number}
        onCancelClick={() => selectedOrder?.can_cancel && setShowCancelConfirm(selectedOrder?.order_number)}
        onCancelConfirm={() => selectedOrder && handleCancelOrder(selectedOrder.order_number)}
        showCancelConfirm={showCancelConfirm === selectedOrder?.order_number}
        cancelling={cancellingOrder === selectedOrder?.order_number}
        onCancelConfirmClose={() => setShowCancelConfirm(null)}
      />
    </div>
  );
}
