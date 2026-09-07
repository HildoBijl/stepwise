import { getHorizontalClickSide } from '@step-wise/browser-utils'

// getClickPosition checks, for all char children of the given element, where was clicked. This number (cursor index) is returned. 
export function getClickPosition(evt, element) {
	const charElements = [...element.getElementsByClassName('char')]
	const charPos = charElements.indexOf(evt.target)
	return charPos + getHorizontalClickSide(evt, charElements[charPos])
}
