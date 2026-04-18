import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '../../../contexts/AuthContext';
import { MaterialIcons } from '@expo/vector-icons';

export default function TeacherDashboard() {
  const { user, signOut } = useAuth();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome, Professor</Text>
          <Text style={styles.nameText}>{user?.username}</Text>
        </View>
        <TouchableOpacity onPress={signOut} style={styles.logoutBtn}>
          <MaterialIcons name="logout" size={20} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.grid}>
        <Link href="/(app)/(teacher)/attendance" asChild>
          <TouchableOpacity style={styles.card}>
            <MaterialIcons name="fact-check" size={32} color="#4F46E5" />
            <Text style={styles.cardTitle}>Mark Attendance</Text>
          </TouchableOpacity>
        </Link>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="assignment" size={32} color="#10B981" />
          <Text style={styles.cardTitle}>Grade Assignments</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.card}>
          <MaterialIcons name="event-note" size={32} color="#F59E0B" />
          <Text style={styles.cardTitle}>My Timetable</Text>
        </TouchableOpacity>
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
    marginBottom: 40,
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
