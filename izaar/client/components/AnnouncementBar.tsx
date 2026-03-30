import { useRef, useEffect, useMemo } from "react";
import { X } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAnnouncement } from "@/contexts/AnnouncementContext";

interface Announcement {
  id: string;
  text: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

interface AnnouncementBarProps {
  announcements: Announcement[];
  speed?: number; // pixels per second
  backgroundColor?: string;
  textColor?: string;
  enabled?: boolean;
}

export default function AnnouncementBar({
  announcements,
  speed = 50,
  backgroundColor,
  textColor,
  enabled = true,
}: AnnouncementBarProps) {
  const marqueeContentRef = useRef<HTMLDivElement>(null);
  const marqueeContainerRef = useRef<HTMLDivElement>(null);
  const { isRTL } = useLanguage();
  const { closeBar } = useAnnouncement();

  // Fixed announcement texts separated by spaces
  const text1 = "الحق تصفيات الشتوي خامات 100% قطن";
  const text2 = "مع إزاري احسن خدمة عملاء ومتابعة، معاينة قبل الاستلام";
  const announcementText = useMemo(() => {
    return `${text1}     ${text2}`; // 5 spaces between texts
  }, []);

  // Duplicate for seamless looping (but positioned so only one is visible at a time)
  const duplicatedText = useMemo(() => {
    return `${announcementText}     ${announcementText}`;
  }, [announcementText]);

  // Calculate animation duration and positions based on speed
  useEffect(() => {
    if (!enabled) return;

    const container = marqueeContainerRef.current;
    const content = marqueeContentRef.current;
    if (!container || !content) return;

    // Wait for DOM to be ready
    const updateAnimation = () => {
      // Get container width (visible area)
      const containerWidth = container.offsetWidth;
      // Get content width (includes duplication)
      const contentWidth = content.scrollWidth;
      // One sequence width (half of total since we duplicate)
      const sequenceWidth = contentWidth / 2;
      
      // Start position: content starts completely off the right edge
      const startPosition = containerWidth;
      // End position: move one sequence width to the left
      const endPosition = containerWidth - sequenceWidth;
      const distance = sequenceWidth;
      const duration = (distance / speed) * 1000; // Convert to milliseconds

      // Set CSS custom properties
      container.style.setProperty('--marquee-duration', `${duration}ms`);
      container.style.setProperty('--marquee-start', `${startPosition}px`);
      container.style.setProperty('--marquee-end', `${endPosition}px`);
    };

    // Use requestAnimationFrame to ensure layout is complete
    const frame = requestAnimationFrame(() => {
      updateAnimation();
    });

    return () => cancelAnimationFrame(frame);
  }, [enabled, speed, duplicatedText]);

  const handleClose = () => {
    closeBar(24);
  };

  if (!enabled) {
    return null;
  }

  return (
    <div
      className="announcement-bar-container fixed top-0 left-0 right-0 z-50 overflow-hidden"
      style={{
        backgroundColor: backgroundColor || "hsl(var(--primary))",
        color: textColor || "hsl(var(--primary-foreground))",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <div className="relative flex items-center h-10 md:h-12">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute left-2 z-10 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrolling Text Container */}
        <div
          ref={marqueeContainerRef}
          className="marquee-container flex-1 overflow-hidden"
          style={{
            direction: isRTL ? "rtl" : "ltr",
          }}
        >
          {/* Marquee Content - duplicated for seamless loop, but positioned correctly */}
          <div
            ref={marqueeContentRef}
            className="marquee-content whitespace-nowrap text-sm md:text-base font-medium"
            style={{
              display: 'inline-block',
              paddingLeft: '1rem',
              paddingRight: '1rem',
              animation: isRTL 
                ? `marquee-scroll-rtl var(--marquee-duration, 30s) linear infinite`
                : `marquee-scroll-ltr var(--marquee-duration, 30s) linear infinite`,
              animationPlayState: 'running',
              willChange: 'transform',
            }}
          >
            {duplicatedText}
          </div>
        </div>
      </div>

      {/* CSS for hover pause */}
      <style>{`
        .announcement-bar-container:hover .marquee-content {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}

