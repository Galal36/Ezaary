import { Link } from "react-router-dom";
import { Facebook, Instagram, MessageCircle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-foreground text-background mt-16 md:mt-24">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: About */}
          <div className="text-center lg:text-right">
            <h3 className="text-xl lg:text-2xl font-bold mb-4 text-accent">إزاري</h3>
            <p className="text-sm lg:text-base opacity-90 leading-relaxed">
              متجرك الأول لشراء الملابس الرجالية بجودة عالية وأسعار منافسة. نقدم أحدث التصاميم والماركات العالمية.
            </p>
          </div>

          {/* Column 2: Quick Links */}
          <div className="text-center lg:text-right">
            <h3 className="text-lg font-bold mb-4">روابط سريعة</h3>
            <ul className="space-y-2 text-sm opacity-90">
              <li>
                <Link to="/" className="hover:text-accent transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link to="/categories" className="hover:text-accent transition-colors">
                  الفئات
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-accent transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link to="/shipping-policy" className="hover:text-accent transition-colors">
                  سياسة الشحن والاسترجاع
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy" className="hover:text-accent transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="text-center lg:text-right">
            <h3 className="text-lg font-bold mb-4">تواصل معنا</h3>
            <ul className="space-y-3 text-sm opacity-90">
              <li>
                <a
                  href="https://wa.me/201204437575?text=مرحباً، أرغب في الاستفسار عن..."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors flex items-center justify-center lg:justify-end gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  01204437575
                </a>
              </li>
              <li>
                <a
                  href="https://www.facebook.com/profile.php?id=61585790939558"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent transition-colors flex items-center justify-center lg:justify-end gap-2"
                >
                  <Facebook className="w-4 h-4" />
                  إزاري
                </a>
              </li>
              <li>
                <a
                  href="mailto:help@ezaary.com"
                  className="hover:text-accent transition-colors"
                >
                  help@ezaary.com
                </a>
              </li>
              <li className="text-xs">أسيوط، مصر</li>
            </ul>
          </div>

          {/* Column 4: Follow Us */}
          <div className="text-center lg:text-right">
            <h3 className="text-lg font-bold mb-4">تابعنا</h3>
            <div className="flex justify-center lg:justify-end gap-4 mb-6">
              <a
                href="https://www.facebook.com/profile.php?id=61585790939558"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Facebook className="w-5 h-5 text-background" />
              </a>
              <a
                href="https://wa.me/201204437575"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <MessageCircle className="w-5 h-5 text-background" />
              </a>
              <a
                href="#"
                className="w-10 h-10 bg-accent rounded-full flex items-center justify-center hover:opacity-90 transition-opacity"
              >
                <Instagram className="w-5 h-5 text-background" />
              </a>
            </div>

            {/* Newsletter Signup */}
            <div className="space-y-3">
              <p className="text-xs opacity-80">اشترك في نشرتنا البريدية</p>
              <div className="flex gap-2 flex-col sm:flex-row">
                <input
                  type="email"
                  placeholder="بريدك الإلكتروني"
                  className="flex-1 px-3 py-2 rounded-lg bg-background/10 text-background placeholder-background/60 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="px-4 py-2 bg-accent text-background rounded-lg hover:opacity-90 transition-opacity text-sm font-medium">
                  اشترك
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-background/20 px-4 lg:px-8 py-6 text-center text-xs opacity-75">
        <p>© 2024 إزاري. جميع الحقوق محفوظة</p>
      </div>
    </footer>
  );
}
