import { useState } from "react";
import { useCustomerAuth } from "@/contexts/CustomerAuthContext";
import { customerAuth } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Lock, LogOut, AlertCircle, Package } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CustomerProtectedRoute from "@/components/CustomerProtectedRoute";
import MyOrdersTab from "@/components/profile/MyOrdersTab";

type TabType = "info" | "orders";

function ProfileContent() {
  const [activeTab, setActiveTab] = useState<TabType>("info");
  const { customer, updateProfile, logout } = useCustomerAuth();
  const [first_name, setFirst_name] = useState(customer?.first_name ?? "");
  const [last_name, setLast_name] = useState(customer?.last_name ?? "");
  const [phone, setPhone] = useState(customer?.phone ?? "");
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");
  const [profileLoading, setProfileLoading] = useState(false);

  const [old_password, setOld_password] = useState("");
  const [new_password, setNew_password] = useState("");
  const [new_password_confirm, setNew_password_confirm] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError("");
    setProfileSuccess("");
    setProfileLoading(true);
    try {
      await updateProfile({ first_name, last_name, phone: phone.trim() || undefined });
      setProfileSuccess("تم تحديث البيانات بنجاح.");
    } catch (err: any) {
      setProfileError(err?.message || "فشل التحديث.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");
    setPasswordLoading(true);
    try {
      await customerAuth.changePassword(old_password, new_password, new_password_confirm);
      setPasswordSuccess("تم تغيير كلمة المرور بنجاح.");
      setOld_password("");
      setNew_password("");
      setNew_password_confirm("");
    } catch (err: any) {
      setPasswordError(err?.message || "فشل تغيير كلمة المرور.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-background" dir="rtl">
      <Header />
      <main className="flex-1 py-12">
        <div className="max-w-2xl mx-auto px-4 space-y-8">
          <h1 className="text-2xl font-bold text-primary">حسابي</h1>

          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              onClick={() => setActiveTab("info")}
              className={`px-6 py-3 font-medium transition-colors relative ${
                activeTab === "info"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              معلوماتي
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-6 py-3 font-medium transition-colors relative flex items-center gap-2 ${
                activeTab === "orders"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Package className="w-4 h-4" />
              طلباتي
            </button>
          </div>

          {activeTab === "info" && (
            <>
          {/* Profile section */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">البيانات الشخصية</h2>
            <form onSubmit={handleProfileSubmit} className="space-y-4">
              {profileSuccess && (
                <Alert className="border-green-500/50 bg-green-500/5">
                  <AlertDescription>{profileSuccess}</AlertDescription>
                </Alert>
              )}
              {profileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{profileError}</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="profile_first_name">الاسم الأول</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="profile_first_name"
                      value={first_name}
                      onChange={(e) => setFirst_name(e.target.value)}
                      className="pr-10"
                      required
                      disabled={profileLoading}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="profile_last_name">الاسم الأخير</Label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="profile_last_name"
                      value={last_name}
                      onChange={(e) => setLast_name(e.target.value)}
                      className="pr-10"
                      required
                      disabled={profileLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>البريد الإلكتروني</Label>
                <Input value={customer?.email ?? ""} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_phone">رقم الهاتف</Label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="profile_phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pr-10"
                    disabled={profileLoading}
                  />
                </div>
              </div>

              <Button type="submit" disabled={profileLoading}>
                {profileLoading ? "جاري الحفظ..." : "حفظ التغييرات"}
              </Button>
            </form>
          </div>

          {/* Change password section */}
          <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
            <h2 className="text-lg font-semibold mb-4">تغيير كلمة المرور</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {passwordSuccess && (
                <Alert className="border-green-500/50 bg-green-500/5">
                  <AlertDescription>{passwordSuccess}</AlertDescription>
                </Alert>
              )}
              {passwordError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{passwordError}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="old_password">كلمة المرور الحالية</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="old_password"
                    type="password"
                    value={old_password}
                    onChange={(e) => setOld_password(e.target.value)}
                    className="pr-10"
                    required
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_new_password">كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="profile_new_password"
                    type="password"
                    value={new_password}
                    onChange={(e) => setNew_password(e.target.value)}
                    className="pr-10"
                    minLength={8}
                    required
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profile_new_password_confirm">تأكيد كلمة المرور الجديدة</Label>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="profile_new_password_confirm"
                    type="password"
                    value={new_password_confirm}
                    onChange={(e) => setNew_password_confirm(e.target.value)}
                    className="pr-10"
                    minLength={8}
                    required
                    disabled={passwordLoading}
                  />
                </div>
              </div>

              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "جاري التغيير..." : "تغيير كلمة المرور"}
              </Button>
            </form>
          </div>

          {/* Logout */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              تسجيل الخروج
            </Button>
          </div>
            </>
          )}

          {activeTab === "orders" && (
            <div className="bg-card rounded-lg shadow-lg p-6 border border-border">
              <h2 className="text-lg font-semibold mb-4">طلباتي</h2>
              <MyOrdersTab />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function ProfilePage() {
  return (
    <CustomerProtectedRoute>
      <ProfileContent />
    </CustomerProtectedRoute>
  );
}
