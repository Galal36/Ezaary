from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.postgres.fields import ArrayField
from django.utils.text import slugify
from django.utils import timezone
import uuid


class Category(models.Model):
    """Categories for products (فئات المنتجات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_ar = models.CharField(max_length=255, verbose_name="الاسم بالعربية")
    name_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="الاسم بالإنجليزية")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="الرابط الودي")
    description_ar = models.TextField(blank=True, null=True, verbose_name="الوصف بالعربية")
    image_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="رابط الصورة")
    parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True, blank=True, 
                               related_name='subcategories', verbose_name="الفئة الأب")
    display_order = models.IntegerField(default=0, verbose_name="ترتيب العرض")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "فئة"
        verbose_name_plural = "الفئات"
        ordering = ['display_order', 'name_ar']
        indexes = [
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['parent']),
        ]

    def __str__(self):
        return self.name_ar


class Brand(models.Model):
    """Brands (البراندات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name_ar = models.CharField(max_length=255, verbose_name="الاسم بالعربية")
    name_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="الاسم بالإنجليزية")
    logo_url = models.CharField(max_length=500, blank=True, null=True, verbose_name="رابط الشعار")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "براند"
        verbose_name_plural = "البراندات"
        ordering = ['name_ar']
        indexes = [
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.name_ar


class Product(models.Model):
    """Products (المنتجات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    sku = models.CharField(max_length=100, unique=True, verbose_name="كود المنتج")
    name_ar = models.CharField(max_length=255, verbose_name="الاسم بالعربية")
    name_en = models.CharField(max_length=255, blank=True, null=True, verbose_name="الاسم بالإنجليزية")
    slug = models.SlugField(max_length=255, unique=True, verbose_name="الرابط الودي")
    description_ar = models.TextField(blank=True, null=True, verbose_name="الوصف بالعربية")
    description_en = models.TextField(blank=True, null=True, verbose_name="الوصف بالإنجليزية")
    
    # Pricing
    price = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], 
                                verbose_name="السعر")
    discount_percentage = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="نسبة الخصم"
    )
    # final_price will be calculated dynamically in serializer
    
    # Relationships
    category = models.ForeignKey(Category, on_delete=models.RESTRICT, related_name='products', 
                                 verbose_name="الفئة")
    brand = models.ForeignKey(Brand, on_delete=models.SET_NULL, null=True, blank=True, 
                              related_name='products', verbose_name="البراند")
    
    # Inventory
    stock_quantity = models.IntegerField(default=0, validators=[MinValueValidator(0)], 
                                         verbose_name="الكمية المتاحة")
    is_in_stock = models.BooleanField(default=True, verbose_name="متوفر")
    low_stock_threshold = models.IntegerField(default=5, verbose_name="حد التنبيه للمخزون")
    
    # Product Details - Using ArrayField for PostgreSQL
    available_sizes = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        null=True,
        verbose_name="المقاسات المتاحة",
        help_text="مثال: S, M, L, XL, XXL"
    )
    available_colors = ArrayField(
        models.CharField(max_length=50),
        blank=True,
        null=True,
        verbose_name="الألوان المتاحة",
        help_text="مثال: أبيض, أسود, أزرق"
    )
    
    # SEO & Display
    is_featured = models.BooleanField(default=False, verbose_name="مميز")
    is_new = models.BooleanField(default=False, verbose_name="جديد")
    is_on_sale = models.BooleanField(default=False, verbose_name="عليه تخفيض")
    
    # Ratings (calculated from reviews)
    average_rating = models.DecimalField(
        max_digits=2, 
        decimal_places=1, 
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(5)],
        verbose_name="متوسط التقييم"
    )
    review_count = models.IntegerField(default=0, verbose_name="عدد التقييمات")
    
    # Metadata
    views_count = models.IntegerField(default=0, verbose_name="عدد المشاهدات")
    sales_count = models.IntegerField(default=0, verbose_name="عدد المبيعات")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    display_order = models.IntegerField(default=0, verbose_name="ترتيب العرض", help_text="رقم أقل = يظهر أولاً")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "منتج"
        verbose_name_plural = "المنتجات"
        ordering = ['display_order', '-created_at']  # display_order first, then newest
        indexes = [
            models.Index(fields=['category']),
            models.Index(fields=['brand']),
            models.Index(fields=['slug']),
            models.Index(fields=['is_active']),
            models.Index(fields=['is_featured']),
            models.Index(fields=['is_on_sale']),
            models.Index(fields=['average_rating']),
            models.Index(fields=['display_order']),  # Index for ordering
        ]

    def __str__(self):
        return self.name_ar

    @property
    def final_price(self):
        """Calculate final price after discount"""
        from decimal import Decimal
        discount_amount = self.price * (Decimal(self.discount_percentage) / Decimal(100))
        return self.price - discount_amount

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name_ar, allow_unicode=True) 
            if not self.slug: # Fallback if arabic fails or empty
                 self.slug = slugify(self.name_en) or str(uuid.uuid4())[:8]
            
            # Ensure uniqueness for slug
            original_slug = self.slug
            counter = 1
            while Product.objects.filter(slug=self.slug).exists():
                self.slug = f"{original_slug}-{counter}"
                counter += 1

        if not self.sku:
            # Generate SKU: SKU-{8_CHARS_UUID}
            self.sku = f"SKU-{str(uuid.uuid4())[:8].upper()}"
            # Ensure uniqueness for SKU (highly unlikely collision but good practice)
            while Product.objects.filter(sku=self.sku).exists():
                self.sku = f"SKU-{str(uuid.uuid4())[:8].upper()}"

        # Set default display_order for new products (place at end)
        if self.display_order == 0 and not self.pk:
            max_order = Product.objects.aggregate(Max('display_order'))['display_order__max'] or 0
            self.display_order = max_order + 1

        super().save(*args, **kwargs)


class ProductImage(models.Model):
    """Product images (صور المنتجات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='images', 
                                verbose_name="المنتج")
    image_url = models.CharField(max_length=500, verbose_name="رابط الصورة")
    alt_text_ar = models.CharField(max_length=255, blank=True, null=True, verbose_name="النص البديل")
    display_order = models.IntegerField(default=0, verbose_name="ترتيب العرض")
    is_primary = models.BooleanField(default=False, verbose_name="صورة رئيسية")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإضافة")

    class Meta:
        verbose_name = "صورة منتج"
        verbose_name_plural = "صور المنتجات"
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['product', 'is_primary']),
        ]

    def __str__(self):
        return f"صورة {self.product.name_ar}"


