import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AddStudentScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    division: '',
    category: ''
  });

  const handleSubmit = async () => {
    // Basic validation
    if (!form.student_id || !form.name || !form.email) {
      Alert.alert("Required Fields", "Please provide at least Student ID, Name, and Email.");
      return;
    }

    setLoading(true);
    try {
      // The backend now auto-handles the department based on the Faculty's Profile!
      await api.post('/students/', form, token as string);
      
      Alert.alert(
        "Success", 
        "Student admitted successfully! An automated welcome email with login credentials has been dispatched.",
        [{ text: "Great", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.data ? JSON.stringify(err.data) : "Failed to admit student. Connectivity issue suspected.";
      Alert.alert("Admission Failed", errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const updateForm = (key: string, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back-ios" size={20} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Admission</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.infoBox}>
          <MaterialIcons name="info" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Enrolling a student will automatically map them to your department sector for real-time tracking.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Official Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. STU-2024-001"
            value={form.student_id}
            onChangeText={(v) => updateForm('student_id', v)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Student Name"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="student@college.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Phone Number</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v)}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Division</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. A"
              value={form.division}
              onChangeText={(v) => updateForm('division', v)}
              autoCapitalize="characters"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Category</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Science"
              value={form.category}
              onChangeText={(v) => updateForm('category', v)}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.submitBtn, loading && styles.disabledBtn]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <View style={styles.btnContent}>
              <MaterialIcons name="person-add" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>FINALIZE ADMISSION</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
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
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#EEF2FF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 24,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#4338CA',
    marginLeft: 12,
    lineHeight: 18,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 16,
    padding: 16,
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  row: {
    flexDirection: 'row',
  },
  submitBtn: {
    backgroundColor: '#4F46E5',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 8,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  btnContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    marginLeft: 10,
    letterSpacing: 1.5,
  }
});
