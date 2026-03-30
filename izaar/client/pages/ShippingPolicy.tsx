import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ShippingPolicy() {
  const { t } = useLanguage();
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center">{t('shipping.title')}</h1>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="prose prose-lg max-w-none">
            <div className="space-y-8 text-foreground leading-relaxed">
              {/* Delivery Section */}
              <div>
                <h2 className="text-3xl font-bold mb-6 text-foreground">{t('shipping.delivery')}</h2>
                <p className="text-lg mb-6">
                  <strong>{t('shipping.deliveryInfo')}</strong>
                </p>

                <div className="bg-secondary p-6 rounded-lg">
                  <p className="text-lg font-bold">{t('shipping.deliveryAll')}</p>
                </div>
              </div>

              {/* Return and Exchange Policy Section */}
              <div className="border-t border-border pt-8">
                <h2 className="text-3xl font-bold mb-6 text-foreground">{t('shipping.returnPolicy')}</h2>
                
                <p className="text-lg mb-8">
                  <strong>{t('shipping.returnPolicyIntro')}</strong>
                </p>

                {/* شروط الاسترجاع والاستبدال */}
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-4 text-foreground">{t('shipping.returnConditions')}</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">{t('shipping.returnFirst')}</h4>
                      <ol className="list-decimal list-inside space-y-3 text-lg">
                        <li>{t('shipping.returnFirst1')}</li>
                        <li>{t('shipping.returnFirst2')}</li>
                        <li>{t('shipping.returnFirst3')}
                          <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                            <li>{t('shipping.returnFirst3a')}</li>
                            <li>{t('shipping.returnFirst3b')}</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">{t('shipping.returnSecond')}</h4>
                      <ol className="list-decimal list-inside space-y-3 text-lg">
                        <li>{t('shipping.returnSecond1')}</li>
                        <li>{t('shipping.returnSecond2')}</li>
                        <li>{t('shipping.returnSecond3')}</li>
                        <li>{t('shipping.returnSecond4')}
                          <ul className="list-disc list-inside mr-6 mt-2 space-y-1">
                            <li>{t('shipping.returnSecond4a')}</li>
                            <li>{t('shipping.returnSecond4b')}</li>
                          </ul>
                        </li>
                      </ol>
                    </div>

                    <div>
                      <h4 className="text-xl font-bold mb-3 text-foreground">{t('shipping.returnThird')}</h4>
                      <ul className="list-disc list-inside space-y-3 text-lg">
                        <li>{t('shipping.returnThird1')}</li>
                        <li>{t('shipping.returnThird2')}</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* هدفنا */}
                <div className="bg-primary/10 border border-primary/20 p-6 rounded-lg">
                  <h4 className="text-xl font-bold mb-3 text-foreground">{t('shipping.ourGoal')}</h4>
                  <p className="text-lg">
                    <strong>{t('shipping.ourGoalText')}</strong>
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
