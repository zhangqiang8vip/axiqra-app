import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

type SupportedLocale = 'en' | 'zh'

const savedLocale = localStorage.getItem('axiqra-locale')
const defaultLocale: SupportedLocale =
  savedLocale === 'en' || savedLocale === 'zh'
    ? savedLocale
    : navigator.language.startsWith('zh') ? 'zh' : 'en'

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
})

export function setLocale(locale: SupportedLocale) {
  ;(i18n.global.locale as unknown as { value: SupportedLocale }).value = locale
  localStorage.setItem('axiqra-locale', locale)
  document.documentElement.lang = locale
}
