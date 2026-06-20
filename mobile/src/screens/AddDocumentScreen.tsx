import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, Animated, Easing, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import DatePickerField from '../components/DatePickerField'
import ModalPicker from '../components/ModalPicker'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import api from '../api'
import type { Person } from '../api'
import { colors } from '../theme'
import GlassCard from '../components/GlassCard'
import type { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

interface DocType { id: number; code: string; name: string }
interface Extraction {
  title: string | null; document_type: string | null; document_number: string | null
  issued_date: string | null; expiry_date: string | null
  issuing_authority: string | null; holder_name: string | null
  notes: string | null; confidence: string | null
}

type Step = 'choose' | 'extracting' | 'form'

function AiAnimation() {
  const spin = useRef(new Animated.Value(0)).current
  const pulse = useRef(new Animated.Value(1)).current
  const scan = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(Animated.timing(spin, { toValue: 1, duration: 2000, easing: Easing.linear, useNativeDriver: true })).start()
    Animated.loop(Animated.sequence([
      Animated.timing(pulse, { toValue: 1.08, duration: 900, useNativeDriver: true }),
      Animated.timing(pulse, { toValue: 1, duration: 900, useNativeDriver: true }),
    ])).start()
    Animated.loop(Animated.timing(scan, { toValue: 1, duration: 1800, easing: Easing.inOut(Easing.ease), useNativeDriver: true })).start()
  }, [])

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, 90] })

  return (
    <View style={aiStyles.wrap}>
      <Animated.View style={[aiStyles.ring, { transform: [{ rotate }] }]} />
      <Animated.View style={[aiStyles.core, { transform: [{ scale: pulse }] }]}>
        <Text style={{ fontSize: 40 }}>🤖</Text>
        <Animated.View style={[aiStyles.scanLine, { transform: [{ translateY: scanY }] }]} />
      </Animated.View>
      <Text style={aiStyles.title}>Claude is reading your document…</Text>
      <Text style={aiStyles.sub}>This usually takes 5–15 seconds</Text>
      <Text style={aiStyles.powered}>Powered by Claude AI</Text>
    </View>
  )
}

const aiStyles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: 32 },
  ring: { position: 'absolute', top: 12, width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: colors.brand, borderStyle: 'dashed' },
  core: { width: 100, height: 100, borderRadius: 50, backgroundColor: colors.glassDark, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(52,201,186,0.4)', marginTop: 12 },
  scanLine: { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: colors.brand, opacity: 0.8 },
  title: { fontSize: 16, fontWeight: '700', color: colors.textPrimary, marginTop: 24, textAlign: 'center' },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  powered: { fontSize: 11, color: colors.textMuted, marginTop: 20 },
})

