import { useEffect, useState } from 'react'
import { View, StyleSheet, Platform, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { getT, getLangFromStorage, setLangInStorage } from '@/lib/i18n'
import { supabase } from '@/lib/supabase'
import { registerForPushNotificationsAsync } from '@/lib/notifications'
import { useAuthContext } from '../_layout'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize } from '@/constants/theme'
import type { Translations } from '@/lib/i18n/types'
import type { ContentLang } from '@/types/database'

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatTime(date: Date): string {
  return toTimeString(date)
}

export default function OnboardingScreen() {
  const router = useRouter()
  const theme = useTheme()
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

  function openTimePicker(current: Date, onChange: (date: Date) => void) {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({
        value: current,
        mode: 'time',
        is24Hour: true,
        onChange: (_, date) => date && onChange(date),
      })
      return
    }
    // TODO: iOS time picker
  }

  async function handleSubmit() {
    if (!user) return
    setError(null)
    setLoading(true)

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        name: name.trim() || null,
        lang,
        notif_morning_time: toTimeString(morningTime),
        notif_evening_time: toTimeString(eveningTime),
        onboarding_completed: true,
      })
      .eq('id', user.id)

    if (updateError) {
      setLoading(false)
      setError(t.onboarding.errorGeneric)
      return
    }

    await setLangInStorage(lang)
    await registerForPushNotificationsAsync(user.id)

    setLoading(false)
    router.replace('/(app)/home')
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text variant="heading" style={styles.title}>
          {t.onboarding.title}
        </Text>
        <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
          {t.onboarding.subtitle}
        </Text>

        <Text variant="caption" color={theme.textMuted} style={styles.label}>
          {t.onboarding.nameLabel}
        </Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t.onboarding.namePlaceholder}
          style={styles.input}
        />

        <Text variant="caption" color={theme.textMuted} style={styles.label}>
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

        <Text variant="caption" color={theme.textMuted} style={styles.label}>
          {t.onboarding.notifLabel}
        </Text>
        <View style={styles.timeRow}>
          <Text variant="body">{t.onboarding.notifMorning}</Text>
          <Pressable
            style={[styles.timeButton, { borderColor: theme.border }]}
            onPress={() => openTimePicker(morningTime, setMorningTime)}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(morningTime)}</Text>
          </Pressable>
        </View>
        <View style={styles.timeRow}>
          <Text variant="body">{t.onboarding.notifEvening}</Text>
          <Pressable
            style={[styles.timeButton, { borderColor: theme.border }]}
            onPress={() => openTimePicker(eveningTime, setEveningTime)}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(eveningTime)}</Text>
          </Pressable>
        </View>
        {Platform.OS === 'ios' && (
          <View style={styles.iosPickers}>
            <DateTimePicker
              value={morningTime}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && setMorningTime(date)}
            />
            <DateTimePicker
              value={eveningTime}
              mode="time"
              display="spinner"
              onChange={(_, date) => date && setEveningTime(date)}
            />
          </View>
        )}
        <Text variant="caption" color={theme.textFaint} style={styles.notifNote}>
          {t.onboarding.notifNote}
        </Text>

        {error && (
          <Text variant="caption" color={theme.danger} style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.bg }]}>
        <Button
          label={loading ? t.onboarding.buttonLoading : t.onboarding.buttonCta}
          onPress={handleSubmit}
          disabled={loading}
          loading={loading}
        />
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    paddingBottom: spacing.xxl * 2,
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  timeButton: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  timeButtonText: {
    fontSize: fontSize.base,
  },
  iosPickers: {
    marginTop: spacing.sm,
  },
  notifNote: {
    marginTop: spacing.sm,
  },
  error: {
    marginTop: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
})
