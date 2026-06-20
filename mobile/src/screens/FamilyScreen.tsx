import { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation } from '@react-navigation/native'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import api from '../api'
import type { Person } from '../api'
import { colors, RELATION_ICON } from '../theme'
import GlassCard from '../components/GlassCard'
import type { RootStackParamList } from '../navigation'

type Nav = NativeStackNavigationProp<RootStackParamList>

const RELATION_COLORS: Record<string, string> = {
  SELF: '#34c9ba', SPOUSE: '#e879a0', CHILD: '#f6ad55',
  PARENT: '#68d391', SIBLING: '#76e4f7', OTHER: '#b794f4',
}

function formatAge(dob: string | null) {
  if (!dob) return null
  const age = Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
  return `${age}y`
}

export default function FamilyScreen() {
  const nav = useNavigation<Nav>()
  const insets = useSafeAreaInsets()
  const [family, setFamily] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRelation, setNewRelation] = useState('CHILD')
  const [newDob, setNewDob] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const r = await api.get('/family')
    setFamily(r.data.data)
  }

  useEffect(() => { load().finally(() => setLoading(false)) }, [])

  async function handleAdd() {
    if (!newName.trim()) return
    setSaving(true)
    try {
      await api.post('/family', { full_name: newName.trim(), relation_type: newRelation, date_of_birth: newDob || null })
      await load()
      setShowAdd(false); setNewName(''); setNewDob('')
    } finally { setSaving(false) }
  }

  function confirmDelete(member: Person) {
    Alert.alert('Remove member', `Remove ${member.full_name}? Their documents will be preserved.`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => {
        await api.delete(`/family/${member.id}`)
        await load()
      }},
    ])
  }

  const RELATION_TYPES = ['SPOUSE', 'CHILD', 'PARENT', 'SIBLING', 'OTHER']

  if (loading) return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.center}>
      <ActivityIndicator size="large" color={colors.brand} />
    </LinearGradient>
  )

  return (
    <LinearGradient colors={[colors.bgStart, colors.bgEnd]} style={styles.root}>
      <FlatList
        data={family}
        keyExtractor={p => String(p.id)}
        contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 40 }]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <GlassCard dark style={styles.summaryCard}>
            <Text style={{ fontSize: 32, marginBottom: 6 }}>👨‍👩‍👧</Text>
            <Text style={styles.summaryNum}>{family.length}</Text>
            <Text style={styles.summarySub}>Family members</Text>
          </GlassCard>
        }
        ListFooterComponent={
          showAdd ? (
            <GlassCard style={styles.addCard}>
              <Text style={styles.addTitle}>Add Family Member</Text>
              <TextInput style={styles.input} placeholder="Full name" placeholderTextColor={colors.textMuted} value={newName} onChangeText={setNewName} />
              <Text style={styles.label}>Relation</Text>
              <View style={styles.chipRow}>
                {RELATION_TYPES.map(r => (
                  <TouchableOpacity key={r} onPress={() => setNewRelation(r)} style={[styles.chip, newRelation === r && styles.chipActive]}>
                    <Text style={[styles.chipText, newRelation === r && styles.chipTextActive]}>{r.charAt(0) + r.slice(1).toLowerCase()}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <TextInput style={styles.input} placeholder="Date of birth (YYYY-MM-DD)" placeholderTextColor={colors.textMuted} value={newDob} onChangeText={setNewDob} />
              <View style={styles.addBtns}>
                <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowAdd(false)}><Text style={{ color: colors.textSecondary }}>Cancel</Text></TouchableOpacity>
                <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving}>
                  <Text style={styles.saveBtnText}>{saving ? 'Saving…' : 'Add Member'}</Text>
                </TouchableOpacity>
              </View>
            </GlassCard>
          ) : (
            <TouchableOpacity style={styles.addTrigger} onPress={() => setShowAdd(true)}>
              <Text style={styles.addTriggerText}>＋  Add Family Member</Text>
            </TouchableOpacity>
          )
        }
        renderItem={({ item: p }) => {
          const color = RELATION_COLORS[p.relation_type] ?? '#b794f4'
          const initials = p.full_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()
          const relation = p.is_primary ? 'Self' : p.relation_type.charAt(0) + p.relation_type.slice(1).toLowerCase()

          return (
            <GlassCard style={styles.memberCard}>
              <View style={styles.memberRow}>
                {/* Avatar */}
                <View style={{ position: 'relative' }}>
                  <View style={[styles.avatar, { backgroundColor: `${color}33`, borderColor: `${color}55` }]}>
                    <Text style={[styles.avatarText, { color }]}>{initials}</Text>
                  </View>
                  <View style={[styles.badge]}>
                    <Text style={{ fontSize: 10 }}>{RELATION_ICON[p.relation_type] ?? '🙂'}</Text>
                  </View>
                </View>

                {/* Info */}
                <View style={{ flex: 1 }}>
                  <Text style={styles.memberName}>{p.full_name}</Text>
                  <View style={styles.memberMeta}>
                    <View style={[styles.relationBadge, { backgroundColor: `${color}22`, borderColor: `${color}44` }]}>
                      <Text style={[styles.relationText, { color }]}>{relation}</Text>
                    </View>
                    {p.date_of_birth && <Text style={styles.age}>{formatAge(p.date_of_birth)}</Text>}
                  </View>
                </View>

                {/* Actions */}
                {!p.is_primary && (
                  <View style={styles.actions}>
                    <TouchableOpacity onPress={() => nav.navigate('Documents')} style={styles.actionPill}>
                      <Text style={styles.actionPillText}>Docs</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => confirmDelete(p)} style={styles.deletePill}>
                      <Text style={styles.deletePillText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </GlassCard>
          )
        }}
      />
    </LinearGradient>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 16, paddingBottom: 40, gap: 10 },
  summaryCard: { padding: 24, alignItems: 'center', marginBottom: 6 },
  summaryNum: { fontSize: 36, fontWeight: '800', color: colors.textOnDark },
  summarySub: { fontSize: 13, color: colors.textMutedDark },
  memberCard: { padding: 16 },
  memberRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  avatar: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  avatarText: { fontSize: 18, fontWeight: '800' },
  badge: { position: 'absolute', bottom: -2, right: -4, width: 22, height: 22, borderRadius: 11, backgroundColor: 'white', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(30,45,80,0.1)' },
  memberName: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  memberMeta: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  relationBadge: { borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, borderWidth: 1 },
  relationText: { fontSize: 11, fontWeight: '700' },
  age: { fontSize: 12, color: colors.textMuted },
  actions: { flexDirection: 'row', gap: 6 },
  actionPill: { backgroundColor: 'rgba(52,201,186,0.1)', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(52,201,186,0.2)' },
  actionPillText: { fontSize: 12, color: colors.brand, fontWeight: '600' },
  deletePill: { backgroundColor: 'rgba(229,62,62,0.08)', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 6, borderWidth: 1, borderColor: 'rgba(229,62,62,0.2)' },
  deletePillText: { fontSize: 12, color: '#c53030', fontWeight: '600' },
  addCard: { padding: 20, marginTop: 6 },
  addTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6, marginTop: 10 },
  input: { backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(30,45,80,0.12)', borderRadius: 10, padding: 11, fontSize: 14, color: colors.textPrimary, marginBottom: 4 },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  chip: { backgroundColor: 'rgba(30,45,80,0.05)', borderRadius: 99, paddingHorizontal: 12, paddingVertical: 6 },
  chipActive: { backgroundColor: colors.brand },
  chipText: { fontSize: 12, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: 'white', fontWeight: '700' },
  addBtns: { flexDirection: 'row', gap: 10, marginTop: 14 },
  cancelBtn: { flex: 1, padding: 12, borderRadius: 10, backgroundColor: 'rgba(30,45,80,0.05)', alignItems: 'center' },
  saveBtn: { flex: 2, backgroundColor: colors.brand, borderRadius: 10, padding: 12, alignItems: 'center' },
  saveBtnText: { color: 'white', fontWeight: '700', fontSize: 14 },
  addTrigger: { backgroundColor: colors.glassWhite, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 6, borderWidth: 1, borderColor: colors.border },
  addTriggerText: { color: colors.brand, fontWeight: '700', fontSize: 14 },
})
