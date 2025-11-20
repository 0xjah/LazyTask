import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type SortBy = 'manual' | 'deadline' | 'alphabetical' | 'newest' | 'oldest';
export type FontSize = 'small' | 'medium' | 'large';

export interface AppSettings {
  hapticFeedback: boolean;
  confirmDelete: boolean;
  showCompletedTasks: boolean;
  autoDeleteCompleted: boolean;
  sortBy: SortBy;
  fontSize: FontSize;
  animations: boolean;
  swipeToDelete: boolean;
}

const defaultSettings: AppSettings = {
  hapticFeedback: true,
  confirmDelete: true,
  showCompletedTasks: true,
  autoDeleteCompleted: false,
  sortBy: 'manual',
  fontSize: 'medium',
  animations: true,
  swipeToDelete: true,
};

interface SettingsContextType {
  settings: AppSettings;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => Promise<void>;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: AppSettings) => {
    try {
      await AsyncStorage.setItem('app_settings', JSON.stringify(newSettings));
      setSettings(newSettings);
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  const updateSetting = async <K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  };

  const updateSettings = async (updates: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updates };
    await saveSettings(newSettings);
  };

  const resetSettings = async () => {
    await saveSettings(defaultSettings);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSetting, updateSettings, resetSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Font size mapping
export const fontSizeMap = {
  small: {
    task: 14,
    header: 30,
    button: 14,
  },
  medium: {
    task: 16,
    header: 34,
    button: 16,
  },
  large: {
    task: 18,
    header: 38,
    button: 18,
  },
};
