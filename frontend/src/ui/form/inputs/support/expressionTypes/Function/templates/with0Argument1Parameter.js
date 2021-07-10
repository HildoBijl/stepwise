// This is the template for functions like log[10](...) which have a parameter inside their expression and not a parameter after (which is contained in an ExpressionPart of the parent Expression.)

import { getFuncs, zoomIn, isCursorAtDataStart } from '../..'
import { mergeWithLeft } from '../../support/merging'
import { splitToLeft } from '../../support/splitting'

import defaultFunctions from './default'

const allFunctions = {
	...defaultFunctions,
	countNetBrackets,
	canMerge,
	merge,
	canSplit,
	split,
}
export default allFunctions

function canMerge(data, mergeWithNext, fromOutside) {
	return true
}

function merge(expressionValue, partIndex, mergeWithNext, fromOutside) {
	// If we want to merge with the next, this actually means we should remove this element.
	if (mergeWithNext)
		return getFuncs(expressionValue[partIndex]).removeElementFromExpression(expressionValue, partIndex, fromOutside)
	return mergeWithLeft(expressionValue, partIndex, fromOutside)
}

function canSplit(data) {
	return !isCursorAtDataStart(zoomIn(data))
}

function split(data) {
	return splitToLeft(data)
}

function countNetBrackets(data) {
	return 1
}