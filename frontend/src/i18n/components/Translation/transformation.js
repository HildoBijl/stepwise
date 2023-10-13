import { isValidElement } from 'react'

import { isBasicObject, numberToAlphabetString } from 'step-wise/util'

// elementToString takes a React element like <strong>x: {x}<br/>y: {y}</strong> and turns it into a string for a translation file, like "<a>x: {b}<c/>y: {d}</a>".
export function elementToString(element, counter = { count: 0 }) {
	// Define a handler to get a name for a tag/variable when needed.
	const getName = () => numberToAlphabetString(++counter.count)

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

	// On a React element, add a tag. Include any potential children.
	if (isValidElement(element)) {
		const name = (element.type.tag || getName()) // If present, use the corresponding element tag.
		if (element.props.children === undefined)
			return `<${name}/>`
		return `<${name}>${elementToString(element.props.children, counter)}</${name}>`
	}

	// Anything remaining is just a variable.
	return `{${getName()}}`
}

// applyNoTranslation takes a React element and, instead of doing a translation, it just does some basic processing to make sure it can be rendered. Think of turning single-parameter objects into their values.
export function applyNoTranslation(element) {
	// On an array, pass it on to each element.
	if (Array.isArray(element))
		return element.map(currElement => applyNoTranslation(currElement))

	// On a React element, make a copy with processed children.
	if (isValidElement(element) && element.props.children !== undefined) {
		return {
			...element,
			props: {
				...element.props,
				children: applyNoTranslation(element.props.children),
			}
		}
	}

	// Turn a single-parameter object into said parameter.
	if (isBasicObject(element) && Object.keys(element).length === 1)
		return Object.values(element)[0]

	// Nothing special needs to be done.
	return element
}

// applyTranslation takes a React element and a string translation and tries to apply the translation to the React element. On any inconsistency between the element and the translation, it throws an error.
export function applyTranslation(element, translation) {
	// If the element we received is a string, replace it by the translation.
	if (typeof element === 'string')
		return translation

	// Split up the translation into <tags></tags>, <singleTags/>, {variables} and remaining strings.
	const translationSplit = getTranslationSplit(translation)

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

	// If the element is a React element, process it accordingly.
	if (isValidElement(element)) {
		// On a no-child element, leave it as is.
		if (element.props.children === undefined) {
			if (!translation.match(/^<[a-zA-Z0-9-]+\/>$/))
				throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a tag of the form "<tag/>". Instead, encountered: ${translation}`)
			return element
		}

		// On an element with children, take the children and process them with respect to the contents of the tag.
		const translationMatch = translation.match(/^<([a-zA-Z0-9-]+)>(.*)<\/\1>$/)
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
	if (!translation.match(/^\{([a-z-]+)\}$/))
		throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a variable of the form {x}. Instead, encountered: ${translation}`)
	return element
}

// getTranslationSplit takes a translation string, like "My name is <b>{name}</b> and I'm <c><d>{e}</d> years</c> old." It then splits this according to tags and variables. So it returns ["My name is ", "<b>{name}</b>", " and I'm ", "<c><d>{e}</d> years</c>" old."]. The challenge is to not have extra elements included from the RegEx control groups.
const allElementsRegEx = /(\{[a-zA-Z0-9-]+\}|<([a-zA-Z0-9-]+)>.*<\/\2>|<[a-zA-Z0-9-]+\/>)/
const closedTagRegEx = /^<([a-zA-Z0-9-]+)>.*<\/\1>$/
function getTranslationSplit(translation) {
	// Start with a split according to all elements.
	let translationSplit = translation.split(allElementsRegEx)

	// Filter out empty spaces and undefineds.
	translationSplit = translationSplit.filter(str => str !== '' && str !== undefined)

	// Take out the extra control group elements originating from the open/close tags.
	translationSplit = translationSplit.filter((str, index) => {
		if (index === 0)
			return true
		const match = translationSplit[index - 1].match(closedTagRegEx)
		if (match && match[1] === str)
			return false // We have found the extra control group. Toss it out.
		return true
	})
	return translationSplit
}