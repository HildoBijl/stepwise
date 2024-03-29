import { zoomIn, getFIFuncs, getFIStartCursor, isCursorAtFIStart, isCursorAtFIEnd } from '..'

import { allFunctions as defaultFunctions } from './templates/with2In0AfterVertical'

export const allFunctions = {
	...defaultFunctions,
	aliases: ['/'],
	toLatex,
	isUpFirst,
	charPartToValuePart,
	valuePartToCharPart,
	getInitialCursor,
	keyPressToFI,
}

function toLatex(FI, options) {
	const { value } = FI
	const [numLatex, denLatex] = value.map(element => getFIFuncs(element).toLatex(element, options))

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
		return getFIFuncs(FI).removeElement(FI, true)
	if (key === 'Delete' && isCursorAtFIEnd(activeElementFI) && !isCursorAtFIEnd(FI))
		return getFIFuncs(FI).removeElement(FI, false)

	// Process the key as usual.
	return defaultFunctions.keyPressToFI(keyInfo, FI, settings, charElements, topParentFI, contentsElement, cursorElement)
}
