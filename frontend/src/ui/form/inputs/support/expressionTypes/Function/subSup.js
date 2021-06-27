import { getFuncs } from '../'

import { getDataStartCursor, getDataEndCursor } from '../'
import defaultFunctions from './templates/with2Argument0ParameterVertical'
import Expression from '../Expression'
import SimpleText from '../SimpleText'

const fullExport = {
	...defaultFunctions,
	aliases: ['_', '^'],
	toLatex,
	isUpFirst,
	getInitial,
	getInitialCursor,
}
export default fullExport

function toLatex(data, options) {
	const { value } = data
	const [subLatex, supLatex] = value.map(element => element && getFuncs(element).toLatex(element, options))
	return {
		latex: (subLatex ? `_{${subLatex.latex}}` : ``) + (supLatex ? `^{${supLatex.latex}}` : ``),
		chars: [subLatex.chars || [], supLatex.chars || []],
	}
}

function isUpFirst() {
	return false
}

function getInitial(alias) {
	if (alias === '_') {
		return [
			getEmptySub(),
			null,
		]
	} else {
		return [
			null,
			getEmptySup(),
		]
	}
}

function getInitialCursor(element) {
	// Find the first part that exists.
	const part = element.value.findIndex(partElement => !!partElement)
	return { part, cursor: getDataStartCursor(element.value[part]) }
}

function getEmptySub() {
	return { type: 'SimpleText', value: SimpleText.getEmpty() }
}

function getEmptySup() {
	return { type: 'Expression', value: Expression.getEmpty() }
}