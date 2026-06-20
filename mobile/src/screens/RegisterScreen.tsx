import { useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import api from '../api'
import { colors } from '../theme'
import type { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

export default function RegisterScreen() {
  const nav = useNavigation<Nav>()
  const insets = useSafeAreaInsets()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleRegister() {
    setError('')
    if (!fullName.trim() || !email.trim() || !password) { setError('All fields are required.'); return }
    if (password !== confirm) { setError('Passwords do not match.'); return }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return }
    setLoading(true)
    try {
      const r = await api.post('/auth/register', { full_name: fullName.trim(), email: email.trim().toLowerCase(), password })
      await SecureStore.setItemAsync('ne_token', r.data.data.token)
      nav.replace('Dashboard')
    } catch (e: any) {
      setError(e.response?.data?.error || 'Registration failed. Please try again.')
    } finally { setLoading(false) }
  }

  const field = (placeholder: string, value: string, onChange: (v: string) => void, opts?: { secure?: boolean; keyboard?: any }) => (
    <TextInput
      style={styles.input}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={colors.textMuted}
      secureTextEntry={opts?.secure}
      keyboardType={opts?.keyboard}
      autoCapitalize={opts?.keyboard === 'email-address' || opts?.secure ? 'none' : 'words'}
      autoCorrect={false}
    />
  )

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.kav}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoBox}><Text style={{ fontSize: 32 }}>⏰</Text></View>
            <Text style={styles.appName}>NeverExpire</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.heading}>Sign up</Text>

            <Text style={styles.label}>Full Name</Text>
            {field('e.g. John Smith', fullName, setFullName)}

            <Text style={styles.label}>Email Address</Text>
            {field('you@example.com', email, setEmail, { keyboard: 'email-address' })}

            <Text style={styles.label}>Password</Text>
            {field('Minimum 8 characters', password, setPassword, { secure: true })}

            <Text style={styles.label}>Confirm Password</Text>
            {field('Repeat password', confirm, setConfirm, { secure: true })}

            {!!error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <TouchableOpacity style={[styles.btn, loading && styles.btnDisabled]} onPress={handleRegister} disabled={loading} activeOpacity={0.85}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={styles.btnText}>Create Account</Text>}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => nav.goBack()} style={styles.backLink}>
              <Text style={styles.backText}>Already have an account? <Text style={{ color: colors.brand, fontWeight: '700' }}>Sign in</Text></Text>
            </TouchableOpacity>
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
  logoWrap: { alignItems: 'center', marginBottom: 28 },
  logoBox: { width: 64, height: 64, borderRadius: 18, backgroundColor: colors.brand, alignItems: 'center', justifyContent: 'center', marginBottom: 10, shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  appName: { fontSize: 24, fontWeight: '800', color: colors.textPrimary, letterSpacing: -0.5 },
  subtitle: { fontSize: 13, color: colors.textMuted, marginTop: 4 },
  card: { backgroundColor: colors.glassWhite, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: colors.border, shadowColor: '#1e2d50', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 6 },
  heading: { fontSize: 20, fontWeight: '800', color: colors.textPrimary, marginBottom: 18 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(30,45,80,0.15)', borderRadius: 10, padding: 12, fontSize: 15, color: colors.textPrimary },
  errorBox: { backgroundColor: 'rgba(229,62,62,0.1)', borderRadius: 8, padding: 12, marginTop: 12, borderWidth: 1, borderColor: 'rgba(229,62,62,0.2)' },
  errorText: { color: '#c53030', fontSize: 13 },
  btn: { backgroundColor: colors.brand, borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 18, shadowColor: colors.brand, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  btnDisabled: { backgroundColor: colors.textMuted, shadowOpacity: 0 },
  btnText: { color: 'white', fontWeight: '700', fontSize: 16 },
  backLink: { marginTop: 16, alignItems: 'center' },
  backText: { fontSize: 13, color: colors.textMuted },
})
