// Where are the languages stored?
export const i18nLoadPath = (language: string, path: string): string => `/locales/${language}/${path}.json`
export const i18nUpdatePath = `http://localhost:4000/locales/update`
export const i18nUpdateLogPath = `/locales/updateLog.json`
