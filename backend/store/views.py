from rest_framework import viewsets, status, filters, serializers
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from django.db.models import Q, Count, Sum, Avg, F, Prefetch
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import os
import io
import logging
import secrets
from PIL import Image as PILImage
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.contrib.auth.hashers import make_password, check_password
from django.utils.decorators import method_decorator
from django.views.decorators.cache import cache_page

logger = logging.getLogger(__name__)


def compress_image_to_webp(uploaded_file, max_size=1200, quality=82):
    """Compress an uploaded image to WebP format, returning (ContentFile, filename_with_webp_ext)."""
    try:
        img = PILImage.open(uploaded_file)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((max_size, max_size), PILImage.LANCZOS)
        buffer = io.BytesIO()
        img.save(buffer, format='WEBP', quality=quality)
        buffer.seek(0)
        return ContentFile(buffer.read()), True
    except Exception as e:
        logger.warning(f"Image compression failed, saving original: {e}")
        uploaded_file.seek(0)
        return ContentFile(uploaded_file.read()), False

from .models import (
    Category, Brand, Product, ProductImage, Order, OrderItem,
    OrderStatusHistory, Review, AdminUser, Banner, ShippingZone,
    DiscountCode, SiteSetting, Coupon, PaymentNumber, Customer, CustomerToken
)
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductImageSerializer, OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    OrderItemSerializer, OrderStatusHistorySerializer, ReviewSerializer,
    AdminUserSerializer, AdminLoginSerializer, BannerSerializer, ShippingZoneSerializer,
    DiscountCodeSerializer, SiteSettingSerializer, CouponSerializer, CouponValidateSerializer,
    PaymentNumberSerializer,
    CustomerRegisterSerializer, CustomerLoginSerializer, CustomerProfileSerializer,
    CustomerChangePasswordSerializer, CustomerPasswordResetRequestSerializer,
    CustomerPasswordResetConfirmSerializer, CustomerResendVerificationSerializer,
    CustomerOrderListSerializer, CustomerOrderDetailSerializer,
)
from .shipping_utils import get_shipping_cost, is_valid_governorate
from .customer_auth import get_customer_from_request
from .email_utils import send_verification_email, send_password_reset_email
from .order_constants import STATUS_LABELS_AR


