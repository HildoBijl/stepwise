import { useState, useEffect } from 'react'

import { setDeepParameter } from 'step-wise/util'

import { isLocalhost, useStableCallback } from 'util/index' // Unit test import issue: should be 'util' but this fails unit tests.

import { languages, defaultLanguage } from '../settings'
import { pathAsString, entryAsArray, getStoredLanguage, setStoredLanguage, getLocationBasedLanguage } from '../util'
import { loadLanguageFile, sendLanguageFileUpdates } from '../loadAndUpdate'

export function useI18nHandlers({ setLanguage: setLanguageState, setLanguageFiles, loaderRef }) {
	// setLanguage will do a brief check to see if the given language is OK, and then apply it.
	const setLanguage = useStableCallback((language) => {
		if (!languages.includes(language))
			throw new Error(`Invalid language setting: tried to set the language to "${language}" but this is not among the supported languages.`)
		setLanguageState(language)
		setStoredLanguage(language)
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
			if (isLocalhost()) {
				if (language === defaultLanguage)
					console.error(`Language file loading failed: could not load the language file "${path}". Probably this is because it has not been created yet. Please add the file "frontend/public/locales/${language}/${path}.json" and give it an empty object "{}" as contents. (Yes, this can be automated, but automatic file creation has the potential for massive clutter, so that's why this is left as a manual action.)`)
				else
					console.error(`Missing translation file: the translation file "${path}" has not been translated to language setting "${language}" yet.`)
			}
		})
	})

	// When there are updates to language files, we store the updates in a state, and once every now and then (on an effect) send them to the server.
	const [fileUpdates, setFileUpdates] = useState({})
	useEffect(() => {
		setFileUpdates(fileUpdates => {
			// If there are no updates queued, do nothing.
			if (Object.keys(fileUpdates).length === 0)
				return fileUpdates

			// There are updates queued. Send them.
			sendLanguageFileUpdates(fileUpdates)

			// Process the updates locally too.
			setLanguageFiles(languageFiles => {
				Object.keys(fileUpdates).forEach(language => {
					Object.keys(fileUpdates[language]).forEach(path => {
						Object.keys(fileUpdates[language][path]).forEach(entry => {
							const text = fileUpdates[language][path][entry]
							languageFiles = setDeepParameter(languageFiles, [language, path, ...entryAsArray(entry)], text)
						})
					})
				})
				return languageFiles
			})

			// Erase the file updates storage because the updates have been processed.
			return {}
		})
	}, [fileUpdates, setFileUpdates, setLanguageFiles])

	// updateLanguageEntry queues up an updated entry, to be sent to the server when there is some time.
	const updateLanguageEntry = useStableCallback((language, path, entry, text) => {
		// Save the update into the fileUpdatesRef to queue it for updating on the server. Put the state update in a timeout, since otherwise it's called from a render function which leads to React errors. (Yes, not the cleanest solution, but it works.)
		setTimeout(() => setFileUpdates(fileUpdates => setDeepParameter(fileUpdates, [language, path, entry], text)))
	})

	// Return all the defined handlers.
	return { setLanguage, requestLanguageFile, updateLanguageEntry }
}

// useInitialLanguage aims to set up the initial value of the language, based on various sources of information.
export function useInitialLanguage(setLanguage) {
	// Only perform the check upon mounting.
	useEffect(() => {
		// If the local storage has a valid language, apply it.
		const storedLanguage = getStoredLanguage()
		if (storedLanguage && languages.includes(storedLanguage)) {
			setLanguage(storedLanguage)
			return
		}

		// Otherwise, if some location data of the user can be obtained, use that to set the language.
		getLocationBasedLanguage().then(locationBasedLanguage => {
			if (locationBasedLanguage) {
				setLanguage(language => language || locationBasedLanguage)
				if (!storedLanguage)
					setStoredLanguage(locationBasedLanguage)
			}
		})
		// Note: the above method uses a direct requested from the frontend, exposing the token. Through domain whitelisting this is mostly safe. If the token gets used too much, it might be worthwhile to reroute the request through our own server instead, keeping the token private.
	}, [setLanguage])
}