class Order(models.Model):
    """Customer orders (الطلبات)"""
    STATUS_CHOICES = [
        ('pending', 'قيد الانتظار'),
        ('confirmed', 'تم التأكيد'),
        ('processing', 'قيد المعالجة'),
        ('shipped', 'تم الشحن'),
        ('out_for_delivery', 'قيد التوصيل'),
        ('delivered', 'تم التوصيل'),
        ('cancelled', 'ملغي'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order_number = models.CharField(max_length=50, unique=True, verbose_name="رقم الطلب")
    
    # Customer Information (no user account)
    customer_name = models.CharField(max_length=255, verbose_name="اسم العميل")
    customer_phone = models.CharField(max_length=20, verbose_name="رقم الهاتف")
    customer_email = models.EmailField(blank=True, null=True, verbose_name="البريد الإلكتروني")
    
    # Shipping Address
    governorate = models.CharField(max_length=100, verbose_name="المحافظة")
    district = models.CharField(max_length=100, verbose_name="المركز")
    village = models.CharField(max_length=100, blank=True, null=True, verbose_name="القرية")
    detailed_address = models.TextField(verbose_name="العنوان التفصيلي")
    
    # Order Totals
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], 
                                   verbose_name="المجموع الفرعي")
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                         validators=[MinValueValidator(0)], verbose_name="الخصم")
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], 
                                       verbose_name="تكلفة الشحن")
    total = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], 
                               verbose_name="الإجمالي")
    
    # Order Status
    status = models.CharField(max_length=50, choices=STATUS_CHOICES, default='pending', 
                             verbose_name="حالة الطلب")
    
    # Additional Notes
    customer_notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات العميل")
    admin_notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات الإدارة")
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الطلب")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")
    confirmed_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ التأكيد")
    shipped_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ الشحن")
    delivered_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ التوصيل")
    cancelled_at = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ الإلغاء")

    class Meta:
        verbose_name = "طلب"
        verbose_name_plural = "الطلبات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order_number']),
            models.Index(fields=['customer_phone']),
            models.Index(fields=['status']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['governorate']),
        ]

    def __str__(self):
        return f"طلب {self.order_number} - {self.customer_name}"


