# Add this to your existing models.py file

from django.db import models
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
import uuid


class Coupon(models.Model):
    """Coupon model for product discounts"""
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, db_index=True, verbose_name="كود الكوبون")
    discount_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(100)],
        verbose_name="نسبة الخصم (%)"
    )
    product = models.ForeignKey(
        'Product',
        on_delete=models.CASCADE,
        related_name='coupons',
        null=True,
        blank=True,
        verbose_name="المنتج"
    )
    valid_from = models.DateTimeField(verbose_name="صالح من")
    valid_to = models.DateTimeField(verbose_name="صالح حتى")
    is_active = models.BooleanField(default=True, verbose_name="نشط")
    max_uses = models.PositiveIntegerField(null=True, blank=True, verbose_name="الحد الأقصى للاستخدام")
    used_count = models.PositiveIntegerField(default=0, verbose_name="عدد مرات الاستخدام")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "كوبون"
        verbose_name_plural = "كوبونات"
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['code', 'is_active']),
            models.Index(fields=['product', 'is_active']),
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


