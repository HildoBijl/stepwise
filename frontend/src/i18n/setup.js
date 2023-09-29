import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

i18n
	.use(Backend) // Learn more: https://github.com/i18next/i18next-xhr-backend
	.use(LanguageDetector) // Learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(initReactI18next) // Connect with React.
	.init({ // Learn more: https://www.i18next.com/overview/configuration-options
		debug: true,

		lng: 'en',
		fallbackLng: 'en',
		whitelist: ['en', 'nl', 'de'],

		interpolation: {
			escapeValue: false, // not needed for react as it escapes by default
		},

		saveMissing: true,
		saveMissingTo: 'all',

		backend: {
			loadPath: '/locales/{{lng}}/{{ns}}.json',
			addPath: '/locales/add/{{lng}}/{{ns}}',
		},
	})

i18n.on('missingKey', (lngs, namespace, key, res) => { console.log(lngs, namespace, key, res) })

export default i18n