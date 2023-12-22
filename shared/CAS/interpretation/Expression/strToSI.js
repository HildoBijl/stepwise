// This file has all functionalities to turn Expressions, Equations and such from String format to Input Object format. (You can turn String to SI, SI to FO, and FO to String.)

const { getNextSymbol, removeWhitespace, isLetter, processOptions } = require('../../../util')

const { defaultFieldSettings } = require('../../options')

const { getStartCursor, getEndCursor, getSubExpression, moveLeft, moveRight, mergeAdjacentExpressionParts, addExpressionType } = require('../support')
const { squareBrackets, findEndOfTerm, getMatchingBrackets, findCharacterAtZeroBracketCount } = require('../characterLocalization')
const { advancedFunctionComponents, accents, isFunctionAllowed } = require('../functions')

function strToSI(str, settings = {}) {
	settings = processOptions(settings, defaultFieldSettings)

	// Check for non-string entries.
	if (typeof str !== 'string')
		str = str.toString()

	// Whitespace is always ignored. Remove it directly to prevent confusion.
	str = removeWhitespace(str)

	// Start with a single expression part. Process it as we go.
	return processExpression([{
		type: 'ExpressionPart',
		value: str,
	}], settings)
}
module.exports = strToSI

function processExpression(value, settings) {
	// Check for advanced functions like log(100) or log[10](100) and for accents like dot(x).
	value = processFunctionsAndAccents(value, settings)

	// Check for subscripts and powers.
	value = processSubSups(value, settings)

	// Check for fractions.
	value = processFractions(value, settings)

	// All done!
	return value
}

// processFunctionsAndAccents takes an array of ExpressionParts. If there is a string like "log(100)" or "log[10](100)" it is turned into an advanced function { type: 'Function', name: 'log', alias: 'log(', value: [{...}, {...}] }. Similarly, strings like "dot(x)" are turned into accents like { type: 'Accent', name: 'dot', alias: 'dot(', value: "x" }.
function processFunctionsAndAccents(value, settings) {
	const bracketSets = getMatchingBrackets(value)
	const result = []

	// Walk through the matching brackets and add each part accordingly.
	let lastPosition = getStartCursor(value)
	bracketSets.forEach(bracketSet => {
		const { opening, closing } = bracketSet

		// If the opening bracket has already been processed, ignore it.
		if (value[opening.part].type !== 'ExpressionPart')
			return

		// If the opening bracket is a square bracket, ignore it.
		if (value[opening.part].value[opening.cursor] === '[')
			return

		// Retrieve any potential optional arguments between square brackets.
		let end = { ...opening }
		let optionalArguments = []
		while (value[end.part].type === 'ExpressionPart' && end.cursor > 0 && value[end.part].value[end.cursor - 1] === ']') {
			end = moveLeft(end)
			const start = findCharacterAtZeroBracketCount(value, end, '[', false, false, squareBrackets)
			optionalArguments.push(getSubExpression(value, start, end))
			end = moveLeft(start)
		}
		optionalArguments = optionalArguments.reverse().map(argument => addExpressionType(processExpression(argument, settings)))

		// Retrieve the function name by looking for the first non-letter character.
		const str = value[end.part].value
		let movingCursor = end.cursor
		while (movingCursor > 0 && isLetter(str[movingCursor - 1]))
			movingCursor--
		const functionName = str.substring(movingCursor, end.cursor)
		end.cursor = movingCursor

		// If the function name corresponds to an acceptable advanced function, apply it.
		if (advancedFunctionComponents[functionName] && isFunctionAllowed(functionName, settings)) {
			// Check the number of arguments and fill it up with defaults if there are too few.
			const defaultOptionalArguments = advancedFunctionComponents[functionName].defaultArguments.slice(1)
			const numOptionalArguments = defaultOptionalArguments.length
			if (optionalArguments.length > numOptionalArguments)
				throw new Error(`Invalid optional parameters: tried to interpret a "${functionName}" function but received ${optionalArguments.length} optional parameter${optionalArguments.length === 1 ? '' : 's'}. The maximum allowed number for this function is ${numOptionalArguments}.`)
			optionalArguments = defaultOptionalArguments.map((value, index) => optionalArguments[index] || value)

			// Add the part prior to the function.
			result.push(...getSubExpression(value, lastPosition, end))

			// Get the part between brackets.
			const partBetweenBrackets = getSubExpression(value, moveRight(opening), closing)

			// Set up the function. If it needs to pull a parameter inside, like "root[3](dot(x))", then do so first.
			const func = advancedFunctionComponents[functionName]
			if (!func.hasParameterAfter)
				optionalArguments = [...optionalArguments, addExpressionType(processExpression(partBetweenBrackets, settings))]
			result.push({
				type: 'Function',
				name: functionName,
				alias: `${functionName}(`,
				value: optionalArguments,
			})

			// If the part between brackets has not been pulled inside, like for "log[10](dot(x))", process it separately.
			if (func.hasParameterAfter)
				result.push(...processFunctionsAndAccents(partBetweenBrackets, settings))

			// Shift the cursor accordingly. When the parameter between brackets has been pulled inside, also skip past the closing bracket.
			return lastPosition = func.hasParameterAfter ? closing : moveRight(closing)
		}

		// If the function name corresponds to an accent, apply it.
		if (settings.accent && accents.includes(functionName)) {
			// Ensure that there are no optional arguments.
			if (optionalArguments.length > 0)
				throw new Error(`Interpretation error: received an accent named "${functionName}" but this was followed by ${optionalArguments.length === 1 ? `an optional parameter` : `${arguments.length} optional parameters`}. Accents cannot have optional parameters. They should be of the form "dot(x)".`)

			// Add the part prior to the accent.
			result.push(...getSubExpression(value, lastPosition, end))

			// Add the accent itself and shift the cursor.
			if (opening.part !== closing.part)
				throw new Error(`Invalid expression accent: received an accent with a parameter between brackets that did not have pure text.`)
			const str = value[opening.part].value
			result.push({
				type: 'Accent',
				name: functionName,
				alias: `${functionName}(`,
				value: str.substring(opening.cursor + 1, closing.cursor),
			})
			return lastPosition = moveRight(closing)
		}

		// No known advanced function or accent. If there were optional arguments, throw an error.
		if (optionalArguments.length > 0)
			throw new Error(`Invalid expression: found square brackets but could not recognize the function with name "${functionName}". This function does not support optional parameters.`)

		// We most likely have a basic function like "sin(x+2)" or a multiplication like "x(x+2)". Process the part between brackets separately.
		result.push(...getSubExpression(value, lastPosition, moveRight(opening)))
		const partBetweenBrackets = processFunctionsAndAccents(getSubExpression(value, moveRight(opening), closing), settings)
		result.push(...partBetweenBrackets)
		return lastPosition = closing
	})

	// Add the remaining part of the expression.
	const end = getEndCursor(value)
	result.push(...getSubExpression(value, lastPosition, end))
	return mergeAdjacentExpressionParts(result)
}

