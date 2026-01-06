import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [isClosed, setIsClosed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Filter active announcements based on dates
  const activeAnnouncements = announcements.filter((announcement) => {
    if (!announcement.enabled) return false;
    const now = new Date();
    if (announcement.startDate && new Date(announcement.startDate) > now) return false;
    if (announcement.endDate && new Date(announcement.endDate) < now) return false;
    return true;
  });

  // Check if user closed the bar (cookie/localStorage)
  useEffect(() => {
    const closedUntil = localStorage.getItem("announcement_bar_closed_until");
    if (closedUntil) {
      const closedDate = new Date(closedUntil);
      if (closedDate > new Date()) {
        setIsClosed(true);
      } else {
        localStorage.removeItem("announcement_bar_closed_until");
      }
    }
  }, []);

  // Rotate messages
  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeAnnouncements.length);
    }, 5000); // Change message every 5 seconds

    return () => clearInterval(interval);
  }, [activeAnnouncements.length]);

  // Smooth scrolling animation
  useEffect(() => {
    if (!enabled || isClosed || activeAnnouncements.length === 0 || isPaused) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const textElement = container.querySelector("div");
    if (!textElement) return;

    let position = 0;
    const textWidth = textElement.scrollWidth / 3; // Divide by 3 because we duplicate 3 times

    const animate = () => {
      if (!isPaused) {
        position += speed / 60; // 60fps
        if (position >= textWidth) {
          position = 0;
        }
        container.style.transform = `translateX(-${position}px)`;
      }
      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [enabled, isClosed, activeAnnouncements, speed, isPaused, currentIndex]);

  const handleClose = () => {
    setIsClosed(true);
    // Set to reappear after 24 hours
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    localStorage.setItem("announcement_bar_closed_until", tomorrow.toISOString());
  };

  if (!enabled || isClosed || activeAnnouncements.length === 0) {
    return null;
  }

  const currentMessage = activeAnnouncements[currentIndex];
  if (!currentMessage) return null;

  // Duplicate content for seamless loop
  const duplicatedText = `${currentMessage.text} • ${currentMessage.text} • ${currentMessage.text} • `;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 overflow-hidden"
      style={{
        backgroundColor: backgroundColor || "hsl(var(--primary))",
        color: textColor || "hsl(var(--primary-foreground))",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
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

        {/* Scrolling Text */}
        <div
          ref={containerRef}
          className="flex-1 flex items-center overflow-hidden"
          style={{
            willChange: "transform",
            transform: "translateX(0)",
          }}
        >
          <div
            className="whitespace-nowrap text-sm md:text-base font-medium px-4"
            style={{
              display: "inline-block",
            }}
          >
            {duplicatedText}
          </div>
        </div>

        {/* Message Indicators (dots) */}
        {activeAnnouncements.length > 1 && (
          <div className="absolute right-2 flex gap-1">
            {activeAnnouncements.map((_, index) => (
              <div
                key={index}
                className={cn(
                  "w-1.5 h-1.5 rounded-full transition-opacity",
                  index === currentIndex ? "opacity-100" : "opacity-40"
                )}
                style={{
                  backgroundColor: textColor || "hsl(var(--primary-foreground))",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

