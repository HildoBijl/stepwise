// What languages are there?
export const languages = ['en', 'nl', 'de'] as const;
export type Language = typeof languages[number];
export const defaultLanguage: Language = languages[0];

// Where are the languages stored?
export const i18nLoadPath = (language: Language, path: string): string => `/locales/${language}/${path}.json`;
export const i18nUpdatePath = `http://localhost:4000/locales/update`;
export const i18nUpdateLogPath = `/locales/updateLog.json`;
