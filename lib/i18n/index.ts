import AsyncStorage from '@react-native-async-storage/async-storage'
import { it } from './it'
import { fr } from './fr'
import type { Translations } from './types'
import type { ContentLang } from '@/types/database'

export type { Translations }

const LANG_STORAGE_KEY = 'sobre_lang'

export const translations: Record<ContentLang, Translations> = { it, fr }

export function getT(lang: ContentLang): Translations {
  return translations[lang] ?? it
}

export async function getLangFromStorage(): Promise<ContentLang | null> {
  const stored = await AsyncStorage.getItem(LANG_STORAGE_KEY)
  return stored === 'it' || stored === 'fr' ? stored : null
}

export async function setLangInStorage(lang: ContentLang): Promise<void> {
  await AsyncStorage.setItem(LANG_STORAGE_KEY, lang)
}
