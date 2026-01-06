import { useState, useEffect } from "react";
import { Save, Plus, Trash2, TrendingUp, Search as SearchIcon } from "lucide-react";
import AdminLayout from "@/layouts/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

interface SearchKeyword {
  id: string;
  keyword: string;
  synonyms: string[];
  is_active: boolean;
}

interface SearchAnalytics {
  query: string;
  normalized_query: string;
  result_count: number;
  has_results: boolean;
  created_at: string;
}

interface ZeroResultSearch {
  id: string;
  query: string;
  normalized_query: string;
  count: number;
  last_searched: string;
}

export default function SearchManagement() {
  const [keywords, setKeywords] = useState<SearchKeyword[]>([]);
  const [popularSearches, setPopularSearches] = useState<any[]>([]);
  const [zeroResults, setZeroResults] = useState<ZeroResultSearch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [newKeyword, setNewKeyword] = useState("");
  const [newSynonyms, setNewSynonyms] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load keywords
      const keywordsRes = await fetch("http://localhost:8000/api/search-keywords/", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
      });
      const keywordsData = await keywordsRes.json();
      setKeywords(keywordsData.results || keywordsData || []);

      // Load popular searches
      const popularRes = await fetch("http://localhost:8000/api/search-analytics/popular/?days=30", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
      });
      const popularData = await popularRes.json();
      setPopularSearches(popularData || []);

      // Load zero results
      const zeroRes = await fetch("http://localhost:8000/api/search-analytics/zero_results/", {
        headers: {
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
      });
      const zeroData = await zeroRes.json();
      setZeroResults(zeroData || []);
    } catch (error) {
      console.error("Failed to load search data:", error);
      toast.error("فشل تحميل البيانات");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      toast.error("أدخل الكلمة المفتاحية");
      return;
    }

    try {
      const synonymsArray = newSynonyms
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s);

      const response = await fetch("http://localhost:8000/api/search-keywords/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          keyword: newKeyword.trim(),
          synonyms: synonymsArray,
          is_active: true,
        }),
      });

      if (response.ok) {
        toast.success("تم إضافة الكلمة المفتاحية");
        setNewKeyword("");
        setNewSynonyms("");
        loadData();
      } else {
        toast.error("فشل إضافة الكلمة المفتاحية");
      }
    } catch (error) {
      console.error("Error adding keyword:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleDeleteKeyword = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذه الكلمة المفتاحية؟")) return;

    try {
      const response = await fetch(`http://localhost:8000/api/search-keywords/${id}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        toast.success("تم الحذف");
        loadData();
      } else {
        toast.error("فشل الحذف");
      }
    } catch (error) {
      console.error("Error deleting keyword:", error);
      toast.error("حدث خطأ");
    }
  };

  const handleToggleKeyword = async (keyword: SearchKeyword) => {
    try {
      const response = await fetch(`http://localhost:8000/api/search-keywords/${keyword.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Token ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify({
          is_active: !keyword.is_active,
        }),
      });

      if (response.ok) {
        toast.success("تم التحديث");
        loadData();
      } else {
        toast.error("فشل التحديث");
      }
    } catch (error) {
      console.error("Error updating keyword:", error);
      toast.error("حدث خطأ");
    }
  };

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">إدارة البحث</h1>
        <p className="text-muted-foreground">إدارة الكلمات المفتاحية والمرادفات وتحليلات البحث</p>
      </div>

      <Tabs defaultValue="keywords" className="space-y-6">
        <TabsList>
          <TabsTrigger value="keywords">الكلمات المفتاحية</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="zero-results">بحوث بدون نتائج</TabsTrigger>
        </TabsList>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">إضافة كلمة مفتاحية جديدة</h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="keyword">الكلمة المفتاحية</Label>
                <Input
                  id="keyword"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  placeholder="مثال: هودي"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="synonyms">المرادفات (مفصولة بفواصل)</Label>
                <Input
                  id="synonyms"
                  value={newSynonyms}
                  onChange={(e) => setNewSynonyms(e.target.value)}
                  placeholder="مثال: سويت شيرت، جاكيت خفيف"
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  سيتم ربط هذه المرادفات بالكلمة المفتاحية في البحث
                </p>
              </div>
              <Button onClick={handleAddKeyword}>
                <Plus className="w-4 h-4 ml-2" />
                إضافة
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">الكلمات المفتاحية الحالية</h2>
            {isLoading ? (
              <div className="text-center py-10">جاري التحميل...</div>
            ) : keywords.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">لا توجد كلمات مفتاحية</p>
            ) : (
              <div className="space-y-4">
                {keywords.map((keyword) => (
                  <div
                    key={keyword.id}
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-foreground">{keyword.keyword}</span>
                        <Switch
                          checked={keyword.is_active}
                          onCheckedChange={() => handleToggleKeyword(keyword)}
                        />
                        <span className="text-xs text-muted-foreground">
                          {keyword.is_active ? "نشط" : "معطل"}
                        </span>
                      </div>
                      {keyword.synonyms && keyword.synonyms.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-muted-foreground mb-1">المرادفات:</p>
                          <div className="flex flex-wrap gap-2">
                            {keyword.synonyms.map((synonym, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-secondary rounded text-xs"
                              >
                                {synonym}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteKeyword(keyword.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              أكثر البحوث شعبية (آخر 30 يوم)
            </h2>
            {isLoading ? (
              <div className="text-center py-10">جاري التحميل...</div>
            ) : popularSearches.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">لا توجد بيانات</p>
            ) : (
              <div className="space-y-2">
                {popularSearches.map((search, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{search.query}</p>
                      <p className="text-xs text-muted-foreground">
                        {search.normalized_query}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">{search.count}</p>
                      <p className="text-xs text-muted-foreground">مرة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* Zero Results Tab */}
        <TabsContent value="zero-results" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <SearchIcon className="w-5 h-5" />
              بحوث بدون نتائج
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              هذه البحوث لم تعط نتائج. يمكنك إضافة منتجات أو كلمات مفتاحية لتحسين النتائج.
            </p>
            {isLoading ? (
              <div className="text-center py-10">جاري التحميل...</div>
            ) : zeroResults.length === 0 ? (
              <p className="text-center text-muted-foreground py-10">
                ممتاز! لا توجد بحوث بدون نتائج
              </p>
            ) : (
              <div className="space-y-2">
                {zeroResults.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-foreground">{item.query}</p>
                      <p className="text-xs text-muted-foreground">
                        آخر بحث: {new Date(item.last_searched).toLocaleDateString("ar-EG")}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-destructive">{item.count}</p>
                      <p className="text-xs text-muted-foreground">مرة</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}

