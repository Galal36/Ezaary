from rest_framework import serializers
from django.contrib.auth import authenticate
from django.conf import settings
from django.utils import timezone
from decimal import Decimal
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from .models import (
    Category, Brand, Product, ProductImage, Order, OrderItem,
    OrderStatusHistory, Review, AdminUser, Banner, ShippingZone,
    DiscountCode, SiteSetting, Coupon, PaymentNumber, Customer
)
from .shipping_utils import get_shipping_cost, is_valid_governorate
import os
import shutil


class CategorySerializer(serializers.ModelSerializer):
    """Serializer for Category model"""
    products_count = serializers.IntegerField(read_only=True)
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = [
            'id', 'name_ar', 'name_en', 'slug', 'description_ar', 'image_url',
            'parent', 'display_order', 'is_active', 'products_count', 'created_at', 'updated_at',
            'subcategories'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_image_url(self, obj):
        """Normalize category image URL - convert local paths to proper media URLs"""
        url = obj.image_url
        if not url:
            return None
        
        # If it's already a full URL (http/https), return as is
        if url.startswith('http://') or url.startswith('https://'):
            # Replace localhost if present
            if 'localhost' in url:
                return url.replace('http://localhost:8000', 'https://ezaary.com')
            return url
        
        # If it's a relative path starting with /media, make it absolute
        if url.startswith('media/') or url.startswith('/media/'):
            request = self.context.get('request')
            if request:
                clean_url = url.lstrip('/')
                return request.build_absolute_uri('/' + clean_url)
            return url if url.startswith('/') else '/' + url
        
        # If it's a relative path without 'media/', assume it's in media/categories/
        if not url.startswith('http') and not url.startswith('/'):
            request = self.context.get('request')
            media_path = f"categories/{url}" if not url.startswith('categories/') else url
            if request:
                return request.build_absolute_uri(settings.MEDIA_URL + media_path)
            return settings.MEDIA_URL + media_path
        
        # Frontend placeholder - serve from root, not media (avoids /media/placeholder.svg 404)
        _req = self.context.get('request')
        if url in ('/placeholder.svg', 'placeholder.svg'):
            return _req.build_absolute_uri('/placeholder.svg') if _req else '/placeholder.svg'
        
        # If it starts with / but not /media, assume it's a media path
        if url.startswith('/') and not url.startswith('/media'):
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri('/media' + url)
            return '/media' + url
        
        return url
    
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
    images = serializers.SerializerMethodField()
    available_sizes = serializers.SerializerMethodField()
    available_colors = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = [
            'id', 'sku', 'name_ar', 'name_en', 'slug', 'price', 'discount_percentage',
            'final_price', 'category', 'category_name', 'brand', 'brand_name',
            'stock_quantity', 'is_in_stock', 'is_featured', 'is_new', 'is_on_sale',
            'average_rating', 'review_count', 'primary_image', 'images', 'available_sizes', 
            'available_colors', 'display_order', 'created_at'
        ]
        read_only_fields = ['id', 'final_price', 'created_at']

    def get_available_sizes(self, obj):
        """
        Always return a list (never null) to keep frontend logic simple.
        Also filters out empty/falsey entries.
        """
        sizes = getattr(obj, 'available_sizes', None) or []
        return [s for s in sizes if s]

    def get_available_colors(self, obj):
        """
        Always return a list (never null) to keep frontend logic simple.
        Also filters out empty/falsey entries.
        """
        colors = getattr(obj, 'available_colors', None) or []
        return [c for c in colors if c]
    
    def get_images(self, obj):
        """Get all product images (ordered by display_order) - optimized"""
        try:
            # Check if images are prefetched
            if hasattr(obj, '_prefetched_objects_cache') and 'images' in obj._prefetched_objects_cache:
                images = list(obj._prefetched_objects_cache['images'])
            else:
                images = list(obj.images.all())
        except:
            return []
        
        if not images:
            return []
        
        # Normalize and return image URLs in display order
        result = []
        request = self.context.get('request')
        for img in images:
            if not img.image_url:
                continue
            url = img.image_url
            if url.startswith('http://') or url.startswith('https://'):
                normalized = url
            elif url.startswith('media/') or url.startswith('/media/'):
                clean = url.lstrip('/')
                normalized = request.build_absolute_uri('/' + clean) if request else ('/' + clean)
            elif not url.startswith('/'):
                media_path = url if url.startswith('products/') or url.startswith('categories/') else f"products/{url}"
                normalized = request.build_absolute_uri(settings.MEDIA_URL + media_path) if request else (settings.MEDIA_URL + media_path)
            else:
                normalized = url
            result.append({'image_url': normalized, 'is_primary': img.is_primary})
        return result
    
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
    available_sizes = serializers.SerializerMethodField()
    available_colors = serializers.SerializerMethodField()
    
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

    def get_available_sizes(self, obj):
        sizes = getattr(obj, 'available_sizes', None) or []
        return [s for s in sizes if s]

    def get_available_colors(self, obj):
        colors = getattr(obj, 'available_colors', None) or []
        return [c for c in colors if c]
    
    def get_reviews(self, obj):
        """Get approved reviews for this product"""
        reviews = obj.reviews.filter(is_approved=True).order_by('-created_at')[:10]
        return ReviewSerializer(reviews, many=True).data


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for OrderItem model"""
    # Provide product options alongside the selected snapshot so checkout can render selectors.
    # Names match Product serializer fields for frontend compatibility.
    available_sizes = serializers.SerializerMethodField()
    available_colors = serializers.SerializerMethodField()

    # Allow high precision from frontend (will be rounded in validation/save)
    unit_price = serializers.DecimalField(max_digits=50, decimal_places=20)
    final_unit_price = serializers.DecimalField(max_digits=50, decimal_places=20)
    subtotal = serializers.DecimalField(max_digits=50, decimal_places=20)
    
    # Convenience: frontends that need to render per-quantity selections can use this list.
    # (We still store only one selected_size/selected_color in DB, but this unlocks the UI.)
    detail_slots = serializers.SerializerMethodField()
    
    # Add product image for admin dashboard
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'id', 'product', 'product_name_ar', 'product_sku', 'selected_size',
            'selected_color', 'quantity', 'unit_price', 'discount_percentage',
            'final_unit_price', 'subtotal',
            'available_sizes', 'available_colors', 'detail_slots', 'product_image',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']
        extra_kwargs = {
            'selected_size': {'required': False, 'allow_blank': True, 'allow_null': True},
            'selected_color': {'required': False, 'allow_blank': True, 'allow_null': True},
            'product_sku': {'required': False, 'allow_blank': True, 'allow_null': True},
        }

    def get_product_image(self, obj):
        """Get product primary image URL"""
        if obj.product:
            # Try to get primary image from prefetched images if available
            # Note: We might need to ensure images are prefetched in the viewset
            # For now, we'll try to access safely
            images = getattr(obj.product, 'images', None)
            if images:
                # If it's a queryset/manager
                if hasattr(images, 'all'):
                    primary = images.filter(is_primary=True).first()
                    if not primary:
                        primary = images.first()
                # If it's a list (prefetched)
                else:
                    try:
                        # Assuming list is ordered by is_primary
                        primary = images[0] if len(images) > 0 else None
                        # Or search for primary
                        for img in images:
                            if getattr(img, 'is_primary', False):
                                primary = img
                                break
                    except (IndexError, TypeError):
                        primary = None
                
                if primary and hasattr(primary, 'image_url'):
                    # reuse logic from ProductImageSerializer to normalize URL?
                    # duplicated logic is bad, but for now copying basic normalize logic
                    # ideally we should use ProductImageSerializer(primary).data['image_url']
                    # but we need context for request
                    return ProductImageSerializer(primary, context=self.context).data.get('image_url')
        return None

    def get_available_sizes(self, obj):
        product = getattr(obj, 'product', None)
        sizes = getattr(product, 'available_sizes', None) if product else None
        return [s for s in (sizes or []) if s]

    def get_available_colors(self, obj):
        product = getattr(obj, 'product', None)
        colors = getattr(product, 'available_colors', None) if product else None
        return [c for c in (colors or []) if c]

    def get_detail_slots(self, obj):
        """
        Returns a list with length == quantity so the checkout UI can render
        repeated size/color fields when quantity increases.
        """
        try:
            qty = int(getattr(obj, 'quantity', 0) or 0)
        except (TypeError, ValueError):
            qty = 0
        qty = max(0, qty)
        return [
            {
                'index': i + 1,
                'selected_size': getattr(obj, 'selected_size', None),
                'selected_color': getattr(obj, 'selected_color', None),
            }
            for i in range(qty)
        ]
    
    def validate_product(self, value):
        """Validate that the product exists and is available"""
        if not value:
            raise serializers.ValidationError("المنتج مطلوب")
        
        # Check if product exists
        try:
            product = Product.objects.get(id=value.id)
            if not product.is_active:
                raise serializers.ValidationError(f"المنتج '{product.name_ar}' غير متاح حالياً")
        except Product.DoesNotExist:
            raise serializers.ValidationError("المنتج المطلوب غير موجود. يرجى تحديث سلة التسوق والمحاولة مرة أخرى.")
        
        return value
    
    def validate(self, data):
        """Convert empty strings to None for optional fields"""
        if 'selected_size' in data and data['selected_size'] == '':
            data['selected_size'] = None
        if 'selected_color' in data and data['selected_color'] == '':
            data['selected_color'] = None
        if 'product_sku' in data and data['product_sku'] == '':
            data['product_sku'] = None
        return data


class ProductCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating/updating products"""
    images = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        write_only=True
    )
    # Allow Arabic/Unicode slugs (we already generate them with slugify(..., allow_unicode=True))
    slug = serializers.SlugField(required=False, allow_blank=True, allow_unicode=True)
    
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
        from django.utils.text import slugify
        import re
        
        images_data = validated_data.pop('images', [])
        
        # Auto-generate slug from name_ar if not provided or empty
        if not validated_data.get('slug'):
            base_slug = slugify(validated_data['name_ar'], allow_unicode=True)
            # Ensure slug is unique
            slug = base_slug
            counter = 1
            while Product.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            validated_data['slug'] = slug
        
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
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
            'governorate', 'district', 'village', 'detailed_address',
            'subtotal', 'discount_amount', 'shipping_cost', 'total', 
            'payment_method', 'payment_method_display', 'payment_screenshot',
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
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    
    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'customer_name', 'customer_phone', 'customer_email',
            'governorate', 'district', 'village', 'detailed_address', 'subtotal',
            'discount_amount', 'shipping_cost', 'total', 'payment_method', 'payment_method_display',
            'payment_screenshot', 'status', 'status_display',
            'customer_notes', 'admin_notes', 'items', 'status_history', 'created_at',
            'updated_at', 'confirmed_at', 'shipped_at', 'delivered_at', 'cancelled_at'
        ]
        read_only_fields = ['id', 'order_number', 'created_at', 'updated_at']


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders"""
    items = OrderItemSerializer(many=True)
    payment_screenshot = serializers.FileField(required=False, allow_null=True)
    coupon_code = serializers.CharField(required=False, allow_null=True, allow_blank=True, write_only=True)
    # Override subtotal and total to allow more precision from frontend
    subtotal = serializers.DecimalField(max_digits=50, decimal_places=20, required=True)
    total = serializers.DecimalField(max_digits=50, decimal_places=20, required=True)
    
    class Meta:
        model = Order
        fields = [
            'customer_name', 'customer_phone', 'customer_email', 'governorate',
            'district', 'village', 'detailed_address', 'subtotal', 'discount_amount',
            'shipping_cost', 'total', 'payment_method', 'payment_screenshot', 'customer_notes', 'items', 'coupon_code'
        ]
        extra_kwargs = {
            'district': {'required': False, 'allow_blank': True, 'allow_null': True},
            'village': {'required': False, 'allow_blank': True, 'allow_null': True},
            'customer_notes': {'required': False, 'allow_blank': True, 'allow_null': True},
            'customer_email': {'required': False, 'allow_blank': True, 'allow_null': True},
        }
    
    def validate(self, data):
        """Validate payment method, screenshot, and shipping cost"""
        from decimal import Decimal, ROUND_HALF_UP

        def to_decimal(value, default=Decimal('0')):
            try:
                return Decimal(str(value))
            except Exception:
                return default

        def money(value: Decimal) -> Decimal:
            return (value or Decimal('0')).quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

        def item_subtotal(item: dict) -> Decimal:
            """
            Compute an item subtotal consistently from the item payload.
            Prefer final_unit_price * quantity; fallback to provided subtotal.
            """
            qty_raw = item.get('quantity', 0)
            try:
                qty = int(qty_raw or 0)
            except (TypeError, ValueError):
                qty = 0
            qty = max(0, qty)

            unit = item.get('final_unit_price', None)
            if unit is None:
                unit = item.get('unit_price', 0)
            unit = to_decimal(unit)
            computed = unit * Decimal(qty)

            # If client provided subtotal, prefer computed for consistency unless missing
            provided = item.get('subtotal', None)
            if provided is None:
                return money(computed)
            return money(computed)

        payment_method = data.get('payment_method', 'cash_on_delivery')
        payment_screenshot = data.get('payment_screenshot')
        
        # If payment method is Vodafone Cash or Instapay, screenshot is required
        if payment_method in ['vodafone_cash', 'instapay']:
            if not payment_screenshot:
                raise serializers.ValidationError({
                    'payment_screenshot': 'Payment screenshot is required for this payment method.'
                })
            
            # Validate file size (20MB max)
            if payment_screenshot.size > 20 * 1024 * 1024:
                raise serializers.ValidationError({
                    'payment_screenshot': 'File size must not exceed 20MB.'
                })
            
            # Validate file type (images only)
            allowed_extensions = ['jpg', 'jpeg', 'png']
            file_extension = payment_screenshot.name.split('.')[-1].lower()
            if file_extension not in allowed_extensions:
                raise serializers.ValidationError({
                    'payment_screenshot': f'Only {", ".join(allowed_extensions)} files are allowed.'
                })
        
        # Validate shipping cost based on governorate (CRITICAL for price tampering prevention)
        governorate = data.get('governorate', '').strip()
        submitted_shipping_cost = data.get('shipping_cost', 0)
        
        if governorate:
            # Calculate expected shipping cost based on governorate
            expected_shipping_cost = get_shipping_cost(governorate)
            
            # Allow a small tolerance for floating point differences (0.01 EGP)
            if abs(Decimal(str(submitted_shipping_cost)) - Decimal(str(expected_shipping_cost))) > Decimal('0.01'):
                raise serializers.ValidationError({
                    'shipping_cost': f'Invalid shipping cost. Expected {expected_shipping_cost} EGP for {governorate}.'
                })
            
            # Update to exact expected value to prevent any discrepancies
            data['shipping_cost'] = expected_shipping_cost

        # Normalize subtotal from items (prevents frontend rounding/mismatch issues)
        items = data.get('items') or []
        if isinstance(items, list) and items:
            computed_subtotal = money(sum(item_subtotal(it) for it in items))
            submitted_subtotal = to_decimal(data.get('subtotal', computed_subtotal))
            if abs(money(submitted_subtotal) - computed_subtotal) > Decimal('0.01'):
                data['subtotal'] = computed_subtotal
            else:
                data['subtotal'] = money(submitted_subtotal)
        else:
            data['subtotal'] = money(to_decimal(data.get('subtotal', 0)))

        # If coupon_code is provided, compute discount server-side (best-effort)
        coupon_code = (data.get('coupon_code') or '').strip()
        if coupon_code:
            normalized_code = coupon_code.upper()
            discount = Decimal('0')

            # 1) Try Coupon (percentage, optional product restrictions)
            try:
                coupon = Coupon.objects.prefetch_related('products').get(code=normalized_code, is_active=True)
                if coupon.is_valid():
                    eligible_total = data['subtotal']
                    coupon_products = coupon.products.all()
                    if coupon_products.exists() and isinstance(items, list):
                        eligible_ids = {str(p.id) for p in coupon_products}
                        eligible_total = money(sum(
                            item_subtotal(it)
                            for it in items
                            if str(getattr(it.get('product', None), 'id', it.get('product', None))) in eligible_ids
                        ))
                    discount = (eligible_total * to_decimal(coupon.discount_percentage) / Decimal('100'))
            except Coupon.DoesNotExist:
                pass
            except Exception:
                # Keep going; don't block checkout due to coupon edge cases
                pass

            # 2) Try DiscountCode (percentage or fixed amount)
            if discount <= 0:
                try:
                    dc = DiscountCode.objects.get(code__iexact=normalized_code, is_active=True)
                    now = timezone.now()
                    if dc.valid_from and dc.valid_from > now:
                        dc = None
                    if dc and dc.valid_until and dc.valid_until < now:
                        dc = None
                    if dc and dc.usage_limit and dc.usage_count >= dc.usage_limit:
                        dc = None

                    if dc:
                        subtotal_val = to_decimal(data.get('subtotal', 0))
                        if subtotal_val >= to_decimal(dc.min_order_amount):
                            if dc.discount_type == 'percentage':
                                discount = (subtotal_val * to_decimal(dc.discount_value) / Decimal('100'))
                            else:
                                discount = to_decimal(dc.discount_value)
                            if dc.max_discount_amount:
                                discount = min(discount, to_decimal(dc.max_discount_amount))
                except DiscountCode.DoesNotExist:
                    pass
                except Exception:
                    pass

            # Clamp + round
            discount = money(max(Decimal('0'), min(discount, to_decimal(data.get('subtotal', 0)))))
            data['discount_amount'] = discount
        else:
            data['discount_amount'] = money(to_decimal(data.get('discount_amount', 0)))

        # Compute total server-side to prevent "Invalid total" failures from frontend mismatch
        # Always normalize all decimal values to 2 decimal places
        subtotal = money(to_decimal(data.get('subtotal', 0)))
        discount_amount = money(to_decimal(data.get('discount_amount', 0)))
        shipping_cost = money(to_decimal(data.get('shipping_cost', 0)))
        expected_total = money(subtotal - discount_amount + shipping_cost)
        data['subtotal'] = subtotal
        data['discount_amount'] = discount_amount
        data['shipping_cost'] = shipping_cost
        data['total'] = expected_total

        return data
    
    def create(self, validated_data):
        """Create order with items"""
        items_data = validated_data.pop('items')
        # Remove coupon_code as it's not a field in Order model (it's only used for tracking)
        coupon_code = validated_data.pop('coupon_code', None)

        # Attach customer if logged in
        customer = self.context.get('customer')
        if customer:
            validated_data['customer'] = customer

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
        # Include coupon code in notes if provided
        notes = 'تم إنشاء الطلب'
        if coupon_code:
            notes += f' - كوبون: {coupon_code}'
        
        OrderStatusHistory.objects.create(
            order=order,
            old_status=None,
            new_status='pending',
            notes=notes
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
    product_ids = serializers.ListField(child=serializers.UUIDField(), required=False, allow_empty=True)
    items = serializers.ListField(child=serializers.DictField(), required=False, allow_empty=True)
    amount = serializers.DecimalField(max_digits=50, decimal_places=20, required=False)

    def validate(self, data):
        """Validate coupon code"""
        code = data.get('code', '').strip().upper()
        product_id = data.get('product_id')
        product_ids = data.get('product_ids', [])
        items = data.get('items', [])
        
        # Merge single product_id into list for unified checking
        all_product_ids = set()
        if product_id:
            all_product_ids.add(str(product_id))
        if product_ids:
            for pid in product_ids:
                if pid:
                    all_product_ids.add(str(pid))
        
        # Also add product IDs from items if available
        if items:
            for item in items:
                pid = item.get('id') or item.get('product')
                if pid:
                    all_product_ids.add(str(pid))

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
            if not all_product_ids:
                raise serializers.ValidationError({"code": "هذا الكوبون مخصص لمنتجات معينة"})
            
            # Check if *any* of the provided product IDs are eligible
            # We convert coupon product IDs to strings for comparison
            eligible_ids = {str(p.id) for p in coupon_products}
            
            # Find intersection
            matching_products = all_product_ids.intersection(eligible_ids)
            
            if not matching_products:
                raise serializers.ValidationError({"code": "هذا الكوبون غير صالح لأي من المنتجات في السلة"})

            # Calculate eligible amount if items are provided
            if items:
                eligible_amount = Decimal('0')
                for item in items:
                    pid = str(item.get('id') or item.get('product') or '')
                    if pid in eligible_ids:
                        price = Decimal(str(item.get('price', 0)))
                        quantity = Decimal(str(item.get('quantity', 1)))
                        eligible_amount += price * quantity
                
                # Store eligible amount in data for view to use
                data['eligible_amount'] = eligible_amount
                
        # If no products specified in coupon, it works for all products
        
        # Check usage limit
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise serializers.ValidationError({"code": "تم تجاوز الحد الأقصى لاستخدام هذا الكوبون"})
        
        data['coupon'] = coupon
        return data


class PaymentNumberSerializer(serializers.ModelSerializer):
    """Serializer for PaymentNumber model"""
    payment_type_display = serializers.CharField(source='get_payment_type_display', read_only=True)
    
    class Meta:
        model = PaymentNumber
        fields = [
            'id', 'payment_type', 'payment_type_display', 'phone_number', 
            'account_name', 'is_active', 'display_order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


# ============================================================================
# CUSTOMER AUTHENTICATION SERIALIZERS
# ============================================================================

class CustomerRegisterSerializer(serializers.Serializer):
    """Serializer for customer registration"""
    first_name = serializers.CharField(max_length=100)
    last_name = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    password = serializers.CharField(min_length=8, write_only=True)
    password_confirm = serializers.CharField(write_only=True)

    def validate_email(self, value):
        if Customer.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("البريد الإلكتروني مسجل بالفعل.")
        return value

    def validate(self, data):
        if data.get('password') != data.get('password_confirm'):
            raise serializers.ValidationError({'password_confirm': 'كلمة المرور غير متطابقة.'})
        if len(data['password']) < 8:
            raise serializers.ValidationError({'password': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'})
        return data


class CustomerLoginSerializer(serializers.Serializer):
    """Serializer for customer login"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)


