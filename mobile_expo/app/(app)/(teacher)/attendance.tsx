import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type StudentResult = {
  id: number;
  user_id: number;
  name: string;
  department: string;
  enrollment_date: string;
};

export default function MarkAttendanceScreen() {
  const { user, token } = useAuth();
  const router = useRouter();
  
  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Maps Student ID -> true (Present) or false (Absent)
  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      // Due to our RBAC in Django, the token natively restricts this 
      // query to ONLY students matching the teacher's department!
      const res = await api.get('/students/', token as string);
      
      const roster: StudentResult[] = res.data;
      setStudents(roster);
      
      // Initialize all as Present by default
      const defaultState: Record<number, boolean> = {};
      roster.forEach(student => {
        defaultState[student.id] = true;
      });
      setAttendanceState(defaultState);

    } catch (err) {
      Alert.alert("Error", "Failed to load student roster securely.");
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (studentId: number) => {
    setAttendanceState(prev => ({
      ...prev,
      [studentId]: !prev[studentId]
    }));
  };

  const submitRegister = async () => {
    setSubmitting(true);
    let successCount = 0;
    
    // Auto-generate immutable metadata required by Django
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      // Iterative asynchronous pushes to securely build robust attendance
      for (const student of students) {
        const payload = {
          student: student.id,
          date: dateStr,
          course: "General", // Placeholder until timetable matrix is formed
          status: attendanceState[student.id] ? 'Present' : 'Absent',
          time: timeStr
        };
        
        await api.post('/attendance/', payload, token as string);
        successCount++;
      }
      
      Alert.alert(
        "Secure Register Submitted", 
        `Successfully logged attendance for ${successCount} mapped student${successCount !== 1 ? 's' : ''}.`,
        [{ text: "Done", style: "default", onPress: () => router.back() }]
      );

    } catch (err) {
      Alert.alert("Submission Incomplete", "A network disruption occurred. Check logs.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Syncing Roster...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mark Register</Text>
        <View style={{ width: 40 }} />
      </View>

      <Text style={styles.dateLabel}>{new Date().toDateString()}</Text>

      <FlatList
        data={students}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => {
          const isPresent = attendanceState[item.id];

          return (
            <TouchableOpacity 
              style={[styles.studentCard, !isPresent && styles.studentCardAbsent]}
              onPress={() => toggleStudent(item.id)}
              activeOpacity={0.7}
            >
              <View style={styles.studentInfo}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{item.name.substring(0, 1)}</Text>
                </View>
                <View>
                  <Text style={styles.studentName}>{item.name}</Text>
                  <Text style={styles.studentDep}>{item.department} Sector</Text>
                </View>
              </View>

              <View style={styles.statusToggle}>
                <Text style={[styles.statusText, !isPresent && styles.statusTextAbsent]}>
                  {isPresent ? 'PRESENT' : 'ABSENT'}
                </Text>
                <Switch
                  value={isPresent}
                  onValueChange={() => toggleStudent(item.id)}
                  trackColor={{ false: '#FECACA', true: '#C7D2FE' }}
                  thumbColor={isPresent ? '#4F46E5' : '#EF4444'}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="group-off" size={48} color="#D1D5DB" />
            <Text style={styles.emptyText}>No students map to your department sector.</Text>
          </View>
        }
      />

      <View style={styles.footer}>
        <TouchableOpacity 
          style={[styles.submitButton, submitting && styles.submitButtonDisabled]} 
          onPress={submitRegister}
          disabled={submitting || students.length === 0}
        >
          {submitting ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.submitButtonText}>SUBMIT REGISTER TO CLOUD</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6'
  },
  loadingText: {
    marginTop: 12,
    fontSize: 12,
    fontWeight: '800',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6'
  },
  backBtn: {
    padding: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  dateLabel: {
    textAlign: 'center',
    paddingVertical: 16,
    fontSize: 12,
    fontWeight: '800',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 2
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 100, // padding for absolute footer
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: '#4F46E5'
  },
  studentCardAbsent: {
    backgroundColor: '#FEF2F2',
    borderLeftColor: '#EF4444'
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4F46E5'
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827'
  },
  studentDep: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: 2
  },
  statusToggle: {
    alignItems: 'flex-end'
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#4F46E5',
    marginBottom: 4
  },
  statusTextAbsent: {
    color: '#EF4444'
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6'
  },
  submitButton: {
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#111827',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2
  }
});
