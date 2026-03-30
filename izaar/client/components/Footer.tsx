import { Link } from "react-router-dom";
import { Facebook, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
  const { t } = useLanguage();
  
  return (
    <footer className="bg-[#1a1a1a] text-background mt-16 md:mt-24" dir="rtl">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 md:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Column 1: Brand (إزاري) */}
          <div className="text-center md:text-right">
            <h3 className="text-2xl lg:text-3xl font-bold mb-3 text-accent">إزاري</h3>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed mt-4">
              {t('footer.izaaryDescription')}
            </p>
          </div>

          {/* Column 2: Quick Links (روابط سريعة) */}
          <div className="text-center md:text-right">
            <h3 className="text-lg lg:text-xl font-bold mb-6 text-white">{t('footer.quickLinksTitle')}</h3>
            <ul className="space-y-3 text-sm lg:text-base opacity-90">
              <li>
                <Link to="/" className="hover:text-accent transition-colors block">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-accent transition-colors block">
                  {t('nav.categories')}
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors block">
                  {t('footer.aboutUs')}
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-accent transition-colors block">
                  {t('footer.shippingPolicy')}
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent transition-colors block">
                  {t('footer.privacyPolicy')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact (تواصل معنا) */}
          <div className="text-center md:text-right">
            <h3 className="text-lg lg:text-xl font-bold mb-6 text-white">{t('footer.contactTitle')}</h3>
            <ul className="space-y-4 text-sm lg:text-base opacity-90">
              <li>
                <a
                  href="tel:01204437575"
                  className="hover:text-accent transition-colors flex items-center justify-center md:justify-end gap-3"
                >
                  <Phone className="w-5 h-5 flex-shrink-0" />
                  <span>01204437575</span>
                </a>
              </li>
              <li>
                <a
                  href="mailto:ezaary201@gmail.com"
                  className="hover:text-accent transition-colors flex items-center justify-center md:justify-end gap-3"
                >
                  <Mail className="w-5 h-5 flex-shrink-0" />
                  <span>ezaary201@gmail.com</span>
                </a>
              </li>
              <li>
                <div className="flex items-center justify-center md:justify-end gap-3">
                  <MapPin className="w-5 h-5 flex-shrink-0" />
                  <span className="text-xs lg:text-sm">{t('footer.location')}</span>
                </div>
              </li>
            </ul>
          </div>

          {/* Column 4: Social & Newsletter (تابعنا) */}
          <div className="text-center md:text-right">
            <h3 className="text-lg lg:text-xl font-bold mb-6 text-white">{t('footer.followTitle')}</h3>
            
            {/* Social Media Icons */}
            <div className="flex justify-center md:justify-end gap-4 mb-8">
              <a
                href="https://www.facebook.com/profile.php?id=61585790939558"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5 text-background" />
              </a>
              <a
                href="https://wa.me/201204437575"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5 text-background" />
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-4">
              <p className="text-xs lg:text-sm opacity-80">{t('footer.newsletter')}</p>
              <div className="flex flex-col gap-3">
                <input
                  type="email"
                  placeholder={t('footer.emailPlaceholder')}
                  className="w-full px-4 py-3 rounded-lg bg-background/10 text-background placeholder-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="w-full px-4 py-3 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  {t('footer.subscribe')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-background/20 px-4 lg:px-8 py-6 text-center text-xs opacity-75">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
