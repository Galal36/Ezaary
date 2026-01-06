import { useState } from "react";
import { Save, Plus, Trash2 } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload } from "lucide-react";
import { useAnnouncement } from "@/contexts/AnnouncementContext";
import { toast } from "sonner";

// Helper functions for color conversion
function hslFromHex(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`;
}

function hexFromHsl(hsl: string): string {
  // Handle CSS variables like hsl(var(--primary))
  if (hsl.includes("var(")) {
    return "#1e3a5f"; // Default primary color
  }
  
  const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
  if (!match) return "#ffffff";
  
  const h = parseInt(match[1]) / 360;
  const s = parseInt(match[2]) / 100;
  const l = parseInt(match[3]) / 100;
  
  let r, g, b;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export default function AdminSettings() {
  const { settings, updateSettings, addAnnouncement, updateAnnouncement, deleteAnnouncement, saveSettings } = useAnnouncement();
  const [storeName, setStoreName] = useState("إزاري");
  const [storeDescription, setStoreDescription] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [facebook, setFacebook] = useState("");
  const [address, setAddress] = useState("");
  const [defaultShipping, setDefaultShipping] = useState(25);
  const [freeShippingAbove, setFreeShippingAbove] = useState(500);
  const [deliveryTime, setDeliveryTime] = useState("3-5 أيام");
  const [whatsappNotifications, setWhatsappNotifications] = useState(true);
  const [orderConfirmationTemplate, setOrderConfirmationTemplate] = useState(
    "شكراً لك على طلبك #{order_number}"
  );
  const [statusUpdateTemplate, setStatusUpdateTemplate] = useState(
    "تم تحديث حالة طلبك #{order_number} إلى {status}"
  );

  const handleSave = () => {
    // TODO: Save settings
    console.log("Saving settings...");
    alert("تم حفظ الإعدادات بنجاح");
  };

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">الإعدادات</h1>
          <p className="text-muted-foreground">إدارة إعدادات المتجر</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 ml-2" />
          حفظ التغييرات
        </Button>
      </div>

      <Tabs defaultValue="store" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="store">إعدادات المتجر</TabsTrigger>
          <TabsTrigger value="announcements">الإعلانات</TabsTrigger>
          <TabsTrigger value="shipping">الشحن</TabsTrigger>
          <TabsTrigger value="payment">الدفع</TabsTrigger>
          <TabsTrigger value="notifications">الإشعارات</TabsTrigger>
          <TabsTrigger value="account">الحساب</TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              إعدادات المتجر
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="storeName">اسم المتجر</Label>
                <Input
                  id="storeName"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="logo">الشعار</Label>
                <div className="mt-2 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">
                    اضغط لرفع شعار المتجر
                  </p>
                  <Input
                    id="logo"
                    type="file"
                    accept="image/*"
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("logo")?.click()}
                  >
                    اختر الصورة
                  </Button>
                </div>
              </div>
              <div>
                <Label htmlFor="description">وصف المتجر</Label>
                <Textarea
                  id="description"
                  value={storeDescription}
                  onChange={(e) => setStoreDescription(e.target.value)}
                  className="mt-2"
                  rows={4}
                  placeholder="وصف المتجر..."
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              معلومات الاتصال
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="whatsapp">واتساب</Label>
                <Input
                  id="whatsapp"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  className="mt-2"
                  placeholder="201234567890"
                />
              </div>
              <div>
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-2"
                  placeholder="info@example.com"
                />
              </div>
              <div>
                <Label htmlFor="facebook">فيسبوك</Label>
                <Input
                  id="facebook"
                  value={facebook}
                  onChange={(e) => setFacebook(e.target.value)}
                  className="mt-2"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <Label htmlFor="address">العنوان</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="mt-2"
                  rows={2}
                  placeholder="العنوان الكامل..."
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Announcements Settings */}
        <TabsContent value="announcements" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              إعدادات شريط الإعلانات
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="announcementsEnabled">تفعيل شريط الإعلانات</Label>
                  <p className="text-sm text-muted-foreground">
                    إظهار شريط الإعلانات في أعلى الموقع
                  </p>
                </div>
                <Switch
                  id="announcementsEnabled"
                  checked={settings.enabled}
                  onCheckedChange={(checked) => updateSettings({ enabled: checked })}
                />
              </div>
              <div>
                <Label htmlFor="announcementSpeed">سرعة الحركة (بكسل/ثانية)</Label>
                <Input
                  id="announcementSpeed"
                  type="number"
                  min="10"
                  max="200"
                  value={settings.speed}
                  onChange={(e) => updateSettings({ speed: Number(e.target.value) })}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  القيمة الافتراضية: 50 (أبطأ: 10، أسرع: 200)
                </p>
              </div>
              <div>
                <Label htmlFor="announcementBgColor">لون الخلفية</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="announcementBgColor"
                    type="color"
                    value={hexFromHsl(settings.backgroundColor)}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const hsl = hslFromHex(hex);
                      updateSettings({ backgroundColor: hsl });
                    }}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="flex-1"
                    placeholder="hsl(var(--primary))"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="announcementTextColor">لون النص</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="announcementTextColor"
                    type="color"
                    value={hexFromHsl(settings.textColor)}
                    onChange={(e) => {
                      const hex = e.target.value;
                      const hsl = hslFromHex(hex);
                      updateSettings({ textColor: hsl });
                    }}
                    className="w-20 h-10"
                  />
                  <Input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => updateSettings({ textColor: e.target.value })}
                    className="flex-1"
                    placeholder="hsl(var(--primary-foreground))"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">رسائل الإعلانات</h2>
              <Button
                onClick={() => {
                  addAnnouncement({
                    text: "رسالة جديدة",
                    enabled: true,
                  });
                  toast.success("تم إضافة رسالة جديدة");
                }}
                size="sm"
              >
                <Plus className="w-4 h-4 ml-2" />
                إضافة رسالة
              </Button>
            </div>
            <div className="space-y-4">
              {settings.announcements.map((announcement, index) => (
                <div key={announcement.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>رسالة #{index + 1}</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={announcement.enabled}
                        onCheckedChange={(checked) =>
                          updateAnnouncement(announcement.id, { enabled: checked })
                        }
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          deleteAnnouncement(announcement.id);
                          toast.success("تم حذف الرسالة");
                        }}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <Input
                    value={announcement.text}
                    onChange={(e) =>
                      updateAnnouncement(announcement.id, { text: e.target.value })
                    }
                    placeholder="أدخل نص الرسالة..."
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">تاريخ البدء (اختياري)</Label>
                      <Input
                        type="datetime-local"
                        value={announcement.startDate ? new Date(announcement.startDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) =>
                          updateAnnouncement(announcement.id, {
                            startDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">تاريخ الانتهاء (اختياري)</Label>
                      <Input
                        type="datetime-local"
                        value={announcement.endDate ? new Date(announcement.endDate).toISOString().slice(0, 16) : ""}
                        onChange={(e) =>
                          updateAnnouncement(announcement.id, {
                            endDate: e.target.value ? new Date(e.target.value).toISOString() : undefined,
                          })
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {settings.announcements.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  لا توجد رسائل. اضغط "إضافة رسالة" لبدء الإضافة.
                </p>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Shipping Settings */}
        <TabsContent value="shipping" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              إعدادات الشحن
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="defaultShipping">
                  تكلفة الشحن الافتراضية (جنيه)
                </Label>
                <Input
                  id="defaultShipping"
                  type="number"
                  value={defaultShipping}
                  onChange={(e) =>
                    setDefaultShipping(Number(e.target.value))
                  }
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="freeShippingAbove">
                  الشحن المجاني فوق (جنيه)
                </Label>
                <Input
                  id="freeShippingAbove"
                  type="number"
                  value={freeShippingAbove}
                  onChange={(e) =>
                    setFreeShippingAbove(Number(e.target.value))
                  }
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم تطبيق الشحن المجاني على الطلبات التي تتجاوز هذا المبلغ
                </p>
              </div>
              <div>
                <Label htmlFor="deliveryTime">مدة التوصيل المتوقعة</Label>
                <Input
                  id="deliveryTime"
                  value={deliveryTime}
                  onChange={(e) => setDeliveryTime(e.target.value)}
                  className="mt-2"
                  placeholder="3-5 أيام"
                />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              طرق الدفع المتاحة
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="cod">الدفع عند الاستلام</Label>
                  <p className="text-sm text-muted-foreground">
                    السماح للعملاء بالدفع عند استلام الطلب
                  </p>
                </div>
                <Switch id="cod" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="online">الدفع الإلكتروني</Label>
                  <p className="text-sm text-muted-foreground">
                    الدفع عبر البطاقات أو المحافظ الإلكترونية (قريباً)
                  </p>
                </div>
                <Switch id="online" disabled />
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              إشعارات الواتساب
            </h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="whatsappNotifications">
                    تفعيل الإشعارات
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    إرسال إشعارات تلقائية للعملاء عبر واتساب
                  </p>
                </div>
                <Switch
                  id="whatsappNotifications"
                  checked={whatsappNotifications}
                  onCheckedChange={setWhatsappNotifications}
                />
              </div>
              <div>
                <Label htmlFor="orderConfirmation">
                  رسالة تأكيد الطلب
                </Label>
                <Textarea
                  id="orderConfirmation"
                  value={orderConfirmationTemplate}
                  onChange={(e) => setOrderConfirmationTemplate(e.target.value)}
                  className="mt-2"
                  rows={3}
                  placeholder="شكراً لك على طلبك..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  استخدم {"{order_number}"} لرقم الطلب
                </p>
              </div>
              <div>
                <Label htmlFor="statusUpdate">رسالة تحديث الحالة</Label>
                <Textarea
                  id="statusUpdate"
                  value={statusUpdateTemplate}
                  onChange={(e) => setStatusUpdateTemplate(e.target.value)}
                  className="mt-2"
                  rows={3}
                  placeholder="تم تحديث حالة طلبك..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  استخدم {"{order_number}"} لرقم الطلب و {"{status}"} للحالة
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Account Settings */}
        <TabsContent value="account" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">
              إعدادات الحساب
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">كلمة المرور الحالية</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  className="mt-2"
                  placeholder="أدخل كلمة المرور الحالية"
                />
              </div>
              <div>
                <Label htmlFor="newPassword">كلمة المرور الجديدة</Label>
                <Input
                  id="newPassword"
                  type="password"
                  className="mt-2"
                  placeholder="أدخل كلمة المرور الجديدة"
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">تأكيد كلمة المرور</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  className="mt-2"
                  placeholder="أعد إدخال كلمة المرور الجديدة"
                />
              </div>
              <Button>تغيير كلمة المرور</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}




