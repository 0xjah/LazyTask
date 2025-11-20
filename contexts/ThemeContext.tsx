import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance } from 'react-native';

// Color options
export const tintColors = {
  blue: '#007AFF',
  green: '#34c759',
  red: '#ff3b30',
  orange: '#ff9500',
  purple: '#af52de',
  pink: '#ff2d92',
  yellow: '#ffcc02',
  monochromic: 'monochromic', // Special value
};

// Base theme definitions
const createTheme = (isDark: boolean, tintColor: string) => {
  const isMonochromic = tintColor === 'monochromic';
  const effectiveTint = isMonochromic ? (isDark ? '#ffffff' : '#000000') : tintColor;
  
  return {
    background: isDark ? '#000000' : '#ffffff',
    text: isDark ? '#ffffff' : '#000000',
    tint: effectiveTint,
    card: isDark ? '#1a1a1a' : '#f8f8f8',
    border: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
    tabIconDefault: '#8e8e93',
    tabIconSelected: effectiveTint,
    swipeComplete: isMonochromic ? effectiveTint : (isDark ? '#30d158' : '#34c759'),
    swipeDelete: isMonochromic ? effectiveTint : (isDark ? '#ff453a' : '#ff3b30'),
    overlay: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.4)',
    placeholder: '#8e8e93',
    disabled: isDark ? '#2a2a2a' : '#f0f0f0',
    accent: effectiveTint,
    success: isMonochromic ? effectiveTint : (isDark ? '#30d158' : '#34c759'),
    warning: isMonochromic ? effectiveTint : (isDark ? '#ff9f0a' : '#ff9500'),
    error: isMonochromic ? effectiveTint : (isDark ? '#ff453a' : '#ff3b30'),
    buttonText: isMonochromic ? (isDark ? '#000000' : '#ffffff') : '#ffffff',
  };
};

export const themeOptions = {
  auto: 'Auto',
  light: 'Light',
  dark: 'Dark',
};

export type ThemeName = keyof typeof themeOptions;
export type TintColorName = keyof typeof tintColors;
export type Theme = ReturnType<typeof createTheme>;

interface ThemeContextType {
  currentTheme: Theme;
  themeName: ThemeName;
  tintColorName: TintColorName;
  setTheme: (themeName: ThemeName) => void;
  setTintColor: (colorName: TintColorName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeName, setThemeName] = useState<ThemeName>('auto');
  const [tintColorName, setTintColorNameState] = useState<TintColorName>('blue');
  const [systemColorScheme, setSystemColorScheme] = useState(Appearance.getColorScheme());

  const isDarkMode = themeName === 'auto' 
    ? systemColorScheme === 'dark'
    : themeName === 'dark';

  const currentTheme = createTheme(isDarkMode, tintColors[tintColorName]);

  useEffect(() => {
    loadSettings();
    
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setSystemColorScheme(colorScheme);
    });

    return () => subscription?.remove();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        if (settings.theme && themeOptions[settings.theme as ThemeName]) {
          setThemeName(settings.theme as ThemeName);
        }
        if (settings.tintColor && tintColors[settings.tintColor as TintColorName]) {
          setTintColorNameState(settings.tintColor as TintColorName);
        }
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const setTheme = async (newThemeName: ThemeName) => {
    setThemeName(newThemeName);
    await saveSettings({ theme: newThemeName, tintColor: tintColorName });
  };

  const setTintColor = async (colorName: TintColorName) => {
    setTintColorNameState(colorName);
    await saveSettings({ theme: themeName, tintColor: colorName });
  };

  const saveSettings = async (updates: { theme: ThemeName; tintColor: TintColorName }) => {
    try {
      const savedSettings = await AsyncStorage.getItem('app_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : {};
      Object.assign(settings, updates);
      await AsyncStorage.setItem('app_settings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ 
      currentTheme, 
      themeName, 
      tintColorName,
      setTheme, 
      setTintColor 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within a ThemeProvider');
  }
  return context;
}