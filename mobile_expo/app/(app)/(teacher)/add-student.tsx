import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function DivisionSortingScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchStudents = async () => {
    try {
      const res = await api.get('/students/', token as string);
      setStudents(res.data);
    } catch (err) {
      console.error(err);
      Alert.alert("Sync Error", "Failed to bridge student records.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleSort = async (studentId: number, division: string) => {
    setUpdatingId(studentId);
    try {
      await api.patch(`/students/${studentId}/`, { division }, token as string);
      // Local update for smoothness
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, division } : s));
    } catch (err) {
      Alert.alert("Permission Error", "You are not authorized to sort this sector.");
    } finally {
      setUpdatingId(null);
    }
  };

  const renderStudent = ({ item }: { item: any }) => (
    <View style={styles.studentCard}>
      <View style={styles.cardInfo}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.name.substring(0, 1)}</Text>
        </View>
        <View style={styles.details}>
          <Text style={styles.studentName}>{item.name}</Text>
          <Text style={styles.studentId}>{item.student_id}</Text>
        </View>
        <View style={[styles.divBadge, { backgroundColor: item.division ? '#EEF2FF' : '#FEF2F2' }]}>
          <Text style={[styles.divBadgeText, { color: item.division ? '#4F46E5' : '#EF4444' }]}>
            {item.division || 'NULL'}
          </Text>
        </View>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.sortActions}>
        <Text style={styles.sortLabel}>Assign Sector:</Text>
        <View style={styles.btnRow}>
          {['A', 'B', 'C', 'D'].map((div) => (
            <TouchableOpacity 
              key={div}
              onPress={() => handleSort(item.id, div)}
              style={[
                styles.divBtn, 
                item.division === div && styles.divBtnActive,
                updatingId === item.id && { opacity: 0.5 }
              ]}
              disabled={updatingId === item.id}
            >
              <Text style={[styles.divBtnText, item.division === div && styles.divBtnTextActive]}>{div}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Division Sorting</Text>
        <TouchableOpacity onPress={fetchStudents} style={styles.refreshBtn}>
          <MaterialIcons name="sync" size={20} color="#4F46E5" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4F46E5" />
          <Text style={styles.loadingText}>Syncing Department Scope...</Text>
        </View>
      ) : (
        <FlatList
          data={students}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderStudent}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <MaterialIcons name="group-off" size={64} color="#D1D5DB" />
              <Text style={styles.emptyText}>No students pending in your department.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
  refreshBtn: {
    padding: 10,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#4F46E5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  details: {
    flex: 1,
    marginLeft: 16,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  studentId: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginTop: 2,
  },
  divBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  divBadgeText: {
    fontSize: 14,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: '#F3F4F6',
    marginVertical: 16,
  },
  sortActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  divBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  divBtnActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
  },
  divBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#4B5563',
  },
  divBtnTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 12,
    fontWeight: '900',
    color: '#4F46E5',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 100,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 14,
    fontWeight: '600',
    color: '#9CA3AF',
    textAlign: 'center',
  }
});
