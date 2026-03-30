import { useState } from "react";
import { orders as ordersApi } from "@/lib/api-client";
import { toast } from "sonner";
// Remove mock import
// import { Order } from "@/lib/admin-mock-data"; 
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Phone, Mail, MapPin, Printer, MessageSquare, Download, CreditCard } from "lucide-react";

// Define compatible interfaces matching Orders.tsx
interface OrderProduct {
  id: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string;
  color?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string;
  address?: string;
  governorate?: string;
  district?: string;
  total: number;
  subtotal?: number; // Optional as it might be calculated or passed
  shipping?: number; // Optional
  discount?: number; // Optional
  status: string;
  createdAt: string;
  updatedAt?: string;
  products: OrderProduct[];
  notes?: string;
  payment_method?: string; // Payment method
  payment_screenshot?: string; // Payment screenshot URL
}

interface OrderDetailsProps {
  order: Order;
  onClose: () => void;
  onUpdate?: () => void;
}

const statusOptions = [
  { value: "pending", label: "قيد الانتظار" },
  { value: "confirmed", label: "تم التأكيد" },
  { value: "processing", label: "قيد المعالجة" },
  { value: "shipped", label: "تم الشحن" },
  { value: "out_for_delivery", label: "قيد التوصيل" },
  { value: "delivered", label: "تم التوصيل" },
  { value: "cancelled", label: "ملغي" },
];

