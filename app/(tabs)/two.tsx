import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Animated, Platform, Pressable, ScrollView, StyleSheet, Switch, TouchableOpacity, UIManager } from 'react-native';

import ArrowsUpDown from '@/assets/images/arrows-up-down.svg';
import DropdownMenu from '@/components/DropdownMenu';
import { Text, View } from '@/components/Themed';
import { useSettings } from '@/contexts/SettingsContext';
import {
  ThemeName,
  themeOptions,
  TintColorName,
  tintColors,
  useAppTheme
} from '@/contexts/ThemeContext';
import { storage } from '@/utils/storage';

export default function TabTwoScreen() {
  const router = useRouter();
  const { currentTheme, themeName, tintColorName, setTheme, setTintColor } = useAppTheme();
  const { settings, updateSetting, resetSettings } = useSettings();

  const [backScale] = useState(new Animated.Value(1));

  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
  });

  const [themePickerVisible, setThemePickerVisible] = useState(false);
  const [colorPickerVisible, setColorPickerVisible] = useState(false);
  const [sortPickerVisible, setSortPickerVisible] = useState(false);
  const [fontSizePickerVisible, setFontSizePickerVisible] = useState(false);

  const sortOptions = {
    manual: 'Manual',
    deadline: 'Deadline',
    alphabetical: 'Alphabetical',
    newest: 'Newest First',
    oldest: 'Oldest First',
  };

  const fontSizeOptions = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large',
  };

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    const tasks = await storage.getTasks();
    const completed = tasks.filter(task => task.completed).length;
    setStats({
      total: tasks.length,
      completed,
      pending: tasks.length - completed,
    });
  };

  const toggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key]);
  };

  const changeTheme = (newThemeName: ThemeName) => {
    setTheme(newThemeName);
  };

  const changeColor = (colorName: TintColorName) => {
    setTintColor(colorName);
  };

  const handleClearAllTasks = async () => {
    Alert.alert(
      'Delete All Tasks',
      `Are you sure you want to delete all ${stats.total} tasks? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAllTasks();
            await loadStats();
            Alert.alert('Success', 'All tasks have been deleted');
          },
        },
      ]
    );
  };

  const handleResetApp = async () => {
    Alert.alert(
      'Reset App',
      'This will delete all your tasks and reset all settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            await storage.clearAllTasks();
            await AsyncStorage.clear();
            await resetSettings();
            await loadStats();
            Alert.alert('Success', 'App has been reset');
          },
        },
      ]
    );
  };

  const SettingItem = ({ title, subtitle, value, onToggle, type = 'switch' }: any) => {
    const handleToggle = (newValue: boolean) => {
      // Disable animations globally during switch toggle
      if (Platform.OS === 'ios') {
        UIManager.setLayoutAnimationEnabledExperimental?.(false);
      }
      onToggle(newValue);
      // Re-enable after a short delay
      setTimeout(() => {
        if (Platform.OS === 'ios') {
          UIManager.setLayoutAnimationEnabledExperimental?.(true);
        }
      }, 50);
    };

    return (
      <TouchableOpacity 
        style={styles.settingItem} 
        onPress={type === 'button' ? value : onToggle}
        activeOpacity={1}
      >
        <View style={[styles.settingText, { backgroundColor: 'transparent' }]}>
          <Text style={[styles.settingTitle, { color: currentTheme.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: currentTheme.placeholder }]}>{subtitle}</Text>}
        </View>
        {type === 'switch' && (
          <Switch
            value={value}
            onValueChange={handleToggle}
            trackColor={{ false: currentTheme.disabled, true: currentTheme.tint }}
            thumbColor={currentTheme.tint === '#FFFFFF' || currentTheme.tint === '#ffffff' ? '#757575' : '#FFFFFF'}
            ios_backgroundColor={currentTheme.disabled}
          />
        )}
        {type === 'button' && (
          <Text style={[styles.chevron, { color: currentTheme.placeholder }]}>›</Text>
        )}
      </TouchableOpacity>
    );
  };

  const ThemeSelector = () => {
    const options = Object.entries(themeOptions).map(([key, label]) => ({ key, label }));
    return (
      <DropdownMenu
        visible={themePickerVisible}
        handleClose={() => setThemePickerVisible(false)}
        handleOpen={() => setThemePickerVisible(true)}
        dropdownWidth={250}
        trigger={
          <View
            style={[styles.pickerButton, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }]}
          >
            <Text style={[styles.pickerButtonText, { color: currentTheme.text }]}>
              {themeOptions[themeName]}
            </Text>
            <ArrowsUpDown width={20} height={20} color={currentTheme.tint} />
          </View>
        }
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.dropdownItem, { backgroundColor: 'transparent' }]}
            onPress={() => {
              changeTheme(option.key as ThemeName);
              setThemePickerVisible(false);
            }}
            activeOpacity={1}
          >
            <Text style={[styles.dropdownItemText, { 
              color: currentTheme.text,
              fontWeight: option.key === themeName ? '600' : '400'
            }]}>
              {option.label}
            </Text>
            {option.key === themeName && (
              <Text style={[styles.dropdownCheckmark, { color: currentTheme.tint }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </DropdownMenu>
    );
  };

  const ColorSelector = () => {
    const options = Object.entries(tintColors).map(([key, color]) => ({
      key,
      label: key === 'monochromic' 
        ? 'Monochromic' 
        : key.charAt(0).toUpperCase() + key.slice(1),
      color: key === 'monochromic' ? currentTheme.text : color
    }));
    return (
      <DropdownMenu
        visible={colorPickerVisible}
        handleClose={() => setColorPickerVisible(false)}
        handleOpen={() => setColorPickerVisible(true)}
        dropdownWidth={250}
        trigger={
          <View
            style={[styles.pickerButton, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }]}
          >
            <Text style={[styles.pickerButtonText, { 
              color: tintColorName === 'monochromic' 
                ? currentTheme.text 
                : tintColors[tintColorName]
            }]}>
              {tintColorName === 'monochromic' 
                ? 'Monochromic'
                : tintColorName.charAt(0).toUpperCase() + tintColorName.slice(1)}
            </Text>
            <ArrowsUpDown width={20} height={20} color={currentTheme.tint} />
          </View>
        }
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.dropdownItem, { backgroundColor: 'transparent' }]}
            onPress={() => {
              changeColor(option.key as TintColorName);
              setColorPickerVisible(false);
            }}
            activeOpacity={1}
          >
            <View style={[styles.dropdownColorRow, { backgroundColor: 'transparent' }]}>
              <View style={[styles.colorDot, { backgroundColor: option.color, marginRight: 12 }]} />
              <Text style={[styles.dropdownItemText, { 
                color: currentTheme.text,
                fontWeight: option.key === tintColorName ? '600' : '400'
              }]}>
                {option.label}
              </Text>
            </View>
            {option.key === tintColorName && (
              <Text style={[styles.dropdownCheckmark, { color: currentTheme.tint }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </DropdownMenu>
    );
  };

  const SortSelector = () => {
    const options = Object.entries(sortOptions).map(([key, label]) => ({ key, label }));
    return (
      <DropdownMenu
        visible={sortPickerVisible}
        handleClose={() => setSortPickerVisible(false)}
        handleOpen={() => setSortPickerVisible(true)}
        dropdownWidth={250}
        trigger={
          <View
            style={[styles.pickerButton, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }]}
          >
            <Text style={[styles.pickerButtonText, { color: currentTheme.text }]}>
              {sortOptions[settings.sortBy as keyof typeof sortOptions]}
            </Text>
            <ArrowsUpDown width={20} height={20} color={currentTheme.tint} />
          </View>
        }
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.dropdownItem, { backgroundColor: 'transparent' }]}
            onPress={() => {
              updateSetting('sortBy', option.key as any);
              setSortPickerVisible(false);
            }}
            activeOpacity={1}
          >
            <Text style={[styles.dropdownItemText, { 
              color: currentTheme.text,
              fontWeight: option.key === settings.sortBy ? '600' : '400'
            }]}>
              {option.label}
            </Text>
            {option.key === settings.sortBy && (
              <Text style={[styles.dropdownCheckmark, { color: currentTheme.tint }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </DropdownMenu>
    );
  };

  const FontSizeSelector = () => {
    const options = Object.entries(fontSizeOptions).map(([key, label]) => ({ key, label }));
    return (
      <DropdownMenu
        visible={fontSizePickerVisible}
        handleClose={() => setFontSizePickerVisible(false)}
        handleOpen={() => setFontSizePickerVisible(true)}
        dropdownWidth={250}
        trigger={
          <View
            style={[styles.pickerButton, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
            }]}
          >
            <Text style={[styles.pickerButtonText, { color: currentTheme.text }]}>
              {fontSizeOptions[settings.fontSize as keyof typeof fontSizeOptions]}
            </Text>
            <ArrowsUpDown width={20} height={20} color={currentTheme.tint} />
          </View>
        }
      >
        {options.map((option) => (
          <TouchableOpacity
            key={option.key}
            style={[styles.dropdownItem, { backgroundColor: 'transparent' }]}
            onPress={() => {
              updateSetting('fontSize', option.key as any);
              setFontSizePickerVisible(false);
            }}
            activeOpacity={1}
          >
            <Text style={[styles.dropdownItemText, { 
              color: currentTheme.text,
              fontWeight: option.key === settings.fontSize ? '600' : '400'
            }]}>
              {option.label}
            </Text>
            {option.key === settings.fontSize && (
              <Text style={[styles.dropdownCheckmark, { color: currentTheme.tint }]}>✓</Text>
            )}
          </TouchableOpacity>
        ))}
      </DropdownMenu>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.background }}>
      {/* Header with Back Button */}
      <View style={[styles.header, { backgroundColor: currentTheme.background }]}>
        <Pressable
          onPressIn={() => {
            Animated.spring(backScale, {
              toValue: 0.85,
              useNativeDriver: true,
              speed: 50,
              bounciness: 8,
            }).start();
          }}
          onPressOut={() => {
            Animated.spring(backScale, {
              toValue: 1,
              useNativeDriver: true,
              speed: 50,
              bounciness: 8,
            }).start();
          }}
          onPress={() => router.back()}
        >
          <Animated.View 
            style={[
              styles.backButton, 
              { 
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border,
                transform: [{ scale: backScale }],
              }
            ]}
          >
            <Ionicons name="arrow-back" size={24} color={currentTheme.tint} />
          </Animated.View>
        </Pressable>
        
        <Text style={[styles.pageTitle, { color: currentTheme.text, flex: 1 }]}>Settings</Text>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Appearance Section */}
        <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Appearance</Text>
            <View style={[styles.settingRow, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Theme</Text>
              <ThemeSelector />
            </View>
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <View style={[styles.settingRow, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Accent Color</Text>
              <ColorSelector />
            </View>
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <View style={[styles.settingRow, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Text Size</Text>
              <FontSizeSelector />
            </View>
          </View>

          {/* Display Section */}
          <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Display</Text>
            <SettingItem
              title="Show Completed"
              value={settings.showCompletedTasks}
              onToggle={() => toggleSetting('showCompletedTasks')}
            />
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <SettingItem
              title="Animations"
              value={settings.animations}
              onToggle={() => toggleSetting('animations')}
            />
          </View>

          {/* Task Management Section */}
          <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Tasks</Text>
            <View style={[styles.settingRow, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.settingLabel, { color: currentTheme.text }]}>Sort Order</Text>
              <SortSelector />
            </View>
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <SettingItem
              title="Swipe to Delete"
              value={settings.swipeToDelete}
              onToggle={() => toggleSetting('swipeToDelete')}
            />
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <SettingItem
              title="Confirm Delete"
              value={settings.confirmDelete}
              onToggle={() => toggleSetting('confirmDelete')}
            />
            
            <View style={[styles.divider, { backgroundColor: currentTheme.border }]} />
            
            <SettingItem
              title="Auto-Delete Completed"
              value={settings.autoDeleteCompleted}
              onToggle={() => toggleSetting('autoDeleteCompleted')}
            />
          </View>

          {/* Interaction Section */}
          <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Interaction</Text>
            <SettingItem
              title="Haptic Feedback"
              subtitle="Vibrate on task completion and deletion"
              value={settings.hapticFeedback}
              onToggle={() => toggleSetting('hapticFeedback')}
            />
          </View>

          {/* Data Management Section */}
          <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Data Management</Text>
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, gap: 12, backgroundColor: 'transparent' }}>
              <TouchableOpacity
                style={[styles.modernButton, { 
                  backgroundColor: currentTheme.error + '15',
                  borderColor: currentTheme.error + '30',
                }]}
                onPress={handleClearAllTasks}
                activeOpacity={0.6}
              >
                <View style={[styles.modernButtonContent, { backgroundColor: 'transparent' }]}>
                  <View style={[styles.modernButtonIcon, { backgroundColor: currentTheme.error + '20' }]}>
                    <Ionicons name="trash-outline" size={20} color={currentTheme.error} />
                  </View>
                  <View style={[styles.modernButtonText, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.modernButtonTitle, { color: currentTheme.error }]}>Delete All Tasks</Text>
                    <Text style={[styles.modernButtonSubtitle, { color: currentTheme.placeholder }]}>
                      Remove all tasks from your list
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modernButton, { 
                  backgroundColor: currentTheme.error + '15',
                  borderColor: currentTheme.error + '30',
                }]}
                onPress={handleResetApp}
                activeOpacity={0.6}
              >
                <View style={[styles.modernButtonContent, { backgroundColor: 'transparent' }]}>
                  <View style={[styles.modernButtonIcon, { backgroundColor: currentTheme.error + '20' }]}>
                    <Ionicons name="refresh-outline" size={20} color={currentTheme.error} />
                  </View>
                  <View style={[styles.modernButtonText, { backgroundColor: 'transparent' }]}>
                    <Text style={[styles.modernButtonTitle, { color: currentTheme.error }]}>Reset App</Text>
                    <Text style={[styles.modernButtonSubtitle, { color: currentTheme.placeholder }]}>
                      Delete all data and reset settings
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* About Section */}
          <View style={[styles.section, { backgroundColor: currentTheme.card, borderColor: currentTheme.border }]}>
          <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>About</Text>
            <View style={[styles.aboutContent, { backgroundColor: 'transparent' }]}>
              <Text style={[styles.aboutTitle, { color: currentTheme.text }]}>LazyTask</Text>
              <Text style={[styles.aboutVersion, { color: currentTheme.placeholder }]}>Version 1.0.0</Text>
              <Text style={[styles.aboutDescription, { color: currentTheme.placeholder }]}>
                A beautiful, minimal task management app that keeps your data private and secure on your device.
              </Text>
            </View>
          </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  backButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'right',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 100,
    gap: 12,
  },
  section: {
    borderRadius: 12,
    borderWidth: 0.5,
    overflow: 'hidden',
    opacity: 1,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.5,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 6,
  },
  divider: {
    height: 0.5,
    marginLeft: 16,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    minHeight: 40,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '400',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 40,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 17,
    fontWeight: '400',
    marginBottom: 1,
  },
  settingSubtitle: {
    fontSize: 13,
    opacity: 0.6,
  },
  chevron: {
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 20,
  },
  pickerButton: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 0.5,
    minWidth: 120,
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  pickerButtonText: {
    fontSize: 16,
    fontWeight: '400',
    flexShrink: 1,
  },
  colorDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  aboutContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  aboutTitle: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 15,
    marginBottom: 8,
  },
  aboutDescription: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownItemText: {
    fontSize: 16,
    flex: 1,
  },
  dropdownCheckmark: {
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 12,
  },
  dropdownColorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modernButton: {
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
  },
  modernButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  modernButtonIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modernButtonText: {
    flex: 1,
  },
  modernButtonTitle: {
    fontSize: 17,
    fontWeight: '600',
    marginBottom: 2,
  },
  modernButtonSubtitle: {
    fontSize: 13,
    lineHeight: 18,
  },
});