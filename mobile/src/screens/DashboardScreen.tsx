import { useEffect, useState } from 'react'
import { ActivityIndicator, Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as SecureStore from 'expo-secure-store'
import api, { API_BASE } from '../api'
import type { DashboardSummary, DocumentBrief, Person, User } from '../api'
import { fetchMe, logout } from '../auth'
import { colors, STATUS_COLOR } from '../theme'
import GlassCard from '../components/GlassCard'
import StatusBadge from '../components/StatusBadge'
import DonutChart from '../components/DonutChart'
import type { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function daysLabel(days: number | null, status: string) {
  if (days === null) return ''
  if (status === 'expired') return `${Math.abs(days)}d ago`
  return `${days}d left`
}

function StatTile({ label, value, color, bg, onPress }: { label: string; value: number; color: string; bg: string; onPress?: () => void }) {
  return (
    <TouchableOpacity style={[styles.statTile, { backgroundColor: bg }]} onPress={onPress} activeOpacity={0.75}>
      <Text style={[styles.statNum, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  )
}

export default function DashboardScreen() {
  const nav = useNavigation<Nav>()
  const insets = useSafeAreaInsets()
  const [user, setUser] = useState<User | null>(null)
  const [summary, setSummary] = useState<DashboardSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [primaryMember, setPrimaryMember] = useState<Person | null>(null)
  const [profilePhotoUri, setProfilePhotoUri] = useState<string | null>(null)

  async function load() {
    const [me, dash, fam] = await Promise.all([fetchMe(), api.get('/dashboard/summary'), api.get('/family')])
    setUser(me)
    setSummary(dash.data.data)
    const primary = (fam.data.data as Person[]).find(p => p.is_primary) ?? null
    setPrimaryMember(primary)
    // Load profile photo if exists
    if (primary?.photo_path) {
      const token = await SecureStore.getItemAsync('ne_token')
      try {
        const resp = await fetch(`${API_BASE}/api/v1/family/${primary.id}/photo`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
        if (resp.ok) {
          const blob = await resp.blob()
          const reader = new FileReader()
          reader.onloadend = () => setProfilePhotoUri(reader.result as string)
          reader.readAsDataURL(blob)
        }
      } catch {}
    }
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function handleRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (loading) return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </LinearGradient>
  )

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.brand} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting()},</Text>
            <Text style={styles.userName}>{user?.full_name.split(' ')[0] ?? 'there'} 👋</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {/* Profile photo */}
            {profilePhotoUri
              ? <Image source={{ uri: profilePhotoUri }} style={styles.profilePhoto} />
              : <View style={[styles.profilePhoto, styles.profilePhotoFallback]}>
                  <Text style={{ fontSize: 16, fontWeight: '800', color: colors.brand }}>
                    {user?.full_name.charAt(0) ?? '?'}
                  </Text>
                </View>
            }
            <TouchableOpacity
              onPress={async () => { await logout(); nav.replace('Login') }}
              style={styles.signOutBtn}
            >
              <Text style={styles.signOutText}>Sign out</Text>
            </TouchableOpacity>
          </View>
        </View>

        {summary && (
          <>
            {/* Stat tiles */}
            <View style={styles.statsRow}>
              <StatTile label="Total" value={summary.total} color={colors.textPrimary} bg="rgba(30,45,80,0.07)" onPress={() => nav.navigate('Documents', { statusFilter: '' })} />
              <StatTile label="Expired" value={summary.expired} color={colors.expired} bg={colors.expiredBg} onPress={() => nav.navigate('Documents', { statusFilter: 'expired' })} />
              <StatTile label="Expiring" value={summary.expiring_soon} color={colors.expiring} bg={colors.expiringBg} onPress={() => nav.navigate('Documents', { statusFilter: 'expiring_soon' })} />
              <StatTile label="Valid" value={summary.valid} color={colors.valid} bg={colors.validBg} onPress={() => nav.navigate('Documents', { statusFilter: 'valid' })} />
            </View>

            {/* Dark hero card — donut + attention list */}
            <GlassCard dark style={styles.heroCard}>
              <View style={styles.heroTop}>
                {/* Donut */}
                <View style={styles.donutWrap}>
                  <DonutChart
                    total={summary.total}
                    size={110}
                    thickness={14}
                    segments={[
                      { value: summary.expired, color: colors.expired },
                      { value: summary.expiring_soon, color: colors.expiring },
                      { value: summary.valid, color: colors.valid },
                      { value: summary.no_expiry, color: colors.noExpiry },
                    ]}
                  />
                  {/* Legend — 2 columns, all 4 types */}
                  <View style={{ marginTop: 10, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                    {[
                      { color: colors.expired, label: 'Expired', value: summary.expired },
                      { color: colors.expiring, label: 'Expiring', value: summary.expiring_soon },
                      { color: colors.valid, label: 'Valid', value: summary.valid },
                      { color: colors.noExpiry, label: 'No expiry', value: summary.no_expiry },
                    ].map(l => (
                      <View key={l.label} style={[styles.legendRow, { width: '48%' }]}>
                        <View style={[styles.legendDot, { backgroundColor: l.color }]} />
                        <Text style={styles.legendLabel}>{l.label}</Text>
                        <Text style={styles.legendValue}>{l.value}</Text>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Divider */}
                <View style={styles.divider} />

                {/* Attention list */}
                <View style={styles.attentionWrap}>
                  <Text style={styles.heroTitle}>
                    {summary.upcoming.length > 0 ? '⚠️ Needs Attention' : '✅ All Clear'}
                  </Text>
                  <Text style={styles.heroSub}>
                    {summary.upcoming.length > 0
                      ? `${summary.upcoming.length} document${summary.upcoming.length !== 1 ? 's' : ''}`
                      : 'All documents are up to date'}
                  </Text>
                </View>
              </View>

              {/* Attention docs — max 4, scrollable, See all link */}
              <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                {summary.upcoming.slice(0, 4).map((doc: DocumentBrief) => (
                  <TouchableOpacity
                    key={doc.id}
                    onPress={() => nav.navigate('DocumentDetail', { id: doc.id })}
                    style={styles.attentionRow}
                    activeOpacity={0.7}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={styles.attentionTitle} numberOfLines={1}>{doc.title}</Text>
                      <Text style={styles.attentionSub}>{doc.person?.full_name} · {doc.document_type?.name}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge status={doc.status} />
                      <Text style={[styles.daysLabel, { color: STATUS_COLOR[doc.status] ?? colors.textMuted }]}>
                        {daysLabel(doc.days_remaining, doc.status)}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
              {summary.upcoming.length > 0 && (
                <TouchableOpacity onPress={() => nav.navigate('Documents', { statusFilter: 'expiring_soon' })} style={{ marginTop: 10, alignItems: 'center' }}>
                  <Text style={{ color: colors.brand, fontSize: 12, fontWeight: '600' }}>See all {summary.expired + summary.expiring_soon} requiring attention →</Text>
                </TouchableOpacity>
              )}
            </GlassCard>

            {/* Quick actions */}
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('Documents')} activeOpacity={0.8}>
                <Text style={styles.actionIcon}>📄</Text>
                <Text style={styles.actionLabel}>Documents</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('AddDocument')} activeOpacity={0.8}>
                <LinearGradient colors={[colors.brand, colors.brandDark]} style={styles.actionBtnPrimary}>
                  <Text style={styles.actionIcon}>➕</Text>
                  <Text style={[styles.actionLabel, { color: 'white' }]}>Add Doc</Text>
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => nav.navigate('Family')} activeOpacity={0.8}>
                <Text style={styles.actionIcon}>👨‍👩‍👧</Text>
                <Text style={styles.actionLabel}>Family</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { fontSize: 14, color: colors.textMuted },
  userName: { fontSize: 22, fontWeight: '800', color: colors.textPrimary, marginTop: 2 },
  profilePhoto: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, borderColor: 'rgba(52,201,186,0.4)' },
  profilePhotoFallback: { backgroundColor: 'rgba(52,201,186,0.15)', alignItems: 'center', justifyContent: 'center' },
  signOutBtn: { backgroundColor: 'rgba(229,62,62,0.08)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(229,62,62,0.15)' },
  signOutText: { color: '#c53030', fontSize: 12, fontWeight: '600' },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  statTile: { flex: 1, borderRadius: 12, padding: 10, alignItems: 'center' },
  statNum: { fontSize: 22, fontWeight: '800' },
  statLabel: { fontSize: 10, color: colors.textMuted, fontWeight: '600', marginTop: 2 },
  heroCard: { padding: 18, marginBottom: 16 },
  heroTop: { flexDirection: 'row', gap: 14, marginBottom: 14 },
  donutWrap: { alignItems: 'center' },
  legendRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 7, height: 7, borderRadius: 99 },
  legendLabel: { fontSize: 10, color: colors.textMutedDark, flex: 1 },
  legendValue: { fontSize: 10, color: colors.textOnDark, fontWeight: '700' },
  divider: { width: 1, backgroundColor: 'rgba(255,255,255,0.08)' },
  attentionWrap: { flex: 1, justifyContent: 'center' },
  heroTitle: { fontSize: 13, fontWeight: '700', color: colors.textOnDark, marginBottom: 4 },
  heroSub: { fontSize: 11, color: colors.textMutedDark },
  attentionRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: 12,
    marginTop: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)', gap: 10,
  },
  attentionTitle: { fontSize: 13, fontWeight: '600', color: colors.textOnDark },
  attentionSub: { fontSize: 11, color: colors.textMutedDark, marginTop: 2 },
  daysLabel: { fontSize: 10, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', gap: 12 },
  actionBtn: { flex: 1, backgroundColor: colors.glassWhite, borderRadius: 14, alignItems: 'center', paddingVertical: 16, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  actionBtnPrimary: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', padding: 16 },
  actionIcon: { fontSize: 24, marginBottom: 6 },
  actionLabel: { fontSize: 12, fontWeight: '600', color: colors.textPrimary },
})
