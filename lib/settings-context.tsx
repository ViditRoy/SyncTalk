'use client';

import { createContext, useContext, useState, useEffect } from 'react';

export interface UserSettings {
  notifications: boolean;
  soundEnabled: boolean;
  status: 'online' | 'offline' | 'away';
  privateMessages: 'all' | 'friends' | 'none';
  readReceipts: boolean;
  lastActivityVisible: boolean;
}

const defaultSettings: UserSettings = {
  notifications: true,
  soundEnabled: true,
  status: 'online',
  privateMessages: 'all',
  readReceipts: true,
  lastActivityVisible: true,
};

interface SettingsContextType {
  settings: UserSettings;
  updateSettings: (newSettings: Partial<UserSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Load user and settings on mount
  useEffect(() => {
    const loadUserAndSettings = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const user = JSON.parse(storedUser);
          setCurrentUserId(user.id);

          // Load settings from API
          const response = await fetch(`/api/settings?userId=${user.id}`);
          if (response.ok) {
            const dbSettings = await response.json();
            if (dbSettings.id) {
              setSettings({
                notifications: dbSettings.notifications,
                soundEnabled: dbSettings.soundEnabled,
                status: dbSettings.status as 'online' | 'offline' | 'away',
                privateMessages: dbSettings.privateMessages as 'all' | 'friends' | 'none',
                readReceipts: dbSettings.readReceipts,
                lastActivityVisible: dbSettings.lastActivityVisible,
              });
            }
          }
        } catch (error) {
          console.error('Failed to load user/settings:', error);
        }
      }
    };

    loadUserAndSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<UserSettings>) => {
    if (!currentUserId) return;

    const updated = { ...settings, ...newSettings };
    setSettings(updated);

    // Save to API
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, ...updated }),
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const resetSettings = async () => {
    if (!currentUserId) return;

    setSettings(defaultSettings);

    // Reset via API
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUserId, ...defaultSettings }),
      });
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }
  return context;
}
