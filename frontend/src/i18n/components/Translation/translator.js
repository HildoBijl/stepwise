import { useCallback } from 'react'

import { Translation } from './Translation'

// useTranslation will apply a translation to the given element. The element can also simply be a string.
export function useTranslation(element, entry, path, extendEntry) {
	const translate = useTranslator()
	return translate(element, entry, path, extendEntry)
}

// useTranslator gives a translator function (element, entry, path) => translatedElement that can apply a translation to said element. The element can also simply be a string, but a React object will always be returned. Optionally, a path can be provided, which will then by used by default unless a path is given to the translator. Also optionally, an addition to the entry can be given, which is then always put prior to any given entry.
export function useTranslator(translatorPath, translatorEntry, translatorExtendEntry = true) {
	return useCallback((element, entry, path, extendEntry = true) => {
		if (extendEntry && translatorEntry && !path)
			entry = `${translatorEntry}.${entry}`
		return <Translation entry={entry} path={path || translatorPath} extendEntry={translatorExtendEntry && extendEntry}>{element}</Translation>
	}, [translatorPath, translatorEntry, translatorExtendEntry])
}

// addSection takes a translator function, and then adds a preamble to the entry. So if a section "section1" is used or so, then everything is placed under that entry point in the language file. The section is ignored if a path is given.
export function addSection(translator, section, extendEntryExternal) {
	return (element, entry, path, extendEntry) => {
		entry = (entry && !path && (extendEntry || extendEntry === undefined) ? `${section}.${entry}` : entry)
		return translator(element, entry, path, extendEntry !== undefined ? extendEntry : extendEntryExternal)
	}
}