export default function AddDocumentScreen() {
  const nav = useNavigation<Nav>()
  const insets = useSafeAreaInsets()
  const [step, setStep] = useState<Step>('choose')
  const [family, setFamily] = useState<Person[]>([])
  const [docTypes, setDocTypes] = useState<DocType[]>([])
  const [extraction, setExtraction] = useState<Extraction | null>(null)
  const [file, setFile] = useState<{ uri: string; name: string; type: string } | null>(null)
  const [saving, setSaving] = useState(false)

  // Form fields
  const [personId, setPersonId] = useState<number | null>(null)
  const [docTypeCode, setDocTypeCode] = useState('OTHER')
  const [title, setTitle] = useState('')
  const [docNumber, setDocNumber] = useState('')
  const [issuedDate, setIssuedDate] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [issuingAuth, setIssuingAuth] = useState('')
  const [holderName, setHolderName] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/family'), api.get('/document-types')]).then(([f, dt]) => {
      setFamily(f.data.data)
      setDocTypes(dt.data.data)
      if (f.data.data.length > 0) setPersonId(f.data.data[0].id)
    })
  }, [])

  function fillFromExtraction(e: Extraction) {
    if (e.title) setTitle(e.title)
    if (e.document_number) setDocNumber(e.document_number)
    if (e.issued_date) setIssuedDate(e.issued_date)
    if (e.expiry_date) setExpiryDate(e.expiry_date)
    if (e.issuing_authority) setIssuingAuth(e.issuing_authority)
    if (e.holder_name) setHolderName(e.holder_name)
    if (e.notes) setNotes(e.notes)
    const matched = docTypes.find(d => d.code === e.document_type)
    if (matched) setDocTypeCode(matched.code)
  }

  async function pickAndExtract() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.85,
      allowsEditing: false,
    })
    if (result.canceled) return
    const asset = result.assets[0]
    const picked = { uri: asset.uri, name: asset.fileName ?? 'document.jpg', type: asset.mimeType ?? 'image/jpeg' }
    setFile(picked)
    setStep('extracting')

    const fd = new FormData()
    fd.append('file', picked as any)
    try {
      const r = await api.post('/documents/extract', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setExtraction(r.data.data)
      fillFromExtraction(r.data.data)
    } catch {
      Alert.alert('Extraction failed', 'Could not read the document automatically. Please fill in the details manually.')
    }
    setStep('form')
  }

  async function cameraCapture() {
    const perm = await ImagePicker.requestCameraPermissionsAsync()
    if (!perm.granted) { Alert.alert('Permission needed', 'Camera access is required to scan documents.'); return }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.85, allowsEditing: true, aspect: [4, 3] })
    if (result.canceled) return
    const asset = result.assets[0]
    const picked = { uri: asset.uri, name: 'scan.jpg', type: 'image/jpeg' }
    setFile(picked)
    setStep('extracting')

    const fd = new FormData()
    fd.append('file', picked as any)
    try {
      const r = await api.post('/documents/extract', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setExtraction(r.data.data)
      fillFromExtraction(r.data.data)
    } catch {
      Alert.alert('Extraction failed', 'Fill in details manually.')
    }
    setStep('form')
  }

  async function handleSave() {
    if (!personId || !title.trim()) { setError('Person and title are required.'); return }
    setSaving(true); setError('')
    try {
      let r
      if (file && extraction) {
        const fd = new FormData()
        fd.append('file', file as any)
        fd.append('person_id', String(personId))
        fd.append('document_type_code', docTypeCode)
        fd.append('title', title)
        if (docNumber) fd.append('document_number', docNumber)
        if (issuedDate) fd.append('issued_date', issuedDate)
        if (expiryDate) fd.append('expiry_date', expiryDate)
        if (issuingAuth) fd.append('issuing_authority', issuingAuth)
        if (holderName) fd.append('holder_name', holderName)
        if (notes) fd.append('notes', notes)
        r = await api.post('/documents/upload-and-create', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      } else {
        r = await api.post('/documents', { person_id: personId, document_type_code: docTypeCode, title: title.trim(), document_number: docNumber || null, issued_date: issuedDate || null, expiry_date: expiryDate || null, issuing_authority: issuingAuth || null, holder_name: holderName || null, notes: notes || null })
      }
      nav.replace('DocumentDetail', { id: r.data.data.id })
    } catch (e: any) {
      setError(e.response?.data?.error || 'Failed to save document.')
    } finally { setSaving(false) }
  }

  const inp = (label: string, value: string, onChange: (v: string) => void, opts?: { placeholder?: string; keyboard?: any }) => (
    <View style={styles.fieldWrap}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} value={value} onChangeText={onChange} placeholder={opts?.placeholder ?? ''} placeholderTextColor={colors.textMuted} keyboardType={opts?.keyboard} />
    </View>
  )

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 60 }]} showsVerticalScrollIndicator={false}>

          {/* Choose step */}
          {step === 'choose' && (
            <>
              <Text style={styles.heading}>Add Document</Text>
              <Text style={styles.subheading}>Upload or scan a document for AI extraction, or enter details manually.</Text>

              <GlassCard dark style={styles.aiCard}>
                <Text style={{ fontSize: 32, marginBottom: 10 }}>🤖</Text>
                <Text style={styles.aiCardTitle}>AI Extraction</Text>
                <Text style={styles.aiCardSub}>Take a photo or pick from gallery — Claude reads the document and fills in details automatically.</Text>
                <View style={styles.aiBtns}>
                  <TouchableOpacity style={styles.aiBtn} onPress={cameraCapture} activeOpacity={0.8}>
                    <Text style={styles.aiBtnText}>📷 Camera</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.aiBtn} onPress={pickAndExtract} activeOpacity={0.8}>
                    <Text style={styles.aiBtnText}>🖼 Gallery</Text>
                  </TouchableOpacity>
                </View>
              </GlassCard>

              <TouchableOpacity style={styles.manualBtn} onPress={() => setStep('form')} activeOpacity={0.8}>
                <Text style={styles.manualText}>✏️  Enter details manually</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Extracting */}
          {step === 'extracting' && <AiAnimation />}

          {/* Form */}
          {step === 'form' && (
            <>
              {extraction && (
                <GlassCard style={{ padding: 14, marginBottom: 14 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: colors.brand }}>🤖 AI extraction complete</Text>
                  <Text style={{ fontSize: 12, color: colors.textMuted, marginTop: 4 }}>Confidence: {extraction.confidence ?? 'medium'} · Review and confirm below</Text>
                </GlassCard>
              )}

              <GlassCard style={styles.formCard}>
                {/* Person — horizontal chips (few items) */}
                <Text style={styles.label}>Family Member *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 14 }}>
                  {family.map(p => (
                    <TouchableOpacity key={p.id} onPress={() => setPersonId(p.id)} style={[styles.personChip, personId === p.id && styles.personChipActive]}>
                      <Text style={[styles.personChipText, personId === p.id && styles.personChipTextActive]}>{p.full_name.split(' ')[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                <ModalPicker
                  label="Document Type"
                  value={docTypeCode}
                  options={docTypes.map(dt => ({ label: dt.name, value: dt.code }))}
                  onChange={setDocTypeCode}
                />

                {inp('Title *', title, setTitle, { placeholder: 'e.g. Alice Passport' })}
                {inp('Document Number', docNumber, setDocNumber, { placeholder: 'e.g. A12345678' })}

                <DatePickerField label="Issued Date" value={issuedDate} onChange={setIssuedDate} />
                <DatePickerField label="Expiry Date" value={expiryDate} onChange={setExpiryDate} />

                {inp('Issuing Authority', issuingAuth, setIssuingAuth)}
                {inp('Holder Name', holderName, setHolderName)}
                {inp('Notes', notes, setNotes)}
              </GlassCard>

              {!!error && <Text style={styles.errorText}>{error}</Text>}

              <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
                <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.saveBtnGrad}>
                  {saving ? <ActivityIndicator color="white" /> : <Text style={styles.saveBtnText}>✓  Save Document</Text>}
                </LinearGradient>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  scroll: { padding: 16, paddingBottom: 60 },
  heading: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginBottom: 6 },
  subheading: { fontSize: 13, color: colors.textMuted, marginBottom: 20, lineHeight: 18 },
  aiCard: { padding: 24, alignItems: 'center', marginBottom: 14 },
  aiCardTitle: { fontSize: 16, fontWeight: '700', color: colors.textOnDark, marginBottom: 8 },
  aiCardSub: { fontSize: 13, color: colors.textMutedDark, textAlign: 'center', lineHeight: 18, marginBottom: 20 },
  aiBtns: { flexDirection: 'row', gap: 12 },
  aiBtn: { backgroundColor: 'rgba(52,201,186,0.15)', borderRadius: 12, paddingHorizontal: 24, paddingVertical: 12, borderWidth: 1, borderColor: 'rgba(52,201,186,0.3)' },
  aiBtnText: { color: colors.brand, fontWeight: '700', fontSize: 14 },
  manualBtn: { backgroundColor: colors.glassWhite, borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  manualText: { color: colors.textSecondary, fontWeight: '600', fontSize: 14 },
  formCard: { padding: 18, marginBottom: 14 },
  fieldWrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  input: { backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(30,45,80,0.12)', borderRadius: 10, padding: 11, fontSize: 14, color: colors.textPrimary },
  personChip: { backgroundColor: 'rgba(30,45,80,0.06)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 7, marginRight: 8, borderWidth: 1, borderColor: 'transparent' },
  personChipActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  personChipText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  personChipTextActive: { color: 'white', fontWeight: '700' },
  errorText: { color: '#c53030', fontSize: 13, marginBottom: 10, textAlign: 'center' },
  saveBtn: { borderRadius: 12, overflow: 'hidden' },
  saveBtnGrad: { padding: 15, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 16 },
})
