# Add these views to your existing views.py file

from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils import timezone
from django.core.cache import cache
from .models import Coupon
from .serializers import CouponSerializer, CouponValidateSerializer

# Import Product model - try multiple ways
Product = None
try:
    from .models import Product
except ImportError:
    try:
        from django.apps import apps
        Product = apps.get_model('store', 'Product')
    except:
        pass

# Simple search functions (fallback if search_utils not available)
def normalize_arabic_text(text):
    """Simple Arabic text normalization"""
    if not text:
        return ""
    text = str(text)
    # Normalize Arabic characters
    text = text.replace('أ', 'ا').replace('إ', 'ا').replace('آ', 'ا')
    text = text.replace('ى', 'ي')
    text = text.replace('ة', 'ه')
    # Remove diacritics and tatweel
    text = ''.join(c for c in text if c not in 'ًٌٍَُِّْـ')
    return text.lower().strip()

def simple_fuzzy_match(query, text, threshold=0.3):
    """Simple fuzzy matching"""
    if not query or not text:
        return False, 0.0
    query_norm = normalize_arabic_text(query)
    text_norm = normalize_arabic_text(text)
    if query_norm in text_norm:
        return True, 1.0
    # Check if any word matches
    query_words = query_norm.split()
    text_words = text_norm.split()
    matches = sum(1 for qw in query_words if any(qw in tw or tw in qw for tw in text_words))
    similarity = matches / len(query_words) if query_words else 0.0
    return similarity >= threshold, similarity


class CouponViewSet(viewsets.ModelViewSet):
    """ViewSet for Coupon model"""
    queryset = Coupon.objects.all().select_related('product')
    serializer_class = CouponSerializer
    permission_classes = [IsAuthenticated]  # Only admins can manage coupons
    lookup_field = 'id'

    def get_queryset(self):
        """Filter coupons based on query parameters"""
        queryset = super().get_queryset()
        
        # Filter by product if provided
        product_id = self.request.query_params.get('product_id')
        if product_id:
            queryset = queryset.filter(product_id=product_id)
        
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


class SearchViewSet(viewsets.ViewSet):
    """Simple search endpoint - added directly to views.py to ensure it registers"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """Search products"""
        query = request.query_params.get('q', '').strip()
        limit = int(request.query_params.get('limit', 20))
        offset = int(request.query_params.get('offset', 0))
        
        if not query or len(query) < 2:
            return Response({
                'results': [],
                'count': 0,
                'suggestions': [],
                'did_you_mean': None
            })
        
        # Try to get products
        products = []
        try:
            # Try to import Product
            try:
                from .models import Product
            except ImportError:
                from django.apps import apps
                Product = apps.get_model('store', 'Product')
            
            # Get products
            products = list(Product.objects.filter(
                is_active=True,
                is_in_stock=True
            ).select_related('category')[:1000])
        except Exception as e:
            # If Product model not available, return empty results
            print(f"Search error (Product model not available): {e}")
            return Response({
                'results': [],
                'count': 0,
                'suggestions': [],
                'did_you_mean': None,
                'error': 'Product model not available'
            })
        
        # Simple search - check if query is in product name
        results = []
        query_lower = query.lower()
        
        for product in products:
            name_ar = (product.name_ar or '').lower()
            description_ar = (product.description_ar or '').lower()
            category_name = (product.category.name_ar if product.category else '').lower()
            
            # Check if query matches
            if (query_lower in name_ar or 
                query_lower in description_ar or 
                query_lower in category_name):
                results.append({
                    'id': str(product.id),
                    'name_ar': product.name_ar,
                    'slug': product.slug,
                    'price': float(product.price),
                    'final_price': float(getattr(product, 'final_price', product.price)),
                    'discount_percentage': float(getattr(product, 'discount_percentage', 0)),
                    'primary_image': getattr(product, 'primary_image', None) or getattr(product, 'image_url', None),
                    'category_name': product.category.name_ar if product.category else None,
                    'category_slug': product.category.slug if product.category else None,
                })
        
        # Apply pagination
        total_count = len(results)
        paginated_results = results[offset:offset + limit]
        
        return Response({
            'results': paginated_results,
            'count': total_count,
            'suggestions': [],
            'did_you_mean': None
        })


