import { isValidElement } from 'react'

import { isBasicObject, numberToAlphabetString, getTagTree, tagTreeToString } from 'step-wise/util'

// elementToString takes a React element like <strong>x: {x}<br/>y: {y}</strong> and turns it into a string for a translation file, like "<a>x: {b}<c/>y: {d}</a>".
export function elementToString(element, counter = { count: 0 }) {
	// Define a handler to get a name for a tag/variable when needed.
	const getName = () => numberToAlphabetString(++counter.count)

	// On an array, process the elements individually and paste them together. Do check if there are no two strings together.
	if (Array.isArray(element)) {
		const faultyIndex = element.findIndex((currElement, index) => typeof currElement === 'string' && index > 0 && typeof element[index - 1] === 'string')
		if (faultyIndex !== -1)
			throw new Error(`Invalid variable inclusion: you have directly incorporated a string variable into text, like in {variableName}. This prevents the Translation system to distinguish the variable from static text. Include the variable as a single-parameter object like {{variableName}} or otherwise as {{variableName: someCalculation()}}, so the Translation system can distinguish the variable from static text.\nExtra note: the dynamic text included was probably "${element[faultyIndex]}", or maybe "${element[faultyIndex - 1]}". (The script cannot fully detect which is the dynamic variable.)`)
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
		// Determine the tag name to show.
		let name
		if (typeof element.type === 'string')
			name = element.type // A regular HTML component: get the tag.
		else if (typeof element.type === 'function' && element.type.tag)
			name = element.type.tag // A React component with a tag parameter.
		else
			name = getName() // Unknown React component. Get a sequentially generated name.

		// Set up a function to determine the translation string. Then run it. This function effectively turns an element's props into tags.
		const defaultGetTranslationString = (props) => {
			const contents = props.children
			return contents ? elementToString(contents, counter) : ''
		}
		const getTranslationString = element?.type?.getTranslationString || defaultGetTranslationString
		const contentsString = getTranslationString(element.props, (element) => elementToString(element, counter), element)

		// Add a tag and return the result.
		return contentsString ? `<${name}>${contentsString}</${name}>` : `<${name}/>`
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
		// ToDo: set up similar to applyTranslation.
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
export function applyTranslation(element, translation, tagTree) {
	// If not already done, split up the translation into <tags></tags>, <singleTags/>, {variables} and remaining strings.
	if (!tagTree)
		tagTree = getTagTree(translation)

	// If the element we received is an array, the translation should match. Process it element by element.
	if (Array.isArray(element)) {
		if (element.length !== tagTree.length)
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text.\nOriginal text: ${elementToString(element)}\nTranslation: ${tagTreeToString(tagTree)}`)
		return element.map((currElement, index) => applyTranslation(currElement, undefined, tagTree[index]))
	}

	// If the tag tree is a single-element array, then select that element. React does this automatically on its elements.
	if (Array.isArray(tagTree) && tagTree.length === 1)
		tagTree = tagTree[0]

	// If the element we received is a string, replace it by the translation.
	if (typeof element === 'string') {
		if (tagTree.type !== 'text')
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to receive some regular text, but received:\n${tagTreeToString(tagTree)}`)
		return tagTree.value
	}

	// If the element we received is a single-variable object, include it as variable.
	if (isBasicObject(element) && Object.keys(element).length === 1) {
		const name = Object.keys(element)[0]
		if (tagTree.type !== 'variable')
			throw new Error(`Invalid translation: there was a mismatch in the translation. Expected to include a variable with name "${name}" and hence encounter "{${name}}" in the translation. Instead, encountered:\n${tagTreeToString(tagTree)}`)
		if (tagTree.name !== name)
			throw new Error(`Invalid translation: there was a mismatch in variable names. Expected to include a variable "${name}" but encountered a variable "${tagTree.name}" in the translation.`)
		return element[name]
	}

	// If the element is a React element, process it accordingly.
	if (isValidElement(element)) {
		if (tagTree.type !== 'tag')
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a tag like <${tagTree.name}>...</${tagTree.name}> but instead encountered:\n${tagTreeToString(tagTree)}`)

		// Set up a function to apply the translation. Then run the function. This function effectively preprocesses the props given to an element.
		const defaultTranslateProps = (props, tagTree, applyTranslationTree) => {
			// On a no-child element, leave it as is.
			const contents = element.props.children
			if (!contents)
				return element

			// On an element with children, take the children and process them with respect to the contents of the tag.
			return {
				...props,
				children: applyTranslationTree(element.props.children, tagTree),
			}
		}
		const translateProps = element?.type?.translateProps || defaultTranslateProps
		return {
			...element,
			props: translateProps(element.props, tagTree.value, (element, tagTree) => applyTranslation(element, undefined, tagTree)),
		}
	}

	// We must have a variable. Leave it as is.
	if (tagTree.type !== 'variable')
		throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a variable of the form {x}. Instead, encountered:\n${tagTreeToString(tagTree)}`)
	return element
}
