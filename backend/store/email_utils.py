"""
Email utilities for customer authentication (إرسال البريد للعملاء)
"""
from django.core.mail import send_mail
from django.conf import settings


def send_verification_email(customer):
    """Send email verification link to customer (إرسال رابط تفعيل البريد)"""
    token = customer.email_verification_token
    if not token:
        return False

    verification_url = f"https://ezaary.com/verify-email?token={token}"

    subject = "تفعيل حسابك في إيزاري - Ezaary"
    html_message = f"""
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background: #f5f5f5; margin: 0; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }}
            .brand {{ font-size: 24px; font-weight: bold; color: #1e3a5f; margin-bottom: 20px; }}
            h1 {{ color: #1e3a5f; font-size: 20px; margin-bottom: 16px; }}
            p {{ color: #444; line-height: 1.7; margin-bottom: 24px; }}
            .btn {{ display: inline-block; background: #e85d2c; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }}
            .footer {{ margin-top: 24px; font-size: 12px; color: #888; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="brand">إيزاري Ezaary</div>
            <h1>مرحباً {customer.first_name}!</h1>
            <p>شكراً لتسجيلك في إيزاري. نحن سعداء بانضمامك إلينا.</p>
            <p>يرجى النقر على الزر أدناه لتفعيل حسابك والاستفادة من جميع مزايا المتجر:</p>
            <p><a href="{verification_url}" class="btn">تفعيل حسابي</a></p>
            <p style="font-size: 13px;">أو انسخ الرابط التالي في المتصفح:<br>
            <a href="{verification_url}" style="word-break: break-all;">{verification_url}</a></p>
            <div class="footer">© إيزاري Ezaary - متجر الملابس المصري</div>
        </div>
    </body>
    </html>
    """

    plain_message = f"مرحباً {customer.first_name}، انقر على الرابط لتفعيل حسابك: {verification_url}"

    try:
        return send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[customer.email],
            fail_silently=True,
            html_message=html_message,
        )
    except Exception:
        return False


def send_password_reset_email(customer):
    """Send password reset link to customer (إرسال رابط إعادة تعيين كلمة المرور)"""
    token = customer.password_reset_token
    if not token:
        return False

    reset_url = f"https://ezaary.com/reset-password?token={token}"

    subject = "إعادة تعيين كلمة المرور - إيزاري Ezaary"
    html_message = f"""
    <!DOCTYPE html>
    <html dir="rtl">
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: 'Segoe UI', Tahoma, Arial, sans-serif; direction: rtl; background: #f5f5f5; margin: 0; padding: 20px; }}
            .container {{ max-width: 500px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 32px; box-shadow: 0 2px 10px rgba(0,0,0,0.08); }}
            .brand {{ font-size: 24px; font-weight: bold; color: #1e3a5f; margin-bottom: 20px; }}
            h1 {{ color: #1e3a5f; font-size: 20px; margin-bottom: 16px; }}
            p {{ color: #444; line-height: 1.7; margin-bottom: 24px; }}
            .btn {{ display: inline-block; background: #e85d2c; color: #fff !important; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; }}
            .warning {{ background: #fff3cd; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; }}
            .footer {{ margin-top: 24px; font-size: 12px; color: #888; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="brand">إيزاري Ezaary</div>
            <h1>إعادة تعيين كلمة المرور</h1>
            <p>مرحباً {customer.first_name}،</p>
            <p>لقد تلقينا طلباً لإعادة تعيين كلمة المرور لحسابك. انقر على الزر أدناه لتعيين كلمة مرور جديدة:</p>
            <p><a href="{reset_url}" class="btn">تعيين كلمة مرور جديدة</a></p>
            <div class="warning">تنبيه: هذا الرابط صالح لمدة ساعة واحدة فقط.</div>
            <p style="font-size: 13px;">إذا لم تطلب إعادة تعيين كلمة المرور، يمكنك تجاهل هذه الرسالة.</p>
            <div class="footer">© إيزاري Ezaary - متجر الملابس المصري</div>
        </div>
    </body>
    </html>
    """

    plain_message = f"مرحباً {customer.first_name}، انقر على الرابط لإعادة تعيين كلمة المرور (صالح لمدة ساعة): {reset_url}"

    try:
        return send_mail(
            subject=subject,
            message=plain_message,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[customer.email],
            fail_silently=True,
            html_message=html_message,
        )
    except Exception:
        return False
