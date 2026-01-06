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
  updateSettings: (settings: Partial<AnnouncementSettings>) => void;
  addAnnouncement: (announcement: Omit<Announcement, "id">) => void;
  updateAnnouncement: (id: string, announcement: Partial<Announcement>) => void;
  deleteAnnouncement: (id: string) => void;
  loadSettings: () => Promise<void>;
  saveSettings: () => Promise<void>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

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
  ],
};

export const AnnouncementProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<AnnouncementSettings>(defaultSettings);

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
        updateSettings,
        addAnnouncement,
        updateAnnouncement,
        deleteAnnouncement,
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

