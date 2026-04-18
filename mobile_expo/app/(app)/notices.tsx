import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';

type Notice = {
  id: number;
  title: string;
  content: string;
  date_posted: string;
};

export default function NoticeBoardScreen() {
  const { token } = useAuth();
  const router = useRouter();
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotices();
  }, []);

  const fetchNotices = async () => {
    try {
      const res = await api.get('/notifications/', token as string);
      setNotices(res.data);
    } catch (err) {
      console.error("Failed to load notices");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Theme.colors.primary} />
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
          <Text style={styles.headerTitle}>Notice Board</Text>
          <View style={{ width: 44 }} />
        </View>

        <FlatList
          data={notices}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.iconBox, { backgroundColor: Theme.colors.primary + '10' }]}>
                  <MaterialIcons name="campaign" size={24} color={Theme.colors.primary} />
                </View>
                <Text style={styles.date}>
                  {new Date(item.date_posted).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                </Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.content}>{item.content}</Text>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <MaterialIcons name="notifications-none" size={40} color={Theme.colors.text.muted} />
              </View>
              <Text style={styles.emptyTitle}>Clear Skies</Text>
              <Text style={styles.emptyText}>No active official notifications currently archived in the ledger.</Text>
            </View>
          }
        />
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
  listContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  date: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
  },
  title: {
    ...Theme.typography.h2,
    fontSize: 18,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.xs,
  },
  content: {
    ...Theme.typography.body,
    color: Theme.colors.text.secondary,
    lineHeight: 22,
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
