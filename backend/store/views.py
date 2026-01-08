from rest_framework import viewsets, status, filters, serializers
from rest_framework.decorators import action, api_view, permission_classes, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from rest_framework.authtoken.models import Token
from django.db.models import Q, Count, Sum, Avg, F, Prefetch
from django.db import transaction
from django.utils import timezone
from datetime import timedelta
import os
from django.conf import settings
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile

from .models import (
    Category, Brand, Product, ProductImage, Order, OrderItem,
    OrderStatusHistory, Review, AdminUser, Banner, ShippingZone,
    DiscountCode, SiteSetting, Coupon
)
from .serializers import (
    CategorySerializer, BrandSerializer, ProductListSerializer, ProductDetailSerializer, ProductCreateSerializer,
    ProductImageSerializer, OrderListSerializer, OrderDetailSerializer, OrderCreateSerializer,
    OrderItemSerializer, OrderStatusHistorySerializer, ReviewSerializer,
    AdminUserSerializer, AdminLoginSerializer, BannerSerializer, ShippingZoneSerializer,
    DiscountCodeSerializer, SiteSettingSerializer, CouponSerializer, CouponValidateSerializer
)


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
        
        # Save file to media directory
        import uuid
        ext = os.path.splitext(image.name)[1]
        filename = f"categories/{uuid.uuid4()}{ext}"
        
        path = default_storage.save(filename, ContentFile(image.read()))
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
    


    def retrieve(self, request, *args, **kwargs):
        """Increment views count when product is viewed"""
        instance = self.get_object()
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
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
        
        # Save file to media directory
        import uuid
        ext = os.path.splitext(image.name)[1]
        filename = f"products/{uuid.uuid4()}{ext}"
        
        path = default_storage.save(filename, ContentFile(image.read()))
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
    queryset = Order.objects.all().prefetch_related('items', 'status_history')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['order_number', 'customer_name', 'customer_phone']
    ordering_fields = ['created_at', 'total', 'status']
    ordering = ['-created_at']
    
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
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        
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
        """Get shipping cost for a governorate"""
        governorate = request.query_params.get('governorate')
        if not governorate:
            return Response({'error': 'Governorate is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            zone = ShippingZone.objects.get(governorate=governorate, is_active=True)
            serializer = self.get_serializer(zone)
            return Response(serializer.data)
        except ShippingZone.DoesNotExist:
            # Return default shipping cost from settings
            from django.conf import settings
            return Response({
                'governorate': governorate,
                'shipping_cost': settings.DEFAULT_SHIPPING_COST,
                'estimated_days': '3-7 أيام'
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
            
            discount_amount = (float(amount) * float(coupon.discount_percentage)) / 100 if amount else 0
            final_amount = float(amount) - discount_amount if amount else 0
            
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
