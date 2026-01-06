"""
Search analytics and management models
"""
from django.db import models
from django.utils import timezone
import uuid


class SearchKeyword(models.Model):
    """Keywords and synonyms for search enhancement"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    keyword = models.CharField(max_length=200, db_index=True, verbose_name="الكلمة المفتاحية")
    synonyms = models.JSONField(default=list, blank=True, verbose_name="المرادفات")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "كلمة مفتاحية"
        verbose_name_plural = "كلمات مفتاحية"
        ordering = ['-created_at']
    
    def __str__(self):
        return self.keyword


class SearchAnalytics(models.Model):
    """Track search queries and results"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=500, db_index=True, verbose_name="الاستعلام")
    normalized_query = models.CharField(max_length=500, db_index=True, verbose_name="الاستعلام الم normalized")
    result_count = models.PositiveIntegerField(default=0, verbose_name="عدد النتائج")
    has_results = models.BooleanField(default=True, verbose_name="يوجد نتائج")
    ip_address = models.GenericIPAddressField(null=True, blank=True, verbose_name="عنوان IP")
    user_agent = models.TextField(null=True, blank=True, verbose_name="User Agent")
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        verbose_name = "تحليل البحث"
        verbose_name_plural = "تحليلات البحث"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['normalized_query', '-created_at']),
            models.Index(fields=['has_results', '-created_at']),
        ]
    
    def __str__(self):
        return f"{self.query} ({self.result_count} results)"


class ZeroResultSearch(models.Model):
    """Track searches with zero results for improvement"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    query = models.CharField(max_length=500, db_index=True, verbose_name="الاستعلام")
    normalized_query = models.CharField(max_length=500, db_index=True, verbose_name="الاستعلام الم normalized")
    count = models.PositiveIntegerField(default=1, verbose_name="عدد المرات")
    last_searched = models.DateTimeField(auto_now=True, verbose_name="آخر بحث")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    
    class Meta:
        verbose_name = "بحث بدون نتائج"
        verbose_name_plural = "بحوث بدون نتائج"
        ordering = ['-count', '-last_searched']
        unique_together = ['normalized_query']
    
    def __str__(self):
        return f"{self.query} ({self.count} times)"