const statusColors: Record<string, string> = {
  pending: "bg-blue-100 text-blue-800",
  confirmed: "bg-indigo-100 text-indigo-800",
  processing: "bg-yellow-100 text-yellow-800",
  shipped: "bg-green-100 text-green-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-green-600 text-white",
  cancelled: "bg-red-100 text-red-800",
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

const paymentMethodLabels: Record<string, string> = {
  cash_on_delivery: "دفع عند الاستلام",
  vodafone_cash: "فودافون كاش",
  instapay: "انستاباي",
};

export default function OrderDetails({ order, onClose, onUpdate }: OrderDetailsProps) {
  const [status, setStatus] = useState(order.status);
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await ordersApi.updateStatus(order.id, status, notes);
      toast.success("تم تحديث حالة الطلب بنجاح");
      if (onUpdate) onUpdate();
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("فشل تحديث حالة الطلب");
    } finally {
      setIsSaving(false);
    }
  };

  const handleWhatsApp = () => {
    const message = encodeURIComponent(
      `مرحباً ${order.customerName}، شكراً لك على طلبك #${order.id}`
    );
    window.open(`https://wa.me/${order.phone}?text=${message}`, "_blank");
  };

  // derived values if missing
  const subtotal = order.subtotal || order.total;
  const shipping = order.shipping || 0;
  const discount = order.discount || 0;
  const updatedAt = order.updatedAt || order.createdAt;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">
            تفاصيل الطلب #{order.orderNumber}
          </h2>
          <span
            className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${statusColors[status] || "bg-gray-100 text-gray-800"
              }`}
          >
            {statusLabels[status] || status}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Customer Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-4">معلومات العميل</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">الاسم</p>
              <p className="font-medium text-foreground">{order.customerName}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">رقم الهاتف</p>
              <a
                href={`tel:${order.phone}`}
                className="font-medium text-primary hover:underline flex items-center gap-2"
              >
                <Phone className="w-4 h-4" />
                {order.phone}
              </a>
            </div>
            {order.email && (
              <div>
                <p className="text-muted-foreground mb-1">البريد الإلكتروني</p>
                <a
                  href={`mailto:${order.email}`}
                  className="font-medium text-primary hover:underline flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  {order.email}
                </a>
              </div>
            )}
            <div>
              <p className="text-muted-foreground mb-1">المحافظة</p>
              <p className="font-medium text-foreground">
                {order.governorate || "غير محدد"}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">المركز</p>
              <p className="font-medium text-foreground">{order.district || "غير محدد"}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">العنوان</p>
              <p className="font-medium text-foreground flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                {order.address}
              </p>
            </div>
            {order.notes && (
              <div>
                <p className="text-muted-foreground mb-1">ملاحظات</p>
                <p className="font-medium text-foreground">{order.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-4">معلومات الطلب</h3>
          <div className="space-y-3 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">تاريخ الطلب</p>
              <p className="font-medium text-foreground">
                {new Date(order.createdAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">رقم الطلب</p>
              <p className="font-medium text-foreground">#{order.orderNumber}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">عدد المنتجات</p>
              <p className="font-medium text-foreground">
                {order.products.length} منتج
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">آخر تحديث</p>
              <p className="font-medium text-foreground">
                {new Date(updatedAt).toLocaleDateString("ar-EG", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-bold text-foreground mb-4">الملخص المالي</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">المجموع الفرعي</span>
              <span className="font-medium text-foreground">
                {subtotal.toLocaleString("ar-EG")} جنيه
              </span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">الخصم</span>
                <span className="font-medium text-green-600">
                  -{discount.toLocaleString("ar-EG")} جنيه
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">الشحن</span>
              <span className="font-medium text-foreground">
                {shipping.toLocaleString("ar-EG")} جنيه
              </span>
            </div>
            <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
              <span className="font-bold text-foreground">الإجمالي</span>
              <span className="font-bold text-lg text-foreground">
                {order.total.toLocaleString("ar-EG")} جنيه
              </span>
            </div>
            
            {/* Payment Method */}
            {order.payment_method && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-blue-600" />
                  <span className="font-bold text-foreground">طريقة الدفع</span>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <span className="font-medium text-blue-900">
                    {paymentMethodLabels[order.payment_method] || order.payment_method}
                  </span>
                </div>
              </div>
            )}
            
            {/* Payment Screenshot */}
            {order.payment_screenshot && (
              <div className="border-t border-gray-200 pt-3 mt-3">
                <div className="flex items-center gap-2 mb-2">
                  <Download className="w-4 h-4 text-green-600" />
                  <span className="font-bold text-foreground">صورة إثبات الدفع</span>
                </div>
                <div className="bg-white border-2 border-green-200 rounded-lg p-2">
                  <a 
                    href={order.payment_screenshot.startsWith('http') ? order.payment_screenshot : `https://ezaary.com${order.payment_screenshot}`}
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block"
                  >
                    <img
                      src={order.payment_screenshot.startsWith('http') ? order.payment_screenshot : `https://ezaary.com${order.payment_screenshot}`}
                      alt="Payment Screenshot"
                      className="w-full h-48 object-contain rounded border border-gray-200 hover:border-green-400 transition-colors cursor-pointer"
                    />
                  </a>
                  <a
                    href={order.payment_screenshot.startsWith('http') ? order.payment_screenshot : `https://ezaary.com${order.payment_screenshot}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Download className="w-4 h-4" />
                    تحميل الصورة كاملة
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-bold text-foreground">المنتجات</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  صورة
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  اسم المنتج
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  المقاس
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  اللون
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الكمية
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  السعر
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                  الإجمالي
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {order.products.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.size || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.color || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {product.price.toLocaleString("ar-EG")} جنيه
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {(product.price * product.quantity).toLocaleString(
                      "ar-EG"
                    )}{" "}
                    جنيه
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Update Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">تحديث حالة الطلب</h3>
        <div className="space-y-4">
          <div>
            <Label htmlFor="status">الحالة</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status" className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="notes">ملاحظات على التحديث (اختياري)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف ملاحظات حول التحديث..."
              className="mt-2"
              rows={3}
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave}>حفظ التحديث</Button>
            <Button variant="outline" onClick={onClose}>
              إلغاء
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleWhatsApp}>
          <MessageSquare className="w-4 h-4 ml-2" />
          تواصل عبر واتساب
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="w-4 h-4 ml-2" />
          طباعة الطلب
        </Button>
        <Button variant="outline">
          <Mail className="w-4 h-4 ml-2" />
          إرسال تأكيد بالبريد
        </Button>
      </div>
    </div>
  );
}





