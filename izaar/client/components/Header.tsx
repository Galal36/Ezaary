import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Heart, User, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { useAnnouncement } from "@/contexts/AnnouncementContext";
import SearchBar from "@/components/SearchBar";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { getTotalItems } = useCart();
  const cartCount = getTotalItems();
  const { getTotalItems: getWishlistCount } = useWishlist();
  const wishlistCount = getWishlistCount();
  const { settings } = useAnnouncement();
  
  // Calculate top position based on announcement bar
  // Announcement bar is h-10 (2.5rem/40px) on mobile and h-12 (3rem/48px) on desktop
  // We use responsive positioning to match
  const announcementBarHeight = settings.enabled ? "2.5rem" : "0"; // md:3rem handled via CSS

  const navLinks = [
    { label: "الرئيسية", href: "/" },
    { label: "الفئات", href: "/categories" },
    { label: "من نحن", href: "/about" },
    { label: "الخصوصية", href: "/privacy-policy" },
    { label: "سياسات التوصيل والاسترداد", href: "/shipping-policy" },
  ];

  return (
    <header 
      className={`sticky z-40 w-full border-b border-border bg-card shadow-sm ${settings.enabled ? 'top-10 md:top-12' : 'top-0'}`}
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

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-4">
              <SearchBar />
            </div>

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

              {/* Account Icon */}
              <Link
                to="/account"
                className="p-2 rounded-lg hover:bg-secondary transition-colors hidden sm:block"
              >
                <User className="w-5 h-5 lg:w-6 lg:h-6 text-foreground" />
              </Link>

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

          {/* Search Bar - Mobile */}
          <div className="md:hidden mt-4">
            <SearchBar />
          </div>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:block border-t border-border bg-background">
          <div className="px-8 flex items-center justify-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="py-3 px-2 text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
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
                  className="block py-2 px-4 text-sm font-medium text-foreground hover:bg-secondary rounded-lg transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
