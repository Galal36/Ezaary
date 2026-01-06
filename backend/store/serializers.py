from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import (
    Category, Brand, Product, ProductImage, Order, OrderItem,
    OrderStatusHistory, Review, AdminUser, Banner, ShippingZone,
    DiscountCode, SiteSetting, Coupon
)
import os
import shutil


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    products_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = [
            'id', 'name_ar', 'name_en', 'slug', 'description_ar', 'image_url',
            'parent', 'display_order', 'is_active', 'products_count', 'created_at', 'updated_at',
            'subcategories'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_subcategories(self, obj):
        """Get all subcategories"""
        subcategories = obj.subcategories.filter(is_active=True)
        return CategorySerializer(subcategories, many=True).data


class BrandSerializer(serializers.ModelSerializer):
    """Serializer for Brand model"""
    class Meta:
        model = Brand
        fields = ['id', 'name_ar', 'name_en', 'logo_url', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']


class ProductImageSerializer(serializers.ModelSerializer):
    """Serializer for ProductImage model"""
    image_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ProductImage
        fields = ['id', 'product', 'image_url', 'alt_text_ar', 'display_order', 'is_primary', 'created_at']
        read_only_fields = ['id', 'created_at']
    
    def get_image_url(self, obj):
        """Normalize image URL - convert local paths to proper media URLs"""
        url = obj.image_url
        
        if not url:
            return None
        
        # If it's already a full URL (http/https), return as is
        if url.startswith('http://') or url.startswith('https://'):
            return url
        
        # If it's a local file path (Windows or Unix), copy to media and return URL
        if '\\' in url or (url.startswith('/') and not url.startswith('/media') and not url.startswith('http')):
            # Extract filename
            filename = os.path.basename(url.replace('\\', '/'))
            # Sanitize filename (remove special characters that might cause issues)
            safe_filename = "".join(c for c in filename if c.isalnum() or c in (' ', '-', '_', '.')).strip()
            safe_filename = safe_filename.replace(' ', '_')
            
            # Create media path
            media_path = f"products/{safe_filename}"
            
            # Check if file exists at the local path and copy it
            if os.path.exists(url):
                # Copy file to media directory if it doesn't exist there
                if not default_storage.exists(media_path):
                    try:
                        with open(url, 'rb') as src_file:
                            default_storage.save(media_path, ContentFile(src_file.read()))
                        # Update the database record to point to the new location
                        obj.image_url = media_path
                        obj.save(update_fields=['image_url'])
                    except Exception as e:
                        print(f"Error copying image from {url}: {e}")
                        return None
                else:
                    # File already exists in media, update database to point to it
                    if obj.image_url != media_path:
                        obj.image_url = media_path
                        obj.save(update_fields=['image_url'])
            elif default_storage.exists(media_path):
                # File doesn't exist at local path but exists in media, update DB
                if obj.image_url != media_path:
                    obj.image_url = media_path
                    obj.save(update_fields=['image_url'])
            else:
                # File doesn't exist anywhere
                print(f"Warning: Image file not found at {url} and not in media directory")
                return None
            
            # Return the media URL
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(settings.MEDIA_URL + media_path)
            return settings.MEDIA_URL + media_path
        
        # If it's already a relative media path, make it absolute
        if url.startswith('media/') or url.startswith('/media/'):
            request = self.context.get('request')
            if request:
                # Remove leading slash if present, then add it back for build_absolute_uri
                clean_url = url.lstrip('/')
                return request.build_absolute_uri('/' + clean_url)
            # Return with leading slash
            return url if url.startswith('/') else '/' + url
        
        # If it's a relative path without 'media/', assume it's in media/products/
        if not url.startswith('http') and not url.startswith('/'):
            request = self.context.get('request')
            media_path = f"products/{url}" if not url.startswith('products/') else url
            if request:
                return request.build_absolute_uri(settings.MEDIA_URL + media_path)
            return settings.MEDIA_URL + media_path
        
        return url


class ProductListSerializer(serializers.ModelSerializer):
    """Serializer for listing products (lighter version)"""
    category_name = serializers.CharField(source='category.name_ar', read_only=True)
    brand_name = serializers.CharField(source='brand.name_ar', read_only=True, allow_null=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    primary_image = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name_ar', 'name_en', 'slug', 'price', 'discount_percentage',
            'final_price', 'category', 'category_name', 'brand', 'brand_name',
            'stock_quantity', 'is_in_stock', 'is_featured', 'is_new', 'is_on_sale',
            'average_rating', 'review_count', 'primary_image', 'available_sizes', 
            'available_colors', 'display_order', 'created_at'
        ]
        read_only_fields = ['id', 'final_price', 'created_at']
    
    def get_primary_image(self, obj):
        """Get primary product image - optimized to avoid N+1 queries"""
        # Use prefetched images (already loaded, no DB query)
        try:
            # Check if images are prefetched
            if hasattr(obj, '_prefetched_objects_cache') and 'images' in obj._prefetched_objects_cache:
                images = list(obj._prefetched_objects_cache['images'])
            else:
                # Fallback: use all() but this should rarely happen with proper prefetch
                images = list(obj.images.all())
        except:
            return None
        
        if not images:
            return None
        
        # Find primary image - O(n) but n is small (typically 1-5 images)
        # Since images are prefetched and ordered by is_primary, first image is likely primary
        primary_img = images[0] if images else None
        for img in images:
            if img.is_primary:
                primary_img = img
                break
        
        if not primary_img:
            return None
        
        # Build URL directly without creating another serializer (faster)
        url = primary_img.image_url
        if not url:
            return None
        
        # Normalize URL (same logic as ProductImageSerializer but inline for performance)
        if url.startswith('http://') or url.startswith('https://'):
            return url
        
        if url.startswith('media/') or url.startswith('/media/'):
            request = self.context.get('request')
            if request:
                clean_url = url.lstrip('/')
                return request.build_absolute_uri('/' + clean_url)
            return url if url.startswith('/') else '/' + url
        
        if not url.startswith('http') and not url.startswith('/'):
            request = self.context.get('request')
            media_path = f"products/{url}" if not url.startswith('products/') else url
            if request:
                return request.build_absolute_uri(settings.MEDIA_URL + media_path)
            return settings.MEDIA_URL + media_path
        
        return url


class ProductDetailSerializer(serializers.ModelSerializer):
    """Serializer for product details (full version)"""
    category_name = serializers.CharField(source='category.name_ar', read_only=True)
    brand_name = serializers.CharField(source='brand.name_ar', read_only=True, allow_null=True)
    final_price = serializers.DecimalField(max_digits=10, decimal_places=2, read_only=True)
    images = ProductImageSerializer(many=True, read_only=True)
    reviews = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name_ar', 'name_en', 'slug', 'description_ar', 'description_en',
            'price', 'discount_percentage', 'final_price', 'category', 'category_name',
            'brand', 'brand_name', 'stock_quantity', 'is_in_stock', 'low_stock_threshold',
            'available_sizes', 'available_colors', 'is_featured', 'is_new', 'is_on_sale',
            'average_rating', 'review_count', 'views_count', 'sales_count', 'is_active',
            'display_order', 'images', 'reviews', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'final_price', 'views_count', 'sales_count', 
                           'average_rating', 'review_count', 'created_at', 'updated_at']
    
    def get_reviews(self, obj):
        """Get approved reviews for this product"""
        reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')[:10]
        return ReviewSerializer(reviews, many=True).data


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model"""
    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name_ar', 'product_sku', 'selected_size',
            'selected_color', 'quantity', 'unit_price', 'discount_percentage',
            'final_unit_price', 'subtotal', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Product
        fields = [
            'id', 'slug', 'name_ar', 'name_en', 'sku', 'description_ar', 'description_en',
            'price', 'discount_percentage', 'category', 'brand',
            'stock_quantity', 'is_in_stock', 'low_stock_threshold',
            'available_sizes', 'available_colors', 'is_featured', 
            'is_new', 'is_on_sale', 'images', 'is_active', 'display_order'
        ]
        read_only_fields = ['id']  # Allow slug to be updated
    
    def create(self, validated_data):
        images_data = validated_data.pop('images', [])
        
        # Create product
        product = Product.objects.create(**validated_data)
        
        # Create images
        for i, image_url in enumerate(images_data):
            ProductImage.objects.create(
                product=product,
                image_url=image_url,
                display_order=i,
                is_primary=(i == 0)
            )
            
        return product

    def update(self, instance, validated_data):
        images_data = validated_data.pop('images', None)
        
        # Update product fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update images if provided
        if images_data is not None:
            # Delete existing images
            instance.images.all().delete()
            # Create new images
            for i, image_url in enumerate(images_data):
                ProductImage.objects.create(
                    product=instance,
                    image_url=image_url,
                    display_order=i,
                    is_primary=(i == 0)
                )
        
        return instance


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    """Serializer for OrderStatusHistory model"""
    changed_by_name = serializers.CharField(source='changed_by.full_name_ar', read_only=True, allow_null=True)
    
    class Meta:
        model = OrderStatusHistory
        fields = ['id', 'order', 'old_status', 'new_status', 'changed_by', 
                 'changed_by_name', 'notes', 'created_at']
        read_only_fields = ['id', 'created_at']


class OrderListSerializer(serializers.ModelSerializer):
    """Serializer for listing orders (lighter version)"""
    items_count = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
            'governorate', 'district', 'village', 'detailed_address',
            'subtotal', 'discount_amount', 'shipping_cost', 'total', 
            'items_count', 'items', 'status', 'status_display', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']
    
    def get_items_count(self, obj):
        """Get total items count"""
        return obj.items.count()


class OrderDetailSerializer(serializers.ModelSerializer):
    """Serializer for order details (full version)"""
    items = OrderItemSerializer(many=True, read_only=True)
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
            'governorate', 'district', 'village', 'detailed_address', 'subtotal',
            'discount_amount', 'shipping_cost', 'total', 'status', 'status_display',
            'customer_notes', 'admin_notes', 'items', 'status_history', 'created_at',
            'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_phone', 'customer_email', 'governorate',
            'district', 'village', 'detailed_address', 'subtotal', 'discount_amount',
            'shipping_cost', 'total', 'customer_notes', 'items'
        ]
    
    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        
        # Generate order number
        from datetime import date
        today = date.today().strftime('%Y%m%d')
        last_order = Order.objects.filter(order_number__startswith=f'IZR-{today}').order_by('-order_number').first()
        if last_order:
            last_num = int(last_order.order_number.split('-')[-1])
            order_number = f'IZR-{today}-{last_num + 1:04d}'
        else:
            order_number = f'IZR-{today}-0001'
        
        # Create order
        order = Order.objects.create(order_number=order_number, **validated_data)
        
        # Create order items
        for item_data in items_data:
            OrderItem.objects.create(order=order, **item_data)
        
        # Create initial status history
        OrderStatusHistory.objects.create(
            order=order,
            old_status=None,
            new_status='pending',
            notes='تم إنشاء الطلب'
        )
        
        return order


class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    product_name = serializers.CharField(source='product.name_ar', read_only=True)
    
    class Meta:
        model = Review
        fields = [
            'id', 'product', 'product_name', 'order', 'reviewer_name', 'reviewer_phone',
            'rating', 'title_ar', 'comment_ar', 'is_approved', 'is_verified_purchase',
            'helpful_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'is_verified_purchase', 'helpful_count', 'created_at', 'updated_at']


class AdminUserSerializer(serializers.ModelSerializer):
    """Serializer for AdminUser model"""
    class Meta:
        model = AdminUser
        fields = [
            'id', 'username', 'email', 'full_name_ar', 'phone', 'role',
            'is_active', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'last_login', 'created_at', 'updated_at']
        extra_kwargs = {'password': {'write_only': True}}


class AdminLoginSerializer(serializers.Serializer):
    """Serializer for admin login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        """Validate login credentials"""
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Find user by email
            try:
                user = AdminUser.objects.get(email=email)
                # Authenticate with username (Django default)
                user = authenticate(username=user.username, password=password)
            except AdminUser.DoesNotExist:
                user = None
            
            if not user:
                raise serializers.ValidationError('البريد الإلكتروني أو كلمة المرور غير صحيحة.')
            
            if not user.is_active:
                raise serializers.ValidationError('هذا الحساب غير نشط.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('يجب إدخال البريد الإلكتروني وكلمة المرور.')


class BannerSerializer(serializers.ModelSerializer):
    """Serializer for Banner model"""
    class Meta:
        model = Banner
        fields = [
            'id', 'title_ar', 'description_ar', 'image_url', 'button_text_ar',
            'button_link', 'display_order', 'is_active', 'start_date', 'end_date',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class ShippingZoneSerializer(serializers.ModelSerializer):
    """Serializer for ShippingZone model"""
    class Meta:
        model = ShippingZone
        fields = [
            'id', 'governorate', 'shipping_cost', 'estimated_days', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class DiscountCodeSerializer(serializers.ModelSerializer):
    """Serializer for DiscountCode model"""
    class Meta:
        model = DiscountCode
        fields = [
            'id', 'code', 'description_ar', 'discount_type', 'discount_value',
            'min_order_amount', 'max_discount_amount', 'usage_limit', 'usage_count',
            'valid_from', 'valid_until', 'is_active', 'created_at'
        ]
        read_only_fields = ['id', 'usage_count', 'created_at']


class SiteSettingSerializer(serializers.ModelSerializer):
    """Serializer for SiteSetting model"""
    class Meta:
        model = SiteSetting
        fields = ['id', 'key', 'value', 'description', 'updated_at']
        read_only_fields = ['id', 'updated_at']


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for Coupon model"""
    is_valid = serializers.SerializerMethodField()
    products = serializers.PrimaryKeyRelatedField(
        many=True,
        queryset=Product.objects.all(),
        required=False,
        allow_empty=True
    )
    product_names = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_percentage', 'products', 'product_names', 'product_count',
            'valid_from', 'valid_to', 'is_active', 'max_uses', 'used_count',
            'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'updated_at']

    def validate_code(self, value):
        """Validate coupon code"""
        if not value:
            raise serializers.ValidationError("كود الكوبون مطلوب")
        # Convert to uppercase
        value = value.strip().upper()
        # Check for duplicates (excluding current instance if updating)
        queryset = Coupon.objects.filter(code=value)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("كود الكوبون موجود بالفعل")
        return value

    def validate(self, data):
        """Validate coupon data"""
        valid_from = data.get('valid_from')
        valid_to = data.get('valid_to')
        
        if valid_from and valid_to:
            if valid_from >= valid_to:
                raise serializers.ValidationError({
                    'valid_to': 'تاريخ انتهاء الصلاحية يجب أن يكون بعد تاريخ البداية'
                })
        
        discount_percentage = data.get('discount_percentage')
        if discount_percentage is not None:
            if discount_percentage < 0 or discount_percentage > 100:
                raise serializers.ValidationError({
                    'discount_percentage': 'نسبة الخصم يجب أن تكون بين 0 و 100'
                })
        
        return data

    def get_is_valid(self, obj):
        """Check if coupon is currently valid"""
        if hasattr(obj, 'is_valid'):
            try:
                return obj.is_valid()
            except:
                return False
        return False

    def get_product_names(self, obj):
        """Get product names safely"""
        try:
            products = obj.products.all()
            return [p.name_ar for p in products] if products.exists() else []
        except:
            return []

    def get_product_count(self, obj):
        """Get number of products associated with this coupon"""
        try:
            return obj.products.count()
        except:
            return 0

    def create(self, validated_data):
        """Create coupon with products"""
        products = validated_data.pop('products', [])
        coupon = Coupon.objects.create(**validated_data)
        if products:
            coupon.products.set(products)
        return coupon

    def update(self, instance, validated_data):
        """Update coupon with products"""
        products = validated_data.pop('products', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if products is not None:
            instance.products.set(products)
        return instance


class CouponValidateSerializer(serializers.Serializer):
    """Serializer for coupon validation"""
    code = serializers.CharField(max_length=50)
    product_id = serializers.UUIDField(required=False, allow_null=True)
    amount = serializers.DecimalField(max_digits=10, decimal_places=2, required=False)

    def validate(self, data):
        """Validate coupon code"""
        code = data.get('code', '').strip().upper()
        product_id = data.get('product_id')
        
        try:
            coupon = Coupon.objects.prefetch_related('products').get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "كود الكوبون غير صحيح"})
        
        # Check if coupon is valid
        if not coupon.is_valid():
            raise serializers.ValidationError({"code": "كود الكوبون منتهي الصلاحية أو غير صالح"})
        
        # Check if coupon is for specific products
        coupon_products = coupon.products.all()
        if coupon_products.exists():  # If products are specified
            if not product_id:
                raise serializers.ValidationError({"code": "هذا الكوبون مخصص لمنتجات معينة"})
            if not coupon_products.filter(id=product_id).exists():
                raise serializers.ValidationError({"code": "هذا الكوبون غير صالح لهذا المنتج"})
        # If no products specified, coupon works for all products
        
        # Check usage limit
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise serializers.ValidationError({"code": "تم تجاوز الحد الأقصى لاستخدام هذا الكوبون"})
        
        data['coupon'] = coupon
        return data




