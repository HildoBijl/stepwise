import { isValidElement } from 'react'

import { isEmptyArray, isBasicObject, numberToAlphabetString, tagTreeToString, camelCaseToDashCase } from 'step-wise/util'

// elementToString takes a React element like <Par>x: {{x}}<br/>y: {{y}}</Par> and turns it into a string for a translation file, like "<par>x: {x}<br/>y: {y}</par>".
export function elementToString(element, counter = { count: 0 }) {
	// Define a handler to get a name for a tag/variable when needed.
	const getName = () => numberToAlphabetString(++counter.count)

	// On a non-existing element, return an empty string.
	if (element === undefined || element === null)
		return ''

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
		else if (element.type?.name)
			name = camelCaseToDashCase(element.type.name)
		else
			name = getName() // Unknown React component. Get a sequentially generated name.

		// Determine the contents of the tag.
		let contents = ''
		if (element?.type?.translation === false) { // Translation turned off.
			// No contents needed.
		} else if (element?.type?.getTranslationString) { // Custom function defined.
			contents = element.type.getTranslationString(element.props, (element) => elementToString(element, counter), element)
		} else { // Use default function.
			// Define a handler to process a prop.
			const processProp = key => {
				const prop = element.props[key]
				if (!prop) { // Undefined prop.
					return ''
				} else if (Array.isArray(prop) && key !== 'children') { // Array of items. Use separating tags.
					const keyDashCase = camelCaseToDashCase(key)
					const itemTag = (keyDashCase.slice(-1) === 's' ? keyDashCase.slice(0, -1) : `${keyDashCase}-item`) // Turn "someElements" into "some-element", or turn "internalStuff" to "internal-stuff-item".
					return prop
						.map(item => elementToString(item, counter))
						.map(str => str ? `<${itemTag}>${str}</${itemTag}>` : `<${itemTag}/>`)
						.join('')
				} else { // Single item or the children prop. Don't use separating tags.
					return elementToString(element.props[key], counter)
				}
			}

			// Depending on the translatableProps set-up, process these props.
			const translatableProps = element?.type?.translatableProps || 'children'
			if (typeof translatableProps === 'string') { // Single prop to translate.
				contents = processProp(translatableProps)
			} else if (Array.isArray(translatableProps)) { // Array of props. Walk through them and add each existing one with separating tags.
				contents = translatableProps.map(key => {
					const propContents = processProp(key)
					const tag = camelCaseToDashCase(key)
					return propContents ? `<${tag}>${propContents}</${tag}>` : ''
				}).join('')
			} else {
				throw new Error(`Invalid translatableProps parameter: expected a string or an array of strings, but received "${JSON.stringify(translatableProps)}".`)
			}
		}

		// Add a tag and return the result.
		return contents ? `<${name}>${contents}</${name}>` : `<${name}/>`
	}

	// Anything remaining is just a variable.
	return `{${getName()}}`
}

// applyNoTranslation takes a React element and, instead of doing a translation, it just does some basic processing to make sure it can be rendered. Think of turning single-parameter objects into their values.
export function applyNoTranslation(element, key) {
	// On an array, pass it on to each element.
	if (Array.isArray(element))
		return element.map((currElement, index) => applyNoTranslation(currElement, index))

	// On a React element, apply the no-translation function to translatable props. For this, check what kind of translation would normally be applied, to properly no-translate the respective props.
	if (isValidElement(element)) {
		// On no translation, keep the element as is.
		if (element.type.translation === false)
			return element

		// Set up a noTranslateProps function to be used, either a custom specified one, or a standard one.
		const noTranslateProps = element.type.translateProps || ((props, _, applyTranslation) => {
			// Determine which props need translation.
			const translatableProps = element.type.translatableProps || 'children'

			// On a single translatable prop, process it.
			if (typeof translatableProps === 'string') {
				const key = translatableProps
				const prop = props[key]
				if (!prop || isEmptyArray(prop))
					return props
				return {
					...props,
					[key]: applyNoTranslation(prop)
				}
			}

			// On multiple translatable props, process them together.
			if (Array.isArray(translatableProps)) {
				const propsClone = { ...props }
				translatableProps.forEach(key => {
					propsClone[key] = applyNoTranslation(props[key])
				})
				return propsClone
			}

			// This should never happen.
			throw new Error(`Invalid translate case: expected translatableProps to be a string or array, but received "${JSON.stringify(translatableProps)}".`)
		})

		// Apply the noTranslateProps function to the element and return it.
		return {
			...element,
			key: element.key || key, // Add a key when needed to prevent React warnings.
			props: noTranslateProps(element.props, [], element => applyNoTranslation(element)),
		}
	}

	// Turn a single-parameter object into said parameter. If it's a React element, make sure it has a key.
	if (isBasicObject(element) && Object.keys(element).length === 1) {
		let variable = Object.values(element)[0]
		if (isValidElement(variable))
			variable = { ...variable, key: variable.key || `i18n-key-${key}` }
		return variable
	}

	// Nothing special needs to be done.
	return element
}

