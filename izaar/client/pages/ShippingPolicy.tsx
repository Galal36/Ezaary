import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function ShippingPolicy() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center">سياسات التوصيل والاسترداد</h1>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-foreground leading-relaxed">
              {/* Delivery Section */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">التوصيل</h2>
                <p className="text-lg mb-6">
                  <strong>التوصيل داخل محافظة أسيوط وداخل مراكز وقري أسيوط، مع العلم إذا كان الموقع المراد التوصيل إليه بعيدا قد يتم التواصل مع المشتري لزيادة مصاريف الشحن علي الاورد فقط.</strong>
                </p>

                <div className="bg-secondary p-6 rounded-lg space-y-4">
                  <div>
                    <p className="text-lg font-bold mb-2">التوصيل داخل أسيوط:</p>
                    <p className="text-lg">من 1 إلى 3 أيام عمل</p>
                  </div>
                  
                  <div className="border-t border-border pt-4">
                    <p className="text-lg font-bold mb-2">إلي محافظة القاهرة:</p>
                    <p className="text-lg">من 2 إلى 4 أيام عمل</p>
                  </div>
                </div>
              </div>

              {/* Return and Exchange Policy Section */}
              <div className="border-t border-border pt-8">
                <h2 className="text-3xl font-bold mb-6 text-foreground">سياسة الاستبدال والاسترجاع | إزاري</h2>
                
                <p className="text-lg mb-8">
                  <strong>إزاري تحرص دائما علي رضا العملاء وخدمات ما بعد البيع. لو فيه أي مشكلة في المنتج سواء المقاس أو أي عيب تقدر ترجعه.</strong>
                </p>

                {/* شروط الاسترجاع والاستبدال */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">شروط الاسترجاع والاستبدال</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">أولًا</h4>
                      <ol className="list-decimal list-inside space-y-3 text-lg">
                        <li>يمكن استرجاع أو استبدال المنتج خلال 3 أيام من استلام الطلب.</li>
                        <li>لازم يكون المنتج بحالته الأصلية (غير مستخدم – غير مغسول)</li>
                        <li>لا يتم قبول المرتجعات في حالة:
                          <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                            <li>تلف أو إتساخ المنتج بعد الاستلام.</li>
                            <li>منتجات تم تفصيلها أو طباعتها خصيصًا بناءً على طلب العميل.</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">ثانيًا: خطوات الاستبدال أو الاسترجاع</h4>
                      <ol className="list-decimal list-inside space-y-3 text-lg">
                        <li>تواصل مع خدمة عملاء إزاري عبر واتساب أو صفحة الفيس.</li>
                        <li>اذكر رقم الطلب وسبب الاسترجاع أو الاستبدال.</li>
                        <li>هنرتب مع شركة الشحن لاستلام المنتج من عندك.</li>
                        <li>بعد استلامنا المنتج وفحصه، بنقوم بـ:
                          <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                            <li>استبدال المنتج بآخر حسب رغبتك.</li>
                            <li>أو استرجاع المبلغ بنفس وسيلة الدفع المستخدمة (خلال 3 إلى 5 أيام عمل).</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">ثالثًا: تكلفة الشحن</h4>
                      <ul className="list-disc list-inside space-y-3 text-lg">
                        <li>في حالة الاستبدال أو الاسترجاع بسبب خطأ من إزاري (مقاس خاطئ – عيب تصنيع)، نتحمل التكلفة كاملة.</li>
                        <li>في حالة تغيير رأي العميل أو مقاس غير مناسب تم اختياره خطأ، يتحمل العميل تكلفة الشحن.</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* هدفنا */}
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                  <h4 className="text-xl font-bold mb-3 text-foreground">هدفنا</h4>
                  <p className="text-lg">
                    <strong>في إزاري، أحد أغلي أولوياتنا رضا العميل. لذلك نسعد بالتواصل معنا للتقييم أو في حالة وجود أي مشكلة.</strong>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
