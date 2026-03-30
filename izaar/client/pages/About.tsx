import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Heart, Target, Zap } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { normalizeImageUrl } from "@/lib/data-mappers";

export default function About() {
  const { t } = useLanguage();
  
  return (
    <div className="w-full min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-primary text-primary-foreground py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
              {t('about.title')}
            </h1>
            <p className="text-center text-primary-foreground/90 text-lg max-w-2xl mx-auto">
              {t('about.subtitle')}
            </p>
          </div>
        </section>

        {/* Our Story */}
        <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
                {t('about.ourStory')}
              </h2>

              <p className="text-foreground/80 leading-relaxed text-lg font-bold whitespace-pre-line">
                {t('about.storyP1')}
              </p>
            </div>
            <div className="relative flex items-center justify-center bg-transparent p-8">
              <div className="relative w-full max-w-md flex items-center justify-center">
                <img
                  src={normalizeImageUrl('/media/logos/logo stand.jpg')}
                  alt={t('about.title')}
                  className="w-full h-auto object-contain"
                  style={{ 
                    display: 'block',
                    maxWidth: '100%'
                  }}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="bg-secondary py-12 md:py-20">
          <div className="max-w-7xl mx-auto px-4 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-foreground mb-12">
              {t('about.ourValues')}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Heart className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t('about.qualityFirst')}</h3>
                <p className="text-foreground/70">
                  {t('about.qualityFirstDesc')}
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Target className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t('about.customerFocus')}</h3>
                <p className="text-foreground/70">
                  {t('about.customerFocusDesc')}
                </p>
              </div>
              <div className="bg-card p-8 rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-6">
                  <Zap className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-4">{t('about.continuousInnovation')}</h3>
                <p className="text-foreground/70">
                  {t('about.continuousInnovationDesc')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Closing Statement */}
        {t('about.whyReason6') && (
          <section className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-20">
            <div className="flex justify-center items-center">
              <p className="text-center text-2xl md:text-3xl font-semibold text-foreground">
                {t('about.whyReason6')}
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
