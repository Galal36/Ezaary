import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();
  const [new_password, setNew_password] = useState("");
  const [new_password_confirm, setNew_password_confirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!token) {
      setError("رابط إعادة التعيين غير صالح.");
      return;
    }
    setIsLoading(true);

    try {
      await customerAuth.passwordResetConfirm(
        token,
        new_password,
        new_password_confirm
      );
      setSuccess(true);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-md w-full px-4 text-center">
            <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
              <h1 className="text-xl font-bold text-foreground mb-2">
                رابط غير صالح
              </h1>
              <p className="text-muted-foreground mb-6">
                رابط إعادة تعيين كلمة المرور غير صالح أو منتهي الصلاحية.
              </p>
              <Link to="/forgot-password">
                <Button>طلب رابط جديد</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-md w-full px-4 text-center">
            <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
              <div className="text-accent text-5xl mb-4">✓</div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                تم تغيير كلمة المرور
              </h1>
              <p className="text-muted-foreground mb-6">
                تم تغيير كلمة المرور بنجاح. جاري تحويلك لتسجيل الدخول...
              </p>
              <Link to="/login">
                <Button>تسجيل الدخول</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">
                تعيين كلمة مرور جديدة
              </h1>
              <p className="text-muted-foreground mt-1">
                أدخل كلمة المرور الجديدة
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="new_password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new_password"
                    type="password"
                    value={new_password}
                    onChange={(e) => setNew_password(e.target.value)}
                    className="pr-10"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">8 أحرف على الأقل</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="new_password_confirm">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="new_password_confirm"
                    type="password"
                    value={new_password_confirm}
                    onChange={(e) => setNew_password_confirm(e.target.value)}
                    className="pr-10"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              <Link to="/login" className="text-primary font-medium hover:underline">
                العودة لتسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
