import { isValidElement } from 'react'

import { isBasicObject, numberToAlphabetString } from 'step-wise/util'

// applyBasicProcessing takes a React element and does some small transformations to make sure it can be rendered. Think of turning single-parameter objects into their values.
export function applyBasicProcessing(element) {
	// On an array, pass it on to each element.
	if (Array.isArray(element))
		return element.map(currElement => applyBasicProcessing(currElement))

	// On a React element, make a copy with processed children.
	if (isValidElement(element) && element.props.children) {
		return {
			...element,
			props: {
				...element.props,
				children: applyBasicProcessing(element.props.children),
			}
		}
	}

	// Turn a single-parameter object into said parameter.
	if (isBasicObject(element) && Object.keys(element).length === 1)
		return Object.values(element)[0]

	// Nothing special needs to be done.
	return element
}

// elementToString takes a React element like <strong>x: {x}<br/>y: {y}</strong> and turns it into a string for a translation file, like "<a>x: {b}<c/>y: {d}</a>".
export function elementToString(element, counter = { count: 0 }) {
	// On an array, process the elements individually and paste them together. Do check if there are no two strings together.
	if (Array.isArray(element)) {
		const faultyIndex = element.findIndex((currElement, index) => typeof currElement === 'string' && index > 0 && typeof element[index - 1] === 'string')
		if (faultyIndex !== -1)
			throw new Error(`Invalid variable inclusion: you have directly incorporated a string variable into text, like in {variableName}. This prevents the Translation system to distinguish the variable from static text. Include the variable as a single-parameter object like {{variableName}}, so the Translation system can distinguish the variable from static text.\nExtra note: the dynamic text included was probably "${element[faultyIndex]}", or maybe "${element[faultyIndex - 1]}". (The script cannot fully detect which is the dynamic variable.)`)
		return element.map(currElement => elementToString(currElement, counter)).join('')
	}

	// On a string, leave it as is.
	if (typeof element === 'string')
		return element

	// On a single-parameter object, include it as variable.
	if (isBasicObject(element) && Object.keys(element).length === 1)
		return `{${Object.keys(element)[0]}}`

	// We have some name. Increment the counter.
	counter.count++
	const name = numberToAlphabetString(counter.count)

	// On a React element, add a tag. Include any potential children.
	if (isValidElement(element)) {
		if (!element.props.children)
			return `<${name}/>`
		return `<${name}>${elementToString(element.props.children, counter)}</${name}>`
	}

	// Anything remaining is just a variable.
	return `{${name}}`
}

// applyTranslation takes a React element and a string translation and tries to apply the translation to the React element. On any inconsistency between the element and the translation, it throws an error.
const translationRegEx = /(\{[a-zA-Z0-9]+\}|<[a-zA-Z0-9]+>.*<\/[a-zA-Z0-9]+>|<[a-zA-Z0-9]+\/>)/
export function applyTranslation(element, translation) {
	// If the element we received is a string, replace it by the translation.
	if (typeof element === 'string')
		return translation

	// Split up the translation into <tags></tags>, <singleTags/>, {variables} and remaining strings.
	const translationSplit = translation.split(translationRegEx).filter(str => str !== '')

	// If the element we received is an array, the translation should match. Process it element by element.
	if (Array.isArray(element)) {
		if (element.length !== translationSplit.length)
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text.\nOriginal text: ${elementToString(element)}\nTranslation: ${translation}`)
		return element.map((currElement, index) => applyTranslation(currElement, translationSplit[index]))
	}

	// If the element we received is a single-variable object, include it as variable.
	if (isBasicObject(element) && Object.keys(element).length === 1) {
		const name = Object.keys(element)[0]
		if (translation !== `{${name}}`)
			throw new Error(`Invalid translation: there was a mismatch in variable names. Expected to include a variable with name "${name}" and hence encounter "{${name}}" in the translation. Instead, encountered: ${translation}`)
		return element[name]
	}

	// Is it a valid React element?
	if (isValidElement(element)) {
		// On a no-child element, leave it as is.
		if (!element.props.children) {
			if (!translation.match(/^<[a-zA-Z0-9]+\/>$/))
				throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a tag of the form "<tag/>". Instead, encountered: ${translation}`)
			return element
		}

		// On an element with children, take the children and process them with respect to the contents of the tag.
		const translationMatch = translation.match(/^<([a-zA-Z0-9]+)>(.*)<\/\1>$/)
		if (!translationMatch)
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a tag of the form "<tag>...</tag>". Instead, encountered: ${translation}`)
		return {
			...element,
			props: {
				...element.props,
				children: applyTranslation(element.props.children, translationMatch[2]),
			}
		}
	}

	// We must have a variable. Leave it as is.
	if (!translation.match(/^\{([a-z]+)\}$/))
		throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a variable of the form {x}. Instead, encountered: ${translation}`)
	return element
}
