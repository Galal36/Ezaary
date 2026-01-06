import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Users,
  Menu,
  X,
  Bell,
  LogOut,
  ChevronDown,
  Home,
  Search,
  ArrowUpDown,
} from "lucide-react";
import { useAdminAuth } from "@/contexts/AdminAuthContext";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAdminAuth();

  const navItems = [
    {
      label: "نظرة عامة",
      icon: LayoutDashboard,
      href: "/admin",
      end: true,
    },
    {
      label: "الطلبات",
      icon: ShoppingCart,
      href: "/admin/orders",
    },
    {
      label: "المنتجات",
      icon: Package,
      href: "/admin/products",
    },
    {
      label: "ترتيب المنتجات",
      icon: ArrowUpDown,
      href: "/admin/products/order",
    },
    {
      label: "الفئات",
      icon: Package,
      href: "/admin/categories",
    },
    {
      label: "العملاء",
      icon: Users,
      href: "/admin/customers",
    },
    {
      label: "التقارير",
      icon: BarChart3,
      href: "/admin/reports",
    },
    {
      label: "إدارة البحث",
      icon: Search,
      href: "/admin/search",
    },
    {
      label: "الإعدادات",
      icon: Settings,
      href: "/admin/settings",
    },
  ];

  const isActive = (href: string, end: boolean = false) => {
    if (end) {
      return location.pathname === href;
    }
    return location.pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 md:px-8 py-4">
          {/* Left Side - Logo and Menu Toggle */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg md:hidden"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-primary">
                إزاري
              </h1>
              <p className="text-xs text-muted-foreground">لوحة التحكم</p>
            </div>
          </div>

          {/* Right Side - Notifications and Profile */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Back to Store Button */}
            <Link
              to="/"
              className="hidden md:flex items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>العودة للمتجر</span>
            </Link>

            {/* Notifications */}
            <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                  A
                </div>
                <span className="hidden md:block text-sm font-medium">
                  المسؤول
                </span>
                <ChevronDown className="w-4 h-4 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="p-3 border-b border-gray-100">
                    <p className="text-sm font-medium">{admin?.email}</p>
                    <p className="text-xs text-muted-foreground">مسؤول</p>
                  </div>
                  <button
                    onClick={() => navigate("/admin/settings")}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 transition-colors"
                  >
                    الإعدادات
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-right px-4 py-2 text-sm hover:bg-gray-50 transition-colors text-red-600 border-t border-gray-100 flex items-center gap-2 justify-end"
                  >
                    <LogOut className="w-4 h-4" />
                    تسجيل الخروج
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            sidebarOpen ? "w-64" : "w-0"
          } bg-white border-l border-gray-200 fixed md:relative h-[calc(100vh-73px)] overflow-y-auto transition-all duration-300 z-30`}
        >
          <nav className="p-4 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href, item.end);

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors relative ${
                    active
                      ? "bg-blue-50 text-primary font-medium"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {active && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary rounded-r-lg"></div>
                  )}
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto">
          <div className="p-6 md:p-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* Sidebar Overlay on Mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </div>
  );
}