@method_decorator(cache_page(60 * 15), name='list')
class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet for Category model"""
    queryset = Category.objects.filter(is_active=True).annotate(products_count=Count('products'))
    serializer_class = CategorySerializer
    lookup_field = 'slug'
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_ar', 'name_en']
    ordering_fields = ['display_order', 'name_ar', 'created_at']
    ordering = ['display_order']
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def main_categories(self, request):
        """Get only main categories (no parent)"""
        categories = Category.objects.filter(is_active=True, parent__isnull=True)
        serializer = self.get_serializer(categories, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        """Upload category image"""
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES['image']
        
        import uuid
        content, compressed = compress_image_to_webp(image)
        ext = '.webp' if compressed else os.path.splitext(image.name)[1]
        filename = f"categories/{uuid.uuid4()}{ext}"
        
        path = default_storage.save(filename, content)
        url = request.build_absolute_uri(settings.MEDIA_URL + path)
        
        return Response({'url': url})


class BrandViewSet(viewsets.ModelViewSet):
    """ViewSet for Brand model"""
    queryset = Brand.objects.filter(is_active=True)
    serializer_class = BrandSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_ar', 'name_en']
    ordering_fields = ['name_ar', 'created_at']
    ordering = ['name_ar']
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


@method_decorator(cache_page(60 * 15), name='list')
class ProductViewSet(viewsets.ModelViewSet):
    """ViewSet for Product model"""
    queryset = Product.objects.filter(is_active=True).select_related('category', 'brand').prefetch_related(
        Prefetch(
            'images',
            queryset=ProductImage.objects.order_by('-is_primary', 'display_order').only('id', 'product_id', 'image_url', 'is_primary', 'display_order')
        )
    ).only(
        'id', 'sku', 'name_ar', 'name_en', 'slug', 'price', 'discount_percentage',
        'category_id', 'brand_id', 'stock_quantity', 'is_in_stock', 'is_featured',
        'is_new', 'is_on_sale', 'average_rating', 'review_count', 'available_sizes',
        'available_colors', 'display_order', 'created_at'
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name_ar', 'name_en', 'sku', 'description_ar']
    ordering_fields = ['price', 'created_at', 'average_rating', 'sales_count', 'views_count', 'display_order']
    ordering = ['display_order', '-created_at']  # display_order first, then newest
    lookup_field = 'slug'
    
    def get_serializer_class(self):
        """Use detailed serializer for retrieve action"""
        if self.action == 'retrieve':
            return ProductDetailSerializer
        if self.action in ['create', 'update', 'partial_update']:
            return ProductCreateSerializer
        return ProductListSerializer
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve', 'featured', 'new_arrivals', 'on_sale', 'by_category']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter products based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by category
        category_slug = self.request.query_params.get('category')
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        # Exclude category
        exclude_category = self.request.query_params.get('exclude_category')
        if exclude_category:
            queryset = queryset.exclude(category__slug=exclude_category)
        
        # Filter by brand
        brand_id = self.request.query_params.get('brand')
        if brand_id:
            queryset = queryset.filter(brand_id=brand_id)
        
        # Filter by price range
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)
        
        # Filter by size
        size = self.request.query_params.get('size')
        if size:
            queryset = queryset.filter(available_sizes__contains=[size])
        
        # Filter by color
        color = self.request.query_params.get('color')
        if color:
            queryset = queryset.filter(available_colors__contains=[color])
        
        # Filter by in stock
        in_stock = self.request.query_params.get('in_stock')
        if in_stock == 'true':
            queryset = queryset.filter(is_in_stock=True, stock_quantity__gt=0)

        # Filter by on sale (Special Offers) or minimum discount
        is_on_sale = self.request.query_params.get('is_on_sale')
        if is_on_sale == 'true':
            queryset = queryset.filter(is_on_sale=True)
            
        # Filter by minimum discount percentage
        min_discount = self.request.query_params.get('min_discount')
        if min_discount:
            try:
                min_discount_val = int(min_discount)
                queryset = queryset.filter(discount_percentage__gte=min_discount_val)
            except ValueError:
                pass # Ignore invalid integer values
        
        return queryset
    
    def get_object(self):
        """Allow lookup by slug or id (UUID)"""
        queryset = self.filter_queryset(self.get_queryset())
        lookup_url_kwarg = self.lookup_url_kwarg or self.lookup_field
        lookup = self.kwargs.get(lookup_url_kwarg)

        # Try to match by UUID (id) if it looks like one
        try:
            import uuid
            uuid_obj = uuid.UUID(lookup)
            # If successful, try to get object by ID
            obj = queryset.get(id=uuid_obj)
            self.check_object_permissions(self.request, obj)
            return obj
        except (ValueError, Product.DoesNotExist):
            pass

        # Fallback to default behavior (slug)
        return super().get_object()

    def retrieve(self, request, *args, **kwargs):
        """Increment views count when product is viewed"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @method_decorator(cache_page(60 * 15))
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """Get featured products"""
        products = self.get_queryset().filter(is_featured=True)[:12]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def new_arrivals(self, request):
        """Get new arrival products"""
        products = self.get_queryset().filter(is_new=True).order_by('-created_at')[:12]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def on_sale(self, request):
        """Get products on sale"""
        products = self.get_queryset().filter(is_on_sale=True, discount_percentage__gt=0)[:12]
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def related(self, request, slug=None):
        """Get related products (same category)"""
        product = self.get_object()
        related = self.get_queryset().filter(
            category=product.category
        ).exclude(id=product.id)[:8]
        serializer = self.get_serializer(related, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'], parser_classes=[MultiPartParser, FormParser])
    def upload_image(self, request):
        """Upload product image"""
        if 'image' not in request.FILES:
            return Response({'error': 'No image provided'}, status=status.HTTP_400_BAD_REQUEST)
        
        image = request.FILES['image']
        
        import uuid
        content, compressed = compress_image_to_webp(image)
        ext = '.webp' if compressed else os.path.splitext(image.name)[1]
        filename = f"products/{uuid.uuid4()}{ext}"
        
        path = default_storage.save(filename, content)
        url = request.build_absolute_uri(settings.MEDIA_URL + path)
        
        return Response({'url': url})
    
    @action(detail=False, methods=['post'], permission_classes=[IsAdminUser])
    def reorder(self, request):
        """Bulk update display_order for multiple products"""
        # Expected format: {"products": [{"id": "uuid", "display_order": 1}, ...]}
        products_data = request.data.get('products', [])
        
        if not products_data or not isinstance(products_data, list):
            return Response(
                {'error': 'يجب إرسال قائمة من المنتجات مع display_order'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            with transaction.atomic():
                for item in products_data:
                    product_id = item.get('id')
                    display_order = item.get('display_order')
                    
                    if not product_id or display_order is None:
                        continue
                    
                    Product.objects.filter(id=product_id).update(display_order=display_order)
            
            return Response({
                'success': True,
                'message': f'تم تحديث ترتيب {len(products_data)} منتج بنجاح'
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {'error': f'حدث خطأ أثناء تحديث الترتيب: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class OrderViewSet(viewsets.ModelViewSet):
    """ViewSet for Order model"""
    queryset = Order.objects.all().prefetch_related(
        Prefetch('items', queryset=OrderItem.objects.select_related('product')),
        'status_history',
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    ordering_fields = ['created_at', 'total', 'status']
    ordering = ['-created_at']
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'create':
            return OrderCreateSerializer
        elif self.action == 'retrieve':
            return OrderDetailSerializer
        return OrderListSerializer
    
    def get_permissions(self):
        """Public create access, admin read/update access"""
        if self.action == 'create':
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter orders based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by governorate
        governorate = self.request.query_params.get('governorate')
        if governorate:
            queryset = queryset.filter(governorate=governorate)
        
        # Filter by date range
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        if start_date:
            queryset = queryset.filter(created_at__gte=start_date)
        if end_date:
            queryset = queryset.filter(created_at__lte=end_date)
        
        return queryset
    
    def create(self, request, *args, **kwargs):
        """Create a new order"""
        import json
        from django.core.exceptions import ObjectDoesNotExist
        
        # Build data dict to handle both JSON and FormData
        data = {}
        
        # Copy all request data
        for key, value in request.data.items():
            data[key] = value
        
        # Handle items field - parse JSON string if present (FormData case)
        if 'items' in data and isinstance(data['items'], str):
            try:
                data['items'] = json.loads(data['items'])
            except (json.JSONDecodeError, TypeError) as e:
                return Response(
                    {'items': [f'Invalid JSON format: {str(e)}']},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        # Try to attach to customer account if logged in
        customer = None
        try:
            customer = get_customer_from_request(request)
        except Exception:
            pass  # Guest order, no problem

        try:
            serializer = self.get_serializer(data=data, context={'request': request, 'customer': customer})
            serializer.is_valid(raise_exception=True)
            order = serializer.save()
        except ObjectDoesNotExist as e:
            return Response(
                {'error': 'أحد المنتجات في السلة لم يعد متوفراً. يرجى تحديث سلة التسوق والمحاولة مرة أخرى.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        except serializers.ValidationError as e:
            # Return validation errors directly
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Order validation error: {str(e.detail)}")
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Order creation error: {str(e)}", exc_info=True)
            # Return the actual error message for debugging
            return Response(
                {'error': f'حدث خطأ أثناء إنشاء الطلب: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update product sales count and stock
        for item in order.items.all():
            product = item.product
            product.sales_count += item.quantity
            product.stock_quantity -= item.quantity
            if product.stock_quantity <= 0:
                product.is_in_stock = False
            product.save(update_fields=['sales_count', 'stock_quantity', 'is_in_stock'])
        
        # Return detailed order
        detail_serializer = OrderDetailSerializer(order)
        return Response(detail_serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update order status"""
        order = self.get_object()
        new_status = request.data.get('status')
        notes = request.data.get('notes', '')
        
        if not new_status:
            return Response({'error': 'Status is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        old_status = order.status
        order.status = new_status
        
        # Update timestamps based on status
        if new_status == 'confirmed':
            order.confirmed_at = timezone.now()
        elif new_status == 'shipped':
            order.shipped_at = timezone.now()
        elif new_status == 'delivered':
            order.delivered_at = timezone.now()
        elif new_status == 'cancelled':
            order.cancelled_at = timezone.now()
            # Restore product stock
            for item in order.items.all():
                product = item.product
                product.stock_quantity += item.quantity
                product.is_in_stock = True
                product.save(update_fields=['stock_quantity', 'is_in_stock'])
        
        order.save()
        
        # Create status history
        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user if request.user.is_authenticated else None,
            notes=notes
        )
        
        serializer = OrderDetailSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get order statistics"""
        # Overall stats
        total_orders = Order.objects.count()
        pending_orders = Order.objects.filter(status='pending').count()
        confirmed_orders = Order.objects.filter(status='confirmed').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()
        
        # Revenue stats
        total_revenue = Order.objects.filter(
            status__in=['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # Today's stats
        today = timezone.now().date()
        today_orders = Order.objects.filter(created_at__date=today).count()
        today_revenue = Order.objects.filter(
            created_at__date=today,
            status__in=['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        # This month's stats
        first_day_of_month = today.replace(day=1)
        month_orders = Order.objects.filter(created_at__gte=first_day_of_month).count()
        month_revenue = Order.objects.filter(
            created_at__gte=first_day_of_month,
            status__in=['confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered']
        ).aggregate(total=Sum('total'))['total'] or 0
        
        return Response({
            'total_orders': total_orders,
            'pending_orders': pending_orders,
            'confirmed_orders': confirmed_orders,
            'delivered_orders': delivered_orders,
            'cancelled_orders': cancelled_orders,
            'total_revenue': float(total_revenue),
            'today_orders': today_orders,
            'today_revenue': float(today_revenue),
            'month_orders': month_orders,
            'month_revenue': float(month_revenue),
        })


class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review model"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['created_at', 'rating', 'helpful_count']
    ordering = ['-created_at']
    
    def get_permissions(self):
        """Public create access, public read approved reviews, admin full access"""
        if self.action in ['create']:
            return [AllowAny()]
        elif self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter reviews"""
        queryset = super().get_queryset()
        
        # Non-admin users see only approved reviews
        if not (self.request.user and self.request.user.is_staff):
            queryset = queryset.filter(is_approved=True)
        
        # Filter by product
        product_id = self.request.query_params.get('product')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
        return queryset
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """Approve a review"""
        review = self.get_object()
        review.is_approved = True
        review.save()
        
        # Update product rating
        product = review.product
        avg_rating = Review.objects.filter(
            product=product, is_approved=True
        ).aggregate(avg=Avg('rating'))['avg'] or 0
        review_count = Review.objects.filter(product=product, is_approved=True).count()
        
        product.average_rating = round(avg_rating, 1)
        product.review_count = review_count
        product.save(update_fields=['average_rating', 'review_count'])
        
        serializer = self.get_serializer(review)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        """Mark review as helpful"""
        review = self.get_object()
        review.helpful_count += 1
        review.save(update_fields=['helpful_count'])
        serializer = self.get_serializer(review)
        return Response(serializer.data)


class BannerViewSet(viewsets.ModelViewSet):
    """ViewSet for Banner model"""
    queryset = Banner.objects.filter(is_active=True).order_by('display_order')
    serializer_class = BannerSerializer
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter active banners within valid dates"""
        queryset = super().get_queryset()
        now = timezone.now()
        
        # Filter by date range if specified
        queryset = queryset.filter(
            Q(start_date__isnull=True) | Q(start_date__lte=now),
            Q(end_date__isnull=True) | Q(end_date__gte=now)
        )
        
        return queryset


class ShippingZoneViewSet(viewsets.ModelViewSet):
    """ViewSet for ShippingZone model"""
    queryset = ShippingZone.objects.filter(is_active=True)
    serializer_class = ShippingZoneSerializer
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve', 'get_shipping_cost']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    @action(detail=False, methods=['get'])
    def get_shipping_cost(self, request):
        """Get shipping cost for a governorate using 3-tier zonal pricing"""
        governorate = request.query_params.get('governorate')
        if not governorate:
            return Response({'error': 'Governorate is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Use new zonal pricing system
        shipping_cost = get_shipping_cost(governorate)
        
        # Determine estimated delivery days based on tier
        if shipping_cost == 60:
            estimated_days = '2-4 أيام'
        elif shipping_cost == 100:
            estimated_days = '3-5 أيام'
        else:  # 120 EGP
            estimated_days = '4-7 أيام'
        
        return Response({
            'governorate': governorate,
            'shipping_cost': shipping_cost,
            'estimated_days': estimated_days
        })


class SiteSettingViewSet(viewsets.ModelViewSet):
    """ViewSet for SiteSetting model"""
    queryset = SiteSetting.objects.all()
    serializer_class = SiteSettingSerializer
    lookup_field = 'key'
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class CouponViewSet(viewsets.ModelViewSet):
    """ViewSet for Coupon model"""
    queryset = Coupon.objects.all().prefetch_related('products')
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]  # Only admins can manage coupons
    lookup_field = 'id'

    def get_queryset(self):
        """Filter coupons based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by product if provided
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(products__id=product_id).distinct()
        
        # Filter active coupons only (for public listing)
        active_only = self.request.query_params.get('active_only', 'false').lower() == 'true'
        if active_only:
            now = timezone.now()
            queryset = queryset.filter(
                is_active=True,
                valid_from__lte=now,
                valid_to__gte=now
            )
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """Override create to handle errors better"""
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except serializers.ValidationError as e:
            # Return validation errors properly
            return Response(e.detail, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            import traceback
            error_msg = str(e)
            traceback_str = traceback.format_exc()
            print(f"Error creating coupon: {error_msg}")
            print(traceback_str)
            # Return a more user-friendly error message
            return Response(
                {
                    'detail': error_msg,
                    'error': 'حدث خطأ أثناء إنشاء الكوبون. تأكد من صحة البيانات المدخلة.'
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def validate(self, request):
        """Validate a coupon code"""
        serializer = CouponValidateSerializer(data=request.data)
        if serializer.is_valid():
            coupon = serializer.validated_data['coupon']
            amount = serializer.validated_data.get('amount', 0)
            eligible_amount = serializer.validated_data.get('eligible_amount')
            
            # Use eligible_amount as base if available, otherwise amount
            base_amount = eligible_amount if eligible_amount is not None else (amount or 0)
            
            discount_amount = (float(base_amount) * float(coupon.discount_percentage)) / 100
            final_amount = float(amount or 0) - discount_amount
            
            return Response({
                'valid': True,
                'coupon': CouponSerializer(coupon).data,
                'discount_percentage': float(coupon.discount_percentage),
                'discount_amount': discount_amount,
                'final_amount': final_amount,
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def increment_usage(self, request, id=None):
        """Increment coupon usage count (called after order is placed)"""
        coupon = self.get_object()
        coupon.used_count += 1
        coupon.save(update_fields=['used_count'])
        return Response({'message': 'تم تحديث عدد مرات الاستخدام'}, status=status.HTTP_200_OK)


# Admin Authentication Views
@api_view(['POST'])
@permission_classes([AllowAny])
def admin_login(request):
    """Admin login endpoint"""
    serializer = AdminLoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.validated_data['user']
    
    # Update last login
    user.last_login = timezone.now()
    user.save(update_fields=['last_login'])
    
    # Get or create token
    token, created = Token.objects.get_or_create(user=user)
    
    return Response({
        'token': token.key,
        'user': AdminUserSerializer(user).data
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def admin_logout(request):
    """Admin logout endpoint"""
    # Delete token
    request.user.auth_token.delete()
    return Response({'message': 'تم تسجيل الخروج بنجاح'})


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def admin_profile(request):
    """Get current admin profile"""
    serializer = AdminUserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({'status': 'ok', 'message': 'Izaar API is running'})


class PaymentNumberViewSet(viewsets.ModelViewSet):
    """ViewSet for PaymentNumber model - Public read, admin write"""
    queryset = PaymentNumber.objects.filter(is_active=True).order_by('payment_type', 'display_order')
    serializer_class = PaymentNumberSerializer
    
    def get_permissions(self):
        """Public read access, admin write access"""
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]
    
    def get_queryset(self):
        """Filter by payment_type if provided"""
        queryset = super().get_queryset()
        payment_type = self.request.query_params.get('payment_type')
        if payment_type:
            queryset = queryset.filter(payment_type=payment_type)
        return queryset


# ============================================================================
# CUSTOMER AUTHENTICATION VIEWS
# ============================================================================

class CustomerRegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        token = secrets.token_urlsafe(32)
        try:
            customer = Customer.objects.create(
                first_name=data['first_name'],
                last_name=data['last_name'],
                email=data['email'].lower().strip(),
                phone=data.get('phone') or None,
                password=make_password(data['password']),
                is_active=False,
                is_verified=False,
                email_verification_token=token,
                email_verification_sent_at=timezone.now(),
            )
        except Exception as e:
            logger.exception("Customer registration failed: %s", e)
            return Response(
                {'error': 'حدث خطأ أثناء إنشاء الحساب. يرجى المحاولة لاحقاً.'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        try:
            send_verification_email(customer)
        except Exception as e:
            logger.warning("Verification email send failed (account created): %s", e)
        return Response({'message': 'تم إنشاء حسابك. يرجى تفعيل بريدك الإلكتروني.'}, status=status.HTTP_201_CREATED)


class CustomerVerifyEmailView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        token = request.query_params.get('token')
        if not token:
            return Response({'error': 'رابط التفعيل غير صالح.'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            customer = Customer.objects.get(email_verification_token=token)
        except Customer.DoesNotExist:
            return Response({'error': 'رابط التفعيل غير صالح أو منتهي.'}, status=status.HTTP_400_BAD_REQUEST)

        sent_at = customer.email_verification_sent_at
        if sent_at and (timezone.now() - sent_at) > timedelta(hours=24):
            customer.email_verification_token = None
            customer.email_verification_sent_at = None
            customer.save(update_fields=['email_verification_token', 'email_verification_sent_at'])
            return Response({'error': 'انتهت صلاحية رابط التفعيل. يرجى طلب إرسال رابط جديد.'}, status=status.HTTP_400_BAD_REQUEST)

        customer.is_active = True
        customer.is_verified = True
        customer.email_verification_token = None
        customer.email_verification_sent_at = None
        customer.save(update_fields=['is_active', 'is_verified', 'email_verification_token', 'email_verification_sent_at'])

        return Response({'message': 'تم تفعيل حسابك بنجاح!'})


class CustomerLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        email = data['email'].lower().strip()
        password = data['password']

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response({'detail': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'}, status=status.HTTP_401_UNAUTHORIZED)

        if not customer.is_active:
            return Response({
                'detail': 'الحساب غير مفعل. يرجى تفعيل بريدك الإلكتروني أولاً.',
                'unverified': True,
                'email': customer.email,
            }, status=status.HTTP_403_FORBIDDEN)

        if not check_password(password, customer.password):
            return Response({'detail': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.'}, status=status.HTTP_401_UNAUTHORIZED)

        # Auto-link past guest orders by email
        Order.objects.filter(
            customer_email__iexact=customer.email,
            customer__isnull=True
        ).update(customer=customer)

        # Create or update CustomerToken
        token_key = secrets.token_urlsafe(40)
        CustomerToken.objects.update_or_create(
            customer=customer,
            defaults={'key': token_key}
        )

        profile = CustomerProfileSerializer(customer).data
        return Response({'token': token_key, 'customer': profile})


class CustomerLogoutView(APIView):
    def post(self, request):
        customer = get_customer_from_request(request)
        CustomerToken.objects.filter(customer=customer).delete()
        return Response({'message': 'تم تسجيل الخروج.'})


class CustomerProfileView(APIView):
    def get(self, request):
        customer = get_customer_from_request(request)
        serializer = CustomerProfileSerializer(customer)
        return Response(serializer.data)

    def patch(self, request):
        customer = get_customer_from_request(request)
        serializer = CustomerProfileSerializer(customer, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class CustomerChangePasswordView(APIView):
    def post(self, request):
        customer = get_customer_from_request(request)
        serializer = CustomerChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        if not check_password(data['old_password'], customer.password):
            return Response({'old_password': ['كلمة المرور الحالية غير صحيحة.']}, status=status.HTTP_400_BAD_REQUEST)

        customer.password = make_password(data['new_password'])
        customer.save(update_fields=['password'])
        return Response({'message': 'تم تغيير كلمة المرور بنجاح.'})


class CustomerPasswordResetRequestView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerPasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()

        try:
            customer = Customer.objects.get(email=email)
            token = secrets.token_urlsafe(32)
            customer.password_reset_token = token
            customer.password_reset_sent_at = timezone.now()
            customer.save(update_fields=['password_reset_token', 'password_reset_sent_at'])
            send_password_reset_email(customer)
        except Customer.DoesNotExist:
            pass

        return Response({'message': 'إذا كان البريد الإلكتروني مسجلاً، ستصلك رسالة لإعادة تعيين كلمة المرور.'})


class CustomerPasswordResetConfirmView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerPasswordResetConfirmSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        try:
            customer = Customer.objects.get(password_reset_token=data['token'])
        except Customer.DoesNotExist:
            return Response({'error': 'الرابط غير صالح أو منتهي.'}, status=status.HTTP_400_BAD_REQUEST)

        sent_at = customer.password_reset_sent_at
        if sent_at and (timezone.now() - sent_at) > timedelta(hours=1):
            customer.password_reset_token = None
            customer.password_reset_sent_at = None
            customer.save(update_fields=['password_reset_token', 'password_reset_sent_at'])
            return Response({'error': 'انتهت صلاحية الرابط. يرجى طلب إعادة تعيين كلمة المرور مرة أخرى.'}, status=status.HTTP_400_BAD_REQUEST)

        customer.password = make_password(data['new_password'])
        customer.password_reset_token = None
        customer.password_reset_sent_at = None
        customer.save(update_fields=['password', 'password_reset_token', 'password_reset_sent_at'])

        return Response({'message': 'تم تغيير كلمة المرور بنجاح.'})


class CustomerResendVerificationView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = CustomerResendVerificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].lower().strip()

        try:
            customer = Customer.objects.get(email=email)
        except Customer.DoesNotExist:
            return Response({'message': 'إذا كان البريد مسجلاً ولم يكن مفعلاً، سنرسل لك رابط التفعيل.'})

        if customer.is_verified:
            return Response({'message': 'الحساب مفعل بالفعل. يمكنك تسجيل الدخول.'})

        sent_at = customer.email_verification_sent_at
        if sent_at and (timezone.now() - sent_at) < timedelta(minutes=2):
            return Response({'error': 'يرجى الانتظار دقيقتين قبل طلب إعادة الإرسال.'}, status=status.HTTP_429_TOO_MANY_REQUESTS)

        token = secrets.token_urlsafe(32)
        customer.email_verification_token = token
        customer.email_verification_sent_at = timezone.now()
        customer.save(update_fields=['email_verification_token', 'email_verification_sent_at'])
        send_verification_email(customer)

        return Response({'message': 'تم إرسال رابط التفعيل إلى بريدك الإلكتروني.'})


# ============================================================================
# CUSTOMER ORDERS VIEWS
# ============================================================================

from django.core.paginator import Paginator, EmptyPage


class CustomerOrderListView(APIView):
    """GET /api/auth/orders/ - List orders for authenticated customer"""

    def get(self, request):
        customer = get_customer_from_request(request)
        queryset = Order.objects.filter(customer=customer).prefetch_related(
            Prefetch('items', queryset=OrderItem.objects.select_related('product').prefetch_related('product__images'))
        ).order_by('-created_at')

        status_filter = request.query_params.get('status', '').strip()
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        search = request.query_params.get('search', '').strip()
        if search:
            queryset = queryset.filter(order_number__icontains=search)

        paginator = Paginator(queryset, 10)
        page_num = request.query_params.get('page', 1)
        try:
            page = paginator.page(int(page_num))
        except (ValueError, EmptyPage):
            page = paginator.page(1)

        serializer = CustomerOrderListSerializer(page.object_list, many=True, context={'request': request})
        base = request.build_absolute_uri(request.path)
        def build_page_url(p):
            q = request.GET.copy()
            q['page'] = p
            return f"{base}?{q.urlencode()}"

        next_url = build_page_url(page.next_page_number()) if page.has_next() else None
        prev_url = build_page_url(page.previous_page_number()) if page.has_previous() else None

        return Response({
            'count': paginator.count,
            'next': next_url,
            'previous': prev_url,
            'results': serializer.data,
            'current_page': page.number,
            'total_pages': paginator.num_pages,
        })


class CustomerOrderDetailView(APIView):
    """GET /api/auth/orders/<order_number>/ - Detail for single order"""

    def get(self, request, order_number):
        customer = get_customer_from_request(request)
        try:
            order = Order.objects.prefetch_related(
                Prefetch('items', queryset=OrderItem.objects.select_related('product').prefetch_related('product__images')),
                'status_history'
            ).get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'الطلب غير موجود.'}, status=status.HTTP_404_NOT_FOUND)

        if order.customer_id != customer.id:
            return Response({'error': 'لا يمكنك عرض هذا الطلب.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = CustomerOrderDetailSerializer(order, context={'request': request})
        data = serializer.data
        data['status_label_ar'] = STATUS_LABELS_AR.get(order.status, order.get_status_display())
        return Response(data)


class CustomerOrderCancelView(APIView):
    """POST /api/auth/orders/<order_number>/cancel/ - Cancel order"""

    def post(self, request, order_number):
        customer = get_customer_from_request(request)
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response({'error': 'الطلب غير موجود.'}, status=status.HTTP_404_NOT_FOUND)

        if order.customer_id != customer.id:
            return Response({'error': 'لا يمكنك إلغاء هذا الطلب.'}, status=status.HTTP_403_FORBIDDEN)

        if order.status not in ('pending', 'confirmed'):
            return Response(
                {'error': 'لا يمكن إلغاء هذا الطلب لأنه قيد التجهيز أو تم شحنه بالفعل.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        old_status = order.status
        order.status = 'cancelled'
        order.cancelled_at = timezone.now()
        order.save(update_fields=['status', 'cancelled_at', 'updated_at'])

        OrderStatusHistory.objects.create(
            order=order,
            old_status=old_status,
            new_status='cancelled',
            notes='تم الإلغاء بواسطة العميل',
            changed_by=None,
        )

        for item in order.items.all():
            product = item.product
            product.stock_quantity += item.quantity
            product.is_in_stock = True
            product.save(update_fields=['stock_quantity', 'is_in_stock'])

        return Response({'message': 'تم إلغاء طلبك بنجاح.'})
