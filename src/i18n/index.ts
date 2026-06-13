import { createI18n } from 'vue-i18n'
import en from './locales/en.json'
import zh from './locales/zh.json'

type MessageSchema = typeof en

const savedLocale = localStorage.getItem('axiqra-locale')
const defaultLocale = savedLocale || (navigator.language.startsWith('zh') ? 'zh' : 'en')

export const i18n = createI18n<[MessageSchema], 'en' | 'zh'>({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en',
  messages: {
    en,
    zh,
  },
})

export function setLocale(locale: 'en' | 'zh') {
  i18n.global.locale.value = locale
  localStorage.setItem('axiqra-locale', locale)
  document.documentElement.lang = locale
}
