import { useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircle, Package, Phone, Home } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

export default function OrderConfirmation() {
  const location = useLocation();
  const navigate = useNavigate();
  const orderData = location.state?.orderData;

  useEffect(() => {
    if (!orderData) {
      navigate("/");
    }
  }, [orderData, navigate]);

  if (!orderData) {
    return null;
  }

  const whatsappNumber = "201204437575";
  const whatsappMessage = encodeURIComponent(
    `مرحباً، أنا ${orderData.customer.name}\nرقم الطلب: ${orderData.order_number}\nأريد الاستفسار عن طلبي`
  );
  const whatsappLink = `https://wa.me/${whatsappNumber}?text=${whatsappMessage}`;

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="max-w-2xl mx-auto px-4 w-full">
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              تم استلام طلبك بنجاح!
            </h1>
            <p className="text-muted-foreground">
              شكراً لك على طلبك من متجر إزاري
            </p>
          </div>

          {/* Order Number Card */}
          <div className="bg-card rounded-lg shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
              <div className="flex items-center gap-3">
                <Package className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">رقم الطلب</p>
                  <p className="text-xl font-bold text-foreground">
                    {orderData.order_number}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="space-y-3 mb-4">
              <h3 className="font-bold text-foreground">ملخص الطلب:</h3>
              {orderData.items.map((item: any, idx: number) => (
                <div key={idx} className="text-sm">
                  <p className="font-medium text-foreground">
                    {item.product_name} × {item.units.length}
                  </p>
                  <div className="mr-4 text-muted-foreground text-xs space-y-1">
                    {item.units.map((unit: any, unitIdx: number) => (
                      <p key={unitIdx}>
                        • الوحدة {unit.unit}: {unit.size} - {unit.color}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">المجموع الفرعي</span>
                <span className="font-medium">
                  {orderData.subtotal.toLocaleString("ar-EG")} جنيه
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">الشحن</span>
                <span className="font-medium">
                  {orderData.shipping === 0
                    ? "مجاني"
                    : `${orderData.shipping} جنيه`}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-border">
                <span className="font-bold text-foreground">الإجمالي</span>
                <span className="text-xl font-bold text-primary">
                  {orderData.total.toLocaleString("ar-EG")} جنيه
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
            <h3 className="font-bold text-foreground mb-3">تواصل معنا:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-600" />
                <span className="text-muted-foreground">واتساب:</span>
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  01204437575
                </a>
              </div>
              <p className="text-muted-foreground mr-6">
                سنتواصل معك قريباً لتأكيد الطلب وموعد التوصيل
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button asChild className="flex-1" size="lg">
              <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                <Phone className="w-5 h-5 ml-2" />
                تواصل عبر واتساب
              </a>
            </Button>
            <Button asChild variant="outline" className="flex-1" size="lg">
              <Link to="/">
                <Home className="w-5 h-5 ml-2" />
                العودة للرئيسية
              </Link>
            </Button>
          </div>

          {/* Note */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            يمكنك حفظ رقم الطلب للمتابعة أو الاستعلام عنه لاحقاً
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}




