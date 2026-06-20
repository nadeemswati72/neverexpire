import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import api from '../api'
import type { DocumentDetail } from '../api'
import { colors, DOC_ICON, STATUS_COLOR } from '../theme'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import AuthenticatedImage from '../components/AuthenticatedImage'
import type { RootStackParamList } from '../navigation'

type Route = RouteProp<RootStackParamList, 'DocumentDetail'>

function formatDate(d: string | null) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

function Field({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={[styles.fieldValue, !value && styles.fieldEmpty]}>{value || '—'}</Text>
    </View>
  )
}

export default function DocumentDetailScreen() {
  const nav = useNavigation()
  const route = useRoute<Route>()
  const insets = useSafeAreaInsets()
  const [doc, setDoc] = useState<DocumentDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    api.get(`/documents/${route.params.id}`).then(r => setDoc(r.data.data)).finally(() => setLoading(false))
  }, [route.params.id])

  function confirmDelete() {
    Alert.alert('Delete document', `Delete "${doc?.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        setDeleting(true)
        await api.delete(`/documents/${doc!.id}`)
        nav.goBack()
      }},
    ])
  }

  if (loading) return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </LinearGradient>
  )

  if (!doc) return null
  const statusColor = STATUS_COLOR[doc.status] ?? colors.textMuted
  const hasImage = doc.files?.length > 0 && /\.(jpg|jpeg|png|webp)/i.test(doc.files[0].mime_type ?? '')

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <ScrollView contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 40 }]} showsVerticalScrollIndicator={false}>

        {/* Hero dark card */}
        <GlassCard dark style={styles.heroCard}>
          <View style={styles.heroRow}>
            <View style={[styles.iconBox, { backgroundColor: `${statusColor}22` }]}>
              <Text style={{ fontSize: 28 }}>{DOC_ICON[doc.document_type?.code] ?? '📄'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle} numberOfLines={2}>{doc.title}</Text>
              <Text style={styles.heroSub}>{doc.person?.full_name} · {doc.document_type?.name}</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <StatusBadge status={doc.status} />
              {doc.days_remaining !== null && (
                <Text style={[styles.daysHero, { color: statusColor }]}>
                  {doc.status === 'expired' ? `${Math.abs(doc.days_remaining)}d ago` : `${doc.days_remaining}d left`}
                </Text>
              )}
            </View>
          </View>

          {/* Date strip */}
          <View style={styles.dateStrip}>
            <View>
              <Text style={styles.dateLabel}>ISSUED</Text>
              <Text style={styles.dateValue}>{formatDate(doc.issued_date)}</Text>
            </View>
            <View style={styles.dateDivider} />
            <View>
              <Text style={styles.dateLabel}>EXPIRES</Text>
              <Text style={[styles.dateValue, { color: statusColor }]}>{formatDate(doc.expiry_date)}</Text>
            </View>
            {doc.document_number && (
              <>
                <View style={styles.dateDivider} />
                <View>
                  <Text style={styles.dateLabel}>DOC NO.</Text>
                  <Text style={[styles.dateValue, { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' }]}>{doc.document_number}</Text>
                </View>
              </>
            )}
          </View>
        </GlassCard>

        {/* File preview */}
        {hasImage && (
          <GlassCard style={styles.previewCard}>
            <Text style={styles.sectionTitle}>📎 Document Preview</Text>
            <Text style={styles.watermarkNote}>🔒 Watermarked copy</Text>
            <AuthenticatedImage
              path={`/api/v1/files/${doc.files[0].id}`}
              style={styles.previewImage}
              fallback={<Text style={{ color: colors.textMuted, textAlign: 'center', padding: 20 }}>Preview unavailable</Text>}
            />
          </GlassCard>
        )}

        {/* Details grid */}
        <GlassCard style={styles.detailCard}>
          <Text style={styles.sectionTitle}>Document Details</Text>
          <View style={styles.fieldsGrid}>
            <Field label="Issued Date" value={formatDate(doc.issued_date)} />
            <Field label="Expiry Date" value={formatDate(doc.expiry_date)} />
            <Field label="Document Number" value={doc.document_number} />
            <Field label="Issuing Authority" value={doc.issuing_authority} />
            <Field label="Holder Name" value={doc.holder_name} />
            <Field label="Source" value={doc.source === 'ai_extracted' ? '🤖 AI Extracted' : '✏️ Manual Entry'} />
          </View>
          {doc.notes && (
            <>
              <View style={styles.notesDiv} />
              <Text style={styles.fieldLabel}>Notes</Text>
              <Text style={styles.notesText}>{doc.notes}</Text>
            </>
          )}
          {doc.extraction_runs?.length > 0 && (
            <View style={styles.aiBox}>
              <Text style={styles.aiLabel}>🤖 AI: {doc.extraction_runs[0].model_name} · Confidence: {doc.extraction_runs[0].confidence}</Text>
            </View>
          )}
        </GlassCard>

        {/* Delete */}
        <TouchableOpacity onPress={confirmDelete} disabled={deleting} style={styles.deleteBtn}>
          <Text style={styles.deleteText}>{deleting ? 'Deleting…' : '🗑  Delete Document'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  heroCard: { padding: 18 },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12, marginBottom: 16 },
  iconBox: { width: 52, height: 52, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTitle: { fontSize: 16, fontWeight: '800', color: colors.textOnDark, marginBottom: 4 },
  heroSub: { fontSize: 12, color: colors.textMutedDark },
  daysHero: { fontSize: 18, fontWeight: '800' },
  dateStrip: { flexDirection: 'row', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12, gap: 16 },
  dateLabel: { fontSize: 9, fontWeight: '700', color: colors.textMutedDark, letterSpacing: 0.5, marginBottom: 3 },
  dateValue: { fontSize: 13, fontWeight: '600', color: colors.textOnDark },
  dateDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  previewCard: { padding: 14 },
  watermarkNote: { fontSize: 11, color: colors.textMuted, marginBottom: 10 },
  previewImage: { width: '100%', height: 200, borderRadius: 10, resizeMode: 'contain', backgroundColor: '#f0f4fa' },
  detailCard: { padding: 18 },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  fieldsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 0 },
  field: { width: '50%', marginBottom: 14, paddingRight: 8 },
  fieldLabel: { fontSize: 10, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 3 },
  fieldValue: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
  fieldEmpty: { color: colors.textMuted, fontWeight: '400' },
  notesDiv: { height: 1, backgroundColor: 'rgba(30,45,80,0.07)', marginBottom: 14 },
  notesText: { fontSize: 13, color: colors.textPrimary, lineHeight: 20 },
  aiBox: { marginTop: 12, backgroundColor: 'rgba(52,201,186,0.08)', borderRadius: 8, padding: 8 },
  aiLabel: { fontSize: 11, color: colors.brand, fontWeight: '600' },
  deleteBtn: { backgroundColor: 'rgba(229,62,62,0.08)', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(229,62,62,0.2)', marginTop: 4 },
  deleteText: { color: '#c53030', fontWeight: '600', fontSize: 14 },
})
