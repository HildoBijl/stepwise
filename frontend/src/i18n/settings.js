export const languages = ['en', 'nl', 'de']
export const defaultLanguage = 'en'
export const loadPath = (language, path) => `/locales/${language}/${path}.json`
export const updatePath = `http://localhost:4000/locales/update`
