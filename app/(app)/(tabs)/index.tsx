import { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, Plus, Trash2, Calendar, Clock, Tag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

interface Task {
  id: string;
  title: string;
  is_complete: boolean;
  category: string;
  due_date: string;
  due_time: string;
}

const CATEGORIES = [
  { id: 'social', label: 'Protocolo Social' },
  { id: 'education', label: 'Entrenamiento Mental' },
  { id: 'work', label: 'Misión Laboral' },
  { id: 'other', label: 'Protocolo Alternativo' },
];

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedCategory, setSelectedCategory] = useState('social');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [inputHeight, setInputHeight] = useState(0);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const savedTasks = await AsyncStorage.getItem('tasks');
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveTasks = async (newTasks: Task[]) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(newTasks));
    } catch (err) {
      console.error('Error saving tasks:', err);
    }
  };

  const addTask = async () => {
    if (!newTask.trim()) return;

    const newTaskItem: Task = {
      id: Date.now().toString(),
      title: newTask.trim(),
      is_complete: false,
      category: selectedCategory,
      due_date: selectedDate.toISOString().split('T')[0],
      due_time: selectedTime.toLocaleTimeString(),
    };

    const updatedTasks = [newTaskItem, ...tasks];
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setNewTask('');
  };

  const toggleTask = async (task: Task) => {
    const updatedTasks = tasks.map(t =>
      t.id === task.id ? { ...t, is_complete: !t.is_complete } : t
    );
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const deleteTask = async (id: string) => {
    const updatedTasks = tasks.filter(t => t.id !== id);
    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
  };

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleEditTask = () => {
    setIsEditing(true);
    // Establecer los valores actuales en los estados de edición
    if (selectedTask) {
      setNewTask(selectedTask.title);
      setSelectedCategory(selectedTask.category);
      setSelectedDate(new Date(selectedTask.due_date));
      setSelectedTime(new Date(`2000-01-01T${selectedTask.due_time}`));
    }
  };

  const saveEditedTask = async () => {
    if (!selectedTask || !newTask.trim()) return;

    const updatedTask: Task = {
      ...selectedTask,
      title: newTask.trim(),
      category: selectedCategory,
      due_date: selectedDate.toISOString().split('T')[0],
      due_time: selectedTime.toLocaleTimeString(),
    };

    const updatedTasks = tasks.map(t =>
      t.id === selectedTask.id ? updatedTask : t
    );

    setTasks(updatedTasks);
    await saveTasks(updatedTasks);
    setIsEditing(false);
    setShowTaskModal(false);
    setSelectedTask(null);
    setNewTask('');
  };

  const CategoryPickerModal = () => (
    <Modal
      visible={showCategoryPicker}
      transparent
      animationType="fade"
      onRequestClose={() => setShowCategoryPicker(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Seleccionar Protocolo</Text>
          {CATEGORIES.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryOption,
                selectedCategory === category.id && styles.categoryOptionSelected
              ]}
              onPress={() => {
                setSelectedCategory(category.id);
                setShowCategoryPicker(false);
              }}
            >
              <Text style={styles.categoryText}>{category.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </Modal>
  );

  const TaskDetailsModal = () => (
    <Modal
      visible={showTaskModal}
      transparent
      animationType="fade"
      onRequestClose={() => {
        setShowTaskModal(false);
        setSelectedTask(null);
        setIsEditing(false);
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {!isEditing ? (
            // Vista de detalles
            <>
              <Text style={styles.modalTitle}>Detalles de la Directiva</Text>
              <View style={styles.taskDetails}>
                <Text style={styles.taskDetailLabel}>Título:</Text>
                <Text style={styles.taskDetailText}>{selectedTask?.title}</Text>

                <Text style={styles.taskDetailLabel}>Protocolo:</Text>
                <Text style={styles.taskDetailText}>
                  {CATEGORIES.find(c => c.id === selectedTask?.category)?.label}
                </Text>

                <Text style={styles.taskDetailLabel}>Fecha:</Text>
                <Text style={styles.taskDetailText}>
                  {new Date(selectedTask?.due_date || '').toLocaleDateString()}
                </Text>

                <Text style={styles.taskDetailLabel}>Hora:</Text>
                <Text style={styles.taskDetailText}>{selectedTask?.due_time}</Text>

                <Text style={styles.taskDetailLabel}>Estado:</Text>
                <Text style={styles.taskDetailText}>
                  {selectedTask?.is_complete ? 'Completada' : 'Pendiente'}
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => toggleTask(selectedTask!)}
                >
                  <Check size={20} color="#00ff00" />
                  <Text style={styles.modalButtonText}>
                    {selectedTask?.is_complete ? 'Desmarcar' : 'Completar'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleEditTask}
                >
                  <Clock size={20} color="#00ff00" />
                  <Text style={styles.modalButtonText}>Modificar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => {
                    deleteTask(selectedTask!.id);
                    setShowTaskModal(false);
                  }}
                >
                  <Trash2 size={20} color="#ff0000" />
                  <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
                    Eliminar
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            // Vista de edición
            <>
              <Text style={styles.modalTitle}>Modificar Directiva</Text>
              <TextInput
                style={styles.modalInput}
                value={newTask}
                onChangeText={setNewTask}
                placeholder="Título de la directiva"
                placeholderTextColor="rgba(0, 255, 0, 0.5)"
              />

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Calendar size={20} color="#00ff00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Clock size={20} color="#00ff00" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.iconButton}
                  onPress={() => setShowCategoryPicker(true)}
                >
                  <Tag size={20} color="#00ff00" />
                </TouchableOpacity>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={saveEditedTask}
                >
                  <Check size={20} color="#00ff00" />
                  <Text style={styles.modalButtonText}>Guardar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEditing(false);
                    setNewTask('');
                  }}
                >
                  <Trash2 size={20} color="#ff0000" />
                  <Text style={[styles.modalButtonText, styles.deleteButtonText]}>
                    Cancelar
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <LinearGradient colors={['#000000', '#001a00']} style={styles.centered}>
        <ActivityIndicator size="large" color="#00ff00" />
        <Text style={styles.loadingText}>Inicializando Sistema...</Text>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={['#000000', '#001a00']} style={styles.container}>
      <Text style={styles.title}>Sistema de Tareas</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      <View 
        style={styles.inputContainer}
        onLayout={(event) => {
          const { height, y } = event.nativeEvent.layout;
          setInputHeight(height + y);
        }}
      >
        <TextInput
          style={styles.input}
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Nueva Directiva"
          placeholderTextColor="rgba(0, 255, 0, 0.5)"
          onSubmitEditing={addTask}
        />
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Calendar size={20} color="#00ff00" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowTimePicker(true)}
          >
            <Clock size={20} color="#00ff00" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Tag size={20} color="#00ff00" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.addButton, !newTask.trim() && styles.addButtonDisabled]}
            onPress={addTask}
            disabled={!newTask.trim()}
          >
            <Plus size={20} color="#000000" />
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.taskItem}
            onPress={() => handleTaskPress(item)}
          >
            <Text 
              style={[
                styles.taskText,
                item.is_complete && styles.taskTextCompleted
              ]}
            >
              {item.title}
            </Text>
          </TouchableOpacity>
        )}
      />

      {showDatePicker && (
        <View style={[styles.pickerContainer, { top: inputHeight + 20 }]}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleccionar Fecha</Text>
          </View>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            onChange={(_event: any, date?: Date) => {
              setShowDatePicker(false);
              if (date) setSelectedDate(date);
            }}
            style={styles.picker}
            themeVariant="dark"
            textColor="#00ff00"
          />
        </View>
      )}

      {showTimePicker && (
        <View style={[styles.pickerContainer, { top: inputHeight + 20 }]}>
          <View style={styles.pickerHeader}>
            <Text style={styles.pickerTitle}>Seleccionar Hora</Text>
          </View>
          <DateTimePicker
            value={selectedTime}
            mode="time"
            onChange={(_event: any, time?: Date) => {
              setShowTimePicker(false);
              if (time) setSelectedTime(time);
            }}
            style={styles.picker}
            themeVariant="dark"
            textColor="#00ff00"
          />
        </View>
      )}

      <CategoryPickerModal />
      <TaskDetailsModal />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#00ff00',
    marginBottom: 20,
    fontFamily: 'TVCD',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 10,
    padding: 15,
    color: '#00ff00',
    fontSize: 16,
    fontFamily: 'TVCD',
    marginBottom: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  iconButton: {
    flex: 1,
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  addButton: {
    flex: 1,
    height: 45,
    backgroundColor: '#00ff00',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ff00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  addButtonDisabled: {
    backgroundColor: 'rgba(0, 255, 0, 0.3)',
    shadowOpacity: 0,
  },
  taskItem: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#00ff00',
  },
  taskContent: {
    flex: 1,
    marginRight: 10,
  },
  taskDetails: {
    marginTop: 10,
  },
  taskDetailText: {
    color: '#00ff00',
    fontSize: 12,
    fontFamily: 'TVCD',
    opacity: 0.8,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#00ff00',
    marginRight: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#00ff00',
  },
  taskText: {
    fontSize: 16,
    color: '#00ff00',
    fontFamily: 'TVCD',
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    opacity: 0.5,
  },
  deleteButton: {
    borderColor: '#ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  deleteButtonText: {
    color: '#ff0000',
  },
  cancelButton: {
    borderColor: '#ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  error: {
    color: '#ff0000',
    marginBottom: 15,
    textAlign: 'center',
    fontFamily: 'TVCD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#001a00',
    borderRadius: 15,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: '#00ff00',
    shadowColor: '#00ff00',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#00ff00',
    padding: 15,
  },
  modalHeaderText: {
    fontSize: 20,
    color: '#00ff00',
    fontFamily: 'TVCD',
    textShadowColor: '#00ff00',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  closeButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    color: '#00ff00',
    fontSize: 24,
    fontWeight: 'bold',
  },
  taskDetails: {
    padding: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    borderRadius: 10,
    padding: 10,
  },
  detailIcon: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  taskDetailIcon: {
    fontSize: 24,
  },
  detailContent: {
    flex: 1,
  },
  taskDetailLabel: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 12,
    opacity: 0.8,
    marginBottom: 2,
  },
  taskDetailText: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 255, 0, 0.2)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00ff00',
    minWidth: 100,
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonText: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 14,
  },
  completeButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
  },
  editButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
  },
  deleteButton: {
    borderColor: '#ff0000',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
  },
  deleteButtonText: {
    color: '#ff0000',
  },
  editForm: {
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 10,
    padding: 15,
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 16,
    backgroundColor: 'rgba(0, 255, 0, 0.05)',
    marginBottom: 20,
  },
  editButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  editOptionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#00ff00',
    width: '30%',
  },
  editOptionText: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 12,
    marginTop: 5,
  },
  editActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  saveButton: {
    backgroundColor: 'rgba(0, 255, 0, 0.15)',
    flex: 1,
    marginRight: 10,
  },
  cancelButton: {
    flex: 1,
    marginLeft: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    gap: 10,
  },
  modalButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 255, 0, 0.1)',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#00ff00',
    gap: 5,
  },
  modalButtonText: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 14,
  },
  taskDetailLabel: {
    color: '#00ff00',
    fontFamily: 'TVCD',
    fontSize: 14,
    marginTop: 10,
    opacity: 0.8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#00ff00',
    borderRadius: 8,
    padding: 10,
    color: '#00ff00',
    fontFamily: 'TVCD',
    marginTop: 10,
  },
});














