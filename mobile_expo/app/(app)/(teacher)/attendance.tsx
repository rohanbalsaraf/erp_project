import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Switch, Alert } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

type StudentResult = {
  id: number;
  user_id: number;
  name: string;
  department: string;
  enrollment_date: string;
};

export default function MarkAttendanceScreen() {
  const { token } = useAuth();
  const router = useRouter();

  const [students, setStudents] = useState<StudentResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [attendanceState, setAttendanceState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchRoster();
  }, []);

  const fetchRoster = async () => {
    try {
      const res = await api.get('/students/', token as string);
      const roster: StudentResult[] = res.data;
      setStudents(roster);

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

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    try {
      for (const student of students) {
        const payload = {
          student: student.id,
          date: dateStr,
          course: "General",
          status: attendanceState[student.id] ? 'Present' : 'Absent',
          time: timeStr
        };

        await api.post('/attendance/', payload, token as string);
        successCount++;
      }

      Alert.alert(
        "Register Submitted",
        `Logged attendance for ${successCount} entries.`,
        [{ text: "Finished", style: "default", onPress: () => router.back() }]
      );

    } catch (err) {
      Alert.alert("Submission Error", "Check connectivity.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
        <Text style={styles.loadingText}>Syncing Ledger...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={18} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mark Attendance</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{students.length}</Text>
            <Text style={styles.statLabel}>Total Students</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Theme.colors.status.success }]}>
              {Object.values(attendanceState).filter(v => v).length}
            </Text>
            <Text style={styles.statLabel}>Present</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: Theme.colors.status.error }]}>
              {Object.values(attendanceState).filter(v => !v).length}
            </Text>
            <Text style={styles.statLabel}>Absent</Text>
          </View>
        </View>

        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => {
            const isPresent = attendanceState[item.id];

            return (
              <TouchableOpacity
                style={[styles.studentCard, !isPresent && styles.studentCardAbsent]}
                onPress={() => toggleStudent(item.id)}
                activeOpacity={0.7}
              >
                <View style={styles.studentInfo}>
                  <View style={[styles.avatar, { backgroundColor: isPresent ? Theme.colors.primaryLight : '#FEE2E2' }]}>
                    <Text style={[styles.avatarText, { color: isPresent ? Theme.colors.primary : Theme.colors.status.error }]}>
                      {item.name.substring(0, 1)}
                    </Text>
                  </View>
                  <View>
                    <Text style={styles.studentName}>{item.name}</Text>
                    <Text style={styles.studentDep}>{item.department}</Text>
                  </View>
                </View>

                <View style={styles.statusToggle}>
                  <Text style={[styles.statusText, !isPresent && styles.statusTextAbsent]}>
                    {isPresent ? 'PRESENT' : 'ABSENT'}
                  </Text>
                  <Switch
                    value={isPresent}
                    onValueChange={() => toggleStudent(item.id)}
                    trackColor={{ false: '#FECACA', true: Theme.colors.primaryLight }}
                    thumbColor={isPresent ? Theme.colors.primary : Theme.colors.status.error}
                  />
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group-off" size={48} color={Theme.colors.text.muted} />
              <Text style={styles.emptyText}>No students assigned to your sector.</Text>
            </View>
          }
        />

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.submitButton, (submitting || students.length === 0) && styles.submitButtonDisabled]}
            onPress={submitRegister}
            disabled={submitting || students.length === 0}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitButtonText}>FINALIZE ATTENDANCE</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.surface,
  },
  container: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.colors.background
  },
  loadingText: {
    marginTop: 12,
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.md,
    backgroundColor: Theme.colors.surface,
    ...Theme.shadows.soft,
  },
  backBtn: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
  },
  statsBar: {
    flexDirection: 'row',
    backgroundColor: Theme.colors.surface,
    margin: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadows.soft,
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    ...Theme.typography.h1,
    color: Theme.colors.text.primary,
    fontSize: 18,
  },
  statLabel: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
    fontSize: 9,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: Theme.colors.border,
  },
  listContent: {
    paddingHorizontal: Theme.spacing.lg,
    paddingBottom: 120,
  },
  studentCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...Theme.shadows.soft,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.primary,
  },
  studentCardAbsent: {
    borderLeftColor: Theme.colors.status.error,
  },
  studentInfo: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md
  },
  avatarText: {
    ...Theme.typography.h2,
    fontSize: 18,
  },
  studentName: {
    ...Theme.typography.h3,
    color: Theme.colors.text.primary,
  },
  studentDep: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  statusToggle: {
    alignItems: 'flex-end'
  },
  statusText: {
    ...Theme.typography.caption,
    color: Theme.colors.primary,
    fontSize: 9,
    marginBottom: 2
  },
  statusTextAbsent: {
    color: Theme.colors.status.error
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    marginTop: 16,
    ...Theme.typography.body,
    color: Theme.colors.text.muted,
    textAlign: 'center'
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Theme.colors.surface,
    paddingHorizontal: Theme.spacing.lg,
    paddingVertical: Theme.spacing.xl,
    ...Theme.shadows.up,
  },
  submitButton: {
    backgroundColor: Theme.colors.primary,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    ...Theme.shadows.medium,
  },
  submitButtonDisabled: {
    opacity: 0.5
  },
  submitButtonText: {
    color: '#FFFFFF',
    ...Theme.typography.h3,
    fontSize: 14,
    letterSpacing: 2
  }
});
