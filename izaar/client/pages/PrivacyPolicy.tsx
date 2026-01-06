import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-center">الخصوصية</h1>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="space-y-8">
            {/* First Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                يقوم المتجر الإلكتروني بالتعامل بشكل احترافي مع مستخدميه من خلال توضيح جميع النقاط التي يلزم للمشتري معرفته، ونهتم بكل تفاصيل الطلب من حين تفعيله وطلبه إلي توصيله وكذلك الخدمات في ما بعد البيع.
              </p>
            </div>

            {/* Second Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                كذلك تبني إزاري الهيكل العام للمتجر بشكل يرضي جميع العملاء حيث ينبغي للعميل فتح بضاعته ومعاينتها عند الإستلام ولا مانع إذا لم يجد ما طلبه موجودا أن يرد الطلب، مع اشتراط عند الاسترداد دفع مصاريف الشحن إلا إذا كان الطلب بشكل خاطيء من المتجر فحينها تتحمل إزاري مصاريف الشحن.
              </p>
            </div>

            {/* Third Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                ينبغي عليك إضافة رقم الهاتف والبريد الإلكتروني - يعتبر البريد ضروريا أيضا لأنه يرسل عليه رابط تقييم المنتج الذي اشتريته.
              </p>
            </div>

            {/* Fourth Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                بعض المنتجات لا تكون ملكا للموقع نفسه ولكن قد يعرض أصحاب المتاجر بضائعهم علي المتجر الخاص بنا ويكون للمتجر نسبة من الكسب. كذلك بعض العلامات التجارية التي تكون موجودة قد لا تكون مملوكة للمتجر، لكن يوجد تيسيرات للمتجر أن يشتريها في حال وجود طلب عليها.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
