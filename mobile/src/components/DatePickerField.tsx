import { useState } from 'react'
import { Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { colors } from '../theme'

interface Props {
  label: string
  value: string        // ISO date string YYYY-MM-DD or ''
  onChange: (iso: string) => void
  placeholder?: string
}

function isoToDate(iso: string): Date {
  return iso ? new Date(iso + 'T12:00:00') : new Date()
}

function formatDisplay(iso: string): string {
  if (!iso) return ''
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function DatePickerField({ label, value, onChange, placeholder = 'Select date…' }: Props) {
  const [show, setShow] = useState(false)
  const [tempDate, setTempDate] = useState<Date>(isoToDate(value))

  function toISO(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${dd}`
  }

  function handleOpen() {
    setTempDate(isoToDate(value))
    setShow(true)
  }

  // Android: picker dialog closes itself, onChange fires once on confirm
  function handleAndroidChange(_: any, d?: Date) {
    setShow(false)
    if (d) onChange(toISO(d))
  }

  // iOS: picker stays open, we track scroll in tempDate, confirm on Done
  function handleIOSChange(_: any, d?: Date) {
    if (d) setTempDate(d)
  }

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.btn} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={[styles.btnText, !value && styles.placeholder]}>
          {value ? formatDisplay(value) : placeholder}
        </Text>
        <Text style={styles.icon}>📅</Text>
      </TouchableOpacity>

      {/* Android — inline picker dialog */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="default"
          onChange={handleAndroidChange}
        />
      )}

      {/* iOS — Modal with spinner + Done/Cancel */}
      {Platform.OS === 'ios' && (
        <Modal transparent visible={show} animationType="slide">
          <View style={styles.overlay}>
            <View style={styles.sheet}>
              <View style={styles.sheetHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.sheetTitle}>{label}</Text>
                <TouchableOpacity onPress={() => { setShow(false); onChange(toISO(tempDate)) }}>
                  <Text style={styles.doneText}>Done</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleIOSChange}
                style={{ backgroundColor: 'white' }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSecondary, marginBottom: 6 },
  btn: { backgroundColor: 'rgba(255,255,255,0.7)', borderWidth: 1, borderColor: 'rgba(30,45,80,0.12)', borderRadius: 10, padding: 11, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  btnText: { fontSize: 14, color: colors.textPrimary },
  placeholder: { color: colors.textMuted },
  icon: { fontSize: 16 },
  // iOS modal
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.35)' },
  sheet: { backgroundColor: 'white', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' },
  sheetTitle: { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  cancelText: { fontSize: 14, color: colors.textMuted },
  doneText: { fontSize: 14, fontWeight: '700', color: colors.brand },
})