// applyTranslation takes a React element and a tag-tree of a translation and tries to apply the tag-tree to the React element. On any inconsistency between the element and the translation, it throws an error. Optionally, a key can be provided to be added to the react element, which is sometimes needed to prevent react warnings/errors.
export function applyTranslation(element, tagTree, key) {
	// If the element is undefined, throw an error. It must always be present.
	if (element === undefined)
		throw new Error(`Invalid element: received undefined as an element, but every translated element must be defined. If you don't want to display a component, render null or an empty string or so.`)

	// If we have arrays, walk through them to match up corresponding elements. After all, it may always happen that one has a string somewhere in-between and the other has not. If that's the case, squeeze in an empty string to have a proper pairing. Then translate these element pairs one by one.
	if (Array.isArray(element)) {
		const elementListProcessed = [], tagTreeProcessed = []
		for (let elementIndex = 0, tagTreeIndex = 0; elementIndex < element.length || tagTreeIndex < tagTree.length;) {
			const currElementItem = element[elementIndex]
			const currTagTreeItem = tagTree[tagTreeIndex]

			// If the element and the tag tree item are both a string or both not a string, then it adds up. Move on to the next item.
			if ((typeof currElementItem === 'string' && currTagTreeItem?.type === 'text') || (typeof currElementItem !== 'string' && currTagTreeItem?.type !== 'text')) {
				elementListProcessed.push(currElementItem)
				elementIndex++
				tagTreeProcessed.push(currTagTreeItem)
				tagTreeIndex++
				continue
			}

			// So one of them is a string and one is not. If the element is a string, add an empty tagTree item.
			if (typeof currElementItem === 'string') {
				elementListProcessed.push(currElementItem)
				elementIndex++
				tagTreeProcessed.push({ type: 'text', value: '' })
				continue
			}

			// But if the tag tree item is a string, add an empty string to the element list.
			if (currTagTreeItem?.type === 'text') {
				tagTreeProcessed.push(currTagTreeItem)
				tagTreeIndex++
				elementListProcessed.push('')
				continue
			}

			// We should never get here.
			throw new Error(`Invalid translation: reached a point in the code that should be impossible to be reached. There is an error in the code.`)
		}

		// By now the two lists should have the same length.
		if (elementListProcessed.length !== tagTreeProcessed.length)
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text.\nOriginal text: ${elementToString(element)}\nTranslation: ${tagTreeToString(tagTree)}`)
		return elementListProcessed.map((currElement, index) => applyTranslation(currElement, tagTreeProcessed[index], index))
	}

	// If the element we received is a string, replace it by the translation.
	if (typeof element === 'string') {
		if (tagTree.type === 'text')
			return tagTree.value
		throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to receive some regular text, but received:\n${tagTree && tagTreeToString(tagTree)}`)
	}

	// If the element we received is a single-variable object, include it. If it's a React element, make sure it has a key.
	if (isBasicObject(element) && Object.keys(element).length === 1) {
		const name = Object.keys(element)[0]
		if (tagTree.type !== 'variable')
			throw new Error(`Invalid translation: there was a mismatch in the translation. Expected to include a variable with name "${name}" and hence encounter "{${name}}" in the translation. Instead, encountered:\n${tagTreeToString(tagTree)}`)
		if (tagTree.name !== name)
			throw new Error(`Invalid translation: there was a mismatch in variable names. Expected to include a variable "${name}" but encountered a variable "${tagTree.name}" in the translation.`)

		// If the variable is a React element, then it appears as a React element in a list. React requires it to have a key. If it doesn't have one, add one.
		let variable = element[name]
		if (isValidElement(variable))
			variable = { ...variable, key: variable.key || `i18n-key-${key}` }
		return variable
	}

	// If the element is a React element, process it accordingly.
	if (isValidElement(element)) {
		if (tagTree.type !== 'tag')
			throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a tag like <${tagTree.name}>...</${tagTree.name}> but instead encountered:\n${tagTreeToString(tagTree)}`)

		// If no translation is done, keep the element.
		if (element.type.translation === false)
			return element

		// Set up a translateProps function to be used, either a custom specified one, or a standard one.
		const translateProps = element.type.translateProps || ((props, tagTree, applyTranslation) => {
			// Determine which props need translation.
			const translatableProps = element.type.translatableProps || 'children'

			// On a single translatable prop, process it.
			if (typeof translatableProps === 'string') {
				const key = translatableProps
				const prop = props[key]
				if (!prop)
					return props
				if (Array.isArray(prop) && key !== 'children') // On an array prop, items have been created. Zoom in on them one by one.
					return { ...props, [key]: prop.map((propItem, index) => applyTranslation(propItem, tagTree[index].value)) }
				return { ...props, [key]: applyTranslation(prop, tagTree) }
			}

			// On multiple translatable props, process them one by one, using the tag name to match them properly.
			if (Array.isArray(translatableProps)) {
				const propsClone = { ...props }
				translatableProps.forEach(key => {
					const name = camelCaseToDashCase(key)
					const tagTreeArray = Array.isArray(tagTree) ? tagTree : [tagTree] // Ensure the tagTree is also an array.
					let tagTreeChild = tagTreeArray.find(item => item.name === name)?.value // Zoom in on the contents of the property tag.
					if (props[key] && !tagTreeChild)
						throw new Error(`Invalid translate case: expected to find a tag "${name}" in the translation file, since the component has a property "${key}", but this was not found. Probably the translation file is outdated.`)
					if (Array.isArray(props[key]) && key !== 'children') // When the contents are an array, extra tags have been added for separation. Remove these.
						tagTreeChild = tagTreeChild.map(item => item?.value && item.value[0])
					if (tagTreeChild !== undefined && props[key] !== undefined)
						propsClone[key] = applyTranslation(props[key], tagTreeChild)
					else if (tagTreeChild === undefined && props[key] !== undefined)
						console.warn(`Invalid translate case: a component has a property "${key}" but this property is not present in the translation file. The translation is likely missing parts.`)
					else if (tagTreeChild !== undefined && props[key] === undefined)
						console.warn(`Invalid translate case: a component has a property "${key}" that is undefined, but nevertheless an entry for it exists in the translation file. The translation likely has unused parts.`)
				})
				return propsClone
			}

			// This should never happen.
			throw new Error(`Invalid translate case: expected translatableProps to be a string or array, but received "${JSON.stringify(translatableProps)}".`)
		})

		// Apply the translateProps function to the element and return it.
		return {
			...element,
			key: element.key || key, // Add a key when needed to prevent React warnings.
			props: translateProps(element.props, tagTree.value, (element, tagTree) => applyTranslation(element, tagTree)),
		}
	}

	// We must have a variable. Leave it as is.
	if (tagTree.type !== 'variable')
		throw new Error(`Invalid translation: there was a mismatch between the received original text and the translation text. Expected to encounter a variable of the form {x}. Instead, encountered:\n${tagTreeToString(tagTree)}`)
	return element
}
