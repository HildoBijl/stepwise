// This file has all functionalities to turn Expressions, Equations and such from String format to Input Object format. (You can turn String to IO, IO to FO, and FO to String.)

import { getNextSymbol } from '../../../util/strings'

import { interpretExpression } from './expressions'
import { interpretEquation } from './equations'

export function expressionStrToIO(str) {
	let value = [{
		type: 'ExpressionPart',
		value: str,
	}]

	// Check for subscripts and powers.
	value = value.map(part => processSubSup(part)).flat()

	// ToDo: extend this further with other function types.

	// For now just turn it into an expression part.
	return {
		type: 'Expression',
		value,
	}
}

export function expressionStrToFO(expression) {
	return interpretExpression(expressionStrToIO(expression))
}
export const asExpression = expressionStrToFO // This is the name of the function used by exercise creators.

export function equationStrToIO(equation) {
	// The method is the same as for an expression.
	return {
		type: 'Equation',
		value: expressionStrToIO(equation).value
	}
}

export function equationStrToFO(equation) {
	return interpretEquation(equationStrToIO(equation))
}
export const asEquation = equationStrToFO // This is the name of the function used by exercise creators.

// Below are functions required for expressionStrToIO.

// processSubSup takes an ExpressionPart object like { type: 'ExpressionPart', value: 'aF^2_bc' } and turns this into the right input object format, having a SubSup of the form { sub: 'b', sup: '2' } (okay, with proper object types).
function processSubSup(part) {
	// Only process ExpressionParts.
	if (part.type !== 'ExpressionPart')
		return part

	const str = part.value
	const result = []

	// Walk through underscores and power symbols and process them appropriately.
	let start = 0
	let symbolPos = getFirstSubSupPosition(str, start)
	let testCounter = 0
	while (symbolPos !== -1 && testCounter < 10) {
		testCounter++
		// Add the part prior to the SubSup.
		result.push({
			type: 'ExpressionPart',
			value: str.substring(start, symbolPos)
		})

		// Set up handlers. These take the given subSup object, as well as the symbolPos variable, and use it to add the right parts to subSup. Also start and symbolPos are updated.
		const subSup = { type: 'Function', name: 'subSup', value: [undefined, undefined] }
		const processSubscript = () => {
			let subscriptText
			if (str[symbolPos + 1] === '(') {
				const end = getSubEnd(str, symbolPos + 1)
				if (end === -1)
					throw new Error(`Invalid subscript. A subscript was opened with a bracket, but no closing bracket was found.`)
				subscriptText = str.substring(symbolPos + 2, end)
				start = symbolPos = end + 1
			} else {
				subscriptText = str[symbolPos + 1]
				start = symbolPos = symbolPos + 2
			}
			subSup.value[0] = { type: 'SubscriptText', value: subscriptText }
		}
		const processSuperscript = () => {
			let power
			if (str[symbolPos + 1] === '(') {
				const end = getBracketEnd(str, symbolPos + 1)
				if (end === -1)
					throw new Error(`Invalid superscript. A superscript was opened with a bracket, but no matching closing bracket was found.`)
				power = expressionStrToIO(str.substring(symbolPos + 2, end))
				start = symbolPos = end + 1
			} else {
				power = expressionStrToIO(str[symbolPos + 1])
				start = symbolPos = symbolPos + 2
			}
			subSup.value[1] = power
		}

		// Process the sub or sup appropriately. Also process a potential follow-up sup or sub right after.
		if (str[symbolPos] === '_') {
			processSubscript()
			if (str[symbolPos] === '^')
				processSuperscript()
		} else {
			processSuperscript()
			if (str[symbolPos] === '_')
				processSubscript()
		}

		// Add the SubSup to the resulting array and shift the position of the iterator.
		result.push(subSup)
		symbolPos = getFirstSubSupPosition(str, start)
	}

	// Add any remaining ExpressionPart and return the final outcome.
	result.push({
		type: 'ExpressionPart',
		value: str.substring(start),
	})
	return result
}

function getFirstSubSupPosition(str, from) {
	return getNextSymbol(str, ['_', '^'], from)
}

function getSubEnd(str, from) {
	return str.indexOf(')', from)
}

function getBracketEnd(str, from) {
	if (str[from] !== '(')
		throw new Error(`Invalid getBracketEnd call: this function can only be called on a string where the start index points to an opening bracket. The matching closing bracket is then found. But this index did not point to an opening bracket. Values given were str="${str}" and from="${from}".`)

	// Walk through all brackets and find when the right closing bracket is found.
	let counter = 0
	let nextBracket = getNextSymbol(str, ['(', ')'], from)
	while (nextBracket !== -1) {
		if (str[nextBracket] === '(') {
			counter++
		} else {
			counter--
			if (counter === 0)
				return nextBracket
		}
		nextBracket = getNextSymbol(str, ['(', ')'], nextBracket + 1)
	}

	throw new Error(`Invalid bracket set-up: could not find a closing bracket to match with the given opening bracket.`)
}
