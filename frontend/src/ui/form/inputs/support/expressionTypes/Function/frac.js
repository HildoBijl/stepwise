import defaultFunctions from './templates/with2In0AfterVertical'

import { zoomIn, getFuncs, getDataStartCursor, isCursorAtDataStart, isCursorAtDataEnd } from '../'

const fullExport = {
	...defaultFunctions,
	aliases: ['/'],
	toLatex,
	isUpFirst,
	charPartToValuePart,
	valuePartToCharPart,
	getInitialCursor,
	keyPressToData,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [numLatex, denLatex] = value.map(element => getFuncs(element).toLatex(element, options))

	return {
		latex: `\\frac{${numLatex.latex}}{${denLatex.latex}}`,
		chars: [denLatex.chars, numLatex.chars], // In Katex the denominator is rendered first.
	}
}

function charPartToValuePart(part) {
	return 1 - part
}

function valuePartToCharPart(part) {
	return 1 - part
}

function isUpFirst() {
	return true
}

function getInitialCursor(element) {
	const part = 1
	return { part, cursor: getDataStartCursor(element.value[part]) }
}

function keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement) {
	const { key } = keyInfo
	const activeElementData = zoomIn(data)

	// Handle backspace/delete: remove the fraction when necessary.
	if (key === 'Backspace' && isCursorAtDataStart(activeElementData) && !isCursorAtDataStart(data))
		return getFuncs(data).removeElement(data, true)
	if (key === 'Delete' && isCursorAtDataEnd(activeElementData) && !isCursorAtDataEnd(data))
		return getFuncs(data).removeElement(data, false)

	// Process the key as usual.
	return defaultFunctions.keyPressToData(keyInfo, data, charElements, topParentData, contentsElement, cursorElement)
}