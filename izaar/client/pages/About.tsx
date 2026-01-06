import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Target, Zap } from "lucide-react";

export default function About() {
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              عن إزاري
            </h1>
            <p className="text-center text-primary-foreground/90 text-lg max-w-2xl mx-auto">
              متجرك الموثوق للملابس الرجالية عالية الجودة بأفضل الأسعار
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                قصتنا
              </h2>

              <p className="text-foreground/80 leading-relaxed mb-4">
               
               بدأت رحلة إزاري عام 2025 برؤية بسيطة لكن قوية: توفير ملابس رجالية عالية الجودة بشكل أساسي ثم نسائية بأسعار معقولة للجميع. نشأنا من قلب مدينة أسيوط بحب وشغف لخدمة عملائنا.
                            </p>
                            <p className="text-foreground/80 leading-relaxed mb-4">
                              اليوم، نفخر بكوننا وجهة مطلوبة  للملابس الرجالية الرياضية والكاجوال، حيث نقدم  التصاميم التي تنال رضا المستخدمين ، ونتعامل كذلك مع ماركات أصلية مثل شي ان (SheIn)والماركات الموثوقة 
              <br />
              لاحظ أن المتجر قد لا يمتلك جميع البضاعة الواردة ولكن نتعامل مع بعض المتاجر الموثوقة، كما أن لدينا شراكات معهم.             
               </p>
                            <p className="text-foreground/80 leading-relaxed">
                              نؤمن أن كل عميل يستحق التعامل بكرامة وراحة، وهذا ما يدفعنا للتحسن المستمر.
                            </p>
                    <p className="text-foreground/80 leading-relaxed">
              نهتم بشكل كبير بالتعامل بعد البيع لمساعدة العملاء في استرداد أو تبديل البضاعة في حالة البضاعة في حالتها الأصلية
              وفي خلال مدة 15 يوما
              
                            </p>
              
                         </div>
            <div className="relative">
              <img
                src="http://localhost:8000/media/logos/إزاري_Ezaary_Logo.png"
                alt="متجر إزاري"
                className="rounded-lg shadow-lg w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-secondary py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              قيمنا الأساسية
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">الجودة أولاً</h3>
                <p className="text-foreground/70">
                  نختار كل منتج بعناية فائقة لضمان أعلى معايير الجودة لعملائنا الكرام
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">التركيز على العميل</h3>
                <p className="text-foreground/70">
                  خدمتك الممتازة وراحتك هي هدفنا الأساسي في كل خطوة من خطوات التسوق
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">الابتكار المستمر</h3>
                <p className="text-foreground/70">
                  نعمل دائماً على تطوير خدماتنا وإضافة منتجات جديدة تواكب الموضة الحديثة
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
            لماذا تختار إزاري؟
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-6">
              {[
                {
                  title: "أسعار منافسة",
                  description: "نقدم أفضل الأسعار في السوق دون التنازل عن الجودة",
                },
                {
                  title: "توصيل سريع",
                  description: "شحن سريع وآمن إلى جميع محافظات مصر في 3-5 أيام",
                },
                {
                  title: "ضمان الرضا",
                  description: "نضمن راحتك بسياسة استرجاع سهلة وآمنة",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-foreground font-bold">{idx + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="space-y-6">
              {[
                {
                  title: "ماركات عالمية",
                  description: "نعرض أفضل الماركات العالمية والمحلية الموثوقة",
                },
                {
                  title: "خدمة عملاء ممتازة",
                  description: "فريقنا متاح 24/7 على واتساب والبريد الإلكتروني",
                },
                {
                  title: "مرونة في الدفع",
                  description: "طرق دفع متعددة وآمنة تناسب احتياجاتك",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-foreground font-bold">{idx + 4}</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {item.title}
                    </h3>
                    <p className="text-foreground/70">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">هل لديك أسئلة؟</h2>
            <p className="text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              تواصل معنا عبر واتساب أو البريد الإلكتروني وسنكون سعداء بمساعدتك
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-accent text-accent-foreground px-8 py-3 rounded-lg font-bold hover:opacity-90 transition-opacity"
              >
                تواصل عبر WhatsApp
              </a>
              <a
                href="mailto:help@ezaary.com"
                className="inline-block border-2 border-primary-foreground text-primary-foreground px-8 py-3 rounded-lg font-bold hover:bg-primary-foreground hover:text-primary transition-colors"
              >
                أرسل بريد إلكتروني
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
