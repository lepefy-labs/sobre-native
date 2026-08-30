import { useEffect, useState } from 'react'
import { View, StyleSheet, Platform, ScrollView, Pressable } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'
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
import { spacing, radius, fontSize, typography, fonts, gradient } from '@/constants/theme'
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
    }
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
      <LinearGradient colors={gradient[theme.scheme].morning} style={StyleSheet.absoluteFill} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandWrap}>
          <Text style={[styles.brand, { color: theme.textMuted }]}>SOBRE</Text>
        </View>

        <Text style={[typography.display, styles.title, { fontFamily: fonts.serif.light, color: theme.text }]}>
          {t.onboarding.title}
        </Text>
        <Text variant="body" color={theme.textMuted} style={styles.subtitle}>
          {t.onboarding.subtitle}
        </Text>

        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}> 
          <Text variant="caption" color={theme.textMuted} style={styles.label}>{t.onboarding.nameLabel}</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={t.onboarding.namePlaceholder}
          />

          <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

          <Text variant="caption" color={theme.textMuted} style={styles.label}>{t.onboarding.langLabel}</Text>
          <View style={styles.langRow}>
            <Button label={t.lang.it} onPress={() => selectLang('it')} variant={lang === 'it' ? 'primary' : 'secondary'} />
            <Button label={t.lang.fr} onPress={() => selectLang('fr')} variant={lang === 'fr' ? 'primary' : 'secondary'} />
          </View>
        </View>

        <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}> 
          <Text variant="caption" color={theme.textMuted} style={styles.label}>{t.onboarding.notifLabel}</Text>

          <View style={styles.timeRow}>
            <Text variant="body">{t.onboarding.notifMorning}</Text>
            <Pressable
              style={[styles.timeButton, { backgroundColor: theme.surfaceMuted }]}
              onPress={() => openTimePicker(morningTime, setMorningTime)}
            >
              <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(morningTime)}</Text>
            </Pressable>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

          <View style={styles.timeRow}>
            <Text variant="body">{t.onboarding.notifEvening}</Text>
            <Pressable
              style={[styles.timeButton, { backgroundColor: theme.surfaceMuted }]}
              onPress={() => openTimePicker(eveningTime, setEveningTime)}
            >
              <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(eveningTime)}</Text>
            </Pressable>
          </View>

          {Platform.OS === 'ios' && (
            <View style={styles.iosPickers}>
              <DateTimePicker value={morningTime} mode="time" display="spinner" onChange={(_, date) => date && setMorningTime(date)} />
              <DateTimePicker value={eveningTime} mode="time" display="spinner" onChange={(_, date) => date && setEveningTime(date)} />
            </View>
          )}

          <Text variant="caption" color={theme.textFaint} style={styles.notifNote}>{t.onboarding.notifNote}</Text>
        </View>

        {error && (
          <Text variant="caption" color={theme.danger} style={styles.error} accessibilityRole="alert">
            {error}
          </Text>
        )}
      </ScrollView>

      <SafeAreaView edges={['bottom']} style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.borderSubtle }]}> 
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
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: 130,
  },
  brandWrap: {
    alignItems: 'flex-start',
    marginBottom: spacing.xl,
  },
  brand: {
    fontSize: 12,
    letterSpacing: 5,
    fontWeight: '600',
  },
  title: {
    marginBottom: spacing.sm,
  },
  subtitle: {
    marginBottom: spacing.xl,
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  label: {
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: spacing.lg,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeButton: {
    borderRadius: radius.full,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  timeButtonText: {
    fontSize: fontSize.base,
    fontWeight: '600',
  },
  iosPickers: {
    marginTop: spacing.sm,
  },
  notifNote: {
    marginTop: spacing.md,
  },
  error: {
    marginTop: spacing.md,
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
  },
})
