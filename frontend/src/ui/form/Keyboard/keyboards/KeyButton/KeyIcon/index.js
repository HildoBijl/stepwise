import React from 'react'
import { Remove as Minus, ArrowBack as ArrowLeft, ArrowForward as ArrowRight, ArrowUpward as ArrowUp, ArrowDownward as ArrowDown, Backspace } from '@material-ui/icons'

import Character from './Character'
import TenPower from './TenPower'

// KeyIcon displays the icon for a given key.
export default function KeyIcon({ keyID }) {
	if (typeof keyID !== 'string')
		throw new Error(`Invalid keyboard key: received a key for a keyboard to display, but the key was not a string. Instead, received a parameter of type ${typeof keyID}.`)

	// ToDo: load the 
	switch (keyID) {
		case '-':
			return <Minus />
		case 'ArrowLeft':
			return <ArrowLeft />
		case 'ArrowRight':
			return <ArrowRight />
		case 'ArrowUp':
			return <ArrowUp />
		case 'ArrowDown':
			return <ArrowDown />
		case 'Backspace':
			return <Backspace style={{ transform: 'scale(0.75)' }} /> // The backspace icon is for some reason overly large.
		case 'TenPower':
			return <TenPower />
		case '.':
			return <Character char="," /> // This should be made language/setting-dependent later.
		default:
		// On other keys, try the things below.
	}

	// Check if it's a character key.
	if (keyID.length === 1)
		return <Character char={keyID} />

	throw new Error(`Unknown keyboard icon: could not find an icon for the key "${keyID}".`)
}