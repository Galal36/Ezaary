import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { login } = useCustomerAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || "/";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setUnverifiedEmail(null);
    setIsLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else if (result.unverified && result.email) {
        setUnverifiedEmail(result.email);
        setError("الحساب غير مفعل. يرجى تفعيل بريدك الإلكتروني أولاً.");
      } else {
        setError("البريد الإلكتروني أو كلمة المرور غير صحيحة.");
      }
    } catch {
      setError("حدث خطأ أثناء تسجيل الدخول. يرجى المحاولة مرة أخرى.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    const emailToUse = unverifiedEmail || email;
    if (!emailToUse) return;
    setResendError("");
    setResendSuccess(false);
    setResendLoading(true);
    try {
      await customerAuth.resendVerification(emailToUse);
      setResendSuccess(true);
    } catch (err: any) {
      setResendError(err?.message || "فشل إرسال رابط التفعيل.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-md px-4">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-primary">تسجيل الدخول</h1>
              <p className="text-muted-foreground mt-1">مرحباً بعودتك إلى إيزاري</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {unverifiedEmail && (
                <Alert className="border-accent/50 bg-accent/5">
                  <AlertDescription>
                    <div className="space-y-2">
                      <p>لم يتم تفعيل حسابك بعد. تحقق من بريدك الإلكتروني.</p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                      >
                        {resendLoading ? "جاري الإرسال..." : "إعادة إرسال رابط التفعيل"}
                      </Button>
                      {resendSuccess && (
                        <p className="text-sm text-green-600">تم إرسال الرابط إلى بريدك.</p>
                      )}
                      {resendError && (
                        <p className="text-sm text-destructive">{resendError}</p>
                      )}
                    </div>
                  </AlertDescription>
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

              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  نسيت كلمة المرور؟
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري الدخول..." : "تسجيل الدخول"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              ليس لديك حساب؟{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                إنشاء حساب
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
