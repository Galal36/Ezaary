import { useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  productName: string;
  discountPercentage?: number;
  isInStock?: boolean;
}

export default function ProductImageGallery({
  images,
  productName,
  discountPercentage = 0,
  isInStock = true,
}: ProductImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  if (!images || images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
        <img
          src="/placeholder.svg"
          alt={productName}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];

  const nextImage = () => {
    setSelectedIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="relative w-full aspect-square bg-secondary rounded-lg overflow-hidden group">
        <img
          src={currentImage}
          alt={`${productName} - صورة ${selectedIndex + 1}`}
          className="w-full h-full object-cover"
          loading={selectedIndex === 0 ? "eager" : "lazy"}
          decoding="async"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />

        {/* Discount Badge */}
        {discountPercentage > 0 && (
          <div className="absolute top-4 left-4 bg-accent text-accent-foreground px-3 py-1 rounded-lg font-bold text-sm z-10">
            خصم {discountPercentage}%
          </div>
        )}

        {/* Out of Stock Overlay */}
        {!isInStock && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
            <span className="bg-white text-black px-4 py-2 rounded-lg font-bold">
              غير متوفر
            </span>
          </div>
        )}

        {/* Navigation Arrows (only show if more than 1 image) */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="الصورة السابقة"
            >
              <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>
            <button
              onClick={nextImage}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
              aria-label="الصورة التالية"
            >
              <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-sm opacity-0 group-hover:opacity-100 transition-opacity z-20">
              {selectedIndex + 1} / {images.length}
            </div>
          </>
        )}

        {/* Zoom Button (optional - can be implemented later) */}
        <button
          onClick={() => setIsZoomed(!isZoomed)}
          className="absolute bottom-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-20"
          aria-label="تكبير الصورة"
        >
          <ZoomIn className="w-5 h-5 text-gray-800" />
        </button>
      </div>

      {/* Thumbnail Gallery */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                selectedIndex === index
                  ? "border-primary ring-2 ring-primary ring-offset-2"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <img
                src={image}
                alt={`${productName} - معاينة ${index + 1}`}
                className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.svg';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Zoom Modal (optional enhancement) */}
      {isZoomed && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative max-w-7xl max-h-full">
            <img
              src={currentImage}
              alt={productName}
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-full"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

