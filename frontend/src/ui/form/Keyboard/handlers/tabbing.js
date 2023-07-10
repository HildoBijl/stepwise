import { useState, useEffect } from 'react'

import { tabs } from '../keyboards'

// useKeyboardTabbing manages the display of tabs of the keyboard.
export function useKeyboardTabbing(settings) {
	let [tab, setTab] = useState()

	// Check which tabs to show.
	let activeTabs = []
	if (settings) {
		if (typeof settings !== 'object')
			throw new Error(`Invalid keyboard settings: the given settings parameter must be an object, but received something of type ${typeof settings}.`)
		activeTabs = tabs.filter(tab => settings[tab])
		if (activeTabs.length === 0)
			throw new Error(`Invalid keyboard settings: the given settings parameter must be an object with a key equal to one of the keyboard variants, but no keyboard variants were found.`)
	}

	// Ensure that at least some tab is active.
	if (!tab || !activeTabs.includes(tab))
		tab = activeTabs[0]

	// When a certain tab is requested by an input field, make sure to show it.
	const requestedTab = settings && settings.tab
	useEffect(() => {
		if (requestedTab) {
			if (!tabs.includes(requestedTab))
				throw new Error(`Invalid keyboard tab: tried to use a keyboard tab "${requestedTab}" but this tab does not exist.`)
			setTab(requestedTab)
		}
	}, [requestedTab])

	// All done. Return useful data and functions.
	return [tab, setTab, activeTabs]
}
