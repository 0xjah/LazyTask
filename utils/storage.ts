import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
  deadline?: number;
}

const TASKS_KEY = '@lazytask_tasks';

export const storage = {
  // Get all tasks
  async getTasks(): Promise<Task[]> {
    try {
      const tasksJson = await AsyncStorage.getItem(TASKS_KEY);
      return tasksJson ? JSON.parse(tasksJson) : [];
    } catch (error) {
      console.error('Error getting tasks:', error);
      return [];
    }
  },

  // Save tasks
  async saveTasks(tasks: Task[]): Promise<void> {
    try {
      await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    } catch (error) {
      console.error('Error saving tasks:', error);
    }
  },

  // Add a new task
  async addTask(title: string, deadline?: number): Promise<Task> {
    const tasks = await this.getTasks();
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      completed: false,
      createdAt: Date.now(),
      deadline,
    };
    tasks.unshift(newTask); // Add to beginning
    await this.saveTasks(tasks);
    return newTask;
  },

  // Toggle task completion
  async toggleTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const task = tasks.find(t => t.id === id);
    if (task) {
      task.completed = !task.completed;
      await this.saveTasks(tasks);
    }
  },

  // Delete a task
  async deleteTask(id: string): Promise<void> {
    const tasks = await this.getTasks();
    const filteredTasks = tasks.filter(t => t.id !== id);
    await this.saveTasks(filteredTasks);
  },

  // Clear all tasks
  async clearAllTasks(): Promise<void> {
    await AsyncStorage.removeItem(TASKS_KEY);
  },
};
