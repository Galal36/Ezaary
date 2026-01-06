import { Customer, mockOrders } from "@/lib/admin-mock-data";
import { Phone, Mail, MapPin, Calendar, ShoppingCart } from "lucide-react";

interface CustomerDetailsProps {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerDetails({
  customer,
  onClose,
}: CustomerDetailsProps) {
  const customerOrders = mockOrders.filter(
    (order) => order.email === customer.email
  );

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
    <div className="p-6">
      <h2 className="text-2xl font-bold text-foreground mb-6">
        تفاصيل العميل
      </h2>

      {/* Customer Info */}
      <div className="bg-gray-50 rounded-lg p-6 mb-6">
        <h3 className="font-bold text-foreground mb-4">معلومات العميل</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground mb-1">الاسم</p>
            <p className="font-medium text-foreground">{customer.name}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">رقم الهاتف</p>
            <a
              href={`tel:${customer.phone}`}
              className="font-medium text-primary hover:underline flex items-center gap-2"
            >
              <Phone className="w-4 h-4" />
              {customer.phone}
            </a>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              البريد الإلكتروني
            </p>
            <a
              href={`mailto:${customer.email}`}
              className="font-medium text-primary hover:underline flex items-center gap-2"
            >
              <Mail className="w-4 h-4" />
              {customer.email}
            </a>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">المحافظة</p>
            <p className="font-medium text-foreground flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              {customer.governorate}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">
              تاريخ التسجيل
            </p>
            <p className="font-medium text-foreground flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {new Date(customer.registrationDate).toLocaleDateString("ar-EG")}
            </p>
          </div>
          {customer.lastOrderDate && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">
                آخر طلب
              </p>
              <p className="font-medium text-foreground">
                {new Date(customer.lastOrderDate).toLocaleDateString("ar-EG")}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <p className="text-sm text-muted-foreground">عدد الطلبات</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {customer.totalOrders}
          </p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-green-600 font-bold">EGP</span>
            <p className="text-sm text-muted-foreground">إجمالي الإنفاق</p>
          </div>
          <p className="text-2xl font-bold text-foreground">
            {customer.totalSpending.toLocaleString("ar-EG")} جنيه
          </p>
        </div>
      </div>

      {/* Order History */}
      <div>
        <h3 className="font-bold text-foreground mb-4">سجل الطلبات</h3>
        {customerOrders.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">
            لا توجد طلبات لهذا العميل
          </p>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      رقم الطلب
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      التاريخ
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      الحالة
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-600 uppercase">
                      الإجمالي
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customerOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusColors[order.status]
                          }`}
                        >
                          {statusLabels[order.status]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-foreground">
                        {order.total.toLocaleString("ar-EG")} جنيه
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}