class OrderItem(models.Model):
    """Products in each order (منتجات الطلب)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', 
                             verbose_name="الطلب")
    product = models.ForeignKey(Product, on_delete=models.RESTRICT, related_name='order_items', 
                                verbose_name="المنتج")
    
    # Product snapshot (in case product is deleted/modified later)
    product_name_ar = models.CharField(max_length=255, verbose_name="اسم المنتج")
    product_sku = models.CharField(max_length=100, blank=True, null=True, verbose_name="كود المنتج")
    
    # Selection
    selected_size = models.CharField(max_length=50, blank=True, null=True, verbose_name="المقاس المختار")
    selected_color = models.CharField(max_length=50, blank=True, null=True, verbose_name="اللون المختار")
    quantity = models.IntegerField(validators=[MinValueValidator(1)], verbose_name="الكمية")
    
    # Pricing (snapshot at order time)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر الوحدة")
    discount_percentage = models.IntegerField(default=0, verbose_name="نسبة الخصم")
    final_unit_price = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="سعر الوحدة النهائي")
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="المجموع الفرعي")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإضافة")

    class Meta:
        verbose_name = "منتج الطلب"
        verbose_name_plural = "منتجات الطلبات"
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['product']),
        ]

    def __str__(self):
        return f"{self.product_name_ar} - {self.order.order_number}"


class OrderStatusHistory(models.Model):
    """Track all status changes for orders (سجل حالة الطلب)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='status_history', 
                             verbose_name="الطلب")
    old_status = models.CharField(max_length=50, blank=True, null=True, verbose_name="الحالة القديمة")
    new_status = models.CharField(max_length=50, verbose_name="الحالة الجديدة")
    changed_by = models.ForeignKey('AdminUser', on_delete=models.SET_NULL, null=True, blank=True, 
                                  verbose_name="تم التغيير بواسطة")
    notes = models.TextField(blank=True, null=True, verbose_name="ملاحظات")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ التغيير")

    class Meta:
        verbose_name = "سجل حالة طلب"
        verbose_name_plural = "سجلات حالة الطلبات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['order']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"{self.order.order_number} - {self.new_status}"


class Review(models.Model):
    """Customer reviews for products (التقييمات والمراجعات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', 
                                verbose_name="المنتج")
    order = models.ForeignKey(Order, on_delete=models.SET_NULL, null=True, blank=True, 
                             related_name='reviews', verbose_name="الطلب")
    
    # Reviewer info (anonymous, no account)
    reviewer_name = models.CharField(max_length=255, verbose_name="اسم المراجع")
    reviewer_phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم الهاتف")
    
    # Review content
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)], 
                                verbose_name="التقييم")
    title_ar = models.CharField(max_length=255, blank=True, null=True, verbose_name="عنوان المراجعة")
    comment_ar = models.TextField(blank=True, null=True, verbose_name="التعليق")
    
    # Moderation
    is_approved = models.BooleanField(default=False, verbose_name="موافق عليه")
    is_verified_purchase = models.BooleanField(default=False, verbose_name="شراء موثق")
    
    # Engagement
    helpful_count = models.IntegerField(default=0, verbose_name="عدد المفيدة")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "مراجعة"
        verbose_name_plural = "المراجعات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['product']),
            models.Index(fields=['is_approved']),
            models.Index(fields=['rating']),
            models.Index(fields=['-created_at']),
        ]

    def __str__(self):
        return f"تقييم {self.product.name_ar} - {self.reviewer_name}"


class AdminUser(AbstractUser):
    """Admin users for authentication (المسؤولين)"""
    ROLE_CHOICES = [
        ('super_admin', 'مدير رئيسي'),
        ('admin', 'مدير'),
        ('moderator', 'مشرف'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    full_name_ar = models.CharField(max_length=255, verbose_name="الاسم الكامل")
    phone = models.CharField(max_length=20, blank=True, null=True, verbose_name="رقم الهاتف")
    role = models.CharField(max_length=50, choices=ROLE_CHOICES, default='admin', 
                           verbose_name="الدور")
    last_login = models.DateTimeField(null=True, blank=True, verbose_name="آخر تسجيل دخول")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "مسؤول"
        verbose_name_plural = "المسؤولين"
        indexes = [
            models.Index(fields=['username']),
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.full_name_ar


class Banner(models.Model):
    """Homepage promotional banners (بانرات الصفحة الرئيسية)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title_ar = models.CharField(max_length=255, verbose_name="العنوان")
    description_ar = models.TextField(blank=True, null=True, verbose_name="الوصف")
    image_url = models.CharField(max_length=500, verbose_name="رابط الصورة")
    
    # CTA (Call to Action)
    button_text_ar = models.CharField(max_length=100, blank=True, null=True, verbose_name="نص الزر")
    button_link = models.CharField(max_length=500, blank=True, null=True, verbose_name="رابط الزر")
    
    # Display
    display_order = models.IntegerField(default=0, verbose_name="ترتيب العرض")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    # Schedule (optional)
    start_date = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ البداية")
    end_date = models.DateTimeField(null=True, blank=True, verbose_name="تاريخ النهاية")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "بانر"
        verbose_name_plural = "البانرات"
        ordering = ['display_order']
        indexes = [
            models.Index(fields=['is_active']),
            models.Index(fields=['display_order']),
        ]

    def __str__(self):
        return self.title_ar


