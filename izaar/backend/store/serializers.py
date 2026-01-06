# Add these to your existing serializers.py file

from rest_framework import serializers
from .models import Coupon


class CouponSerializer(serializers.ModelSerializer):
    """Serializer for Coupon model"""
    is_valid = serializers.SerializerMethodField()
    product_name = serializers.CharField(source='product.name_ar', read_only=True)
    product_slug = serializers.CharField(source='product.slug', read_only=True)

    class Meta:
        model = Coupon
        fields = [
            'id', 'code', 'discount_percentage', 'product', 'product_name', 'product_slug',
            'valid_from', 'valid_to', 'is_active', 'max_uses', 'used_count',
            'is_valid', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'used_count', 'created_at', 'updated_at']

    def get_is_valid(self, obj):
        """Check if coupon is currently valid"""
        return obj.is_valid()


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
            coupon = Coupon.objects.get(code=code, is_active=True)
        except Coupon.DoesNotExist:
            raise serializers.ValidationError({"code": "كود الكوبون غير صحيح"})
        
        # Check if coupon is valid
        if not coupon.is_valid():
            raise serializers.ValidationError({"code": "كود الكوبون منتهي الصلاحية أو غير صالح"})
        
        # Check if coupon is for specific product
        if coupon.product:
            if not product_id or str(coupon.product.id) != str(product_id):
                raise serializers.ValidationError({"code": "هذا الكوبون غير صالح لهذا المنتج"})
        
        # Check usage limit
        if coupon.max_uses and coupon.used_count >= coupon.max_uses:
            raise serializers.ValidationError({"code": "تم تجاوز الحد الأقصى لاستخدام هذا الكوبون"})
        
        data['coupon'] = coupon
        return data


