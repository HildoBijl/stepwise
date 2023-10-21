import { useCallback } from 'react'

import { Translation } from './Translation'

// useTranslation will apply a translation to the given element. The element can also simply be a string.
export function useTranslation(element, entry, path, extendEntry) {
	const translate = useTranslator()
	return translate(element, entry, path, extendEntry)
}

// useTranslator gives a translator function (element, entry, path) => translatedElement that can apply a translation to said element. The element can also simply be a string, but a React object will always be returned. Optionally, a path can be provided, which will then by used by default unless a path is given to the translator. Also optionally, an addition to the entry can be given, which is then always put prior to any given entry.
export function useTranslator(translatorPath) {
	return useCallback((element, entry, path, extendEntry) => <Translation entry={entry} path={path || translatorPath} extendEntry={extendEntry}>{element}</Translation>, [translatorPath])
}

// addEntryPreamble takes a translator function, and then adds a preamble to the entry. So if a preamble "section1" is used or so, then everything is placed under that entry point in the language file. The preamble is ignored if a path is given.
export function addEntryPreamble(translator, entryPreamble, extendEntryExternal) {
	return (element, entry, path, extendEntry) => {
		entry = (entry && !path ? `${entryPreamble}.${entry}` : entry)
		return translator(element, entry, path, extendEntry !== undefined ? extendEntry : extendEntryExternal)
	}
}