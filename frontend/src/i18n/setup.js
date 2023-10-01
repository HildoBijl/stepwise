import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import Backend from 'i18next-xhr-backend'
import LanguageDetector from 'i18next-browser-languagedetector'

class TestBackend {
	constructor(services, options, allOptions) {
		// console.log(services)
		// console.log(options)
		// console.log(allOptions)
		this.type = 'backend'
	}
	init(services, options = {}, allOptions = {}) {
		// console.log(services, options, allOptions)
	}

	readMulti(languages, namespaces, callback) {
		// console.log(languages, namespaces, callback)
	}

	read(language, namespace, callback) {
		// console.log(language, namespace, callback)
	}
}
TestBackend.type = 'backend'

i18n
	.use(Backend) // Learn more: https://github.com/i18next/i18next-xhr-backend
	.use(LanguageDetector) // Learn more: https://github.com/i18next/i18next-browser-languageDetector
	.use(initReactI18next) // Connect with React.
	.use(TestBackend)
	.init({ // Learn more: https://www.i18next.com/overview/configuration-options
		debug: false,

		lng: 'en',
		fallbackLng: 'en',
		whitelist: ['en', 'nl', 'de'],

		interpolation: {
			escapeValue: false, // Not needed for React as it escapes by default.
			// prefix: '{',
			// suffix: '}',
		},

		saveMissing: true,
		saveMissingTo: 'fallback',
		updateMissing: true,

		backend: {
			loadPath: '/locales/{{lng}}/{{ns}}.json',
			addPath: 'http://localhost:4000/locales/add/{{lng}}/{{ns}}',
			// addPath: '/locales/add/{{lng}}/{{ns}}',
			// parsePayload: (namespace, key, fallbackValue) => console.log(namespace, key, fallbackValue) || key,
			// parsePayload: (namespace, key, fallbackValue) => console.log(namespace, key, fallbackValue) || { x: 1, y: 'test' },
		},
	})

i18n.on('missingKey', (lngs, namespace, key, res) => { console.log(lngs, namespace, key, res) })

export default i18n
