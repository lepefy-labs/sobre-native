import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { useTheme } from '@/hooks/useTheme'

export default function ArchiveScreen() {
  const theme = useTheme()
  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Text variant="body">Archivio</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
