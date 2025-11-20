import CheckIcon from '@/assets/images/check-double.svg';
import SettingsIcon from '@/assets/images/settings-icon.svg';
import AddTaskModal from '@/components/AddTaskModal';
import TaskItem from '@/components/TaskItem';
import { Text, View } from '@/components/Themed';
import { fontSizeMap, useSettings } from '@/contexts/SettingsContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { storage, Task } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Animated, FlatList, Image, Pressable, StyleSheet } from 'react-native';

export default function TabOneScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [settingsScale] = useState(new Animated.Value(1));
  const [fabScale] = useState(new Animated.Value(1));
  const { currentTheme } = useAppTheme();
  const { settings } = useSettings();
  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      loadTasks();
    }, [])
  );

  const loadTasks = async () => {
    const loadedTasks = await storage.getTasks();
    setTasks(loadedTasks);
    setLoading(false);
  };

  // Sort and filter tasks based on settings
  const getDisplayedTasks = () => {
    let displayTasks = [...tasks];

    // Filter completed tasks if setting is off
    if (!settings.showCompletedTasks) {
      displayTasks = displayTasks.filter(task => !task.completed);
    }

    // Sort tasks based on sortBy setting
    switch (settings.sortBy) {
      case 'deadline':
        displayTasks.sort((a, b) => {
          if (!a.deadline && !b.deadline) return 0;
          if (!a.deadline) return 1;
          if (!b.deadline) return -1;
          return a.deadline - b.deadline;
        });
        break;
      case 'alphabetical':
        displayTasks.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        displayTasks.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'oldest':
        displayTasks.sort((a, b) => a.createdAt - b.createdAt);
        break;
      case 'manual':
      default:
        // Keep original order
        break;
    }

    return displayTasks;
  };

  const handleAddTask = async (title: string, deadline?: number) => {
    await storage.addTask(title, deadline);
    await loadTasks();
    if (settings.hapticFeedback) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleToggleTask = async (id: string) => {
    if (settings.hapticFeedback) {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    await storage.toggleTask(id);
    await loadTasks();
  };

  const handleDeleteTask = async (id: string) => {
    if (settings.confirmDelete) {
      Alert.alert(
        'Delete Task',
        'Are you sure you want to delete this task?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              if (settings.hapticFeedback) {
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              }
              await storage.deleteTask(id);
              await loadTasks();
            },
          },
        ]
      );
    } else {
      if (settings.hapticFeedback) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      await storage.deleteTask(id);
      await loadTasks();
    }
  };

  const completedCount = tasks.filter(t => t.completed).length;
  const totalCount = tasks.length;
  const pendingCount = totalCount - completedCount;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const displayedTasks = getDisplayedTasks();

  const animateButton = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 0.85,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 50,
        bounciness: 8,
      }),
    ]).start();
  };

  return (
    <View style={[
      styles.container,
      { backgroundColor: currentTheme.background }
    ]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: currentTheme.background }]}>
        <View style={[styles.headerContent, { backgroundColor: 'transparent' }]}>
          <Pressable
            onPressIn={() => {
              Animated.spring(settingsScale, {
                toValue: 0.85,
                useNativeDriver: true,
                speed: 50,
                bounciness: 8,
              }).start();
            }}
            onPressOut={() => {
              Animated.spring(settingsScale, {
                toValue: 1,
                useNativeDriver: true,
                speed: 50,
                bounciness: 8,
              }).start();
            }}
            onPress={() => router.push('/(tabs)/two')}
          >
            <Animated.View 
              style={[
                styles.settingsButton, 
                { 
                  backgroundColor: currentTheme.card,
                  borderColor: currentTheme.border,
                  transform: [{ scale: settingsScale }],
                }
              ]}
            >
              <SettingsIcon width={24} height={24} color={currentTheme.tint} />
            </Animated.View>
          </Pressable>
          
          <View style={{ backgroundColor: 'transparent', flex: 1 }}>
            <Text style={[styles.headerTitle, { 
              color: currentTheme.text,
              fontSize: fontSizeMap[settings.fontSize].header 
            }]}>Tasks</Text>
            {totalCount > 0 && (
              <Text style={[styles.headerSubtitle, { color: currentTheme.placeholder }]}>
                {pendingCount} pending{completedCount > 0 ? ` · ${completedCount} done` : ''}
              </Text>
            )}
          </View>
        </View>

        {/* Progress bar */}
        {totalCount > 0 && (
          <View style={[styles.progressBarContainer, { backgroundColor: currentTheme.border }]}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  backgroundColor: currentTheme.tint,
                  width: `${completionRate}%` 
                }
              ]} 
            />
          </View>
        )}
      </View>

      {/* Task List */}
      {loading ? (
        <View style={styles.emptyContainer}>  
          <Text style={[styles.emptyText, { color: currentTheme.placeholder }]}>Loading...</Text>
        </View>
      ) : tasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Image 
            source={require('@/assets/images/Light-Icon.png')} 
            style={[
              styles.emptyIcon,
              { tintColor: currentTheme.tint, opacity: 0.15 }
            ]}
            resizeMode="contain"
          />
        </View>
      ) : displayedTasks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <View style={{ opacity: 0.3 }}>
            <CheckIcon width={80} height={80} color={currentTheme.tint} />
          </View>
          <Text style={[styles.emptyTitle, { color: currentTheme.text }]}>All Done!</Text>
          <Text style={[styles.emptySubtitle, { color: currentTheme.placeholder }]}>
            You've completed all your tasks
          </Text>
        </View>
      ) : (
        <FlatList
          data={displayedTasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggle={handleToggleTask}
              onDelete={handleDeleteTask}
              fontSize={settings.fontSize}
              swipeToDelete={settings.swipeToDelete}
            />
          )}
          contentContainerStyle={styles.taskList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Floating Add Button */}
      <Pressable
        onPressIn={() => {
          Animated.spring(fabScale, {
            toValue: 0.85,
            useNativeDriver: true,
            speed: 50,
            bounciness: 8,
          }).start();
        }}
        onPressOut={() => {
          Animated.spring(fabScale, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 8,
          }).start();
        }}
        onPress={() => {
          setModalVisible(true);
          if (settings.hapticFeedback) {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
      >
        <Animated.View 
          style={[
            styles.fab, 
            { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border,
              transform: [{ scale: fabScale }],
            }
          ]}
        >
          <Ionicons name="add" size={32} color={currentTheme.tint} style={{ fontWeight: 'bold' }} />
        </Animated.View>
      </Pressable>

      {/* Add Task Modal */}
      <AddTaskModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAddTask={handleAddTask}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1,
    textAlign: 'right',
  },
  headerSubtitle: {
    fontSize: 15,
    marginTop: 4,
    opacity: 0.7,
    textAlign: 'right',
  },
  settingsButton: {
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
  progressBarContainer: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 48,
    gap: 12,
  },
  emptyIcon: {
    width: 300,
    height: 300,
    marginBottom: 55,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyText: {
    fontSize: 16,
  },
  taskList: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 100,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 24,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
});
