import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Theme } from '../../constants/theme';
import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<{ username: string, new_password: string } | null>(null);
  const [error, setError] = useState('');

  const { signIn } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Operator ID and Security Key are required for access.');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      // Fetch JWT via Django Token Endpoint
      const response = await api.post('/token/', { username, password });
      const { access } = response.data;

      // Fetch Profile via API to determine Role
      const profileRes = await api.get('/profile/', access);
      const userProfile = profileRes.data;

      // Hydrate Session
      signIn(access, userProfile);

      // Route Correctly Based on Role
      if (userProfile.role === 'admin' || userProfile.role === 'faculty') {
        router.replace('/(app)/(teacher)');
      } else {
        router.replace('/(app)/(student)');
      }
    } catch (err: any) {
      console.error(err);

      let errorMsg = 'Invalid credentials or system rejection.';

      if (err.message && (err.message.includes('Network request failed') || err.message.includes('Network Error'))) {
        const baseUrl = api.getBaseUrl();
        errorMsg = `Network unreachable. Target: ${baseUrl}`;
      } else if (err.data && err.data.detail) {
        errorMsg = err.data.detail;
      }
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecover = async () => {
    if (!recoveryEmail) {
      setError("Provide registered email.");
      return;
    }
    setRecoveryLoading(true);
    setError('');
    try {
      const response = await api.post('/recover-credentials/', { email: recoveryEmail });
      setRecoveryResult(response.data);
    } catch (err: any) {
      setError("Recovery failed. Identity not found.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.brandSection}>
            <View style={styles.logoContainer}>
              <MaterialIcons name="security" size={48} color={Theme.colors.primary} />
            </View>
            <Text style={styles.brandTitle}>SECURE PORTAL</Text>
            <Text style={styles.brandSubtitle}>Centralized Academic Ledger v1.1</Text>
          </View>

          <View style={styles.authCard}>
            {showRecovery ? (
              <View style={styles.recoveryContainer}>
                <Text style={styles.sectionTitle}>Identity Recovery</Text>
                <Text style={styles.sectionSubtitle}>Account retrieval via registered email.</Text>

                {recoveryResult ? (
                  <View style={styles.resultBox}>
                    <Text style={styles.resultLabel}>User ID: <Text style={styles.resultValue}>{recoveryResult.username}</Text></Text>
                    <Text style={styles.resultLabel}>Temp Key: <Text style={styles.resultValue}>{recoveryResult.new_password}</Text></Text>
                    <Text style={styles.warningText}>Please login and update your password immediately.</Text>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() => { setShowRecovery(false); setRecoveryResult(null); setRecoveryEmail(''); }}
                    >
                      <Text style={styles.primaryBtnText}>RETURN TO LOGIN</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputLabel}>RECOVERY EMAIL</Text>
                      <View style={styles.inputField}>
                        <MaterialIcons name="mail-outline" size={20} color={Theme.colors.text.muted} />
                        <TextInput
                          style={styles.textInput}
                          placeholder="email@institution.edu"
                          value={recoveryEmail}
                          onChangeText={setRecoveryEmail}
                          autoCapitalize="none"
                          keyboardType="email-address"
                        />
                      </View>
                    </View>

                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                      style={[styles.primaryBtn, recoveryLoading && styles.disabledBtn]}
                      onPress={handleRecover}
                      disabled={recoveryLoading}
                    >
                      {recoveryLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>INITIATE RECOVERY</Text>}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => { setShowRecovery(false); setError(''); }} style={styles.textBtn}>
                      <Text style={styles.textBtnLink}>Back to Authentication</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            ) : (
              <View style={styles.loginContainer}>
                <Text style={styles.sectionTitle}>Authorized Access</Text>
                <Text style={styles.sectionSubtitle}>Enter credentials to initialize session.</Text>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>OPERATOR ID</Text>
                  <View style={styles.inputField}>
                    <MaterialIcons name="person-outline" size={20} color={Theme.colors.text.muted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="Username / ID"
                      value={username}
                      onChangeText={setUsername}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputWrapper}>
                  <Text style={styles.inputLabel}>SECURITY KEY</Text>
                  <View style={styles.inputField}>
                    <MaterialIcons name="lock-outline" size={20} color={Theme.colors.text.muted} />
                    <TextInput
                      style={styles.textInput}
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry
                    />
                  </View>
                </View>

                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                <TouchableOpacity
                  style={[styles.primaryBtn, isLoading && styles.disabledBtn]}
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.primaryBtnText}>AUTHENTICATE</Text>}
                </TouchableOpacity>

                <View style={styles.loginFooter}>
                  <TouchableOpacity onPress={() => { setShowRecovery(true); setError(''); }}>
                    <Text style={styles.textBtnLink}>Forgotten ID or Secret Key?</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          <View style={styles.systemStatus}>
            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>SYSTEM OPERATIONAL</Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
    justifyContent: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Theme.spacing.xxl,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: Theme.radius.xl,
    backgroundColor: Theme.colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Theme.spacing.md,
    ...Theme.shadows.medium,
  },
  brandTitle: {
    ...Theme.typography.display,
    color: Theme.colors.text.primary,
    fontSize: 24,
  },
  brandSubtitle: {
    ...Theme.typography.caption,
    color: Theme.colors.text.muted,
    marginTop: 4,
  },
  authCard: {
    backgroundColor: Theme.colors.surface,
    borderRadius: Theme.radius.xl,
    padding: Theme.spacing.xl,
    ...Theme.shadows.medium,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  sectionTitle: {
    ...Theme.typography.h1,
    color: Theme.colors.text.primary,
    marginBottom: 4,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 13,
    color: Theme.colors.text.secondary,
    textAlign: 'center',
    marginBottom: Theme.spacing.xl,
  },
  inputWrapper: {
    marginBottom: Theme.spacing.lg,
  },
  inputLabel: {
    ...Theme.typography.caption,
    fontSize: 10,
    color: Theme.colors.text.secondary,
    marginBottom: Theme.spacing.xs,
    marginLeft: 4,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Theme.colors.background,
    borderRadius: Theme.radius.md,
    paddingHorizontal: Theme.spacing.md,
    borderWidth: 1,
    borderColor: Theme.colors.border,
  },
  textInput: {
    flex: 1,
    paddingVertical: Theme.spacing.md,
    marginLeft: Theme.spacing.sm,
    fontSize: 16,
    fontWeight: '600',
    color: Theme.colors.text.primary,
  },
  primaryBtn: {
    backgroundColor: Theme.colors.primary,
    borderRadius: Theme.radius.lg,
    padding: Theme.spacing.lg,
    alignItems: 'center',
    marginTop: Theme.spacing.md,
    ...Theme.shadows.medium,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 2,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  textBtn: {
    marginTop: Theme.spacing.lg,
    alignItems: 'center',
  },
  textBtnLink: {
    color: Theme.colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  loginFooter: {
    marginTop: Theme.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: Theme.colors.status.error,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Theme.spacing.md,
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
  },
  resultBox: {
    backgroundColor: Theme.colors.primaryLight,
    padding: Theme.spacing.lg,
    borderRadius: Theme.radius.lg,
    borderWidth: 1,
    borderColor: Theme.colors.border,
    marginBottom: Theme.spacing.lg,
  },
  resultLabel: {
    fontSize: 14,
    color: Theme.colors.primaryDark,
    fontWeight: '700',
    marginBottom: 4,
  },
  resultValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Theme.colors.text.primary,
    fontWeight: '900',
  },
  warningText: {
    fontSize: 11,
    color: Theme.colors.primary,
    fontWeight: '700',
    marginTop: 8,
    fontStyle: 'italic',
  },
  systemStatus: {
    marginTop: 'auto',
    paddingVertical: Theme.spacing.xl,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Theme.radius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Theme.colors.status.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    color: Theme.colors.status.success,
    letterSpacing: 1,
  },
  loginContainer: {},
  recoveryContainer: {},
});
