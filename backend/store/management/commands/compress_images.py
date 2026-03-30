import io
import os

from PIL import Image as PILImage
from django.conf import settings
from django.core.files.base import ContentFile
from django.core.files.storage import default_storage
from django.core.management.base import BaseCommand

from store.models import ProductImage, Category


class Command(BaseCommand):
    help = 'Compress existing product and category images to WebP format. Originals are preserved.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Show what would be compressed without making changes.',
        )
        parser.add_argument(
            '--quality',
            type=int,
            default=82,
            help='WebP quality (1-100). Default: 82',
        )
        parser.add_argument(
            '--max-size',
            type=int,
            default=1200,
            help='Maximum dimension in pixels. Default: 1200',
        )

    def handle(self, *args, **options):
        dry_run = options['dry_run']
        quality = options['quality']
        max_size = options['max_size']

        if dry_run:
            self.stdout.write(self.style.WARNING('DRY RUN - no changes will be made'))

        self.stdout.write(f'Settings: quality={quality}, max_size={max_size}px')

        product_ok, product_skip, product_err = self._compress_product_images(dry_run, quality, max_size)
        cat_ok, cat_skip, cat_err = self._compress_category_images(dry_run, quality, max_size)

        self.stdout.write('')
        self.stdout.write(self.style.SUCCESS(
            f'Done. Products: {product_ok} compressed, {product_skip} skipped, {product_err} errors. '
            f'Categories: {cat_ok} compressed, {cat_skip} skipped, {cat_err} errors.'
        ))

    def _compress_single(self, image_url, subfolder, quality, max_size):
        """Compress a single image file. Returns (new_relative_path, saved_bytes) or raises."""
        if not image_url:
            raise ValueError('Empty image URL')

        relative_path = image_url
        for prefix in ('https://ezaary.com/media/', 'http://ezaary.com/media/',
                        'https://www.ezaary.com/media/', 'http://www.ezaary.com/media/'):
            if relative_path.startswith(prefix):
                relative_path = relative_path[len(prefix):]
                break
        if relative_path.startswith('/media/'):
            relative_path = relative_path[len('/media/'):]
        elif relative_path.startswith('media/'):
            relative_path = relative_path[len('media/'):]
        if relative_path.startswith(('http://', 'https://')):
            raise ValueError('External URL (non-local domain), skipping')

        if relative_path.lower().endswith('.webp'):
            raise ValueError('Already WebP')

        full_path = os.path.join(settings.MEDIA_ROOT, relative_path)
        if not os.path.isfile(full_path):
            raise FileNotFoundError(f'File not found: {full_path}')

        original_size = os.path.getsize(full_path)
        base, _ = os.path.splitext(relative_path)
        webp_relative = base + '.webp'
        webp_full = os.path.join(settings.MEDIA_ROOT, webp_relative)

        if os.path.isfile(webp_full):
            webp_size = os.path.getsize(webp_full)
            saved = original_size - webp_size
            return webp_relative, original_size, webp_size, saved

        img = PILImage.open(full_path)
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')
        img.thumbnail((max_size, max_size), PILImage.LANCZOS)

        buffer = io.BytesIO()
        img.save(buffer, format='WEBP', quality=quality)
        webp_size = buffer.tell()
        buffer.seek(0)

        os.makedirs(os.path.dirname(webp_full), exist_ok=True)
        with open(webp_full, 'wb') as f:
            f.write(buffer.read())

        saved = original_size - webp_size
        return webp_relative, original_size, webp_size, saved

    def _compress_product_images(self, dry_run, quality, max_size):
        images = ProductImage.objects.all()
        total = images.count()
        self.stdout.write(f'\nProduct images: {total} total')

        ok = skip = err = 0
        for i, img_obj in enumerate(images.iterator(), 1):
            try:
                webp_path, orig_size, new_size, saved = self._compress_single(
                    img_obj.image_url, 'products', quality, max_size
                )
                ok += 1
                self.stdout.write(
                    f'  [{i}/{total}] {img_obj.image_url} -> {webp_path} '
                    f'({orig_size // 1024}KB -> {new_size // 1024}KB, saved {saved // 1024}KB)'
                )
                if not dry_run:
                    img_obj.image_url = webp_path
                    img_obj.save(update_fields=['image_url'])
            except ValueError as e:
                skip += 1
                self.stdout.write(f'  [{i}/{total}] SKIP {img_obj.image_url}: {e}')
            except Exception as e:
                err += 1
                self.stderr.write(f'  [{i}/{total}] ERROR {img_obj.image_url}: {e}')

        return ok, skip, err

    def _compress_category_images(self, dry_run, quality, max_size):
        categories = Category.objects.exclude(image_url__isnull=True).exclude(image_url='')
        total = categories.count()
        self.stdout.write(f'\nCategory images: {total} total')

        ok = skip = err = 0
        for i, cat in enumerate(categories.iterator(), 1):
            try:
                webp_path, orig_size, new_size, saved = self._compress_single(
                    cat.image_url, 'categories', quality, max_size
                )
                ok += 1
                self.stdout.write(
                    f'  [{i}/{total}] {cat.image_url} -> {webp_path} '
                    f'({orig_size // 1024}KB -> {new_size // 1024}KB, saved {saved // 1024}KB)'
                )
                if not dry_run:
                    cat.image_url = webp_path
                    cat.save(update_fields=['image_url'])
            except ValueError as e:
                skip += 1
                self.stdout.write(f'  [{i}/{total}] SKIP {cat.image_url}: {e}')
            except Exception as e:
                err += 1
                self.stderr.write(f'  [{i}/{total}] ERROR {cat.image_url}: {e}')

        return ok, skip, err
