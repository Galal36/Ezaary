import { Link } from "react-router-dom";
import { User } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Account() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 flex items-center justify-center">
        <div className="text-center py-16">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-foreground mb-4">حسابي</h1>
          <p className="text-muted-foreground mb-8 max-w-md">
          نحن نعمل الان علي بناء نظام مستخدم. يمكنك التوصل معنا عبر الوسائل المتاحة في المنصة اذا كان لديك أي استفسار.

          </p>
          <div className="flex gap-4 justify-center">
            <button className="bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors">
              تسجيل الدخول
            </button>
            <button className="border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary/10 transition-colors">
              إنشاء حساب
            </button>
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
