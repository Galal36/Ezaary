from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import format_html
from django.urls import reverse
from .models import (
    Category, Brand, Product, ProductImage, Order, OrderItem,
    OrderStatusHistory, Review, AdminUser, Banner, ShippingZone,
    DiscountCode, SiteSetting, Coupon, PaymentNumber
)
from .forms import ProductAdminForm


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'slug', 'parent', 'display_order', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name_ar', 'name_en', 'slug']
    prepopulated_fields = {'slug': ('name_ar',)}
    ordering = ['display_order', 'name_ar']


@admin.register(Brand)
class BrandAdmin(admin.ModelAdmin):
    list_display = ['name_ar', 'name_en', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name_ar', 'name_en']


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    form = ProductAdminForm
    list_display = ['name_ar', 'sku', 'category', 'brand', 'price', 'discount_percentage', 
                    'stock_quantity', 'is_in_stock', 'is_featured', 'is_active', 'created_at']
    list_filter = ['is_active', 'is_in_stock', 'is_featured', 'is_new', 'is_on_sale', 
                   'category', 'brand', 'created_at']
    search_fields = ['name_ar', 'name_en', 'sku', 'description_ar']
    prepopulated_fields = {'slug': ('name_ar',)}
    inlines = [ProductImageInline]
    ordering = ['-created_at']
    
    def formfield_for_dbfield(self, db_field, request, **kwargs):
        """Override form field generation to use custom color field"""
        if db_field.name == 'available_colors':
            # Return None to let the form class handle it
            return None
        return super().formfield_for_dbfield(db_field, request, **kwargs)


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ['product', 'image_url', 'is_primary', 'display_order', 'created_at']
    list_filter = ['is_primary', 'created_at']
    search_fields = ['product__name_ar', 'alt_text_ar']


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ['product', 'product_name_ar', 'product_sku', 'selected_size', 
                       'selected_color', 'quantity', 'unit_price', 'final_unit_price', 'subtotal']


class OrderStatusHistoryInline(admin.TabularInline):
    model = OrderStatusHistory
    extra = 0
    readonly_fields = ['old_status', 'new_status', 'changed_by', 'notes', 'created_at']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['order_number', 'customer_name', 'customer_phone', 'governorate', 
                    'payment_method', 'status', 'total', 'created_at']
    list_filter = ['status', 'payment_method', 'governorate', 'created_at']
    search_fields = ['order_number', 'customer_name', 'customer_phone', 'customer_email']
    readonly_fields = ['order_number', 'created_at', 'updated_at', 'confirmed_at', 
                       'shipped_at', 'delivered_at', 'cancelled_at', 'payment_screenshot_preview']
    inlines = [OrderItemInline, OrderStatusHistoryInline]
    ordering = ['-created_at']
    
    fieldsets = (
        ('معلومات الطلب', {
            'fields': ('order_number', 'status', 'created_at', 'updated_at')
        }),
        ('معلومات العميل', {
            'fields': ('customer_name', 'customer_phone', 'customer_email', 'customer_notes')
        }),
        ('عنوان التوصيل', {
            'fields': ('governorate', 'district', 'village', 'detailed_address')
        }),
        ('الملخص المالي', {
            'fields': ('subtotal', 'discount_amount', 'shipping_cost', 'total', 
                      'payment_method', 'payment_screenshot_preview'),
            'description': 'تفاصيل المبالغ وطريقة الدفع'
        }),
        ('ملاحظات الإدارة', {
            'fields': ('admin_notes',),
            'classes': ('collapse',)
        }),
        ('تواريخ الحالة', {
            'fields': ('confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at'),
            'classes': ('collapse',)
        }),
    )
    
    def payment_screenshot_preview(self, obj):
        """Display payment screenshot with preview"""
        if obj.payment_screenshot:
            return format_html(
                '<div style="margin: 10px 0;">'
                '<p style="margin-bottom: 8px;"><strong>صورة إثبات الدفع:</strong></p>'
                '<a href="{}" target="_blank">'
                '<img src="{}" style="max-width: 400px; max-height: 400px; border: 2px solid #ddd; border-radius: 8px; display: block; margin-bottom: 8px;" />'
                '</a>'
                '<a href="{}" target="_blank" style="display: inline-block; padding: 8px 16px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 4px; margin-top: 8px;">'
                '📥 تحميل الصورة كاملة'
                '</a>'
                '</div>',
                obj.payment_screenshot.url,
                obj.payment_screenshot.url,
                obj.payment_screenshot.url
            )
        return format_html('<span style="color: #999;">لا توجد صورة (دفع عند الاستلام)</span>')
    
    payment_screenshot_preview.short_description = 'صورة إثبات الدفع'


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ['product', 'reviewer_name', 'rating', 'is_approved', 
                    'is_verified_purchase', 'created_at']
    list_filter = ['is_approved', 'is_verified_purchase', 'rating', 'created_at']
    search_fields = ['product__name_ar', 'reviewer_name', 'title_ar', 'comment_ar']
    ordering = ['-created_at']
    actions = ['approve_reviews']
    
    def approve_reviews(self, request, queryset):
        queryset.update(is_approved=True)
    approve_reviews.short_description = "الموافقة على التقييمات المحددة"


@admin.register(AdminUser)
class AdminUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'full_name_ar', 'role', 'is_active', 'created_at']
    list_filter = ['role', 'is_active', 'created_at']
    search_fields = ['username', 'email', 'full_name_ar']
    ordering = ['-created_at']
    
    fieldsets = UserAdmin.fieldsets + (
        ('معلومات إضافية', {'fields': ('full_name_ar', 'phone', 'role')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('معلومات إضافية', {'fields': ('full_name_ar', 'phone', 'role', 'email')}),
    )


@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ['title_ar', 'display_order', 'is_active', 'start_date', 'end_date', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['title_ar', 'description_ar']
    ordering = ['display_order']


@admin.register(ShippingZone)
class ShippingZoneAdmin(admin.ModelAdmin):
    list_display = ['governorate', 'shipping_cost', 'estimated_days', 'is_active', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['governorate']
    ordering = ['governorate']


@admin.register(DiscountCode)
class DiscountCodeAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_type', 'discount_value', 'usage_count', 
                    'usage_limit', 'is_active', 'valid_from', 'valid_until']
    list_filter = ['discount_type', 'is_active', 'created_at']
    search_fields = ['code', 'description_ar']
    ordering = ['-created_at']


@admin.register(SiteSetting)
class SiteSettingAdmin(admin.ModelAdmin):
    list_display = ['key', 'value', 'description', 'updated_at']
    search_fields = ['key', 'value', 'description']
    ordering = ['key']


@admin.register(Coupon)
class CouponAdmin(admin.ModelAdmin):
    list_display = ['code', 'discount_percentage', 'get_products', 'is_active', 
                    'valid_from', 'valid_to', 'used_count', 'max_uses', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['code', 'products__name_ar']
    filter_horizontal = ['products']  # Better UI for ManyToMany
    ordering = ['-created_at']
    
    def get_products(self, obj):
        """Display products associated with this coupon"""
        products = obj.products.all()
        if products.exists():
            names = [p.name_ar for p in products[:3]]  # Show first 3
            result = ', '.join(names)
            if products.count() > 3:
                result += f' (+{products.count() - 3} أكثر)'
            return result
        return "جميع المنتجات"
    get_products.short_description = "المنتجات"


@admin.register(PaymentNumber)
class PaymentNumberAdmin(admin.ModelAdmin):
    list_display = ['payment_type', 'phone_number', 'account_name', 'is_active', 'display_order', 'created_at']
    list_filter = ['payment_type', 'is_active', 'created_at']
    search_fields = ['phone_number', 'account_name']
    ordering = ['payment_type', 'display_order']
    
    fieldsets = (
        ('معلومات الدفع', {
            'fields': ('payment_type', 'phone_number', 'account_name')
        }),
        ('الإعدادات', {
            'fields': ('is_active', 'display_order')
        }),
    )
