import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

const { width } = Dimensions.get('window');
const COLUMN_WIDTH = (width - Theme.spacing.lg * 3) / 2;

export default function StudentDashboard() {
  const { user, signOut } = useAuth();

  const menuItems = [
    { title: 'Timetable', icon: 'schedule', color: Theme.colors.status.success, href: '/(app)/timetable' },
    { title: 'Results', icon: 'grading', color: Theme.colors.primary, href: '/(app)/results' },
    { title: 'Assignments', icon: 'folder-shared', color: Theme.colors.status.warning, href: '/(app)/assignments' },
    { title: 'Notices', icon: 'notifications-active', color: Theme.colors.status.error, href: '/(app)/notices' },
    { title: 'Documents', icon: 'cloud-download', color: Theme.colors.status.info, href: '/(app)/documents' },
    { title: 'Attendance', icon: 'event-available', color: '#8B5CF6', href: '/(app)/attendance' },
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
              <Text style={styles.welcomeText}>Student Portal</Text>
              <Text style={styles.nameText}>{user?.username}</Text>
            </View>
          </View>
          <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
            <MaterialIcons name="logout" size={20} color={Theme.colors.status.error} />
          </TouchableOpacity>
        </View>

        <View style={styles.metricsContainer}>
          <View style={[styles.metricCard, { backgroundColor: Theme.colors.primary }]}>
            <MaterialIcons name="pie-chart" size={24} color="#FFF" style={styles.metricIcon} />
            <Text style={styles.metricValue}>95%</Text>
            <Text style={styles.metricLabel}>Attendance</Text>
          </View>
          <View style={[styles.metricCard, { backgroundColor: Theme.colors.text.primary }]}>
            <MaterialIcons name="account-balance-wallet" size={24} color="#FFF" style={styles.metricIcon} />
            <Text style={styles.metricValue}>$0.00</Text>
            <Text style={styles.metricLabel}>Due Fees</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Academic Services</Text>

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
    backgroundColor: Theme.colors.primary,
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
  metricsContainer: {
    flexDirection: 'row',
    gap: Theme.spacing.md,
    marginBottom: Theme.spacing.xl,
  },
  metricCard: {
    flex: 1,
    padding: Theme.spacing.md,
    borderRadius: Theme.radius.lg,
    ...Theme.shadows.medium,
  },
  metricIcon: {
    marginBottom: Theme.spacing.sm,
    opacity: 0.8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
  },
  sectionTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
    marginBottom: Theme.spacing.md,
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
