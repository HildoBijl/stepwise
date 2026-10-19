export { type I18n, type Messages, setupI18n } from '@lingui/core'

export * from './locale.ts'
export * from './message/index.ts'
export * from './catalog/index.ts'
export * from './react/index.ts'
export { type CatalogLoader, I18nProvider } from './I18nProvider.tsx'
export { TranslationCatalog } from './TranslationCatalog.tsx'
