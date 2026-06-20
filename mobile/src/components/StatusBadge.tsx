import { Text, View } from 'react-native'
import { STATUS_BG, STATUS_COLOR, STATUS_LABEL } from '../theme'

export default function StatusBadge({ status }: { status: string }) {
  return (
    <View style={{ backgroundColor: STATUS_BG[status] ?? STATUS_BG.no_expiry, borderRadius: 99, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <Text style={{ color: STATUS_COLOR[status] ?? STATUS_COLOR.no_expiry, fontSize: 11, fontWeight: '700' }}>
        {STATUS_LABEL[status] ?? status}
      </Text>
    </View>
  )
}
