import { isNumber } from '../util/numbers'

export function isFOofType(param) {
	return typeof param === 'string' && !isNumber(param)
}

export function FOtoIO(param) {
	return { value: param }
}

export function IOtoFO({ value }) {
	return value
}

export function getEmpty() {
	return { value: '' }
}

export function isEmpty({ value }) {
	if (typeof value !== 'string')
		throw new Error(`Invalid type: expected a string but received "${JSON.stringify(value)}".`)
	return value === ''
}

export function equals(a, b) {
	return a === b
}