// processSubSups takes an Expression value with possible underscores/powers "_" and "^" and processes these symbols. It creates SubSup objects of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processSubSups(value, settings) {
	return value.map(part => processExpressionPartSubSups(part, settings)).flat()
}

// processExpressionPartSubSups takes an ExpressionPart object like { type: 'ExpressionPart', value: 'aF^2_bc' } and turns this into the right input object format, having a SubSup of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processExpressionPartSubSups(part, settings) {
	// Only process ExpressionParts.
	if (part.type !== 'ExpressionPart')
		return part

	const str = part.value
	const result = []

	// Set up handlers. These contiuously update the position variable, which is the position of the next underscore/superscript symbol.
	let position = 0, previousPosition = 0
	const findNextSymbol = () => {
		position = getNextSymbol(str, ['_', '^'], position)
	}
	const getSubscript = () => {
		let subscriptText
		if (str[position + 1] === '(') { // There is a bracket like m_(person). Find the first closing bracket.
			const end = str.indexOf(')', position)
			if (end === -1)
				throw new Error(`Invalid subscript. A subscript was opened with a bracket, but no closing bracket was found.`)
			subscriptText = str.substring(position + 2, end)
			position = end + 1
		} else { // There is no bracket, like m_1. Only take one symbol.
			subscriptText = str[position + 1]
			position = position + 2
		}
		return { type: 'SubscriptText', value: subscriptText }
	}
	const getSuperscript = () => {
		let power
		if (str[position + 1] === '(') { // There is a bracket. Find the next closing bracket with net bracket count zero.
			const end = getBracketEnd(str, position + 1)
			if (end === -1)
				throw new Error(`Invalid superscript. A superscript was opened with a bracket, but no matching closing bracket was found.`)
			power = strToSI(str.substring(position + 2, end))
			position = end + 1
		} else {
			const numberRegEx = /^-?[0-9.]+/
			const powerString = str.substring(position + 1)
			const match = powerString.match(numberRegEx)
			if (match) { // Check if it is a number, like -2.5.
				power = strToSI(match[0])
				position = position + 1 + match[0].length
			} else { // There is no bracket or number. Only take one symbol.
				power = strToSI(str[position + 1])
				position = position + 2
			}
		}
		return addExpressionType(power)
	}

	// Walk through underscores and power symbols and process them appropriately.
	findNextSymbol()
	while (position !== -1) {
		// Add the part prior to the SubSup.
		result.push({
			type: 'ExpressionPart',
			value: str.substring(previousPosition, position)
		})

		// Set up the subSup object and fill it in the right way.
		const subSup = { type: 'Function', name: 'subSup', value: [undefined, undefined] }
		if (str[position] === '_') {
			subSup.value[0] = getSubscript(subSup)
			if (str[position] === '^')
				subSup.value[1] = getSuperscript(subSup)
		} else {
			subSup.value[1] = getSuperscript(subSup)
			if (str[position] === '_')
				subSup.value[0] = getSubscript(subSup)
		}
		result.push(subSup)

		// Remember the position we're at and find the next one.
		previousPosition = position
		findNextSymbol()
	}

	// Add any remaining ExpressionPart and return the final outcome.
	result.push({
		type: 'ExpressionPart',
		value: str.substring(previousPosition),
	})
	return result
}

