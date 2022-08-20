import defaultFunctions from './templates/with2In0AfterVertical'

import { zoomIn, getFuncs, getFIStartCursor, isCursorAtFIStart, isCursorAtFIEnd } from '../'

const fullExport = {
	...defaultFunctions,
	aliases: ['/'],
	toLatex,
	isUpFirst,
	charPartToValuePart,
	valuePartToCharPart,
	getInitialCursor,
	keyPressToFI,
}
export default fullExport

function toLatex(FI, options) {
	const { value } = FI
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
	return { part, cursor: getFIStartCursor(element.value[part]) }
}

function keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement) {
	const { key } = keyInfo
	const activeElementFI = zoomIn(FI)

	// Handle backspace/delete: remove the fraction when necessary.
	if (key === 'Backspace' && isCursorAtFIStart(activeElementFI) && !isCursorAtFIStart(FI))
		return getFuncs(FI).removeElement(FI, true)
	if (key === 'Delete' && isCursorAtFIEnd(activeElementFI) && !isCursorAtFIEnd(FI))
		return getFuncs(FI).removeElement(FI, false)

	// Process the key as usual.
	return defaultFunctions.keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)
}