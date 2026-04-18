import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useAuth } from '../../../contexts/AuthContext';
import api from '../../../services/api';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../../constants/theme';

export default function AdmissionScreen() {
  const { token, user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    student_id: '',
    name: '',
    email: '',
    phone: '',
    enrollment_id: '',
    department: '',
    division: '',
    category: ''
  });

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

  const departments = ['Computer Science', 'Information Technology', 'Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering'];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <MaterialIcons name="arrow-back-ios" size={18} color={Theme.colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Student Enrollment</Text>
          <View style={{ width: 44 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Identity & Access</Text>
            <View style={styles.card}>
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
                <Text style={styles.label}>Enrollment ID</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. EB20241928"
                  value={form.enrollment_id}
                  onChangeText={(v) => updateForm('enrollment_id', v)}
                  autoCapitalize="characters"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Personal Profile</Text>
            <View style={styles.card}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="As per Identity Document"
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
                <Text style={styles.label}>Mobile Node</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 XXXXX XXXXX"
                  keyboardType="phone-pad"
                  value={form.phone}
                  onChangeText={(v) => updateForm('phone', v)}
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionHeader}>Academic Branch</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.departmentScroll}>
              {departments.map((dept) => (
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
                  ]}>{dept}</Text>
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
                <Text style={styles.submitBtnText}>FINALIZE ADMISSION</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.footerNote}>
            <MaterialIcons name="info-outline" size={14} color={Theme.colors.text.muted} />
            <Text style={styles.footerText}>
              Admission data is immutable once anchored in the central database.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
  headerTitle: {
    ...Theme.typography.h2,
    color: Theme.colors.text.primary,
  },
  scrollContent: {
    padding: Theme.spacing.lg,
    paddingBottom: Theme.spacing.xxl,
  },
  section: {
    marginBottom: Theme.spacing.xl,
  },
  sectionHeader: {
    ...Theme.typography.caption,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.sm,
    marginLeft: Theme.spacing.xs,
  },
  card: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.md,
    ...Theme.shadows.soft,
  },
  inputGroup: {
    marginBottom: Theme.spacing.md,
  },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: Theme.colors.text.secondary,
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
    padding: Theme.spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: Theme.colors.text.primary,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  departmentScroll: {
    flexDirection: 'row',
  },
  deptBadge: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: Theme.radius.md,
    backgroundColor: Theme.colors.surface,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginRight: Theme.spacing.sm,
    ...Theme.shadows.soft,
  },
  deptBadgeActive: {
    backgroundColor: Theme.colors.primary,
    borderColor: Theme.colors.primary,
  },
  deptText: {
    fontSize: 13,
    fontWeight: '700',
    color: Theme.colors.text.secondary,
  },
  deptTextActive: {
    color: '#FFFFFF',
  },
  submitBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    ...Theme.shadows.medium,
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
    letterSpacing: 1,
    marginLeft: Theme.spacing.sm,
  },
  footerNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Theme.spacing.xl,
    paddingHorizontal: Theme.spacing.xl,
  },
  footerText: {
    fontSize: 11,
    color: Theme.colors.text.muted,
    marginLeft: 6,
    textAlign: 'center',
  }
});
