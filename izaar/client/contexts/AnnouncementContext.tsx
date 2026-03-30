import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Announcement {
  id: string;
  text: string;
  enabled: boolean;
  startDate?: string;
  endDate?: string;
}

interface AnnouncementSettings {
  enabled: boolean;
  speed: number; // pixels per second
  backgroundColor: string;
  textColor: string;
  announcements: Announcement[];
}

interface AnnouncementContextType {
  settings: AnnouncementSettings;
  isBarVisible: boolean;
  updateSettings: (settings: Partial<AnnouncementSettings>) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  closeBar: (hours?: number) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

// Versioned key so if users previously closed the bar, new deployments can show it again.
// Also avoids "invisible bar but reserved gap" issues when the close state isn't shared.
const ANNOUNCEMENT_BAR_CLOSED_UNTIL_KEY = "announcement_bar_closed_until_v2";

const defaultSettings: AnnouncementSettings = {
  enabled: true,
  speed: 50,
  backgroundColor: "hsl(var(--primary))",
  textColor: "hsl(var(--primary-foreground))",
  announcements: [
    {
      id: "2",
      text: "خصم 20% لفترة محدودة",
      enabled: true,
    },
    {
      id: "3",
      text: "شحن سريع وخدمة عملاء ممتازة",
      enabled: true,
    },
    {
      id: "4",
      text: "خامات ممتازة وجودة مضمونة",
      enabled: true,
    },
    {
      id: "5",
      text: "الحق تصفيات الشتاء لخامات عالية، الكمية محدودة",
      enabled: true,
    },
  ],
};

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AnnouncementSettings>(defaultSettings);
  const [isClosed, setIsClosed] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("izaar_announcement_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to load announcement settings:", error);
      }
    }
  }, []);

  // Load "closed until" state on mount (guarded for SSR safety)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const closedUntil = window.localStorage.getItem(ANNOUNCEMENT_BAR_CLOSED_UNTIL_KEY);
      if (!closedUntil) return;
      const closedDate = new Date(closedUntil);
      if (closedDate > new Date()) {
        setIsClosed(true);
      } else {
        window.localStorage.removeItem(ANNOUNCEMENT_BAR_CLOSED_UNTIL_KEY);
      }
    } catch {
      // ignore localStorage errors
    }
  }, []);

  const activeAnnouncements = settings.announcements.filter((announcement) => {
    if (!announcement.enabled) return false;
    const now = new Date();
    if (announcement.startDate && new Date(announcement.startDate) > now) return false;
    if (announcement.endDate && new Date(announcement.endDate) < now) return false;
    return true;
  });

  const isBarVisible = settings.enabled && !isClosed && activeAnnouncements.length > 0;

  // Save to localStorage whenever settings change
  useEffect(() => {
    localStorage.setItem("izaar_announcement_settings", JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<AnnouncementSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const addAnnouncement = (announcement: Omit<Announcement, "id">) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
    };
    setSettings((prev) => ({
      ...prev,
      announcements: [...prev.announcements, newAnnouncement],
    }));
  };

  const updateAnnouncement = (id: string, updates: Partial<Announcement>) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.map((ann) =>
        ann.id === id ? { ...ann, ...updates } : ann
      ),
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      announcements: prev.announcements.filter((ann) => ann.id !== id),
    }));
  };

  const closeBar = (hours: number = 24) => {
    setIsClosed(true);
    if (typeof window === "undefined") return;
    try {
      const until = new Date();
      until.setHours(until.getHours() + hours);
      window.localStorage.setItem(ANNOUNCEMENT_BAR_CLOSED_UNTIL_KEY, until.toISOString());
    } catch {
      // ignore localStorage errors
    }
  };

  const loadSettings = async () => {
    // In the future, this can load from backend API
    const saved = localStorage.getItem("izaar_announcement_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSettings({ ...defaultSettings, ...parsed });
      } catch (error) {
        console.error("Failed to load announcement settings:", error);
      }
    }
  };

  const saveSettings = async () => {
    // In the future, this can save to backend API
    localStorage.setItem("izaar_announcement_settings", JSON.stringify(settings));
  };

  return (
    <AnnouncementContext.Provider
      value={{
        settings,
        isBarVisible,
        updateSettings,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
        closeBar,
        loadSettings,
        saveSettings,
      }}
    >
      {children}
    </AnnouncementContext.Provider>
  );
};

export const useAnnouncement = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error("useAnnouncement must be used within AnnouncementProvider");
  }
  return context;
};

