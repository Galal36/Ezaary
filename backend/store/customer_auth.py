"""
Customer authentication utility (أداة مصادقة العملاء)
"""
from rest_framework.exceptions import AuthenticationFailed
from .models import CustomerToken, Customer


def get_customer_from_request(request):
    """
    Extract customer from Authorization: Bearer <token> header.
    Returns Customer instance or raises AuthenticationFailed.
    """
    auth_header = request.META.get('HTTP_AUTHORIZATION', '')
    if not auth_header.startswith('Bearer '):
        raise AuthenticationFailed('يجب تسجيل الدخول للوصول لهذه الخدمة.')

    token_key = auth_header[7:].strip()
    if not token_key:
        raise AuthenticationFailed('يجب تسجيل الدخول للوصول لهذه الخدمة.')

    try:
        customer_token = CustomerToken.objects.select_related('customer').get(key=token_key)
        customer = customer_token.customer
        if not customer.is_active:
            raise AuthenticationFailed('هذا الحساب غير نشط.')
        return customer
    except CustomerToken.DoesNotExist:
        raise AuthenticationFailed('رمز الدخول غير صالح أو منتهي.')
