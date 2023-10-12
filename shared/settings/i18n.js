// These are all settings required by both the front-end and the back-end related to internationalization purposes.

const languages = ['en', 'nl', 'de']

module.exports = {
	languages,
	defaultLanguage: languages[0],
	loadPath: (language, path) => `/locales/${language}/${path}.json`,
	updatePath: `http://localhost:4000/locales/update`,
	updateLogPath: `/locales/updateLog.json`,
}
