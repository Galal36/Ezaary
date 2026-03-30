import { useState } from "react";
import { Link } from "react-router-dom";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Mail, User, Phone, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function RegisterPage() {
  const [first_name, setFirst_name] = useState("");
  const [last_name, setLast_name] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirm, setPassword_confirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useCustomerAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      await register({
        first_name,
        last_name,
        email,
        phone: phone.trim() || undefined,
        password,
        password_confirm,
      });
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "حدث خطأ أثناء التسجيل. يرجى المحاولة مرة أخرى.");
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
                تم إنشاء حسابك!
              </h1>
              <p className="text-muted-foreground mb-6">
                يرجى مراجعة بريدك الإلكتروني لتفعيل الحساب.
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
              <h1 className="text-2xl font-bold text-primary">إنشاء حساب</h1>
              <p className="text-muted-foreground mt-1">انضم إلى إيزاري</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">الاسم الأول</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="first_name"
                      value={first_name}
                      onChange={(e) => setFirst_name(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">الاسم الأخير</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="last_name"
                      value={last_name}
                      onChange={(e) => setLast_name(e.target.value)}
                      className="pr-10"
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>
              </div>

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
                <Label htmlFor="phone">رقم الهاتف (اختياري)</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-10"
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
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">8 أحرف على الأقل</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password_confirm">تأكيد كلمة المرور</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password_confirm"
                    type="password"
                    value={password_confirm}
                    onChange={(e) => setPassword_confirm(e.target.value)}
                    className="pr-10"
                    minLength={8}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "جاري التسجيل..." : "إنشاء حساب"}
              </Button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-6">
              لديك حساب؟{" "}
              <Link to="/login" className="text-primary font-medium hover:underline">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
