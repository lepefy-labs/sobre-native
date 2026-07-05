import { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Switch, Alert, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useQueryClient } from '@tanstack/react-query'
import * as WebBrowser from 'expo-web-browser'
import { DateTimePickerAndroid } from '@react-native-community/datetimepicker'
import { Text } from '@/components/ui/Text'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { useProfile } from '@/hooks/useProfile'
import { useAuthContext } from '@/app/_layout'
import { supabase } from '@/lib/supabase'
import { signOut } from '@/lib/auth'
import { getT, setLangInStorage } from '@/lib/i18n'
import { useTheme } from '@/hooks/useTheme'
import { spacing, radius, fontSize } from '@/constants/theme'
import type { ContentLang, ThemePreference } from '@/types/database'

function formatTime(value: string | null | undefined): string {
  return value ? value.slice(0, 5) : '--:--'
}

function timeStringToDate(value: string | null | undefined): Date {
  const [h, m] = (value ?? '08:00').split(':').map(Number)
  return new Date(2000, 0, 1, h || 0, m || 0)
}

function toTimeString(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

function formatDate(value: string | null | undefined): string {
  if (!value) return ''
  const d = new Date(value)
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`
}

export default function ProfileScreen() {
  const router = useRouter()
  const theme = useTheme()
  const { user } = useAuthContext()
  const { data: profile } = useProfile()
  const queryClient = useQueryClient()
  const t = getT(profile?.lang ?? 'it')

  const [editingName, setEditingName] = useState(false)
  const [nameValue, setNameValue] = useState('')

  useEffect(() => {
    setNameValue(profile?.name ?? '')
  }, [profile?.name])

  function invalidateProfile() {
    queryClient.invalidateQueries({ queryKey: ['profile'] })
  }

  async function saveName() {
    if (!user) return
    setEditingName(false)
    await supabase.from('profiles').update({ name: nameValue.trim() || null }).eq('id', user.id)
    invalidateProfile()
  }

  async function selectLang(lang: ContentLang) {
    if (!user) return
    await supabase.from('profiles').update({ lang }).eq('id', user.id)
    await setLangInStorage(lang)
    invalidateProfile()
  }

  function selectTheme(preference: ThemePreference) {
    theme.setThemePreference(preference)
  }

  async function toggleMorning(value: boolean) {
    if (!user) return
    await supabase.from('profiles').update({ notif_morning_enabled: value }).eq('id', user.id)
    invalidateProfile()
  }

  async function toggleEvening(value: boolean) {
    if (!user) return
    await supabase.from('profiles').update({ notif_evening_enabled: value }).eq('id', user.id)
    invalidateProfile()
  }

  function openTimePicker(current: string | null | undefined, onChange: (time: string) => void) {
    if (Platform.OS !== 'android') return // TODO: iOS
    DateTimePickerAndroid.open({
      value: timeStringToDate(current),
      mode: 'time',
      is24Hour: true,
      onChange: (_, date) => date && onChange(toTimeString(date)),
    })
  }

  async function saveMorningTime(time: string) {
    if (!user) return
    await supabase.from('profiles').update({ notif_morning_time: time }).eq('id', user.id)
    invalidateProfile()
  }

  async function saveEveningTime(time: string) {
    if (!user) return
    await supabase.from('profiles').update({ notif_evening_time: time }).eq('id', user.id)
    invalidateProfile()
  }

  async function handleUpgrade(plan: 'monthly' | 'yearly') {
    const { data } = await supabase.functions.invoke('create-checkout', {
      body: { plan, successUrl: 'sobre://payment/success', cancelUrl: 'sobre://payment/cancel' },
    })
    if (data?.url) {
      await WebBrowser.openAuthSessionAsync(data.url, 'sobre://payment')
    }
  }

  async function handleManageSubscription() {
    const { data } = await supabase.functions.invoke('create-portal-session', {
      body: { returnUrl: 'sobre://payment/cancel' },
    })
    if (data?.url) await WebBrowser.openBrowserAsync(data.url)
  }

  function openPrivacy() {
    WebBrowser.openBrowserAsync('https://sobrewellness.app/privacy')
  }

  function openTerms() {
    WebBrowser.openBrowserAsync('https://sobrewellness.app/terms')
  }

  function handleLogout() {
    Alert.alert(t.profile.logoutConfirm, '', [
      { text: t.profile.logoutCancel, style: 'cancel' },
      {
        text: t.profile.logout,
        style: 'destructive',
        onPress: async () => {
          await signOut()
          router.replace('/(auth)/login')
        },
      },
    ])
  }

  const isPro = profile?.subscription_status === 'pro'

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.bg }]} contentContainerStyle={styles.content}>
      <Text variant="label" style={styles.sectionTitle}>
        {t.profile.sectionAccount}
      </Text>
      <View style={styles.row}>
        <Text variant="body" color={theme.textMuted}>
          {t.profile.nameLabel}
        </Text>
        {editingName ? (
          <View style={styles.nameEditRow}>
            <TextInput
              value={nameValue}
              onChangeText={setNameValue}
              autoFocus
              onBlur={saveName}
              onSubmitEditing={saveName}
              style={styles.nameInput}
            />
            <Pressable onPress={saveName}>
              <Text variant="label" color={theme.text}>
                {t.profile.nameSave}
              </Text>
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.valueRow} onPress={() => setEditingName(true)}>
            <Text variant="body" color={theme.text}>
              {profile?.name || '—'}
            </Text>
            <Text style={styles.editIcon}>✏️</Text>
          </Pressable>
        )}
      </View>

      <View style={styles.row}>
        <Text variant="body" color={theme.textMuted}>
          {t.profile.emailLabel}
        </Text>
        <Text variant="body" color={theme.textFaint}>
          {profile?.email}
        </Text>
      </View>

      <View style={styles.row}>
        <Text variant="body" color={theme.textMuted}>
          {t.profile.langLabel}
        </Text>
        <View style={styles.langRow}>
          <Pressable
            style={[
              styles.langChip,
              { borderColor: theme.border },
              profile?.lang === 'it' && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
            ]}
            onPress={() => selectLang('it')}
          >
            <Text style={[styles.langChipText, { color: profile?.lang === 'it' ? theme.onPrimary : theme.textSecondary }]}>
              🇮🇹 IT
            </Text>
          </Pressable>
          <Pressable
            style={[
              styles.langChip,
              { borderColor: theme.border },
              profile?.lang === 'fr' && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
            ]}
            onPress={() => selectLang('fr')}
          >
            <Text style={[styles.langChipText, { color: profile?.lang === 'fr' ? theme.onPrimary : theme.textSecondary }]}>
              🇫🇷 FR
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.row}>
        <Text variant="body" color={theme.textMuted}>
          {t.profile.themeLabel}
        </Text>
        <View style={styles.langRow}>
          {(
            [
              ['system', t.profile.themeSystem],
              ['light', t.profile.themeLight],
              ['dark', t.profile.themeDark],
            ] as [ThemePreference, string][]
          ).map(([preference, label]) => (
            <Pressable
              key={preference}
              style={[
                styles.langChip,
                { borderColor: theme.border },
                theme.themePreference === preference && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
              ]}
              onPress={() => selectTheme(preference)}
            >
              <Text
                style={[
                  styles.langChipText,
                  { color: theme.themePreference === preference ? theme.onPrimary : theme.textSecondary },
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

      <Text variant="label" style={styles.sectionTitle}>
        {t.profile.sectionNotifications}
      </Text>
      <View style={styles.notifRow}>
        <Text variant="body">{t.profile.morningLabel}</Text>
        <View style={styles.notifControls}>
          <Switch
            value={!!profile?.notif_morning_enabled}
            onValueChange={toggleMorning}
            trackColor={{ true: theme.primaryBg }}
          />
          <Pressable
            style={[styles.timeButton, { borderColor: theme.border }]}
            onPress={() => openTimePicker(profile?.notif_morning_time, saveMorningTime)}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(profile?.notif_morning_time)}</Text>
          </Pressable>
        </View>
      </View>
      <View style={styles.notifRow}>
        <Text variant="body">{t.profile.eveningLabel}</Text>
        <View style={styles.notifControls}>
          <Switch
            value={!!profile?.notif_evening_enabled}
            onValueChange={toggleEvening}
            trackColor={{ true: theme.primaryBg }}
          />
          <Pressable
            style={[styles.timeButton, { borderColor: theme.border }]}
            onPress={() => openTimePicker(profile?.notif_evening_time, saveEveningTime)}
          >
            <Text style={[styles.timeButtonText, { color: theme.text }]}>{formatTime(profile?.notif_evening_time)}</Text>
          </Pressable>
        </View>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

      <Text variant="label" style={styles.sectionTitle}>
        {t.profile.sectionSubscription}
      </Text>
      {isPro ? (
        <View>
          <View style={[styles.proBadge, { backgroundColor: theme.accent }]}>
            <Text style={[styles.proBadgeText, { color: theme.onPrimary }]}>{t.profile.subscriptionPro}</Text>
          </View>
          {profile?.current_period_end && (
            <Text variant="caption" color={theme.textMuted} style={styles.renewalText}>
              {t.profile.subscriptionRenewal} {formatDate(profile.current_period_end)}
            </Text>
          )}
          <Button
            label={t.profile.manageSubscription}
            onPress={handleManageSubscription}
            variant="secondary"
          />
        </View>
      ) : (
        <View>
          <Text variant="body" color={theme.textMuted} style={styles.freeText}>
            {t.profile.subscriptionFree}
          </Text>
          <Button
            label={t.profile.upgradeMonthly}
            onPress={() => handleUpgrade('monthly')}
            variant="primary"
          />
          <View style={styles.buttonSpacer} />
          <Button
            label={t.profile.upgradeYearly}
            onPress={() => handleUpgrade('yearly')}
            variant="secondary"
          />
        </View>
      )}

      <View style={[styles.divider, { backgroundColor: theme.borderSubtle }]} />

      <Text variant="label" style={styles.sectionTitle}>
        {t.profile.sectionOther}
      </Text>
      <Button label={t.profile.privacy} onPress={openPrivacy} variant="secondary" />
      <View style={styles.buttonSpacer} />
      <Button label={t.profile.terms} onPress={openTerms} variant="secondary" />
      <View style={styles.buttonSpacer} />
      <Pressable onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button">
        <Text variant="label" color={theme.danger}>
          {t.profile.logout}
        </Text>
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  sectionTitle: {
    marginBottom: spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    marginBottom: spacing.lg,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  nameInput: {
    flex: 1,
  },
  editIcon: {
    fontSize: fontSize.sm,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  langChip: {
    borderWidth: 1,
    borderRadius: radius.md,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  langChipText: {
    fontSize: fontSize.sm,
  },
  divider: {
    height: 1,
    marginVertical: spacing.xl,
  },
  notifRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  notifControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
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
  proBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  proBadgeText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  renewalText: {
    marginBottom: spacing.lg,
  },
  freeText: {
    marginBottom: spacing.lg,
  },
  buttonSpacer: {
    height: spacing.sm,
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
})
