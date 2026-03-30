import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Truck, AlertTriangle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
  confirmed: "bg-blue-100 text-blue-800 border-blue-300",
  processing: "bg-orange-100 text-orange-800 border-orange-300",
  shipped: "bg-purple-100 text-purple-800 border-purple-300",
  out_for_delivery: "bg-purple-100 text-purple-800 border-purple-300",
  delivered: "bg-green-100 text-green-800 border-green-300",
  cancelled: "bg-red-100 text-red-800 border-red-300",
};

const STATUS_LABELS_AR: Record<string, string> = {
  pending: "في الانتظار",
  confirmed: "تم التأكيد",
  processing: "قيد التجهيز",
  shipped: "تم الشحن",
  out_for_delivery: "خرج للتوصيل",
  delivered: "تم التسليم",
  cancelled: "ملغي",
  returned: "مرتجع",
};

const WHATSAPP_URL = "https://wa.me/201204437575";

interface OrderDetailModalProps {
  open: boolean;
  onClose: () => void;
  order: any | null;
  orderNumber?: string;
  onCancelClick?: () => void;
  onCancelConfirm?: () => void;
  showCancelConfirm?: boolean;
  cancelling?: boolean;
  onCancelConfirmClose?: () => void;
}

export default function OrderDetailModal({
  open,
  onClose,
  order,
  orderNumber,
  onCancelClick,
  onCancelConfirm,
  showCancelConfirm,
  cancelling,
  onCancelConfirmClose,
}: OrderDetailModalProps) {
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("ar-EG", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const formatCurrency = (val: number) => `${Number(val).toFixed(2)} جنيه`;

  const isShipped =
    order && (order.status === "shipped" || order.status === "out_for_delivery");

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle className="text-right flex items-center gap-2 flex-wrap">
            {orderNumber || order?.order_number}
            {order && (
              <span
                className={`inline-block px-2 py-0.5 rounded text-sm font-medium border ${
                  STATUS_COLORS[order.status] || "bg-gray-100 text-gray-800"
                }`}
              >
                {order.status_display || order.status}
              </span>
            )}
          </SheetTitle>
        </SheetHeader>

        {!order && (
          <div className="py-8 text-center text-muted-foreground">
            جاري تحميل التفاصيل...
          </div>
        )}

        {order && (
          <div className="space-y-6 mt-6 pr-2">
            {/* Tracking banner */}
            {isShipped && (
              <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 flex items-center gap-3">
                <Truck className="w-8 h-8 text-primary flex-shrink-0" />
                <div>
                  <p className="font-medium">طلبك في الطريق إليك!</p>
                  <p className="text-sm text-muted-foreground">
                    إذا كان لديك استفسار، تواصل معنا عبر واتساب.
                  </p>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-2"
                  >
                    <Button size="sm">تواصل معنا</Button>
                  </a>
                </div>
              </div>
            )}

            {/* Order items */}
            <section>
              <h3 className="font-semibold mb-3">المنتجات</h3>
              <div className="space-y-3">
                {order.items?.map((item: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    {item.product_image && (
                      <img
                        src={item.product_image}
                        alt=""
                        className="w-16 h-16 object-cover rounded"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{item.product_name_ar}</p>
                      {(item.selected_size || item.selected_color) && (
                        <p className="text-sm text-muted-foreground">
                          {[item.selected_size, item.selected_color]
                            .filter(Boolean)
                            .join(" • ")}
                        </p>
                      )}
                      <p className="text-sm">
                        {item.quantity} × {formatCurrency(item.final_unit_price || item.unit_price)} ={" "}
                        {formatCurrency(item.subtotal)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3 space-y-1 text-sm border-t pt-3">
                <div className="flex justify-between">
                  <span>المجموع الفرعي</span>
                  <span>{formatCurrency(order.subtotal || 0)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>الخصم</span>
                    <span>- {formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>الشحن</span>
                  <span>{formatCurrency(order.shipping_cost || 0)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1">
                  <span>الإجمالي</span>
                  <span>{formatCurrency(order.total_amount || order.total || 0)}</span>
                </div>
              </div>
            </section>

            {/* Delivery info */}
            <section>
              <h3 className="font-semibold mb-3">معلومات التوصيل</h3>
              <div className="space-y-1 text-sm">
                <p>
                  <strong>الاسم:</strong> {order.customer_name}
                </p>
                <p>
                  <strong>الهاتف:</strong> {order.customer_phone}
                </p>
                <p>
                  <strong>العنوان:</strong> {order.customer_address || order.detailed_address}
                </p>
              </div>
            </section>

            {/* Payment info */}
            <section>
              <h3 className="font-semibold mb-3">معلومات الدفع</h3>
              <p className="text-sm">
                {order.payment_method_display || order.payment_method}
              </p>
              {order.payment_status && (
                <p className="text-sm text-muted-foreground mt-1">
                  {order.payment_status}
                </p>
              )}
            </section>

            {/* Status timeline */}
            <section>
              <h3 className="font-semibold mb-3">سير الطلب</h3>
              <div className="space-y-3 border-r-2 border-muted pr-4">
                {order.status_history
                  ?.slice()
                  .sort(
                    (a: any, b: any) =>
                      new Date(b.created_at).getTime() -
                      new Date(a.created_at).getTime()
                  )
                  .map((entry: any, i: number) => (
                    <div key={i} className="relative">
                      <div className="absolute -right-[21px] top-1 w-2 h-2 rounded-full bg-primary" />
                      <p className="font-medium text-sm">
                        {entry.status_label_ar || STATUS_LABELS_AR[entry.new_status] || entry.new_status}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </p>
                      {entry.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {entry.notes}
                        </p>
                      )}
                    </div>
                  ))}
              </div>
            </section>

            {/* Cancel confirmation */}
            {showCancelConfirm && order.can_cancel && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium">هل أنت متأكد أنك تريد إلغاء هذا الطلب؟</p>
                    <p className="text-sm text-muted-foreground">
                      لا يمكن التراجع عن هذا الإجراء بعد التأكيد.
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={onCancelConfirm}
                    disabled={cancelling}
                  >
                    {cancelling ? "جاري..." : "تأكيد الإلغاء"}
                  </Button>
                  <Button variant="outline" size="sm" onClick={onCancelConfirmClose}>
                    رجوع
                  </Button>
                </div>
              </div>
            )}

            {/* Cancel button (when not showing confirm) */}
            {!showCancelConfirm && order.can_cancel && (
              <div className="pt-4">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={onCancelClick}
                >
                  إلغاء الطلب
                </Button>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
