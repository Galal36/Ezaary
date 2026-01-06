import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 lg:px-8 py-16 md:py-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-primary mb-6">404</h1>
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-4">
            عذراً، الصفحة غير موجودة
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
            الصفحة التي تبحث عنها قد تكون محذوفة أو غير متاحة في الوقت الحالي. يرجى محاولة العودة إلى الصفحة الرئيسية.
          </p>

          <div className="flex gap-4 flex-col sm:flex-row justify-center">
            <Link
              to="/"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary/90 transition-colors"
            >
              العودة للصفحة الرئيسية
            </Link>
            <a
              href="https://wa.me/201204437575?text=مرحباً، أحتاج مساعدة"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border-2 border-primary text-primary px-8 py-3 rounded-lg font-bold hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              تواصل معنا
            </a>
          </div>

          {/* Placeholder for future pages */}
          <div className="mt-12 pt-12 border-t border-border">
            <p className="text-muted-foreground mb-4">الصفحات الإضافية قيد الإعداد</p>
            <p className="text-sm text-muted-foreground">
              نحن نعمل على إضافة المزيد من الميزات والصفحات. شكراً لصبرك!
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default NotFound;
