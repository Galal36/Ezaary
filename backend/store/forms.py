"""
Custom admin forms for Store models
"""
from django import forms
from django.contrib.postgres.forms import SimpleArrayField
from .models import Product, SiteSetting


class ProductAdminForm(forms.ModelForm):
    """Custom form for Product admin with color selection"""
    
    # Define available colors (both Arabic and English)  
    # This MUST be defined before Meta to override the model field
    available_colors = forms.MultipleChoiceField(
        choices=[
            ('أبيض', 'أبيض (White)'),
            ('أسود', 'أسود (Black)'),
            ('أحمر', 'أحمر (Red)'),
            ('أزرق', 'أزرق (Blue)'),
            ('أخضر', 'أخضر (Green)'),
            ('رمادي', 'رمادي (Gray)'),
            ('كحلي', 'كحلي (Navy)'),
            ('بيج', 'بيج (Beige)'),
            ('برجاندي', 'برجاندي (Burgundy)'),
            ('بني', 'بني (Brown)'),
            ('زيتي', 'زيتي (Olive)'),
        ],
        widget=forms.CheckboxSelectMultiple(attrs={
            'class': 'custom-color-checkboxes',
            'style': 'list-style: none;'
        }),
        required=False,
        label='الألوان المتاحة',
        help_text='✨ اختر الألوان المتاحة لهذا المنتج (11 لون - تم إضافة 3 ألوان جديدة: برجاندي، بني، زيتي)'
    )
    
    available_sizes = SimpleArrayField(
        forms.CharField(max_length=50),
        delimiter=',',
        required=False,
        label='المقاسات المتاحة',
        help_text='أدخل المقاسات مفصولة بفاصلة (مثال: S, M, L, XL, XXL)',
        widget=forms.TextInput(attrs={'size': '60'})
    )
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        
        # Try to load colors from SiteSetting if available
        try:
            color_setting = SiteSetting.objects.filter(key='available_colors').first()
            if color_setting and color_setting.value:
                import json
                stored_colors = json.loads(color_setting.value)
                self.fields['available_colors'].choices = [
                    (color['value'], color['label']) for color in stored_colors
                ]
                # Update help text
                self.fields['available_colors'].help_text = f'✨ اختر الألوان المتاحة ({len(stored_colors)} لون متاح - تم إضافة 3 ألوان جديدة)'
        except Exception as e:
            # Use default colors if SiteSetting doesn't exist
            pass
        
        # Ensure widget is properly configured
        self.fields['available_colors'].widget = forms.CheckboxSelectMultiple(
            choices=self.fields['available_colors'].choices,
            attrs={
                'class': 'custom-color-checkboxes',
                'style': 'list-style: none;'
            }
        )
    
    def clean_available_colors(self):
        """Convert selected colors to a list for PostgreSQL ArrayField"""
        colors = self.cleaned_data.get('available_colors')
        if colors:
            # Ensure it's a list
            return list(colors) if isinstance(colors, (list, tuple)) else [colors]
        return []
