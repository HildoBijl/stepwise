import { useState, useEffect } from 'react'

import { setDeepParameter } from 'step-wise/util'

import { useStableCallback, isLocalhost } from 'util'

import { languages } from '../settings'
import { pathAsString, entryAsArray } from '../util'
import { loadLanguageFile, sendLanguageFileUpdates } from '../loadAndUpdate'

export function useI18nHandlers({ setLanguage: setLanguageState, setLanguageFiles, loaderRef }) {
	// setLanguage will do a brief check to see if the given language is OK, and then apply it.
	const setLanguage = useStableCallback((language) => {
		if (!languages.includes(language))
			throw new Error(`Invalid language setting: tried to set the language to "${language}" but this is not among the supported languages.`)
		setLanguageState(language)
	})

	// requestLanguageFile will start loading a translation file, assuming this hasn't already been requested.
	const requestLanguageFile = useStableCallback((language, path) => {
		// If the translation file is already being loaded, do nothing.
		path = pathAsString(path)
		if (loaderRef.current[language][path] !== undefined)
			return

		// Start loading the translation file. Store the promise until it resolves.
		loaderRef.current[language][path] = loadLanguageFile(language, path)
		loaderRef.current[language][path].then(result => {
			setLanguageFiles(languageFiles => ({
				...languageFiles,
				[language]: {
					...languageFiles[language],
					[path]: result,
				}
			}))
			loaderRef.current[language][path] = true // Loading completed successfully.
		}).catch(error => {
			loaderRef.current[language][path] = false // Loading failed.
			if (isLocalhost())
				console.error(error)
		})
	})

	// When there are updates to language files, we store the updates in a state, and once every now and then (on an effect) send them to the server.
	const [fileUpdates, setFileUpdates] = useState([])
	useEffect(() => {
		// If there are no updates queued, do nothing.
		if (fileUpdates.length === 0)
			return

		// There are updates queued. Send them.
		console.log(fileUpdates)
		sendLanguageFileUpdates(fileUpdates)

		// Process the updates locally too.
		setLanguageFiles(languageFiles => {
			fileUpdates.forEach(({ language, path, entry, translation }) => {
				languageFiles = setDeepParameter(languageFiles, [language, path, ...entryAsArray(entry)], translation)
			})
			return languageFiles
		})
	}, [fileUpdates, setFileUpdates, setLanguageFiles])

	// updateLanguageEntry queues up an updated entry, to be sent to the server when there is some time.
	const updateLanguageEntry = useStableCallback((language, path, entry, translation) => {
		// Save the update into the fileUpdates to queue it for updating on the server.
		setFileUpdates(fileUpdates => [...fileUpdates, { language, path, entry, translation }])
	})

	// Return all the defined handlers.
	return { setLanguage, requestLanguageFile, updateLanguageEntry }
}
