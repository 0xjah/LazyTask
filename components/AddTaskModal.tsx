import { useAppTheme } from '@/contexts/ThemeContext';
import { getFontFamily } from '@/utils/fontHelper';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Modal,
    Platform,
    Pressable,
    StyleSheet,
    TextInput,
    TouchableOpacity
} from 'react-native';
import { Text, View } from './Themed';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (title: string, deadline?: number) => void;
}

export default function AddTaskModal({ visible, onClose, onAddTask }: AddTaskModalProps) {
  const [title, setTitle] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deadline, setDeadline] = useState<Date | undefined>();
  const { currentTheme } = useAppTheme();

  const handleAddTask = () => {
    if (title.trim()) {
      onAddTask(title.trim(), deadline?.getTime());
      setTitle('');
      setDeadline(undefined);
      setShowDatePicker(false);
      onClose();
    }
  };

  const handleClose = () => {
    setTitle('');
    setDeadline(undefined);
    setShowDatePicker(false);
    onClose();
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDeadline(selectedDate);
    }
  };

  const handleDatePickerDone = () => {
    setShowDatePicker(false);
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      <Pressable 
        style={[styles.overlay, { backgroundColor: currentTheme.overlay }]}
        onPress={handleClose}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <Pressable onPress={(e) => e.stopPropagation()}>
            <View style={[styles.modalContent, { 
              backgroundColor: currentTheme.card,
              borderColor: currentTheme.border 
            }]}>
              <TextInput
                style={[styles.textArea, { 
                  color: currentTheme.text, 
                  borderColor: currentTheme.border,
                  backgroundColor: 'transparent',
                  fontFamily: getFontFamily(title)
                }]}
                placeholder="What needs to be done?"
                placeholderTextColor={currentTheme.placeholder}
                value={title}
                onChangeText={setTitle}
                multiline
                textAlignVertical="top"
                autoFocus
              />

              <View style={[styles.bottomRow, { backgroundColor: 'transparent' }]}>
                <TouchableOpacity 
                  style={[styles.dateButton, { backgroundColor: 'transparent' }]}
                  onPress={() => setShowDatePicker(!showDatePicker)}
                  activeOpacity={1}
                >
                  <Ionicons name="calendar-outline" size={20} color={currentTheme.text} />
                  {deadline && <Text style={[styles.dateText, { 
                    color: currentTheme.text,
                    backgroundColor: 'transparent'
                  }]}>
                    {deadline.toLocaleDateString()}
                  </Text>}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.addButton, 
                    { backgroundColor: currentTheme.tint },
                    !title.trim() && [styles.addButtonDisabled, { backgroundColor: '#404040' }]
                  ]}
                  onPress={handleAddTask}
                  disabled={!title.trim()}
                  activeOpacity={1}
                >
                  <Text style={[styles.addButtonText, { 
                    color: currentTheme.buttonText || '#ffffff'
                  }]}>Add</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>

      {/* Date Picker Popup */}
      {showDatePicker && (
        <Modal
          transparent
          animationType="fade"
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <Pressable 
            style={styles.datePickerOverlay}
            onPress={() => setShowDatePicker(false)}
          >
            <Pressable onPress={(e) => e.stopPropagation()}>
              <View style={[styles.datePickerPopup, { 
                backgroundColor: currentTheme.card,
                borderColor: currentTheme.border 
              }]}>
                {Platform.OS === 'ios' && (
                  <View style={[styles.datePickerHeader, { 
                    borderBottomColor: currentTheme.border 
                  }]}>
                    <TouchableOpacity onPress={handleDatePickerDone}>
                      <Text style={[styles.doneButton, { color: currentTheme.tint }]}>Done</Text>
                    </TouchableOpacity>
                  </View>
                )}
                <DateTimePicker
                  value={deadline || new Date()}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={handleDateChange}
                  minimumDate={new Date()}
                  textColor={currentTheme.text}
                  themeVariant={currentTheme.background === '#000000' ? 'dark' : 'light'}
                />
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      )}
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 200,
    borderWidth: 0.5,
    opacity: 1,
  },
  textArea: {
    fontSize: 18,
    minHeight: 120,
    maxHeight: 200,
    borderWidth: 0,
    padding: 0,
    marginBottom: 20,
    backgroundColor: 'transparent',
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'auto',
    backgroundColor: 'transparent',
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  dateText: {
    marginLeft: 8,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  addButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontWeight: '600',
    fontSize: 16,
  },
  datePickerContainer: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 0.5,
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  datePickerPopup: {
    borderRadius: 20,
    borderWidth: 0.5,
    overflow: 'hidden',
    minWidth: 300,
    opacity: 1,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  doneButton: {
    fontSize: 17,
    fontWeight: '600',
  },
});