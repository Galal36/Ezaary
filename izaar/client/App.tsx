import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AdminAuthProvider } from "@/contexts/AdminAuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { WishlistProvider } from "@/contexts/WishlistContext";
import { AnnouncementProvider, useAnnouncement } from "@/contexts/AnnouncementContext";
import AnnouncementBar from "@/components/AnnouncementBar";
import ProtectedRoute from "@/components/ProtectedRoute";
import ScrollToTop from "@/components/ScrollToTop";
import Home from "./pages/Home";
import Categories from "./pages/Categories";
import CategoryProducts from "./pages/CategoryProducts";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Account from "./pages/Account";
import About from "./pages/About";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminLogin from "./pages/admin/Login";
import AdminOrders from "./pages/admin/Orders";
import AdminProducts from "./pages/admin/Products";
import AdminCategories from "./pages/admin/Categories";
import AdminCustomers from "./pages/admin/Customers";
import AdminReports from "./pages/admin/Reports";
import AdminSettings from "./pages/admin/Settings";
import AdminSearchManagement from "./pages/admin/SearchManagement";
import AdminProductOrderManager from "./pages/admin/ProductOrderManager";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import SearchResults from "./pages/SearchResults";

const queryClient = new QueryClient();

const AppContent = () => {
  const { settings } = useAnnouncement();
  
  return (
    <>
      <ScrollToTop />
      <AnnouncementBar
        announcements={settings.announcements}
        speed={settings.speed}
        backgroundColor={settings.backgroundColor}
        textColor={settings.textColor}
        enabled={settings.enabled}
      />
      <div style={{ paddingTop: settings.enabled ? "2.5rem" : "0" }}>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/category/:categoryId" element={<CategoryProducts />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-confirmation" element={<OrderConfirmation />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/account" element={<Account />} />
            <Route path="/about" element={<About />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            {/* Admin Routes */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute>
                  <AdminOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products"
              element={
                <ProtectedRoute>
                  <AdminProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/categories"
              element={
                <ProtectedRoute>
                  <AdminCategories />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/customers"
              element={
                <ProtectedRoute>
                  <AdminCustomers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <ProtectedRoute>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/search"
              element={
                <ProtectedRoute>
                  <AdminSearchManagement />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/products/order"
              element={
                <ProtectedRoute>
                  <AdminProductOrderManager />
                </ProtectedRoute>
              }
            />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
    </>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AdminAuthProvider>
      <CartProvider>
        <WishlistProvider>
          <AnnouncementProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppContent />
              </BrowserRouter>
            </TooltipProvider>
          </AnnouncementProvider>
        </WishlistProvider>
      </CartProvider>
    </AdminAuthProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
