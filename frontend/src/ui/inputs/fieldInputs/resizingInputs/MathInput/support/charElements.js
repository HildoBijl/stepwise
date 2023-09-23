import { flattenFully, forceIntoShape } from 'step-wise/util'

import { zeroWidthSpaceRegExp } from 'ui/components'

import { emptyElementChar } from '../settings'

// matchCharElements takes an expression and finds all the DOM elements related to all characters.
export function matchCharElements(equationElement, latexChars) {
	// Get all the chars that should be there. Compare this with all the chars that are rendered to check if this matches out. (If not, the whole plan fails.)
	const textLatexChars = flattenFully(latexChars).join('')
	const textContent = equationElement.textContent.replace(zeroWidthSpaceRegExp, '') // Get all text in HTML elements, but remove zero-width spaces.
	if (textContent !== textLatexChars)
		throw new Error(`Equation character error: expected the render of the equation to have characters "${textLatexChars}", but the actual Katex equation rendered "${textContent}". These two strings must be equal: all characters must appear in the order they are expected in.`)

	// Extract all DOM elements (leafs) with a character and match them appropriately.
	const allElements = [...equationElement.getElementsByTagName('*')]
	const charElementList = allElements.filter(isCharElement)
	const charElements = forceIntoShape(charElementList, latexChars)
	return charElements
}

export function isCharElement(element) {
	return element.childElementCount === 0 && element.textContent.replace(zeroWidthSpaceRegExp, '').length > 0
}

export function isCharElementEmpty(element) {
	return element.textContent === emptyElementChar
}
