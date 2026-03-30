import { useState } from "react";
import { Link } from "react-router-dom";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await customerAuth.passwordResetRequest(email);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
        <Header />
        <main className="flex-1 flex items-center justify-center py-16">
          <div className="max-w-md w-full px-4 text-center">
            <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
              <div className="text-accent text-5xl mb-4">✓</div>
              <h1 className="text-xl font-bold text-foreground mb-2">
                تم الإرسال
              </h1>
              <p className="text-muted-foreground mb-6">
                إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.
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
              <h1 className="text-2xl font-bold text-primary">نسيت كلمة المرور</h1>
              <p className="text-muted-foreground mt-1">
                أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
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
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <div className="relative">
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري الإرسال..." : "إرسال رابط إعادة التعيين"}
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
