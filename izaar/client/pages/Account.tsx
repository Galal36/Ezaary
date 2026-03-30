import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { Button } from "@/components/ui/button";

export default function Account() {
  const { isAuthenticated, isLoading } = useCustomerAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/profile", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="animate-pulse text-muted-foreground">جاري التحميل...</div>
        </main>
        <Footer />
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">حسابي</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
            سجّل دخولك أو أنشئ حساباً للاستفادة من مزايا إيزاري وحفظ طلباتك وعناوينك.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/login">
              <Button className="bg-primary text-primary-foreground px-8 py-3 font-bold">
                تسجيل الدخول
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" className="border-2 border-primary text-primary px-8 py-3 font-bold">
                إنشاء حساب
              </Button>
            </Link>
          </div>
          <Link
            to="/"
            className="inline-block mt-6 text-primary font-bold hover:underline"
          >
            العودة للرئيسية
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
