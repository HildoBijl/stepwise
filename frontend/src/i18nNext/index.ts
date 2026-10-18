import { type Messages, setupI18n } from '@step-wise/i18n'
import { type Language, defaultLanguage, languages } from '@step-wise/settings'

import { messages as deMessages } from '../../locales/de/messages.po'
import { messages as enMessages } from '../../locales/en/messages.po'
import { messages as nlMessages } from '../../locales/nl/messages.po'

const messages: Record<Language, Messages> = {
	de: deMessages,
	en: enMessages,
	nl: nlMessages,
}

export const linguiI18n = setupI18n({ locale: defaultLanguage, messages })

export function activateLinguiLanguage(language: string): void {
	if (!languages.includes(language as Language)) throw new Error(`Unsupported language: ${language}`)
	linguiI18n.activate(language)
}
