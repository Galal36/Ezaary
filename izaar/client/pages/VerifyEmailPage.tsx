import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("رابط التفعيل غير صالح.");
      return;
    }

    customerAuth
      .verifyEmail(token)
      .then((res) => {
        setStatus("success");
        setMessage(res.message || "تم تفعيل حسابك بنجاح!");
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err?.message || "فشل تفعيل الحساب. قد يكون الرابط منتهي الصلاحية.");
      });
  }, [token]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-md w-full px-4 text-center">
          <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
            {status === "loading" && (
              <div className="animate-pulse text-muted-foreground">
                جاري تفعيل حسابك...
              </div>
            )}
            {status === "success" && (
              <>
                <div className="text-accent text-5xl mb-4">✓</div>
                <h1 className="text-xl font-bold text-foreground mb-2">
                  تم التفعيل!
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/login">
                  <Button>تسجيل الدخول</Button>
                </Link>
              </>
            )}
            {status === "error" && (
              <>
                <div className="text-destructive text-5xl mb-4">✕</div>
                <h1 className="text-xl font-bold text-foreground mb-2">
                  فشل التفعيل
                </h1>
                <p className="text-muted-foreground mb-6">{message}</p>
                <Link to="/login">
                  <Button>العودة لتسجيل الدخول</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
