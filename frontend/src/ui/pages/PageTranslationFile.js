import { TranslationFile } from 'i18n'

export function PageTranslationFile({ children, page }) {
	return <TranslationFile path={`pages/${page}`}>{children}</TranslationFile>
}
