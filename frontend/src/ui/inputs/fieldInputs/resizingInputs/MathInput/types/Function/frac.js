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
	const numerator = { type: 'Expression', value: FI.numerator }
	const denominator = { type: 'Expression', value: FI.denominator }
	const numLatex = getFIFuncs(numerator).toLatex(numerator, options)
	const denLatex = getFIFuncs(denominator).toLatex(denominator, options)

	return {
		latex: `\\frac{${numLatex.latex}}{${denLatex.latex}}`,
		chars: [denLatex.chars, numLatex.chars], // In Katex the denominator is rendered first.
	}
}

function charPartToValuePart(part) {
	return part === 0 ? 'denominator' : 'numerator'
}

function valuePartToCharPart(part) {
	return part === 'numerator' ? 1 : 0
}

function isUpFirst() {
	return true
}

function getInitialCursor(element) {
	return { part: 'denominator', cursor: getFIStartCursor({ type: 'Expression', value: element.denominator }) }
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
