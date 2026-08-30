import { useEffect, useState } from 'react'
import { View, ScrollView, StyleSheet, Pressable, Switch, Alert, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
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
import { spacing, radius, fontSize, typography, fonts } from '@/constants/theme'
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
    if (Platform.OS !== 'android') return
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
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={[typography.display, styles.title, { fontFamily: fonts.serif.light, color: theme.text }]}>
              {t.dashboard.nav.profile}
            </Text>
            {profile?.email && (
              <Text variant="caption" color={theme.textMuted} style={styles.subtitle}>
                {profile.email}
              </Text>
            )}
          </View>

          <SectionLabel label={t.profile.sectionAccount} />
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <View style={styles.row}>
              <Text variant="body" color={theme.textMuted}>{t.profile.nameLabel}</Text>
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
                    <Text variant="label" color={theme.text}>{t.profile.nameSave}</Text>
                  </Pressable>
                </View>
              ) : (
                <Pressable style={styles.valueRow} onPress={() => setEditingName(true)}>
                  <Text variant="body" color={theme.text}>{profile?.name || '—'}</Text>
                  <Text style={[styles.chevron, { color: theme.textFaint }]}>›</Text>
                </Pressable>
              )}
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.borderSubtle }]} />

            <View style={styles.row}>
              <Text variant="body" color={theme.textMuted}>{t.profile.langLabel}</Text>
              <View style={styles.chipRow}>
                <ChoiceChip label="🇮🇹 IT" selected={profile?.lang === 'it'} onPress={() => selectLang('it')} />
                <ChoiceChip label="🇫🇷 FR" selected={profile?.lang === 'fr'} onPress={() => selectLang('fr')} />
              </View>
            </View>

            <View style={[styles.cardDivider, { backgroundColor: theme.borderSubtle }]} />

            <View style={styles.row}>
              <Text variant="body" color={theme.textMuted}>{t.profile.themeLabel}</Text>
              <View style={styles.chipRow}>
                {([
                  ['system', t.profile.themeSystem],
                  ['light', t.profile.themeLight],
                  ['dark', t.profile.themeDark],
                ] as [ThemePreference, string][]).map(([preference, label]) => (
                  <ChoiceChip
                    key={preference}
                    label={label}
                    selected={theme.themePreference === preference}
                    onPress={() => selectTheme(preference)}
                  />
                ))}
              </View>
            </View>
          </View>

          <SectionLabel label={t.profile.sectionNotifications} />
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <NotificationRow
              label={t.profile.morningLabel}
              enabled={!!profile?.notif_morning_enabled}
              onToggle={toggleMorning}
              time={formatTime(profile?.notif_morning_time)}
              onTimePress={() => openTimePicker(profile?.notif_morning_time, saveMorningTime)}
            />
            <View style={[styles.cardDivider, { backgroundColor: theme.borderSubtle }]} />
            <NotificationRow
              label={t.profile.eveningLabel}
              enabled={!!profile?.notif_evening_enabled}
              onToggle={toggleEvening}
              time={formatTime(profile?.notif_evening_time)}
              onTimePress={() => openTimePicker(profile?.notif_evening_time, saveEveningTime)}
            />
          </View>

          <SectionLabel label={t.profile.sectionSubscription} />
          <View style={[styles.sectionCard, styles.subscriptionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
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
                <Button label={t.profile.manageSubscription} onPress={handleManageSubscription} variant="secondary" />
              </View>
            ) : (
              <View>
                <Text variant="body" color={theme.textMuted} style={styles.freeText}>
                  {t.profile.subscriptionFree}
                </Text>
                <Button label={t.profile.upgradeMonthly} onPress={() => handleUpgrade('monthly')} variant="primary" />
                <View style={styles.buttonSpacer} />
                <Button label={t.profile.upgradeYearly} onPress={() => handleUpgrade('yearly')} variant="secondary" />
              </View>
            )}
          </View>

          <SectionLabel label={t.profile.sectionOther} />
          <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.borderSubtle }]}>
            <Pressable onPress={openPrivacy} style={styles.linkRow}>
              <Text variant="body" color={theme.text}>{t.profile.privacy}</Text>
              <Text style={[styles.chevron, { color: theme.textFaint }]}>›</Text>
            </Pressable>
            <View style={[styles.cardDivider, { backgroundColor: theme.borderSubtle }]} />
            <Pressable onPress={openTerms} style={styles.linkRow}>
              <Text variant="body" color={theme.text}>{t.profile.terms}</Text>
              <Text style={[styles.chevron, { color: theme.textFaint }]}>›</Text>
            </Pressable>
          </View>

          <Pressable onPress={handleLogout} style={styles.logoutButton} accessibilityRole="button">
            <Text variant="label" color={theme.danger}>{t.profile.logout}</Text>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </View>
  )
}

function SectionLabel({ label }: { label: string }) {
  const theme = useTheme()
  return (
    <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>
      {label.toUpperCase()}
    </Text>
  )
}

function ChoiceChip({ label, selected, onPress }: { label: string; selected: boolean; onPress: () => void }) {
  const theme = useTheme()
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.choiceChip,
        { borderColor: theme.border },
        selected && { backgroundColor: theme.primaryBg, borderColor: theme.primaryBg },
      ]}
    >
      <Text style={[styles.choiceChipText, { color: selected ? theme.onPrimary : theme.textSecondary }]}>{label}</Text>
    </Pressable>
  )
}

function NotificationRow({
  label,
  enabled,
  onToggle,
  time,
  onTimePress,
}: {
  label: string
  enabled: boolean
  onToggle: (value: boolean) => void
  time: string
  onTimePress: () => void
}) {
  const theme = useTheme()
  return (
    <View style={styles.notifRow}>
      <View>
        <Text variant="body" color={theme.text}>{label}</Text>
        <Pressable onPress={onTimePress} style={styles.timePressable}>
          <Text variant="caption" color={theme.textMuted}>{time}</Text>
        </Pressable>
      </View>
      <Switch value={enabled} onValueChange={onToggle} trackColor={{ true: theme.accent }} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  header: {
    paddingTop: spacing.sm,
    marginBottom: spacing.xl,
  },
  title: {
    fontSize: 38,
    lineHeight: 44,
  },
  subtitle: {
    marginTop: spacing.xs,
  },
  sectionTitle: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
    fontSize: fontSize.xs,
    letterSpacing: 1.3,
    fontWeight: '600',
  },
  sectionCard: {
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  row: {
    paddingVertical: spacing.md,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  nameEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  nameInput: {
    flex: 1,
  },
  chevron: {
    fontSize: 24,
    lineHeight: 26,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  choiceChip: {
    borderWidth: 1,
    borderRadius: radius.full,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  choiceChipText: {
    fontSize: fontSize.sm,
  },
  cardDivider: {
    height: 1,
  },
  notifRow: {
    minHeight: 72,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  timePressable: {
    marginTop: 4,
    paddingVertical: 3,
  },
  subscriptionCard: {
    paddingVertical: spacing.lg,
  },
  proBadge: {
    alignSelf: 'flex-start',
    borderRadius: radius.full,
    paddingVertical: 6,
    paddingHorizontal: 12,
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
  linkRow: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logoutButton: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
    marginTop: spacing.md,
  },
})
