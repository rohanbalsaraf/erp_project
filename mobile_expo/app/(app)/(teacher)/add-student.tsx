import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert, FlatList, Dimensions } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

const { width } = Dimensions.get('window');

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
        <View style={[styles.divBadge, { backgroundColor: item.division ? Theme.colors.primaryLight : '#FEF2F2' }]}>
          <Text style={[styles.divBadgeText, { color: item.division ? Theme.colors.primary : '#EF4444' }]}>
            {item.division || 'UNSET'}
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
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={18} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Division Sorting</Text>
          <TouchableOpacity onPress={fetchStudents} style={styles.refreshBtn}>
            <MaterialIcons name="sync" size={20} color={Theme.colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Theme.colors.primary} />
            <Text style={styles.loadingText}>Syncing Department Scope...</Text>
          </View>
        ) : (
          <FlatList
            data={students}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderStudent}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <MaterialIcons name="group-off" size={40} color={Theme.colors.text.muted} />
                </View>
                <Text style={styles.emptyTitle}>No Students</Text>
                <Text style={styles.emptyText}>No students pending in your department scope.</Text>
              </View>
            }
          />
        )}
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
  refreshBtn: {
    padding: Theme.spacing.sm,
    backgroundColor: Theme.colors.primaryLight,
    borderRadius: Theme.radius.md,
  },
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
  },
  listContent: {
    padding: Theme.spacing.lg,
    paddingBottom: 100,
  },
  studentCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  details: {
    flex: 1,
    marginLeft: Theme.spacing.md,
  },
  studentName: {
    fontSize: 15,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  studentId: {
    fontSize: 11,
    fontWeight: '600',
    color: Theme.colors.text.muted,
    marginTop: 2,
  },
  divBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Theme.radius.sm,
  },
  divBadgeText: {
    fontSize: 12,
    fontWeight: '900',
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.border,
    marginVertical: Theme.spacing.md,
  },
  sortActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sortLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: Theme.colors.text.muted,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 8,
  },
  divBtn: {
    width: 32,
    height: 32,
    borderRadius: Theme.radius.sm,
    backgroundColor: Theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  divBtnActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  divBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text.secondary,
  },
  divBtnTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Theme.colors.background,
  },
  loadingText: {
    ...Theme.typography.caption,
    marginTop: Theme.spacing.md,
    color: Theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Theme.colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.lg,
  },
  emptyTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
    marginBottom: 8,
  },
  emptyText: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
  }
});
