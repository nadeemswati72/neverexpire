import { StyleSheet, View, type ViewStyle } from 'react-native'
import { colors, radius, shadow } from '../theme'

interface Props {
  children: React.ReactNode
  style?: ViewStyle
  dark?: boolean
}

export default function GlassCard({ children, style, dark = false }: Props) {
  return (
    <View style={[
      styles.base,
      dark ? styles.dark : styles.light,
      shadow.card,
      style,
    ]}>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.card,
    overflow: 'hidden',
    borderWidth: 1,
  },
  light: {
    backgroundColor: colors.glassWhite,
    borderColor: colors.border,
  },
  dark: {
    backgroundColor: colors.glassDark,
    borderColor: colors.borderDark,
  },
})