class ShippingZone(models.Model):
    """Manage shipping costs by governorate (مناطق الشحن)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    governorate = models.CharField(max_length=100, unique=True, verbose_name="المحافظة")
    shipping_cost = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)], 
                                       verbose_name="تكلفة الشحن")
    estimated_days = models.CharField(max_length=50, blank=True, null=True, verbose_name="مدة التوصيل المتوقعة")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "منطقة شحن"
        verbose_name_plural = "مناطق الشحن"
        ordering = ['governorate']
        indexes = [
            models.Index(fields=['governorate']),
        ]

    def __str__(self):
        return f"{self.governorate} - {self.shipping_cost} جنيه"


class DiscountCode(models.Model):
    """Promotional discount codes (أكواد الخصم)"""
    DISCOUNT_TYPE_CHOICES = [
        ('percentage', 'نسبة مئوية'),
        ('fixed_amount', 'قيمة ثابتة'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, verbose_name="الكود")
    description_ar = models.CharField(max_length=255, blank=True, null=True, verbose_name="الوصف")
    
    # Discount details
    discount_type = models.CharField(max_length=20, choices=DISCOUNT_TYPE_CHOICES, 
                                     verbose_name="نوع الخصم")
    discount_value = models.DecimalField(max_digits=10, decimal_places=2, verbose_name="قيمة الخصم")
    
    # Constraints
    min_order_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0, 
                                          verbose_name="الحد الأدنى للطلب")
    max_discount_amount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, 
                                             verbose_name="الحد الأقصى للخصم")
    usage_limit = models.IntegerField(null=True, blank=True, verbose_name="حد الاستخدام")
    usage_count = models.IntegerField(default=0, verbose_name="عدد مرات الاستخدام")
    
    # Validity
    valid_from = models.DateTimeField(null=True, blank=True, verbose_name="صالح من")
    valid_until = models.DateTimeField(null=True, blank=True, verbose_name="صالح حتى")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")

    class Meta:
        verbose_name = "كود خصم"
        verbose_name_plural = "أكواد الخصم"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['is_active']),
        ]

    def __str__(self):
        return self.code


class Coupon(models.Model):
    """Coupon model for product discounts (كوبونات الخصم للمنتجات)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="كود الكوبون")
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="نسبة الخصم (%)"
    )
    products = models.ManyToManyField(
        'Product',
        related_name='coupons',
        blank=True,
        verbose_name="المنتجات",
        help_text="اتركه فارغاً ليعمل على جميع المنتجات"
    )
    valid_from = models.DateTimeField(verbose_name="صالح من")
    valid_to = models.DateTimeField(verbose_name="صالح حتى")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name="الحد الأقصى للاستخدام")
    used_count = models.PositiveIntegerField(default=0, verbose_name="عدد مرات الاستخدام")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="تاريخ الإنشاء")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "كوبون"
        verbose_name_plural = "كوبونات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
        ]

    def __str__(self):
        return f"{self.code} - {self.discount_percentage}%"

    def is_valid(self):
        """Check if coupon is currently valid"""
        now = timezone.now()
        if not self.is_active:
            return False
        if self.valid_from > now or self.valid_to < now:
            return False
        if self.max_uses and self.used_count >= self.max_uses:
            return False
        return True

    def apply_discount(self, amount):
        """Apply coupon discount to an amount"""
        if not self.is_valid():
            return amount
        discount_amount = (amount * self.discount_percentage) / 100
        return amount - discount_amount


class SiteSetting(models.Model):
    """Global site settings (إعدادات الموقع)"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    key = models.CharField(max_length=100, unique=True, verbose_name="المفتاح")
    value = models.TextField(blank=True, null=True, verbose_name="القيمة")
    description = models.CharField(max_length=255, blank=True, null=True, verbose_name="الوصف")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="تاريخ التحديث")

    class Meta:
        verbose_name = "إعداد الموقع"
        verbose_name_plural = "إعدادات الموقع"
        ordering = ['key']

    def __str__(self):
        return f"{self.key}: {self.value}"
