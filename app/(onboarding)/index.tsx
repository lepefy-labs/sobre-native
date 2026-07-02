import { useEffect, useState } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage, setLangInStorage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { useAuthContext } from '../_layout'
import { colors, spacing } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'
import type { ContentLang } from '@/types/database'

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:00`
}

export default function OnboardingScreen() {
  const router = useRouter()
  const { user } = useAuthContext()
  const [t, setT] = useState<Translations>(getT('it'))
  const [lang, setLang] = useState<ContentLang>('it')
  const [name, setName] = useState('')
  const [morningTime, setMorningTime] = useState(new Date(2000, 0, 1, 8, 0))
  const [eveningTime, setEveningTime] = useState(new Date(2000, 0, 1, 21, 0))
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    getLangFromStorage().then((storedLang) => {
      const resolved = storedLang ?? 'it'
      setLang(resolved)
      setT(getT(resolved))
    })
  }, [])

  async function selectLang(newLang: ContentLang) {
    setLang(newLang)
    setT(getT(newLang))
    await setLangInStorage(newLang)
  }

  async function handleSubmit() {
    if (!user) return
    setError(null)
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .update({
        name: name.trim() || null,
        lang,
        notif_morning_time: toTimeString(morningTime),
        notif_evening_time: toTimeString(eveningTime),
        onboarding_completed: true,
      })
      .eq('id', user.id)

    setLoading(false)
    if (error) {
      setError(t.onboarding.errorGeneric)
      return
    }
    router.replace('/(app)/home')
  }

  return (
    <View style={styles.container}>
      <Text variant="heading" style={styles.title}>
        {t.onboarding.title}
      </Text>
      <Text variant="body" color={colors.stone500} style={styles.subtitle}>
        {t.onboarding.subtitle}
      </Text>

      <Text variant="label" style={styles.label}>
        {t.onboarding.nameLabel}
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder={t.onboarding.namePlaceholder}
        style={styles.input}
      />

      <Text variant="label" style={styles.label}>
        {t.onboarding.langLabel}
      </Text>
      <View style={styles.langRow}>
        <Button
          label={t.lang.it}
          onPress={() => selectLang('it')}
          variant={lang === 'it' ? 'primary' : 'secondary'}
        />
        <Button
          label={t.lang.fr}
          onPress={() => selectLang('fr')}
          variant={lang === 'fr' ? 'primary' : 'secondary'}
        />
      </View>

      <Text variant="label" style={styles.label}>
        {t.onboarding.notifLabel}
      </Text>
      <View style={styles.timeRow}>
        <View style={styles.timeCol}>
          <Text variant="caption">{t.onboarding.notifMorning}</Text>
          <DateTimePicker
            value={morningTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => date && setMorningTime(date)}
          />
        </View>
        <View style={styles.timeCol}>
          <Text variant="caption">{t.onboarding.notifEvening}</Text>
          <DateTimePicker
            value={eveningTime}
            mode="time"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(_, date) => date && setEveningTime(date)}
          />
        </View>
      </View>
      <Text variant="caption" color={colors.stone400} style={styles.notifNote}>
        {t.onboarding.notifNote}
      </Text>

      {error && (
        <Text variant="caption" color={colors.red500} style={styles.error}>
          {error}
        </Text>
      )}

      <View style={styles.footer}>
        <Button
          label={loading ? t.onboarding.buttonLoading : t.onboarding.buttonCta}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.stone50,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  label: {
    marginBottom: spacing.xs,
    marginTop: spacing.md,
  },
  input: {
    marginBottom: spacing.sm,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.lg,
  },
  timeCol: {
    flex: 1,
  },
  notifNote: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
  },
  footer: {
    marginTop: 'auto',
    paddingBottom: spacing.xl,
  },
})