class CustomerProfileSerializer(serializers.ModelSerializer):
    """Serializer for customer profile"""
    class Meta:
        model = Customer
        fields = ['id', 'first_name', 'last_name', 'email', 'phone', 'is_verified', 'created_at']
        read_only_fields = ['id', 'email', 'is_verified', 'created_at']


class CustomerChangePasswordSerializer(serializers.Serializer):
    """Serializer for changing password"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'كلمة المرور الجديدة غير متطابقة.'})
        if len(data['new_password']) < 8:
            raise serializers.ValidationError({'new_password': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'})
        return data


class CustomerPasswordResetRequestSerializer(serializers.Serializer):
    """Serializer for password reset request"""
    email = serializers.EmailField()


class CustomerPasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation"""
    token = serializers.CharField()
    new_password = serializers.CharField(min_length=8, write_only=True)
    new_password_confirm = serializers.CharField(write_only=True)

    def validate(self, data):
        if data['new_password'] != data['new_password_confirm']:
            raise serializers.ValidationError({'new_password_confirm': 'كلمة المرور غير متطابقة.'})
        if len(data['new_password']) < 8:
            raise serializers.ValidationError({'new_password': 'كلمة المرور يجب أن تكون 8 أحرف على الأقل.'})
        return data


class CustomerResendVerificationSerializer(serializers.Serializer):
    """Serializer for resending verification email"""
    email = serializers.EmailField()


