import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPolicy() {
  const { t } = useLanguage();
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-primary text-primary-foreground py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-tajawal font-bold text-center">{t('privacy.title')}</h1>
          </div>
        </section>

        {/* Content */}
        <section className="max-w-4xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="space-y-8">
            {/* First Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                {t('privacy.paragraph1')}
              </p>
            </div>

            {/* Second Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                {t('privacy.paragraph2')}
              </p>
            </div>

            {/* Third Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                {t('privacy.paragraph3')}
              </p>
            </div>

            {/* Fourth Paragraph */}
            <div className="bg-card border border-border rounded-lg p-6 md:p-8 shadow-sm">
              <p className="text-base md:text-lg font-cairo text-foreground leading-relaxed">
                {t('privacy.paragraph4')}
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
