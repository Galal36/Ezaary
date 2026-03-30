import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, X, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAnnouncement } from "@/contexts/AnnouncementContext";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [customerMenuOpen, setCustomerMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const { isAuthenticated, customer, logout } = useCustomerAuth();
  const cartCount = getTotalItems();
  const { getTotalItems: getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();
  const { settings, isBarVisible } = useAnnouncement();
  const { t } = useLanguage();

  const navLinks = [
    { label: t('nav.home'), href: "/" },
    { label: t('nav.categories'), href: "/categories" },
    { label: t('footer.aboutUs'), href: "/about" },
    { label: t('footer.privacyPolicy'), href: "/privacy-policy" },
    { label: t('footer.shippingPolicy'), href: "/shipping-policy" },
  ];

  return (
    <header 
      className={`sticky z-40 w-full border-b border-border bg-card shadow-sm ${isBarVisible ? 'top-10 md:top-12' : 'top-0'}`}
    >
      <div className="w-full">
        {/* Main Header */}
        <div className="px-4 lg:px-8 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo */}
            <Link
              to="/"
              className="flex-shrink-0 text-2xl lg:text-3xl font-tajawal font-bold text-primary"
            >
              إزاري
            </Link>

            {/* Right Side Icons */}
            <div className="flex items-center gap-2 lg:gap-4">
              {/* Cart Icon */}
              <Link
                to="/cart"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ShoppingCart className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                {cartCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {cartCount}
                  </span>
                )}
              </Link>

              {/* Wishlist Icon */}
              <Link
                to="/wishlist"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors hidden sm:block"
              >
                <Heart className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                {wishlistCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-accent text-accent-foreground text-xs rounded-full flex items-center justify-center font-bold">
                    {wishlistCount}
                  </span>
                )}
              </Link>

              {/* Account - Login or Customer dropdown */}
              {isAuthenticated && customer ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setCustomerMenuOpen(!customerMenuOpen)}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-secondary transition-colors"
                  >
                    <User className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                    <span className="max-w-[80px] truncate font-medium">
                      {customer.first_name}
                    </span>
                  </button>
                  {customerMenuOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setCustomerMenuOpen(false)}
                      />
                      <div className="absolute right-0 top-full mt-1 py-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm hover:bg-secondary transition-colors"
                          onClick={() => setCustomerMenuOpen(false)}
                        >
                          حسابي
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setCustomerMenuOpen(false);
                          }}
                          className="w-full text-right px-4 py-2 text-sm hover:bg-secondary transition-colors flex items-center gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          تسجيل الخروج
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center gap-1 p-2 rounded-lg hover:bg-secondary transition-colors hidden sm:flex"
                >
                  <User className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
                  <span className="text-sm font-medium">تسجيل الدخول</span>
                </Link>
              )}

              {/* Mobile Menu Toggle */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {isMenuOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t border-border bg-background">
          <div className="px-8 flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="py-3 px-2 text-sm font-medium text-foreground hover:text-primary transition-colors relative group break-normal"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="lg:hidden border-t border-border bg-background">
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="block py-2 px-4 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors break-normal"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {isAuthenticated ? (
                <>
                  <Link
                    to="/profile"
                    className="block py-2 px-4 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    حسابي
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className="block w-full text-right py-2 px-4 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    تسجيل الخروج
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="block py-2 px-4 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  تسجيل الدخول
                </Link>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