// processFractions takes an array of ExpressionParts with possibly other elements in there, and sets up the "frac" functions, just like in the input objects.
function processFractions(value, settings) {
	// Set up a handler that finds the next slash symbol.
	const getNextSymbol = () => {
		const part = value.findIndex(part => part.type === 'ExpressionPart' && part.value.indexOf('/') !== -1)
		return (part === -1 ? null : { part, cursor: value[part].value.indexOf('/') })
	}

	// While there is a next symbol, apply it.
	for (let nextSymbol = getNextSymbol(); nextSymbol; nextSymbol = getNextSymbol()) {
		value = applyFraction(value, nextSymbol, settings)
	}
	return value
}

function applyFraction(value, cursor, settings) {
	// Define cursors.
	const start = getStartCursor(value)
	const beforeSymbol = cursor
	const afterSymbol = moveRight(cursor)
	const leftSide = findEndOfTerm(value, beforeSymbol, false)
	const rightSide = findEndOfTerm(value, afterSymbol, true)
	const end = getEndCursor(value)

	// Set up the fraction value.
	const numerator = processExpression(getSubExpression(value, leftSide, beforeSymbol), settings)
	const denominator = processExpression(getSubExpression(value, afterSymbol, rightSide), settings)
	const fractionValue = [
		addExpressionType(numerator),
		addExpressionType(denominator),
	]

	// Set up the fraction element.
	const fractionElement = {
		type: 'Function',
		name: 'frac',
		value: fractionValue,
	}

	// Build the new Expression value around it.
	return [
		...getSubExpression(value, start, leftSide),
		fractionElement,
		...getSubExpression(value, rightSide, end),
	]
}

// getBracketEnd takes a mathematical string like "2*(x+5*(3+y)-4)+2" as well as a search starting index, often (but not necessarily) connected to an opening bracket. (For instance 2.) From this position it starts walking through the string to find the closing bracket with the right level. It returns the corresponding index. (In the example the last bracket at 14.)
function getBracketEnd(str, from) {
	if (str[from] !== '(')
		throw new Error(`Invalid getBracketEnd call: this function can only be called on a string where the start index points to an opening bracket. The matching closing bracket is then found. But this index did not point to an opening bracket. Values given were str="${str}" and from="${from}".`)

	// Walk through all brackets and find when the right closing bracket is found.
	let counter = 0
	let nextBracket = getNextSymbol(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		// On a bracket, update the bracket counter.
		counter += (str[nextBracket] === '(' ? 1 : -1)

		// When the bracket counter hits zero, return the current position.
		if (counter === 0)
			return nextBracket

		// Move to the next bracket.
		nextBracket = getNextSymbol(str, ['(', ')'], nextBracket + 1)
	}

	throw new Error(`Invalid bracket set-up: could not find a closing bracket to match with the given opening bracket.`)
}