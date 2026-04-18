import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Theme.spacing.lg * 3) / 2;

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();

  const menuItems = [
    { title: 'Mark Attendance', icon: 'fact-check', color: Theme.colors.primary, href: '/(app)/(teacher)/attendance' },
    { title: 'Division Sorting', icon: 'sort', color: Theme.colors.secondary, href: '/(app)/(teacher)/add-student' },
    { title: 'Assignments', icon: 'assignment', color: Theme.colors.status.success, href: '/(app)/(teacher)/assignments' },
    { title: 'Timetable', icon: 'event-note', color: Theme.colors.status.warning, href: '/(app)/(teacher)/timetable' },
    { title: 'Notice Board', icon: 'notifications-active', color: Theme.colors.status.error, href: '/(app)/notices' },
    { title: 'Document Vault', icon: 'cloud-download', color: Theme.colors.status.info, href: '/(app)/documents' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.profileSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{user?.username?.charAt(0).toUpperCase()}</Text>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>Professor Portal</Text>
              <Text style={styles.nameText}>{user?.username}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={20} color={Theme.colors.status.error} />
          </TouchableOpacity>
        </View>

        {user?.role === 'admin' && (
          <View style={styles.adminSection}>
            <Text style={styles.sectionTitle}>Administrative</Text>
            <Link href="/(app)/(teacher)/admission" asChild>
              <TouchableOpacity style={styles.adminCard}>
                <View style={styles.adminIconContainer}>
                  <MaterialIcons name="person-add" size={28} color="#FFF" />
                </View>
                <View>
                  <Text style={styles.adminCardTitle}>New Admission</Text>
                  <Text style={styles.adminCardSub}>Enroll new identity into ledger</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color={Theme.colors.text.muted} style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            </Link>
          </View>
        )}

        <Text style={styles.sectionTitle}>Teaching Operations</Text>

        <View style={styles.grid}>
          {menuItems.map((item, index) => (
            <Link key={index} href={item.href as any} asChild>
              <TouchableOpacity style={styles.card}>
                <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                  <MaterialIcons name={item.icon as any} size={28} color={item.color} />
                </View>
                <Text style={styles.cardTitle}>{item.title}</Text>
              </TouchableOpacity>
            </Link>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Theme.colors.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Theme.spacing.xl,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: Theme.radius.lg,
    backgroundColor: Theme.colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    ...Theme.shadows.soft,
  },
  avatarText: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  userInfo: {
    marginLeft: Theme.spacing.md,
  },
  welcomeText: {
    ...Theme.typography.caption,
    color: Theme.colors.text.secondary,
  },
  nameText: {
    ...Theme.typography.h1,
    color: Theme.colors.text.primary,
  },
  logoutBtn: {
    padding: Theme.spacing.sm,
    backgroundColor: '#FEF2F2',
    borderRadius: Theme.radius.md,
  },
  adminSection: {
    marginBottom: Theme.spacing.xl,
  },
  sectionTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
  },
  adminCard: {
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    ...Theme.shadows.soft,
    borderLeftWidth: 4,
    borderLeftColor: Theme.colors.status.success,
  },
  adminIconContainer: {
    width: 48,
    height: 48,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.status.success,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Theme.spacing.md,
  },
  adminCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: Theme.colors.text.primary,
  },
  adminCardSub: {
    fontSize: 12,
    color: Theme.colors.text.secondary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Theme.spacing.lg,
    justifyContent: 'space-between',
  },
  card: {
    width: COLUMN_WIDTH,
    backgroundColor: Theme.colors.surface,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Theme.shadows.soft,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: Theme.radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: Theme.colors.text.primary,
    textAlign: 'center',
  }
});
