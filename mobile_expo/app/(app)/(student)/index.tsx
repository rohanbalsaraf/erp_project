import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function StudentDashboard() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Student Portal</Text>
          <Text style={styles.nameText}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Attendance</Text>
          <Text style={styles.metricValue}>95%</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Due Fees</Text>
          <Text style={styles.metricValue}>$0.00</Text>
        </View>
      </View>

      <View style={styles.grid}>
        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="schedule" size={32} color="#10B981" />
          <Text style={styles.cardTitle}>My Timetable</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="grading" size={32} color="#4F46E5" />
          <Text style={styles.cardTitle}>Semester Results</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="folder-shared" size={32} color="#F59E0B" />
          <Text style={styles.cardTitle}>Assignments</Text>
        </TouchableOpacity>

        <Link href="/(app)/notices" asChild>
          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="notifications-active" size={32} color="#EF4444" />
            <Text style={styles.cardTitle}>Notice Board</Text>
          </TouchableOpacity>
        </Link>

        <Link href="/(app)/documents" asChild>
          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="cloud-download" size={32} color="#3B82F6" />
            <Text style={styles.cardTitle}>Document Vault</Text>
          </TouchableOpacity>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  welcomeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  nameText: {
    fontSize: 24,
    fontWeight: '900',
    color: '#111827',
  },
  logoutBtn: {
    padding: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 30,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#111827',
    padding: 20,
    borderRadius: 20,
  },
  metricLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  metricValue: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  grid: {
    gap: 16,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  cardTitle: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '800',
    color: '#1F2937',
  }
});
