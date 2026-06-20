import { useEffect, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute, type RouteProp } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import api from '../api'
import type { DocumentBrief } from '../api'
import { colors, DOC_ICON, STATUS_COLOR } from '../theme'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import type { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

const STATUS_FILTERS = [
  { key: '', label: 'All' },
  { key: 'expired', label: 'Expired' },
  { key: 'expiring_soon', label: 'Expiring' },
  { key: 'valid', label: 'Valid' },
]

function daysLabel(days: number | null, status: string) {
  if (days === null) return ''
  if (status === 'expired') return `${Math.abs(days)}d ago`
  return `${days}d left`
}

export default function DocumentsScreen() {
  const nav = useNavigation<Nav>()
  const route = useRoute<RouteProp<RootStackParamList, 'Documents'>>()
  const insets = useSafeAreaInsets()
  const [docs, setDocs] = useState<DocumentBrief[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(route.params?.statusFilter ?? '')
  const personIdFilter = route.params?.personId ?? null

  useEffect(() => {
    api.get('/documents').then(r => setDocs(r.data.data)).finally(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => {
    if (personIdFilter && d.person_id !== personIdFilter) return false
    if (statusFilter && d.status !== statusFilter) return false
    if (search && !d.title.toLowerCase().includes(search.toLowerCase()) &&
        !(d.person?.full_name ?? '').toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  if (loading) return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </LinearGradient>
  )

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search documents or people…"
          placeholderTextColor={colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Status filter pills */}
      <View style={styles.filterRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity
            key={f.key}
            onPress={() => setStatusFilter(f.key)}
            style={[styles.filterPill, statusFilter === f.key && styles.filterPillActive]}
          >
            <Text style={[styles.filterText, statusFilter === f.key && styles.filterTextActive]}>
              {f.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.countText}>{filtered.length} document{filtered.length !== 1 ? 's' : ''}</Text>

      <FlatList
        data={filtered}
        keyExtractor={d => String(d.id)}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={{ fontSize: 40, marginBottom: 12 }}>📭</Text>
            <Text style={styles.emptyText}>No documents found</Text>
          </View>
        }
        renderItem={({ item: doc }) => (
          <TouchableOpacity onPress={() => nav.navigate('DocumentDetail', { id: doc.id })} activeOpacity={0.8}>
            <GlassCard style={styles.docCard}>
              <View style={styles.docRow}>
                {/* Icon */}
                <View style={[styles.docIconBox, { backgroundColor: `${STATUS_COLOR[doc.status] ?? colors.brand}18` }]}>
                  <Text style={{ fontSize: 22 }}>{DOC_ICON[doc.document_type?.code] ?? '📄'}</Text>
                </View>

                {/* Info */}
                <View style={styles.docInfo}>
                  <Text style={styles.docTitle} numberOfLines={1}>{doc.title}</Text>
                  <Text style={styles.docSub} numberOfLines={1}>
                    {doc.person?.full_name ?? '—'} · {doc.document_type?.name ?? '—'}
                    {doc.document_number ? ` · #${doc.document_number}` : ''}
                  </Text>
                </View>

                {/* Status */}
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <StatusBadge status={doc.status} />
                  {doc.days_remaining !== null && (
                    <Text style={[styles.daysText, { color: STATUS_COLOR[doc.status] ?? colors.textMuted }]}>
                      {daysLabel(doc.days_remaining, doc.status)}
                    </Text>
                  )}
                </View>
              </View>
            </GlassCard>
          </TouchableOpacity>
        )}
      />

      {/* FAB — above iOS home indicator */}
      <TouchableOpacity style={[styles.fab, { bottom: insets.bottom + 16 }]} onPress={() => nav.navigate('AddDocument')} activeOpacity={0.85}>
        <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.fabGrad}>
          <Text style={styles.fabText}>＋</Text>
        </LinearGradient>
      </TouchableOpacity>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  searchWrap: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 },
  searchInput: { backgroundColor: colors.glassWhite, borderRadius: 12, padding: 12, fontSize: 14, color: colors.textPrimary, borderWidth: 1, borderColor: colors.border },
  filterRow: { flexDirection: 'row', gap: 8, paddingHorizontal: 16, paddingBottom: 10 },
  filterPill: { backgroundColor: 'rgba(255,255,255,0.5)', borderRadius: 99, paddingHorizontal: 14, paddingVertical: 6, borderWidth: 1, borderColor: colors.border },
  filterPillActive: { backgroundColor: colors.brand, borderColor: colors.brand },
  filterText: { fontSize: 13, color: colors.textSecondary, fontWeight: '500' },
  filterTextActive: { color: 'white', fontWeight: '700' },
  countText: { fontSize: 12, color: colors.textMuted, paddingHorizontal: 16, marginBottom: 6 },
  list: { padding: 16, paddingTop: 4, paddingBottom: 100, gap: 10 },
  docCard: { padding: 14 },
  docRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  docIconBox: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  docInfo: { flex: 1 },
  docTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  docSub: { fontSize: 11, color: colors.textMuted, marginTop: 3 },
  daysText: { fontSize: 11, fontWeight: '600' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyText: { fontSize: 15, color: colors.textMuted },
  fab: { position: 'absolute', right: 20, borderRadius: 99, shadowColor: colors.brand, shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  fabGrad: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center' },
  fabText: { color: 'white', fontSize: 28, lineHeight: 32 },
})
