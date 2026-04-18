import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function AdmissionScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    enrollment_id: '', // New field
    department: '', // Added for branch selection
    division: '',
    category: ''
  });

  // PRE-FILL DEPARTMENT FOR TEACHERS, LEAVE OPEN FOR ADMIN
  React.useEffect(() => {
    if (user?.role !== 'admin' && user?.profile?.department) {
      updateForm('department', user.profile.department);
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!form.student_id || !form.name || !form.email || !form.enrollment_id || !form.department) {
      Alert.alert("Required Fields", "Please provide Student ID, Name, Email, Enrollment ID, and Department.");
      return;
    }

    setLoading(true);
    try {
      const payload = { ...form };
      if (user?.role !== 'admin' && user?.profile?.department) {
        payload.department = user.profile.department;
      }

      await api.post('/students/', payload, token as string);
      
      Alert.alert(
        "Success", 
        "Student record anchored in the ledger. Credentials sent to student email.",
        [{ text: "Confirm", onPress: () => router.back() }]
      );
    } catch (err: any) {
      console.error(err);
      const errorMsg = err.data ? JSON.stringify(err.data) : "Admission rejected by system protocols.";
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
          <MaterialIcons name="security" size={20} color="#4F46E5" />
          <Text style={styles.infoText}>
            Administrative Enrollment: Ensure all academic identifiers are verified before finalization.
          </Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Official Student ID</Text>
          <TextInput
            style={styles.input}
            placeholder="STU-2024-XXXX"
            value={form.student_id}
            onChangeText={(v) => updateForm('student_id', v)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enrollment ID (10th/12th/Diploma)</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. EB20241928"
            value={form.enrollment_id}
            onChangeText={(v) => updateForm('enrollment_id', v)}
            autoCapitalize="characters"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Identity Document Name"
            value={form.name}
            onChangeText={(v) => updateForm('name', v)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email Address</Text>
          <TextInput
            style={styles.input}
            placeholder="official@student.edu"
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(v) => updateForm('email', v)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contact Node</Text>
          <TextInput
            style={styles.input}
            placeholder="+91 Mobile Number"
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(v) => updateForm('phone', v)}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Academic Department</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.departmentScroll}>
            {['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'].map((dept) => (
              <TouchableOpacity 
                key={dept}
                onPress={() => updateForm('department', dept)}
                style={[
                  styles.deptBadge,
                  form.department === dept && styles.deptBadgeActive
                ]}
              >
                <Text style={[
                  styles.deptText,
                  form.department === dept && styles.deptTextActive
                ]}>{dept.split(' ')[0]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
              <MaterialIcons name="verified-user" size={20} color="#FFF" />
              <Text style={styles.submitBtnText}>PROMPT ENROLLMENT</Text>
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
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
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
    letterSpacing: 1.5,
    marginLeft: 10,
  },
  departmentScroll: {
    flexDirection: 'row',
    marginTop: 4,
  },
  deptBadge: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 10,
  },
  deptBadgeActive: {
    backgroundColor: '#4F46E5',
    borderColor: '#4F46E5',
  },
  deptText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#6B7280',
  },
  deptTextActive: {
    color: '#FFFFFF',
  }
});
