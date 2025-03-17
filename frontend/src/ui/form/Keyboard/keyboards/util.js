import { useState } from 'react'

// useButtonClickFunction manages shift key presses in the keyboard. When the shift is pressed, this is remembered. It is then applied to the next key press on the keyboard.
export function useButtonClickFunction(keyFunction) {
	// Set up states for various keys.
	const [shift, setShift] = useState(false)

	// Set up the button click function for each possible keyID.
	const buttonClickFunction = (keyID, evt) => {
		switch (keyID) {
			case 'Shift':
				setShift(shift => !shift)
				return
			default: // Regular key.
				setShift(false)
				return keyFunction({ key: simplifyKey(keyID), shift }, evt)
		}
	}

	// Return the button click function and the parameters.
	return [buttonClickFunction, { shift }]
}

// simplifyKey takes a key like "Plus" and turns it into a symbol "+". This allows input fields to only check for "+" and not additionally check for "Plus". (And similarly for many other symbols.)
export function simplifyKey(key) {
	switch (key) {
		case 'DecimalSeparator':
		case ',':
			return '.'
		case 'Plus':
			return '+'
		case 'Minus':
			return '-'
		case 'PlusMinus':
			return '±'
		case 'Times':
			return '*'
		case 'Divide':
			return '/'
		case 'Power':
			return '^'
		case 'Underscore':
			return '_'
		case 'BracketOpen':
			return '('
		case 'BracketClose':
			return ')'
		case 'Equals':
			return '='
		case 'eMath':
			return 'e'
		case 'Meter':
			return 'm'
		case 'Spacebar':
			return ' '
		default:
			return key // On normal keys, just keep the key itself.
	}
}
