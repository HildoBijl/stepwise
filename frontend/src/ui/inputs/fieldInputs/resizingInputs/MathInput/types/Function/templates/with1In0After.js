// This is the template for functions like sqrt(...) which have a parameter after their term and have no other parameters.

import { sliceExpressionValue, findClosingBracket } from '@step-wise/math-input-value'

import { getFIFuncs, getFIStartCursor, getFIEndCursor, isFIEmpty, createConstruct } from '../..'
import { mergeWithRight, splitToRight } from '../../support'

import { allFunctions as defaultFunctions } from './default'

export const allFunctions = {
	...defaultFunctions,
	create,
	getInitial,
	getInitialCursor,
	canMerge,
	merge,
	canSplit,
	split,
	removeElement,
	onClosingBracketGoOutside: true,
}

function create(expressionFI, part, position, name, alias) {
	let { value } = expressionFI

	// Define cursors.
	const start = getFIStartCursor(expressionFI)
	const beforeAlias = { part, cursor: position }
	const afterAlias = { part, cursor: position + alias.length }
	const endOfTerm = findClosingBracket(value, afterAlias)
	const end = getFIEndCursor(expressionFI)

	// Check if there is a bracket at the end of the term. If not, put everything in the function.
	let endOfTermAfterBracket = endOfTerm
	if (endOfTerm.cursor > 0 && value[endOfTerm.part][endOfTerm.cursor] === ')')
		endOfTermAfterBracket = { ...endOfTerm, cursor: endOfTerm.cursor + 1 }

	// Set up the new function element. 
	const parameter = {
		type: 'Expression',
		value: sliceExpressionValue(value, afterAlias, endOfTerm),
	}
	const parameters = name === 'Root' ? [{ type: 'Expression', value: [''] }, parameter] : [parameter]
	const functionElement = createConstruct(name, alias, parameters)
	const funcs = getFIFuncs(functionElement)

	// Build the new Expression around it.
	value = [
		...sliceExpressionValue(value, start, beforeAlias),
		functionElement,
		...sliceExpressionValue(value, endOfTermAfterBracket, end),
	]
	return {
		...expressionFI,
		value,
		cursor: {
			part: value.indexOf(functionElement),
			cursor: funcs.getInitialCursor(functionElement),
		},
	}
}

function getInitial(alias, parameter) {
	return { radicand: parameter.value }
}

function getInitialCursor(element) {
	return getFIStartCursor(element)
}

function canMerge(FI, mergeWithNext, fromOutside) {
	return true
}

function merge(FI, partIndex, mergeWithNext, fromOutside) {
	const { value } = FI
	// If we want to merge with what came before, this actually means we must remove the element.
	if (!mergeWithNext)
		return getFIFuncs(value[partIndex]).removeElementFromExpression(value, partIndex, !fromOutside)
	return mergeWithRight(FI, partIndex, fromOutside)
}

function canSplit(FI) {
	return true
}

function split(FI) {
	return splitToRight(FI)
}

function removeElement(FI, withBackspace) {
	const { alias } = FI
	const part = FI.type === 'Root' ? 'radicand' : 'radicand'
	const parameter = { type: 'Expression', value: FI[part] }

	// Figure out what remains of the alias and wrap it around the parameter.
	const leftInsertion = withBackspace ? alias.slice(0, -1) : alias.slice(1)
	const rightInsertion = isFIEmpty(parameter) ? '' : ')' // When not empty, add a closing bracket.
	return {
		type: 'Expression',
		value: [
			leftInsertion,
			...parameter.value,
			rightInsertion,
		],
		cursor: {
			part: 0,
			cursor: withBackspace ? leftInsertion.length : 0,
		},
	}
}
