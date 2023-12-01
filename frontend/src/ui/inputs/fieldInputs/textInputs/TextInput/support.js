import { getClickSide } from 'util'

// getClickPosition checks, for all char children of the given element, where was clicked. This number (cursor index) is returned. 
export function getClickPosition(evt, element) {
	const charPos = [...element.getElementsByClassName('char')].indexOf(evt.target)
	return charPos + getClickSide(evt)
}
