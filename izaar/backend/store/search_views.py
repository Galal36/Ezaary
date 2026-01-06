"""
Smart fuzzy search views for products
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models import Q, Count, F
from django.utils import timezone
from django.core.cache import cache
from django.conf import settings
import json

# Import search utilities with error handling
try:
    from .search_utils import normalize_arabic_text, fuzzy_match, extract_search_terms
except ImportError as e:
    print(f"Warning: search_utils not available: {e}")
    # Provide fallback functions
    def normalize_arabic_text(text: str) -> str:
        return text.lower().strip() if text else ""
    def fuzzy_match(query: str, text: str, threshold: float = 0.3) -> tuple:
        query_lower = query.lower()
        text_lower = text.lower()
        if query_lower in text_lower:
            return True, 1.0
        return False, 0.0
    def extract_search_terms(text: str) -> list:
        return text.split() if text else []

# Import search models with error handling
try:
    from .search_models import SearchAnalytics, ZeroResultSearch, SearchKeyword
except ImportError as e:
    print(f"Warning: search_models not available: {e}")
    # Create dummy models to prevent import errors
    class SearchAnalytics:
        objects = None
        @classmethod
        def create(cls, **kwargs):
            pass
    class ZeroResultSearch:
        objects = None
        @classmethod
        def get_or_create(cls, **kwargs):
            return (None, True)
    class SearchKeyword:
        objects = None


# Try to import Product - adjust import path as needed
Product = None
try:
    # First try: direct import from models
    from .models import Product
except ImportError:
    try:
        # Second try: from store.models
        from store.models import Product
    except ImportError:
        # Third try: Use Django app registry
        try:
            from django.apps import apps
            Product = apps.get_model('store', 'Product')
        except (LookupError, AttributeError, ValueError) as e:
            print(f"Could not find Product model via app registry: {e}")
            # Last resort: try to import from any models module
            try:
                import importlib
                import sys
                # Check all loaded modules for Product
                for name, module in sys.modules.items():
                    if name and 'store' in name and 'models' in name:
                        if hasattr(module, 'Product'):
                            Product = getattr(module, 'Product')
                            print(f"Found Product model in {name}")
                            break
            except Exception as e2:
                print(f"Final attempt to find Product failed: {e2}")
                Product = None


class SearchViewSet(viewsets.ViewSet):
    """Smart fuzzy search endpoint"""
    permission_classes = [AllowAny]
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def search(self, request):
        """
        Smart fuzzy search for products
        Query params:
        - q: search query
        - limit: max results (default: 20)
        - offset: pagination offset
        """
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
        
        # Normalize query
        normalized_query = normalize_arabic_text(query)
        
        # Check cache
        cache_key = f'search_{normalized_query}_{limit}_{offset}'
        cached_result = cache.get(cache_key)
        if cached_result:
            return Response(cached_result)
        
        # Get all active products - try multiple approaches
        products = []
        
        # First try: Use Product model if available
        if Product:
            try:
                products = list(Product.objects.filter(
                    is_active=True, 
                    is_in_stock=True
                ).select_related('category').prefetch_related('images')[:1000])  # Limit for performance
            except Exception as e:
                print(f"Error accessing Product model: {e}")
                Product = None
        
        # Fallback: Use HTTP request to call products API
        if not products:
            try:
                import urllib.request
                import urllib.parse
                import json as json_lib
                
                # Build URL for products API
                base_url = request.build_absolute_uri('/api/products/')
                params = urllib.parse.urlencode({'page_size': '1000'})
                url = f"{base_url}?{params}"
                
                # Make HTTP request
                req = urllib.request.Request(url)
                req.add_header('Content-Type', 'application/json')
                
                with urllib.request.urlopen(req, timeout=5) as response:
                    data = json_lib.loads(response.read().decode())
                    products_data = data.get('results', data) if isinstance(data, dict) else data
                    products = products_data if isinstance(products_data, list) else []
                    print(f"Loaded {len(products)} products from API endpoint")
            except Exception as e:
                import traceback
                error_msg = str(e)
                print(f"Error fetching products via HTTP: {error_msg}")
                print(traceback.format_exc())
                # Return empty results with error info for debugging
                return Response({
                    'results': [],
                    'count': 0,
                    'suggestions': [],
                    'did_you_mean': None,
                    'error': f'Unable to fetch products. Error: {error_msg}. Please check backend logs.'
                }, status=status.HTTP_200_OK)  # Return 200 so frontend can handle gracefully
        
        # Apply fuzzy search
        results = []
        for product in products:
            # Handle both model instances and dict/API responses
            if hasattr(product, 'name_ar'):
                # Django model instance
                name_ar = product.name_ar or ''
                description_ar = product.description_ar or ''
                category_name = product.category.name_ar if (hasattr(product, 'category') and product.category) else ''
                sku = product.sku or ''
                product_obj = product
            else:
                # API response dict
                name_ar = product.get('name_ar', '') or ''
                description_ar = product.get('description_ar', '') or ''
                category_name = product.get('category_name', '') or ''
                sku = product.get('sku', '') or ''
                product_obj = product
            
            # Search in multiple fields
            search_fields = [
                name_ar,
                description_ar,
                category_name,
                sku,
            ]
            
            # Combine all searchable text
            searchable_text = ' '.join(str(f) for f in search_fields if f)
            
            # Check for matches
            is_match, similarity = fuzzy_match(query, searchable_text, threshold=0.3)
            
            if is_match:
                # Calculate relevance score
                score = similarity
                
                # Boost score for name matches
                name_match, name_sim = fuzzy_match(query, name_ar, threshold=0.3)
                if name_match:
                    score += name_sim * 0.5
                
                # Boost for category match
                if category_name:
                    cat_match, cat_sim = fuzzy_match(query, category_name, threshold=0.3)
                    if cat_match:
                        score += cat_sim * 0.2
                
                results.append({
                    'product': product_obj,
                    'score': score,
                    'similarity': similarity
                })
        
        # Sort by score (best match first), then by most sold, then newest
        results.sort(key=lambda x: (
            -x['score'],  # Higher score first
            -(getattr(x['product'], 'sold_count', 0) if hasattr(x['product'], 'sold_count') else (x['product'].get('sold_count', 0) if isinstance(x['product'], dict) else 0)),  # Most sold
            -(x['product'].created_at.timestamp() if hasattr(x['product'], 'created_at') and hasattr(x['product'].created_at, 'timestamp') else 0)  # Newest
        ))
        
        # Apply pagination
        total_count = len(results)
        paginated_results = results[offset:offset + limit]
        
        # Serialize results
        serialized_results = []
        for item in paginated_results:
            product = item['product']
            
            # Handle both model instances and dict responses
            if hasattr(product, 'id'):
                # Django model instance
                product_id = str(product.id)
                product_name = product.name_ar or ''
                product_slug = product.slug or ''
                product_price = float(product.price) if hasattr(product, 'price') else 0.0
                product_final_price = float(getattr(product, 'final_price', product.price)) if hasattr(product, 'price') else product_price
                product_discount = float(getattr(product, 'discount_percentage', 0))
                product_image = getattr(product, 'primary_image', None) or getattr(product, 'image_url', None)
                product_category_name = product.category.name_ar if (hasattr(product, 'category') and product.category) else None
                product_category_slug = product.category.slug if (hasattr(product, 'category') and product.category) else None
            else:
                # API response dict
                product_id = str(product.get('id', ''))
                product_name = product.get('name_ar', '') or ''
                product_slug = product.get('slug', '') or ''
                product_price = float(product.get('price', 0))
                product_final_price = float(product.get('final_price', product.get('price', 0)))
                product_discount = float(product.get('discount_percentage', 0))
                product_image = product.get('primary_image') or product.get('image_url')
                product_category_name = product.get('category_name')
                product_category_slug = product.get('category_slug')
            
            serialized_results.append({
                'id': product_id,
                'name_ar': product_name,
                'slug': product_slug,
                'price': product_price,
                'final_price': product_final_price,
                'discount_percentage': product_discount,
                'primary_image': product_image,
                'category_name': product_category_name,
                'category_slug': product_category_slug,
                'similarity': round(item['similarity'], 2),
                'score': round(item['score'], 2),
            })
        
        # Generate suggestions
        suggestions = self._generate_suggestions(query, products)
        did_you_mean = suggestions[0] if suggestions else None
        
        # Track search analytics
        self._track_search(query, normalized_query, total_count, request)
        
        response_data = {
            'results': serialized_results,
            'count': total_count,
            'suggestions': suggestions[:5],
            'did_you_mean': did_you_mean
        }
        
        # Cache for 5 minutes
        cache.set(cache_key, response_data, 300)
        
        return Response(response_data)
    
    def _generate_suggestions(self, query, products):
        """Generate search suggestions based on product names"""
        normalized_query = normalize_arabic_text(query)
        suggestions = []
        
        # Get unique product names and categories
        seen = set()
        for product in products[:100]:  # Limit for performance
            # Handle both model instances and dict responses
            if hasattr(product, 'name_ar'):
                name_ar = product.name_ar or ''
                category_name = product.category.name_ar if (hasattr(product, 'category') and product.category) else ''
            else:
                name_ar = product.get('name_ar', '') or ''
                category_name = product.get('category_name', '') or ''
            
            if name_ar:
                norm_name = normalize_arabic_text(name_ar)
                if norm_name not in seen and normalized_query in norm_name:
                    suggestions.append(name_ar)
                    seen.add(norm_name)
            
            if category_name:
                norm_cat = normalize_arabic_text(category_name)
                if norm_cat not in seen and normalized_query in norm_cat:
                    suggestions.append(category_name)
                    seen.add(norm_cat)
        
        return suggestions[:10]
    
    def _track_search(self, query, normalized_query, result_count, request):
        """Track search analytics"""
        try:
            has_results = result_count > 0
            
            # Track in SearchAnalytics
            SearchAnalytics.objects.create(
                query=query,
                normalized_query=normalized_query,
                result_count=result_count,
                has_results=has_results,
                ip_address=self._get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', '')[:500]
            )
            
            # Track zero-result searches
            if not has_results:
                zero_result, created = ZeroResultSearch.objects.get_or_create(
                    normalized_query=normalized_query,
                    defaults={'query': query}
                )
                if not created:
                    zero_result.count += 1
                    zero_result.query = query  # Update with latest query format
                    zero_result.save(update_fields=['count', 'query', 'last_searched'])
        except Exception as e:
            # Don't fail the request if tracking fails
            print(f"Error tracking search: {e}")
    
    def _get_client_ip(self, request):
        """Get client IP address"""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip


class SearchKeywordViewSet(viewsets.ModelViewSet):
    """Manage search keywords and synonyms"""
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        if hasattr(SearchKeyword, 'objects') and SearchKeyword.objects is not None:
            return SearchKeyword.objects.all()
        from rest_framework.response import Response
        from rest_framework import status
        return []
    
    def get_serializer_class(self):
        try:
            from .search_serializers import SearchKeywordSerializer
            return SearchKeywordSerializer
        except ImportError:
            from rest_framework import serializers
            class DummySerializer(serializers.Serializer):
                pass
            return DummySerializer


class SearchAnalyticsViewSet(viewsets.ReadOnlyModelViewSet):
    """View search analytics"""
    permission_classes = [IsAuthenticated]
    lookup_field = 'id'
    
    def get_queryset(self):
        if hasattr(SearchAnalytics, 'objects') and SearchAnalytics.objects is not None:
            queryset = SearchAnalytics.objects.all()
            # Filter by date range if provided
            days = self.request.query_params.get('days', 30)
            try:
                days = int(days)
                cutoff_date = timezone.now() - timezone.timedelta(days=days)
                queryset = queryset.filter(created_at__gte=cutoff_date)
            except ValueError:
                pass
            return queryset.order_by('-created_at')
        return []
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular searches"""
        if not (hasattr(SearchAnalytics, 'objects') and SearchAnalytics.objects is not None):
            return Response([])
        days = int(request.query_params.get('days', 30))
        cutoff_date = timezone.now() - timezone.timedelta(days=days)
        
        popular = SearchAnalytics.objects.filter(
            created_at__gte=cutoff_date,
            has_results=True
        ).values('normalized_query', 'query').annotate(
            count=Count('id')
        ).order_by('-count')[:20]
        
        return Response(list(popular))
    
    @action(detail=False, methods=['get'])
    def zero_results(self, request):
        """Get zero-result searches"""
        if not (hasattr(ZeroResultSearch, 'objects') and ZeroResultSearch.objects is not None):
            return Response([])
        zero_results = ZeroResultSearch.objects.all().order_by('-count', '-last_searched')[:50]
        try:
            from .search_serializers import ZeroResultSearchSerializer
            serializer = ZeroResultSearchSerializer(zero_results, many=True)
            return Response(serializer.data)
        except ImportError:
            return Response([])

