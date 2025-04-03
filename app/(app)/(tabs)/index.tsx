/**
 * TaskMaster - Aplicación de Gestión de Tareas
 * 
 * Esta aplicación permite a los usuarios organizar y gestionar sus tareas diarias.
 * Características principales:
 * - Crear nuevas tareas con título, fecha, hora y categoría
 * - Marcar tareas como completadas
 * - Editar tareas existentes
 * - Eliminar tareas
 * - Almacenamiento local de tareas
 * 
 * @author [Fabricio Rene Crespo Rossel]
 * @version 1.0.0
 */

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Modal,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '@/lib/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';

type Task = {
  id: string;
  title: string;
  description: string;
  task_type: 'personal' | 'trabajo' | 'estudio' | 'salud' | 'otro';
  status: 'pendiente' | 'en_progreso' | 'completada';
  due_date: string;
  due_time: string;
};

export default function TasksScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<Task['task_type']>('personal');
  const [dueDate, setDueDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editDescription, setEditDescription] = useState('');
  const [editTaskType, setEditTaskType] = useState<Task['task_type']>('personal');
  const [editDueDate, setEditDueDate] = useState(new Date());
  const [showEditDatePicker, setShowEditDatePicker] = useState(false);
  const [showEditTimePicker, setShowEditTimePicker] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = async () => {
    if (!title.trim()) return;

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const boliviaDate = new Date(dueDate);
      boliviaDate.setHours(boliviaDate.getHours() + 4);

      const { data, error } = await supabase.from('tasks').insert({
        user_id: user.id,
        title,
        description,
        task_type: taskType,
        due_date: boliviaDate.toISOString().split('T')[0],
        due_time: boliviaDate.toTimeString().split(' ')[0].slice(0, 5),
      }).select().single();

      if (error) throw error;

      setTitle('');
      setDescription('');
      setTaskType('personal');
      setDueDate(new Date());
      fetchTasks();
    } catch (error) {
      console.error('Error adding task:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          status: 'completada',
          completed_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
      setShowModal(false);
    } catch (error) {
      console.error('Error completing task:', error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      fetchTasks();
      setShowModal(false);
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleEditTask = async () => {
    if (!editingTask) return;

    try {
      const boliviaDate = new Date(editDueDate);
      boliviaDate.setHours(boliviaDate.getHours() + 4);

      const { data, error } = await supabase
        .from('tasks')
        .update({
          description: editDescription,
          task_type: editTaskType,
          due_date: boliviaDate.toISOString().split('T')[0],
          due_time: boliviaDate.toTimeString().split(' ')[0].slice(0, 5),
        })
        .eq('id', editingTask.id)
        .select()
        .single();

      if (error) throw error;
      
      fetchTasks();
      setIsEditing(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setEditDescription(task.description);
    setEditTaskType(task.task_type);
    
    // Ajustar la fecha para la zona horaria de Bolivia
    const taskDate = new Date(`${task.due_date}T${task.due_time}`);
    taskDate.setHours(taskDate.getHours() - 4); // Ajustar de UTC+4 a hora local
    setEditDueDate(taskDate);
    setIsEditing(true);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditingTask(null);
  };

  const renderTask = ({ item }: { item: Task }) => {
    // Ajustar la fecha para la zona horaria de Bolivia
    const taskDate = new Date(`${item.due_date}T${item.due_time}`);
    taskDate.setHours(taskDate.getHours() - 4); // Ajustar de UTC+4 a hora local
    const isOverdue = taskDate < new Date() && item.status !== 'completada';
    
    return (
      <TouchableOpacity 
        style={[
          styles.taskCard,
          item.status === 'completada' && styles.completedTaskCard,
          item.status === 'pendiente' && styles.pendingTaskCard,
          isOverdue && styles.overdueTaskCard
        ]}
        onPress={() => {
          setSelectedTask(item);
          setShowModal(true);
        }}
      >
        <Text style={[
          styles.taskTitle,
          item.status === 'completada' && styles.completedTaskTitle,
          item.status === 'pendiente' && styles.pendingTaskTitle,
          isOverdue && styles.overdueTaskTitle
        ]}>
          {item.status === 'completada' ? '✓ ' : ''}{item.title}
        </Text>
        <Text style={[
          styles.taskDescription,
          item.status === 'completada' && styles.completedTaskDescription,
          item.status === 'pendiente' && styles.pendingTaskDescription,
          isOverdue && styles.overdueTaskDescription
        ]}>
          {item.description}
        </Text>
        <View style={styles.taskDetails}>
          <Text style={[
            styles.taskType,
            item.status === 'completada' && styles.completedTaskType,
            item.status === 'pendiente' && styles.pendingTaskType,
            isOverdue && styles.overdueTaskType
          ]}>
            {item.task_type}
          </Text>
          <Text style={[
            styles.taskDate,
            item.status === 'completada' && styles.completedTaskDate,
            item.status === 'pendiente' && styles.pendingTaskDate,
            isOverdue && styles.overdueTaskDate
          ]}>
            {taskDate.toLocaleDateString()} {taskDate.toLocaleTimeString().slice(0, 5)}
          </Text>
        </View>
        <View style={styles.taskStatus}>
          <Text style={[
            styles.statusText,
            { color: item.status === 'completada' ? '#2ecc71' : isOverdue ? '#e74c3c' : '#f1c40f' }
          ]}>
            {isOverdue ? 'Retrasada' : item.status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <LinearGradient colors={['#ffffff', '#f5f5f5']} style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>¡Bienvenido al Futuro!</Text>
          <Text style={styles.subtitle}>Organiza tus tareas como Marty McFly</Text>
        </View>

        <View style={styles.form}>
          <TextInput
            style={styles.input}
            placeholder="Título de la tarea"
            value={title}
            onChangeText={setTitle}
            placeholderTextColor="#666"
          />
          
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Descripción"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
            placeholderTextColor="#666"
          />

          <View style={styles.typeSelector}>
            {['personal', 'trabajo', 'estudio', 'salud', 'otro'].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeButton,
                  taskType === type && styles.typeButtonActive
                ]}
                onPress={() => setTaskType(type as Task['task_type'])}
              >
                <Text style={[
                  styles.typeButtonText,
                  taskType === type && styles.typeButtonTextActive
                ]}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.dateTimeContainer}>
            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                Fecha: {dueDate.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.dateTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.dateTimeButtonText}>
                Hora: {dueDate.toLocaleTimeString().slice(0, 5)}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={dueDate}
              mode="date"
              display="default"
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={dueDate}
              mode="time"
              display="default"
              onChange={(event, selectedDate) => {
                setShowTimePicker(false);
                if (selectedDate) setDueDate(selectedDate);
              }}
            />
          )}

          <TouchableOpacity
            style={[styles.addButton, loading && styles.addButtonDisabled]}
            onPress={handleAddTask}
            disabled={loading}
          >
            <Text style={styles.addButtonText}>
              {loading ? 'Agregando...' : 'Agregar Tarea'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tasksList}>
          <Text style={styles.sectionTitle}>Tus Tareas</Text>
          <FlatList
            data={tasks}
            renderItem={renderTask}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
          />
        </View>
      </ScrollView>

      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTask?.status === 'completada' ? 'Tarea Completada' : 'Detalles de la Tarea'}
              </Text>
              <TouchableOpacity 
                onPress={() => setShowModal(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <>
                <View style={styles.modalBody}>
                  <Text style={styles.modalLabel}>Título</Text>
                  <Text style={[
                    styles.modalValue,
                    selectedTask.status === 'completada' && styles.completedModalValue
                  ]}>
                    {selectedTask.title}
                  </Text>

                  <Text style={styles.modalLabel}>Descripción</Text>
                  {isEditing ? (
                    <TextInput
                      style={[styles.input, styles.modalInput]}
                      value={editDescription}
                      onChangeText={setEditDescription}
                      multiline
                      numberOfLines={3}
                      placeholderTextColor="#666"
                    />
                  ) : (
                    <Text style={[
                      styles.modalValue,
                      selectedTask.status === 'completada' && styles.completedModalValue
                    ]}>
                      {selectedTask.description}
                    </Text>
                  )}

                  <Text style={styles.modalLabel}>Tipo</Text>
                  {isEditing ? (
                    <View style={styles.typeSelector}>
                      {['personal', 'trabajo', 'estudio', 'salud', 'otro'].map((type) => (
                        <TouchableOpacity
                          key={type}
                          style={[
                            styles.typeButton,
                            editTaskType === type && styles.typeButtonActive
                          ]}
                          onPress={() => setEditTaskType(type as Task['task_type'])}
                        >
                          <Text style={[
                            styles.typeButtonText,
                            editTaskType === type && styles.typeButtonTextActive
                          ]}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ) : (
                    <Text style={[
                      styles.modalValue,
                      selectedTask.status === 'completada' && styles.completedModalValue
                    ]}>
                      {selectedTask.task_type}
                    </Text>
                  )}

                  <Text style={styles.modalLabel}>Fecha y Hora</Text>
                  {isEditing ? (
                    <View style={styles.dateTimeContainer}>
                      <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowEditDatePicker(true)}
                      >
                        <Text style={styles.dateTimeButtonText}>
                          Fecha: {editDueDate.toLocaleDateString()}
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowEditTimePicker(true)}
                      >
                        <Text style={styles.dateTimeButtonText}>
                          Hora: {editDueDate.toLocaleTimeString().slice(0, 5)}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={[
                      styles.modalValue,
                      selectedTask.status === 'completada' && styles.completedModalValue
                    ]}>
                      {new Date(selectedTask.due_date).toLocaleDateString()} {selectedTask.due_time}
                    </Text>
                  )}

                  {selectedTask.status === 'completada' && (
                    <View style={styles.completedBadge}>
                      <Text style={styles.completedBadgeText}>✓ Completada</Text>
                    </View>
                  )}
                </View>

                {showEditDatePicker && (
                  <DateTimePicker
                    value={editDueDate}
                    mode="date"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEditDatePicker(false);
                      if (selectedDate) setEditDueDate(selectedDate);
                    }}
                  />
                )}

                {showEditTimePicker && (
                  <DateTimePicker
                    value={editDueDate}
                    mode="time"
                    display="default"
                    onChange={(event, selectedDate) => {
                      setShowEditTimePicker(false);
                      if (selectedDate) setEditDueDate(selectedDate);
                    }}
                  />
                )}

                {selectedTask.status !== 'completada' && (
                  <View style={styles.modalActions}>
                    {isEditing ? (
                      <>
                        <TouchableOpacity 
                          style={[styles.modalActionButton, styles.saveButton]}
                          onPress={handleEditTask}
                        >
                          <Text style={styles.modalActionButtonText}>Guardar Cambios</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.modalActionButton, styles.cancelButton]}
                          onPress={cancelEditing}
                        >
                          <Text style={styles.modalActionButtonText}>Cancelar</Text>
                        </TouchableOpacity>
                      </>
                    ) : (
                      <>
                        <TouchableOpacity 
                          style={[styles.modalActionButton, styles.editButton]}
                          onPress={() => startEditing(selectedTask)}
                        >
                          <Text style={styles.modalActionButtonText}>Editar</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.modalActionButton, styles.completeButton]}
                          onPress={() => handleCompleteTask(selectedTask.id)}
                        >
                          <Text style={styles.modalActionButtonText}>Marcar como Completada</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.modalActionButton, styles.deleteButton]}
                          onPress={() => handleDeleteTask(selectedTask.id)}
                        >
                          <Text style={styles.modalActionButtonText}>Eliminar</Text>
                        </TouchableOpacity>
                      </>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    textAlign: 'center',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'TVCD',
    textAlign: 'center',
  },
  form: {
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 15,
    margin: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    fontFamily: 'TVCD',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 15,
  },
  typeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  typeButtonActive: {
    backgroundColor: '#e74c3c',
    borderColor: '#e74c3c',
  },
  typeButtonText: {
    color: '#666',
    fontFamily: 'TVCD',
    fontSize: 14,
  },
  typeButtonTextActive: {
    color: '#fff',
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 10,
    gap: 8,
  },
  dateTimeButton: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  dateTimeButtonText: {
    color: '#666',
    fontFamily: 'TVCD',
    textAlign: 'center',
    fontSize: 13,
  },
  addButton: {
    backgroundColor: '#e74c3c',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: '#e74c3c80',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'TVCD',
  },
  tasksList: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    marginBottom: 15,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskTitle: {
    fontSize: 18,
    color: '#000',
    fontFamily: 'TVCD',
    marginBottom: 5,
  },
  taskDescription: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'TVCD',
    marginBottom: 10,
  },
  taskDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  taskType: {
    fontSize: 12,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    backgroundColor: '#e74c3c20',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  taskStatus: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'TVCD',
    fontWeight: 'bold',
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'TVCD',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 15,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e74c3c',
  },
  modalTitle: {
    fontSize: 24,
    color: '#e74c3c',
    fontFamily: 'TVCD',
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#666',
    fontFamily: 'TVCD',
    lineHeight: 24,
  },
  modalBody: {
    padding: 15,
    maxHeight: '70%',
  },
  modalLabel: {
    fontSize: 13,
    color: '#666',
    fontFamily: 'TVCD',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  modalValue: {
    fontSize: 15,
    color: '#000',
    fontFamily: 'TVCD',
    marginBottom: 12,
    lineHeight: 22,
  },
  modalInput: {
    marginBottom: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
    fontFamily: 'TVCD',
    minHeight: 80,
    textAlignVertical: 'top',
    lineHeight: 22,
  },
  modalActions: {
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 10,
  },
  modalActionButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  modalActionButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'TVCD',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  editButton: {
    backgroundColor: '#3498db',
  },
  completeButton: {
    backgroundColor: '#2ecc71',
  },
  deleteButton: {
    backgroundColor: '#e74c3c',
  },
  saveButton: {
    backgroundColor: '#2ecc71',
  },
  cancelButton: {
    backgroundColor: '#95a5a6',
  },
  completedTaskCard: {
    backgroundColor: '#f0fff4',
    borderColor: '#2ecc71',
    borderWidth: 1,
  },
  pendingTaskCard: {
    backgroundColor: '#fff9e6',
    borderColor: '#f1c40f',
    borderWidth: 1,
  },
  overdueTaskCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#e74c3c',
    borderWidth: 1,
  },
  completedTaskTitle: {
    color: '#2ecc71',
    textDecorationLine: 'line-through',
  },
  pendingTaskTitle: {
    color: '#f1c40f',
  },
  overdueTaskTitle: {
    color: '#e74c3c',
  },
  completedTaskDescription: {
    color: '#95a5a6',
    textDecorationLine: 'line-through',
  },
  pendingTaskDescription: {
    color: '#666',
  },
  overdueTaskDescription: {
    color: '#666',
  },
  completedTaskType: {
    color: '#2ecc71',
    backgroundColor: '#2ecc7120',
  },
  pendingTaskType: {
    color: '#f1c40f',
    backgroundColor: '#f1c40f20',
  },
  overdueTaskType: {
    color: '#e74c3c',
    backgroundColor: '#e74c3c20',
  },
  completedTaskDate: {
    color: '#95a5a6',
  },
  pendingTaskDate: {
    color: '#666',
  },
  overdueTaskDate: {
    color: '#666',
  },
  completedModalValue: {
    color: '#2ecc71',
    textDecorationLine: 'line-through',
  },
  completedBadge: {
    backgroundColor: '#2ecc71',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  completedBadgeText: {
    color: '#fff',
    fontSize: 13,
    fontFamily: 'TVCD',
  },
});















