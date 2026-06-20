import { useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { colors } from '../theme'
import { login } from '../auth'
import type { RootStackParamList } from '../navigation'

interface Props { onLogin: () => void }

export default function LoginScreen({ onLogin }: Props) {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    if (!email.trim() || !password) { setError('Email and password are required.'); return }
    setError(''); setLoading(true)
    try {
      await login(email.trim().toLowerCase(), password)
      onLogin()
    } catch (e: any) {
      setError(e.response?.data?.error || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  const insets = useSafeAreaInsets()

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}>
              <Text style={{ fontSize: 32 }}>⏰</Text>
            </View>
            <Text style={styles.appName}>NeverExpire</Text>
            <Text style={styles.subtitle}>Document Expiry Tracker</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.heading}>Sign in</Text>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email address</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.textMuted}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
            </View>

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleLogin} disabled={loading} activeOpacity={0.85}>
              {loading
                ? <ActivityIndicator color="white" />
                : <Text style={styles.btnText}>Sign in</Text>
              }
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert('Forgot Password', 'Password reset is not available in the demo version. Please contact your administrator.')} style={{ alignItems: 'center', marginTop: 12 }}>
              <Text style={styles.linkText}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity style={styles.registerBtn} onPress={() => nav.navigate('Register')} activeOpacity={0.85}>
              <Text style={styles.registerText}>Create new account</Text>
            </TouchableOpacity>

            <Text style={styles.demo}>Demo: alice@neverexpire.test / Demo@1234</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: colors.brand,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
    shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8,
  },
  appName: { fontSize: 26, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  card: {
    backgroundColor: colors.glassWhite,
    borderRadius: 20, padding: 28,
    borderWidth: 1, borderColor: colors.border,
    shadowColor: '#1e2d50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6,
  },
  heading: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 20 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(30,45,80,0.15)',
    borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary,
  },
  errorBox: { backgroundColor: 'rgba(229,62,62,0.1)', borderRadius: 8, padding: 12, marginBottom: 14, borderWidth: 1, borderColor: 'rgba(229,62,62,0.2)' },
  errorText: { color: '#c53030', fontSize: 13 },
  btn: {
    backgroundColor: colors.brand, borderRadius: 12, padding: 14,
    alignItems: 'center', marginTop: 8,
    shadowColor: colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { backgroundColor: colors.textMuted, shadowOpacity: 0 },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  linkText: { fontSize: 13, color: colors.brand, fontWeight: '500' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: 'rgba(30,45,80,0.1)' },
  dividerText: { fontSize: 12, color: colors.textMuted },
  registerBtn: { borderWidth: 1.5, borderColor: colors.brand, borderRadius: 12, padding: 13, alignItems: 'center' },
  registerText: { color: colors.brand, fontWeight: '700', fontSize: 15 },
  demo: { textAlign: 'center', fontSize: 12, color: colors.textMuted, marginTop: 18 },
})