# ============================================================================
# CUSTOMER ORDERS SERIALIZERS
# ============================================================================

class CustomerOrderItemSerializer(serializers.ModelSerializer):
    """Lightweight OrderItem serializer for customer order detail"""
    product_image = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            'product_name_ar', 'product_sku', 'selected_size', 'selected_color',
            'quantity', 'unit_price', 'final_unit_price', 'subtotal', 'product_image'
        ]

    def get_product_image(self, obj):
        if obj.product:
            images = getattr(obj.product, 'images', None)
            if images and hasattr(images, 'all'):
                primary = images.filter(is_primary=True).first() or images.first()
                if primary and hasattr(primary, 'image_url') and primary.image_url:
                    request = self.context.get('request')
                    url = primary.image_url
                    if url.startswith('http'):
                        return url
                    if request:
                        if url.startswith('media/') or url.startswith('/media/'):
                            return request.build_absolute_uri('/' + url.lstrip('/'))
                        return request.build_absolute_uri(settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}'))
                    return settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}')
        return None


class CustomerOrderStatusHistorySerializer(serializers.ModelSerializer):
    """Lightweight status history for customer order detail"""
    status_label_ar = serializers.SerializerMethodField()

    class Meta:
        model = OrderStatusHistory
        fields = ['new_status', 'status_label_ar', 'notes', 'created_at']

    def get_status_label_ar(self, obj):
        from .order_constants import STATUS_LABELS_AR
        return STATUS_LABELS_AR.get(obj.new_status, obj.new_status)


class CustomerOrderListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing customer orders"""
    items_count = serializers.SerializerMethodField()
    first_item_image = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    total_amount = serializers.DecimalField(source='total', max_digits=20, decimal_places=2)
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'total_amount',
            'shipping_cost', 'created_at', 'items_count', 'first_item_image', 'can_cancel'
        ]

    def get_items_count(self, obj):
        return obj.items.count()

    def get_first_item_image(self, obj):
        first_item = obj.items.select_related('product').prefetch_related('product__images').first()
        if not first_item or not first_item.product:
            return None
        images = first_item.product.images.all().order_by('-is_primary', 'display_order')
        primary = images.filter(is_primary=True).first() or images.first()
        if not primary or not primary.image_url:
            return None
        request = self.context.get('request')
        url = primary.image_url
        if url.startswith('http'):
            return url
        if request:
            if url.startswith('media/') or url.startswith('/media/'):
                return request.build_absolute_uri('/' + url.lstrip('/'))
            return request.build_absolute_uri(settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}'))
        return settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}')

    def get_can_cancel(self, obj):
        return obj.status in ('pending', 'confirmed')

    def get_status_display(self, obj):
        from .order_constants import STATUS_LABELS_AR
        return STATUS_LABELS_AR.get(obj.status, obj.get_status_display())


class CustomerOrderDetailSerializer(serializers.ModelSerializer):
    """Full serializer for customer order detail"""
    items = CustomerOrderItemSerializer(many=True, read_only=True)
    status_history = CustomerOrderStatusHistorySerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()
    first_item_image = serializers.SerializerMethodField()
    can_cancel = serializers.SerializerMethodField()
    total_amount = serializers.DecimalField(source='total', max_digits=20, decimal_places=2)
    status_display = serializers.SerializerMethodField()
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)
    customer_address = serializers.SerializerMethodField()
    payment_status = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id', 'order_number', 'status', 'status_display', 'total_amount',
            'shipping_cost', 'discount_amount', 'created_at', 'items_count',
            'first_item_image', 'can_cancel', 'customer_name', 'customer_phone',
            'customer_email', 'customer_address', 'governorate', 'district', 'village',
            'detailed_address', 'payment_method', 'payment_method_display',
            'payment_status', 'customer_notes', 'items', 'status_history'
        ]

    def get_items_count(self, obj):
        return obj.items.count()

    def get_first_item_image(self, obj):
        first_item = obj.items.select_related('product').prefetch_related('product__images').first()
        if not first_item or not first_item.product:
            return None
        images = first_item.product.images.all().order_by('-is_primary', 'display_order')
        primary = images.filter(is_primary=True).first() or images.first()
        if not primary or not primary.image_url:
            return None
        request = self.context.get('request')
        url = primary.image_url
        if url.startswith('http'):
            return url
        if request:
            if url.startswith('media/') or url.startswith('/media/'):
                return request.build_absolute_uri('/' + url.lstrip('/'))
            return request.build_absolute_uri(settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}'))
        return settings.MEDIA_URL + (url if url.startswith('products/') else f'products/{url}')

    def get_can_cancel(self, obj):
        return obj.status in ('pending', 'confirmed')

    def get_status_display(self, obj):
        from .order_constants import STATUS_LABELS_AR
        return STATUS_LABELS_AR.get(obj.status, obj.get_status_display())

    def get_customer_address(self, obj):
        parts = [obj.detailed_address or '', obj.district or '', obj.village or '', obj.governorate]
        return '، '.join(p for p in parts if p)

    def get_payment_status(self, obj):
        if obj.payment_method == 'cash_on_delivery':
            return 'الدفع عند الاستلام'
        return 'في انتظار التأكيد'


