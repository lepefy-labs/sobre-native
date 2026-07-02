import { View, StyleSheet } from 'react-native'
import { Text } from '@/components/ui/Text'
import { colors } from '@/constants/theme'

export default function ArchiveScreen() {
  return (
    <View style={styles.container}>
      <Text variant="body">Archivio</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone50,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
