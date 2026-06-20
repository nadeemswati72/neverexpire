import { useState } from 'react'
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { colors } from '../theme'

interface Option {
  label: string
  value: string
}

interface Props {
  label: string
  value: string
  options: Option[]
  onChange: (value: string) => void
}

export default function ModalPicker({ label, value, options, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const insets = useSafeAreaInsets()
  const selected = options.find(o => o.value === value)

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.trigger} onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Text style={[styles.triggerText, !selected && styles.placeholder]}>
          {selected?.label ?? 'Select…'}
        </Text>
        <Text style={styles.chevron}>▾</Text>
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide">
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setOpen(false)} />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + 8 }]}>
          {/* Handle + header */}
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{label}</Text>
            <TouchableOpacity onPress={() => setOpen(false)}>
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={options}
            keyExtractor={o => o.value}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = item.value === value
              return (
                <TouchableOpacity
                  style={[styles.option, isSelected && styles.optionSelected]}
                  onPress={() => { onChange(item.value); setOpen(false) }}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                    {item.label}
                  </Text>
                  {isSelected && <Text style={styles.check}>✓</Text>}
                </TouchableOpacity>
              )
            }}
          />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  trigger: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: 1, borderColor: 'rgba(30,45,80,0.12)',
    borderRadius: 10, padding: 11,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  triggerText: { fontSize: 14, color: colors.textPrimary, flex: 1 },
  placeholder: { color: colors.textMuted },
  chevron: { fontSize: 12, color: colors.textMuted, marginLeft: 8 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' },
  sheet: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    maxHeight: '65%',
  },
  handle: { width: 36, height: 4, backgroundColor: '#d1d5db', borderRadius: 2, alignSelf: 'center', marginTop: 10, marginBottom: 4 },
  sheetHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#f3f4f6',
  },
  sheetTitle: { fontSize: 15, fontWeight: '700', color: colors.textPrimary },
  doneText: { fontSize: 14, fontWeight: '700', color: colors.brand },
  list: { paddingHorizontal: 12, paddingTop: 4 },
  option: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingVertical: 13, paddingHorizontal: 12,
    borderRadius: 10, marginBottom: 2,
  },
  optionSelected: { backgroundColor: `${colors.brand}15` },
  optionText: { fontSize: 14, color: colors.textPrimary },
  optionTextSelected: { color: colors.brand, fontWeight: '700' },
  check: { color: colors.brand, fontWeight: '700', fontSize: 14 },
})
