import CheckIcon from '@/assets/images/check-double.svg';
import { FontSize, fontSizeMap } from '@/contexts/SettingsContext';
import { useAppTheme } from '@/contexts/ThemeContext';
import { Task } from '@/utils/storage';
import { Ionicons } from '@expo/vector-icons';
import { useRef } from 'react';
import { Animated, PanResponder, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, View } from './Themed';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  fontSize?: FontSize;
  swipeToDelete?: boolean;
}

export default function TaskItem({ task, onToggle, onDelete, fontSize = 'medium', swipeToDelete = true }: TaskItemProps) {
  const { currentTheme } = useAppTheme();
  const translateX = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(1)).current;
  const completeOpacity = useRef(new Animated.Value(0)).current;
  const deleteOpacity = useRef(new Animated.Value(0)).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Respond to horizontal swipes when swipeToDelete is enabled
        return swipeToDelete && Math.abs(gestureState.dx) > Math.abs(gestureState.dy) && Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
        // Stop any ongoing animations when starting a new gesture
        translateX.stopAnimation();
      },
      onPanResponderMove: (_, gestureState) => {
        // Allow both left and right swipes
        translateX.setValue(gestureState.dx);
        
        // Show/hide icons based on swipe direction
        if (gestureState.dx > 0) {
          // Swiping right - show complete icon
          completeOpacity.setValue(Math.min(gestureState.dx / 80, 1));
          deleteOpacity.setValue(0);
        } else if (gestureState.dx < 0) {
          // Swiping left - show delete icon
          deleteOpacity.setValue(Math.min(Math.abs(gestureState.dx) / 80, 1));
          completeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -80) {
          // Swipe LEFT - delete with animation
          Animated.parallel([
            Animated.timing(translateX, {
              toValue: -400,
              duration: 300,
              useNativeDriver: true,
            }),
            Animated.timing(opacity, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }),
          ]).start(() => {
            onDelete(task.id);
          });
        } else if (gestureState.dx > 80) {
          // Swipe RIGHT - toggle completion
          onToggle(task.id);
          // Reset position
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.timing(completeOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        } else {
          // Reset position - swipe wasn't far enough
          Animated.parallel([
            Animated.spring(translateX, {
              toValue: 0,
              useNativeDriver: true,
              tension: 100,
              friction: 10,
            }),
            Animated.timing(completeOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
            Animated.timing(deleteOpacity, {
              toValue: 0,
              duration: 200,
              useNativeDriver: true,
            }),
          ]).start();
        }
      },
    })
  ).current;

  const formatDeadline = (timestamp: number) => {
    const date = new Date(timestamp);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short',
      year: 'numeric',
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    return { date: dateStr, time: timeStr };
  };

  const isOverdue = task.deadline && task.deadline < Date.now() && !task.completed;

  return (
    <Animated.View 
      style={[styles.container, { opacity }]}
      {...(swipeToDelete ? panResponder.panHandlers : {})}
    >
      {/* Left background - swipe right to complete */}
      {swipeToDelete && (
        <Animated.View style={[styles.completeBackground, { backgroundColor: currentTheme.swipeComplete, opacity: completeOpacity }]}>
          <CheckIcon width={24} height={24} color={currentTheme.buttonText} />
        </Animated.View>
      )}

      {/* Right background - swipe left to delete */}
      {swipeToDelete && (
        <Animated.View style={[styles.deleteBackground, { backgroundColor: currentTheme.swipeDelete, opacity: deleteOpacity }]}>
          <Ionicons name="trash-outline" size={24} color={currentTheme.buttonText} />
        </Animated.View>
      )}

      <Animated.View
        style={[
          styles.taskContent,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.taskRow}
          onPress={() => onToggle(task.id)}
          activeOpacity={0.7}
        >
          <View style={[
            styles.checkbox,
            { borderColor: currentTheme.tint },
            task.completed && { backgroundColor: currentTheme.tint }
          ]}>
            {task.completed && (
              <Ionicons name="checkmark" size={18} color="#ffffff" />
            )}
          </View>
          
          <View style={styles.textContainer}>
            {task.deadline && (
              <View style={styles.deadlineContainer}>
                <Ionicons 
                  name="calendar-outline" 
                  size={12} 
                  color={isOverdue ? currentTheme.error : currentTheme.placeholder} 
                />
                <Text style={[
                  styles.deadlineText,
                  { color: isOverdue ? currentTheme.error : currentTheme.placeholder },
                  isOverdue ? { fontWeight: '600' } : undefined
                ]}>
                  {formatDeadline(task.deadline).date}
                </Text>
                <Text style={[
                  styles.deadlineText,
                  { color: isOverdue ? currentTheme.error : currentTheme.placeholder },
                  isOverdue ? { fontWeight: '600' } : undefined
                ]}>
                  • {formatDeadline(task.deadline).time}
                </Text>
              </View>
            )}
            <Text 
              style={[
                styles.taskText,
                { color: currentTheme.text, fontSize: fontSizeMap[fontSize].task },
                task.completed && { opacity: 0.5, textDecorationLine: 'line-through' }
              ]}
            >
              {task.title}
            </Text>
          </View>

          {!swipeToDelete && (
            <TouchableOpacity 
              style={styles.deleteButton}
              onPress={() => onDelete(task.id)}
              activeOpacity={1}
            >
              <Ionicons name="trash-outline" size={20} color={currentTheme.error} />
            </TouchableOpacity>
          )}
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  taskContent: {
    backgroundColor: 'transparent',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  textContainer: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  taskText: {
    fontSize: 16,
    marginTop: 4,
  },
  deadlineContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'transparent',
  },
  deadlineText: {
    fontSize: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
    backgroundColor: 'transparent',
  },
  completeBackground: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteBackground: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 80,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
